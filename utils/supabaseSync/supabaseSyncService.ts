/**
 * Supabase Sync Service
 * 
 * Coordinates all sync operations between localStorage and Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  SyncStatus,
  SyncQueueItem,
  SyncResult,
  SyncDataType,
  SyncConfig,
  UserDataFromAPI,
} from './types';
import { DEFAULT_SYNC_CONFIG } from './types';
import { transformFromAPIFormat } from './dataTransformers';
import { resolveConflict } from './conflictResolver';
import { getTelegramUserId } from '../telegramUserUtils';
import { getValidJWTToken } from './authService';
import { AnalyticsEvent, capture, captureException } from '../analytics/posthog';
import { syncLog } from './syncLogger';
import { loadSyncPayloadForType } from './buildSyncPayload';
import { applyRemoteVariantIfStronger } from '../experiment/experimentAssignment';
import { saveTopicTestResultsMap, type TopicTestResultStored } from '../experiment/topicTestStorage';
import { bumpTopicTestVersion } from '@/src/stores/topic-test.store';

/**
 * Supabase Sync Service Class
 * 
 * Manages synchronization between localStorage and Supabase
 */
export class SupabaseSyncService {
  private supabase: SupabaseClient | null = null;
  private syncInProgress = false;
  private offlineQueue: SyncQueueItem[] = [];
  private fetchCache: {
    inFlight: Promise<UserDataFromAPI | null> | null;
    result: UserDataFromAPI | null;
    timestamp: number;
  } = {
    inFlight: null,
    result: null,
    timestamp: 0,
  };
  private readonly FETCH_CACHE_TTL_MS = 60_000;
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    lastSync: null,
    pendingItems: 0,
    syncInProgress: false,
    errors: [],
  };
  private config: SyncConfig;
  /** Pending data types to sync in one batched POST after debounce. */
  private pendingSyncTypes = new Set<SyncDataType>();
  private batchFlushTimer: number | null = null;
  private initializationPromise: Promise<void>;

  private static readonly ALL_SYNCABLE_TYPES: SyncDataType[] = [
    'surveyResults',
    'dailyCheckins',
    'userStats',
    'achievements',
    'preferences',
    'flowProgress',
    'psychologicalTest',
    'cardProgress',
    'referralData',
    'experimentAssignment',
    'topicTestResults',
  ];

  private parsePreferencesFromStorage(raw: string): Record<string, any> | null {
    // Try legacy/plain JSON first.
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (parsed.data && typeof parsed.data === 'object') {
          return parsed.data as Record<string, any>;
        }
        return parsed as Record<string, any>;
      }
    } catch {
      // Continue with encrypted payload fallback.
    }

    // Fallback for legacy base64-encoded preferences payload.
    try {
      const decrypted = decodeURIComponent(escape(atob(raw)));
      const parsed = JSON.parse(decrypted);
      if (parsed && typeof parsed === 'object' && parsed.data && typeof parsed.data === 'object') {
        return parsed.data as Record<string, any>;
      }
    } catch {
      // Invalid/unsupported payload. Caller will ignore it.
    }

    return null;
  }

  constructor(config?: Partial<SyncConfig>) {
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
    // Initialize Supabase asynchronously and track the promise
    this.initializationPromise = this.initializeSupabase().catch((error) => {
      console.error('Error initializing Supabase:', error);
    });
    this.setupOnlineListeners();
    this.loadOfflineQueue();
    this.setupUnloadFlush();
  }

  /**
   * Initialize Supabase client with JWT token support
   */
  private async initializeSupabase(): Promise<void> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase configuration missing. Sync will be disabled.');
      return;
    }

    // Get JWT token (will authenticate if needed)
    const jwtToken = await getValidJWTToken();
    
    if (jwtToken) {
      // Create client with JWT token
      this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
        auth: {
          persistSession: false, // We manage tokens manually
          autoRefreshToken: false, // We handle refresh manually
        },
      });
    } else {
      // Fallback: create client without JWT (will use anon key only)
      // This maintains backward compatibility but won't work with RLS
      console.warn('JWT token not available, creating client without authentication');
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
  }

  /**
   * Refresh Supabase client with new JWT token
   */
  private async refreshSupabaseClient(): Promise<void> {
    await this.initializeSupabase();
  }

  /**
   * Setup online/offline listeners
   */
  private setupOnlineListeners(): void {
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
    });
  }

  /**
   * Load offline queue from localStorage
   */
  private loadOfflineQueue(): void {
    try {
      const stored = localStorage.getItem('supabase_sync_queue');
      if (stored) {
        const raw = JSON.parse(stored) as any[];
        this.offlineQueue = raw.map((item: any) => {
          if (item.types && item.payload) {
          return {
            types: item.types as SyncDataType[],
            payload: item.payload as Record<string, unknown>,
            timestamp: new Date(item.timestamp),
            retryCount: typeof item.retryCount === 'number' ? item.retryCount : 0,
          };
          }
          // Legacy single-type queue
          const legacyType = item.type as SyncDataType;
          const payload: Record<string, unknown> = {};
          if (legacyType && item.data !== undefined) {
            payload[legacyType] = item.data;
          }
          return {
            types: legacyType ? [legacyType] : [],
            payload,
            timestamp: new Date(item.timestamp),
            retryCount: typeof item.retryCount === 'number' ? item.retryCount : 0,
          };
        });
        this.syncStatus.pendingItems = this.offlineQueue.length;
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }

  /**
   * Save offline queue to localStorage
   */
  private saveOfflineQueue(): void {
    try {
      localStorage.setItem('supabase_sync_queue', JSON.stringify(this.offlineQueue));
      this.syncStatus.pendingItems = this.offlineQueue.length;
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  /**
   * Queue a sync for one or more data types; batches into a single POST after debounce.
   */
  public queueSync(type: SyncDataType, _data?: unknown): void {
    // Check if sync is mocked (e2e tests)
    if (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT__ && (window as any).__MOCK_SUPABASE_SYNC__) {
      syncLog.debug(`[SyncService] Mocked: queueSync(${type}) - skipping sync (e2e test mode)`);
      return;
    }

    if (!this.config.enableOfflineQueue) {
      return;
    }

    this.pendingSyncTypes.add(type);
    if (this.batchFlushTimer) {
      clearTimeout(this.batchFlushTimer);
    }
    this.batchFlushTimer = window.setTimeout(() => {
      this.batchFlushTimer = null;
      void this.flushPendingBatchSync();
    }, this.config.debounceMs);
  }

  /**
   * Create mock initData for local development
   */
  private createMockInitData(): string {
    const mockUserId = 111;
    const authDate = Math.floor(Date.now() / 1000);
    const mockUser = JSON.stringify({ id: mockUserId, first_name: 'Local', username: 'local_dev' });
    return `user=${encodeURIComponent(mockUser)}&auth_date=${authDate}`;
  }

  /**
   * Get initData from Telegram WebApp or create mock for local development
   */
  private getInitData(): string {
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) {
      // Local development: create mock initData with user ID 111
      const mockInitData = this.createMockInitData();
      syncLog.debug('[SyncService] Using mock initData for local development (user ID 111)');
      return mockInitData;
    }
    return initData;
  }

  /**
   * Flush pending types as one POST (partial `data` body).
   */
  private async flushPendingBatchSync(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT__ && (window as any).__MOCK_SUPABASE_SYNC__) {
      return;
    }

    if (this.pendingSyncTypes.size === 0) {
      return;
    }

    const types = new Set(this.pendingSyncTypes);
    this.pendingSyncTypes.clear();

    const data = this.getLocalStorageDataForTypes(types);
    if (Object.keys(data).length === 0) {
      return;
    }

    if (!this.supabase || !this.syncStatus.isOnline) {
      if (this.config.enableOfflineQueue) {
        this.offlineQueue.push({
          types: Array.from(types),
          payload: data,
          timestamp: new Date(),
          retryCount: 0,
        });
        this.saveOfflineQueue();
      }
      return;
    }

    try {
      await this.syncToSupabase(data);
      this.syncStatus.lastSync = new Date();
      this.syncStatus.syncInProgress = false;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      syncLog.error('[SyncService] batch sync error:', err);
      void captureException(err, { context: 'sync_batch_post', types: Array.from(types).join(',') });

      if (this.config.enableOfflineQueue) {
        this.offlineQueue.push({
          types: Array.from(types),
          payload: data,
          timestamp: new Date(),
          retryCount: 0,
        });
        this.saveOfflineQueue();
      }

      for (const type of types) {
        this.syncStatus.errors.push({
          type,
          error: err.message,
          timestamp: new Date(),
          retryable: true,
        });
      }
    }
  }

  /**
   * Process offline queue when online
   */
  private async processOfflineQueue(): Promise<void> {
    if (!this.syncStatus.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    const itemsToProcess = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of itemsToProcess) {
      try {
        if (!this.supabase || Object.keys(item.payload).length === 0) {
          continue;
        }
        await this.syncToSupabase(item.payload);
      } catch {
        if (item.retryCount < this.config.maxRetries) {
          this.offlineQueue.push({
            ...item,
            retryCount: item.retryCount + 1,
          });
        }
      }
    }

    this.saveOfflineQueue();
  }

  /**
   * Best-effort flush of pending batched sync when leaving the page (Telegram WebView close).
   */
  private setupUnloadFlush(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const run = () => {
      if (this.pendingSyncTypes.size === 0) {
        return;
      }
      const types = new Set(this.pendingSyncTypes);
      this.pendingSyncTypes.clear();
      if (this.batchFlushTimer) {
        clearTimeout(this.batchFlushTimer);
        this.batchFlushTimer = null;
      }
      const data = this.getLocalStorageDataForTypes(types);
      if (Object.keys(data).length === 0) {
        return;
      }
      void this.flushUnloadWithKeepalive(data);
    };
    window.addEventListener('pagehide', run);
    window.addEventListener('beforeunload', run);
  }

  private async flushUnloadWithKeepalive(data: Record<string, unknown>): Promise<void> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) return;
    try {
      const jwtToken = await getValidJWTToken();
      const initData = jwtToken ? null : this.getInitData();
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      const url = `${supabaseUrl}/functions/v1/sync-user-data`;
      const body = JSON.stringify({ data });
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        apikey: anonKey,
      };
      if (jwtToken) {
        headers.Authorization = `Bearer ${jwtToken}`;
      } else if (initData) {
        headers['X-Telegram-Init-Data'] = initData;
      } else {
        return;
      }
      await fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers,
        body,
        keepalive: true,
      });
    } catch {
      // ignore
    }
  }

  /**
   * Get sync status
   */
  public getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  private collectSyncPayloadForType(type: SyncDataType): unknown {
    return loadSyncPayloadForType(type, (raw) => this.parsePreferencesFromStorage(raw));
  }

  private getLocalStorageDataForTypes(types: Set<SyncDataType>): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const t of types) {
      const v = this.collectSyncPayloadForType(t);
      if (v !== undefined && v !== null) {
        data[t] = v;
      }
    }
    syncLog.debug('[SyncService] getLocalStorageDataForTypes keys:', Object.keys(data));
    return data;
  }

  /**
   * Get all localStorage data in API format (full snapshot for initial / forced sync).
   */
  private getAllLocalStorageData(): Record<string, unknown> {
    syncLog.debug('[SyncService] getAllLocalStorageData - Starting data collection');
    return this.getLocalStorageDataForTypes(new Set(SupabaseSyncService.ALL_SYNCABLE_TYPES));
  }

  /**
   * Fetch user data from Supabase
   */
  private async fetchFromSupabase(_telegramUserId: number, source: string = 'unknown'): Promise<UserDataFromAPI | null> {
    // Check if sync is mocked (e2e tests)
    if (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT__ && (window as any).__MOCK_SUPABASE_SYNC__) {
      syncLog.debug('[SyncService] Mocked: fetchFromSupabase - returning null (e2e test mode)');
      return null;
    }
    
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    const callStack = new Error(`[fetchFromSupabase] source=${source}`).stack;
    syncLog.debug(`[SyncService] fetchFromSupabase called from: ${source}`);
    syncLog.debug('[SyncService] fetchFromSupabase stack:', callStack);

    if (
      this.fetchCache.timestamp > 0 &&
      Date.now() - this.fetchCache.timestamp < this.FETCH_CACHE_TTL_MS
    ) {
      syncLog.debug(`[SyncService] fetchFromSupabase(${source}) - Cache hit`);
      return this.fetchCache.result;
    }

    if (this.fetchCache.inFlight) {
      syncLog.debug(`[SyncService] fetchFromSupabase(${source}) - Reusing in-flight request`);
      return this.fetchCache.inFlight;
    }

    const requestPromise = (async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL not configured');
      }

      // Get JWT token (refresh if expired)
      const jwtToken = await getValidJWTToken();
      
      // Fallback to Telegram initData if JWT not available (backward compatibility)
      const initData = jwtToken ? null : this.getInitData();
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      syncLog.debug('[SyncService] fetchFromSupabase - User ID:', _telegramUserId);
      syncLog.debug('[SyncService] fetchFromSupabase - Using JWT:', !!jwtToken);

      const url = `${supabaseUrl}/functions/v1/get-user-data`;
      syncLog.debug('[SyncService] fetchFromSupabase - Calling URL:', url);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': anonKey,
      };

      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      } else if (initData) {
        headers['X-Telegram-Init-Data'] = initData;
      } else {
        throw new Error('No authentication method available (JWT token or Telegram initData)');
      }

      syncLog.debug('[SyncService] Making GET request to:', url);
      syncLog.debug('[SyncService] Request headers:', Object.keys(headers));
      
      // Call Edge Function
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers,
      });
      
      syncLog.debug('[SyncService] Response headers:', Object.fromEntries(response.headers.entries()));

      syncLog.debug('[SyncService] fetchFromSupabase - Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SyncService] fetchFromSupabase - Error response:', errorText);
        if (response.status === 404) {
          syncLog.debug('[SyncService] fetchFromSupabase - User not found (404)');
          return null; // User doesn't exist
        }
        throw new Error(`Failed to fetch user data: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      syncLog.debug('[SyncService] fetchFromSupabase - Response success:', result.success);
      syncLog.debug('[SyncService] fetchFromSupabase - Response data keys:', result.data ? Object.keys(result.data) : 'no data');
      syncLog.debug('[SyncService] fetchFromSupabase - hasPremium:', result.hasPremium);
      syncLog.debug('[SyncService] fetchFromSupabase - premiumSignature:', result.premiumSignature ? 'present' : 'missing');
      
      // Debug: Check dailyCheckins data
      if (result.data && result.data.dailyCheckins) {
        const checkinsCount = Object.keys(result.data.dailyCheckins).length;
        const checkinsDates = Object.keys(result.data.dailyCheckins);
        syncLog.debug('[SyncService] fetchFromSupabase - dailyCheckins found:', checkinsCount, 'checkins');
        syncLog.debug('[SyncService] fetchFromSupabase - dailyCheckins dates:', checkinsDates);
      } else {
        syncLog.debug('[SyncService] fetchFromSupabase - No dailyCheckins in response data');
      }
      
      if (result.success && result.data) {
        // Include hasPremium and premiumSignature in returned data
        const userData: UserDataFromAPI = {
          ...result.data,
          hasPremium: result.hasPremium,
          premiumSignature: result.premiumSignature
        };
        return userData;
      }

      return null;
    })();

    this.fetchCache.inFlight = requestPromise;

    try {
      const result = await requestPromise;
      this.fetchCache.result = result;
      this.fetchCache.timestamp = Date.now();
      return result;
    } catch (error) {
      console.error('Error fetching from Supabase:', error);
      throw error;
    } finally {
      this.fetchCache.inFlight = null;
    }
  }

  /**
   * Sync data to Supabase
   */
  private async syncToSupabase(data: any): Promise<SyncResult> {
    // Check if sync is mocked (e2e tests)
    if (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT__ && (window as any).__MOCK_SUPABASE_SYNC__) {
      syncLog.debug('[SyncService] Mocked: syncToSupabase - returning success without syncing (e2e test mode)');
      return {
        success: true,
        syncedTypes: [],
        errors: [],
      };
    }
    
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL not configured');
      }

      // Get JWT token (refresh if expired)
      const jwtToken = await getValidJWTToken();
      
      // Fallback to Telegram initData if JWT not available (backward compatibility)
      const initData = jwtToken ? null : this.getInitData();
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

      syncLog.debug('[SyncService] syncToSupabase - Starting full sync');
      syncLog.debug('[SyncService] syncToSupabase - Data keys:', Object.keys(data));
      syncLog.debug('[SyncService] syncToSupabase - Using JWT:', !!jwtToken);
      const dataSummary = Object.keys(data).reduce((acc, key) => {
        const value = data[key];
        if (value === null || value === undefined) {
          acc[key] = 'null/undefined';
        } else if (typeof value === 'object') {
          if (Array.isArray(value)) {
            acc[key] = `Array[${value.length}]`;
          } else {
            acc[key] = `Object[${Object.keys(value).length} keys]`;
          }
        } else {
          acc[key] = typeof value;
        }
        return acc;
      }, {} as Record<string, string>);
      syncLog.debug('[SyncService] syncToSupabase - Data summary:', dataSummary);

      const url = `${supabaseUrl}/functions/v1/sync-user-data`;
      const body = JSON.stringify({ data });
      syncLog.debug('[SyncService] syncToSupabase - URL:', url);
      syncLog.debug('[SyncService] syncToSupabase - Body size:', body.length, 'bytes');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': anonKey,
      };

      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      } else if (initData) {
        headers['X-Telegram-Init-Data'] = initData;
      } else {
        throw new Error('No authentication method available (JWT token or Telegram initData)');
      }

      // Call Edge Function
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });

      syncLog.debug('[SyncService] syncToSupabase - Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SyncService] syncToSupabase - Error response:', errorText);
        throw new Error(`Failed to sync user data: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      syncLog.debug('[SyncService] syncToSupabase - Response success:', result.success);
      syncLog.debug('[SyncService] syncToSupabase - Synced types:', result.syncedTypes);
      if (result.errors && result.errors.length > 0) {
        console.error('[SyncService] syncToSupabase - Errors:', result.errors);
      }
      if (result.success) {
        return {
          success: true,
          syncedTypes: result.syncedTypes || [],
          metadata: result.metadata,
        };
      }

      throw new Error(result.error || 'Sync failed');
    } catch (error) {
      console.error('Error syncing to Supabase:', error);
      throw error;
    }
  }

  /**
   * Merge remote data with local data and save to localStorage
   */
  private mergeAndSave(remoteData: UserDataFromAPI): void {
    try {
      const localData = this.getAllLocalStorageData();

    // Merge each data type
    if (remoteData.surveyResults) {
      const merged = resolveConflict('surveyResults', localData.surveyResults, remoteData.surveyResults);
      const localFormat = transformFromAPIFormat('surveyResults', merged);
      localStorage.setItem('survey-results', JSON.stringify(localFormat));
    }

    if (remoteData.dailyCheckins) {
      syncLog.debug('[SyncService] mergeAndSave - Processing dailyCheckins');
      const remoteCheckins = remoteData.dailyCheckins;
      const remoteDates = Object.keys(remoteCheckins);
      syncLog.debug('[SyncService] mergeAndSave - remoteData.dailyCheckins dates:', remoteDates);
      
      const merged = resolveConflict('dailyCheckins', localData.dailyCheckins, remoteCheckins);
      const mergedDates = Object.keys(merged);
      syncLog.debug('[SyncService] mergeAndSave - merged dailyCheckins dates:', mergedDates);
      
      const localFormat = transformFromAPIFormat('dailyCheckins', merged);
      const localFormatKeys = Object.keys(localFormat);
      syncLog.debug('[SyncService] mergeAndSave - localFormat keys (localStorage):', localFormatKeys);
      syncLog.debug('[SyncService] mergeAndSave - Saving', localFormatKeys.length, 'checkins to localStorage');
      
      localFormatKeys.forEach(key => {
        syncLog.debug('[SyncService] mergeAndSave - Saving checkin key:', key);
        localStorage.setItem(key, JSON.stringify(localFormat[key]));
      });
      syncLog.debug('[SyncService] mergeAndSave - dailyCheckins saved successfully');
    } else {
      syncLog.debug('[SyncService] mergeAndSave - No remoteData.dailyCheckins');
    }

    if (remoteData.userStats) {
      const merged = resolveConflict('userStats', localData.userStats, remoteData.userStats);
      const localFormat = transformFromAPIFormat('userStats', merged);
      localStorage.setItem('menhausen_user_stats', JSON.stringify(localFormat));
    }

    if (remoteData.achievements) {
      const merged = resolveConflict('achievements', localData.achievements, remoteData.achievements);
      const localFormat = transformFromAPIFormat('achievements', merged);
      localStorage.setItem('menhausen_achievements', JSON.stringify(localFormat));
    }

    if (remoteData.points) {
      const merged = resolveConflict('points', localData.points, remoteData.points);
      const localFormat = transformFromAPIFormat('points', merged);
      localStorage.setItem('menhausen_points_balance', String(localFormat.balance || 0));
      localStorage.setItem('menhausen_points_transactions', JSON.stringify(localFormat.transactions || []));
    }

    if (remoteData.preferences) {
      const merged = resolveConflict('preferences', localData.preferences, remoteData.preferences);
      const localFormat = transformFromAPIFormat('preferences', merged);
      
      // Save preferences object
      localStorage.setItem('menhausen_user_preferences', JSON.stringify(localFormat));
      
      // Also save language separately for compatibility with existing code
      if (localFormat.language) {
        localStorage.setItem('menhausen-language', localFormat.language);
      }
    }

    if (remoteData.flowProgress) {
      const merged = resolveConflict('flowProgress', localData.flowProgress, remoteData.flowProgress);
      const localFormat = transformFromAPIFormat('flowProgress', merged);
      syncLog.debug('[SyncService] mergeAndSave - Updating app-flow-progress:', localFormat);
      localStorage.setItem('app-flow-progress', JSON.stringify(localFormat));
    } else {
      syncLog.debug('[SyncService] mergeAndSave - No remote flowProgress data');
    }

    if (remoteData.psychologicalTest) {
      const merged = resolveConflict('psychologicalTest', localData.psychologicalTest, remoteData.psychologicalTest);
      const localFormat = transformFromAPIFormat('psychologicalTest', merged);
      syncLog.debug('[SyncService] mergeAndSave - Updating psychological-test-results, hasResults:', !!localFormat);
      localStorage.setItem('psychological-test-results', JSON.stringify(localFormat));
    } else {
      syncLog.debug('[SyncService] mergeAndSave - No remote psychologicalTest data');
    }

    if (remoteData.cardProgress) {
      const merged = resolveConflict('cardProgress', localData.cardProgress, remoteData.cardProgress);
      const localFormat = transformFromAPIFormat('cardProgress', merged);
      Object.keys(localFormat).forEach(key => {
        if (key.startsWith('theme_card_progress_')) {
          localStorage.setItem(key, JSON.stringify(localFormat[key]));
        }
      });
    }

    if (remoteData.referralData) {
      const merged = resolveConflict('referralData', localData.referralData, remoteData.referralData);
      const localFormat = transformFromAPIFormat('referralData', merged);
      if (localFormat.menhausen_referred_by) {
        localStorage.setItem('menhausen_referred_by', localFormat.menhausen_referred_by);
      }
      if (localFormat.menhausen_referral_code) {
        localStorage.setItem('menhausen_referral_code', localFormat.menhausen_referral_code);
      }
      if (localFormat.menhausen_referral_registered !== undefined) {
        localStorage.setItem('menhausen_referral_registered', localFormat.menhausen_referral_registered);
      }

      // Restore referral list for the current user (referrer) from Supabase
      if (Array.isArray(localFormat.referralList) && localFormat.referralList.length > 0) {
        try {
          const telegramUserId = getTelegramUserId();
          if (telegramUserId) {
            const key = `menhausen_referral_list_${telegramUserId}`;

            // Build local ReferralStorage structure from simple userId list
            const referrals = localFormat.referralList.map((id: any) => ({
              userId: String(id),
              // We don't have precise timestamps from the backend; use a stable fallback
              registeredAt: new Date().toISOString(),
              hasPremium: false,
            }));

            const referralStorage = {
              referrerId: String(telegramUserId),
              referrals,
            };

            localStorage.setItem(key, JSON.stringify(referralStorage));
          }
        } catch (error) {
          console.warn('[SyncService] mergeAndSave - Error restoring referral list to localStorage:', error);
        }
      }
    }

    if (remoteData.experimentAssignment) {
      const merged = resolveConflict(
        'experimentAssignment',
        localData.experimentAssignment,
        remoteData.experimentAssignment,
      );
      if (merged && typeof merged === 'object' && merged.variant) {
        applyRemoteVariantIfStronger(merged as { variant: string; experimentKey?: string });
      }
    }

    if (remoteData.topicTestResults) {
      const merged = resolveConflict('topicTestResults', localData.topicTestResults, remoteData.topicTestResults);
      const localFormat = transformFromAPIFormat('topicTestResults', merged);
      saveTopicTestResultsMap(localFormat as Record<string, TopicTestResultStored>);
      bumpTopicTestVersion();
    }

    if (remoteData.language) {
      const merged = resolveConflict('language', localData.language, remoteData.language);
      localStorage.setItem('menhausen-language', merged);
    }

    if (remoteData.hasShownFirstAchievement !== undefined) {
      const merged = resolveConflict('hasShownFirstAchievement', localData.hasShownFirstAchievement, remoteData.hasShownFirstAchievement);
      localStorage.setItem('has-shown-first-achievement', String(merged));
    }

    // Handle premium status
    if (remoteData.hasPremium !== undefined) {
      syncLog.debug('[SyncService] mergeAndSave - Updating premium status:', remoteData.hasPremium);
      // Save legacy format for backward compatibility
      localStorage.setItem('user-premium-status', remoteData.hasPremium ? 'true' : 'false');
    }

    // Handle premium signature (Ed25519 signed data)
    if (remoteData.premiumSignature) {
      syncLog.debug('[SyncService] mergeAndSave - Saving premium signature');
      // Save signature synchronously to localStorage (no async needed)
      try {
        localStorage.setItem('premium-signature', JSON.stringify(remoteData.premiumSignature));
      } catch (error) {
        console.warn('[SyncService] Error saving premium signature:', error);
        // Continue without signature - will use legacy format
      }
    }
    } finally {
      if (typeof window !== 'undefined') {
        void import('../../src/sync/storeHydration')
          .then((m) => {
            m.refreshAllStoresFromStorage();
          })
          .catch((err) => {
            console.warn('[SyncService] refreshAllStoresFromStorage failed:', err);
          });
      }
    }
  }

  /**
   * Initial sync on app load
   * - If new user (no data in Supabase): upload all local data
   * - If existing user: fetch and merge with local data
   */
  public async initialSync(): Promise<SyncResult> {
    const syncStartTime = Date.now();

    // Check if sync is mocked (e2e tests)
    if (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT__ && (window as any).__MOCK_SUPABASE_SYNC__) {
      syncLog.debug('[SyncService] Mocked: initialSync - returning success without syncing (e2e test mode)');
      return {
        success: true,
        syncedTypes: [],
        errors: [],
      };
    }
    
    if (this.syncInProgress) {
      console.warn('[SyncService] Sync already in progress');
      void capture(AnalyticsEvent.SYNC_ERROR, {
        error_message: 'Sync already in progress',
        reason: 'sync_in_progress',
        duration_ms: Date.now() - syncStartTime,
      });
      return {
        success: false,
        syncedTypes: [],
        errors: [{ type: 'surveyResults', error: 'Sync already in progress' }],
      };
    }

    // Wait for initialization to complete before checking if Supabase is configured
    await this.initializationPromise;

    // Check if Supabase is configured
    // Note: In local development, getTelegramUserId() returns "111" automatically
    if (!this.supabase) {
      console.warn('[SyncService] Supabase not configured, skipping sync');
      void capture(AnalyticsEvent.SYNC_ERROR, {
        error_message: 'Supabase not configured',
        reason: 'supabase_not_configured',
        duration_ms: Date.now() - syncStartTime,
      });
      return {
        success: false,
        syncedTypes: [],
        errors: [{ type: 'surveyResults', error: 'Supabase not configured' }],
      };
    }

    const telegramUserIdStr = getTelegramUserId();
    if (!telegramUserIdStr) {
      console.warn('[SyncService] Telegram user ID not available, skipping sync');
      void capture(AnalyticsEvent.SYNC_ERROR, {
        error_message: 'Telegram user ID not available',
        reason: 'no_telegram_user_id',
        duration_ms: Date.now() - syncStartTime,
      });
      return {
        success: false,
        syncedTypes: [],
        errors: [{ type: 'surveyResults', error: 'Telegram user ID not available' }],
      };
    }

    const telegramUserId = parseInt(telegramUserIdStr, 10);
    if (isNaN(telegramUserId)) {
      console.warn('[SyncService] Invalid Telegram user ID, skipping sync');
      void capture(AnalyticsEvent.SYNC_ERROR, {
        error_message: 'Invalid Telegram user ID',
        reason: 'invalid_telegram_user_id',
        duration_ms: Date.now() - syncStartTime,
      });
      return {
        success: false,
        syncedTypes: [],
        errors: [{ type: 'surveyResults', error: 'Invalid Telegram user ID' }],
      };
    }

    syncLog.debug('[SyncService] Starting initial sync for user ID:', telegramUserId);
    syncLog.debug('[SyncService] Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

    this.syncInProgress = true;
    this.syncStatus.syncInProgress = true;

    try {
      // Check if user exists in Supabase
      syncLog.debug('[SyncService] Checking if user exists in Supabase...');
      const remoteData = await this.fetchFromSupabase(telegramUserId, 'initialSync');
      syncLog.debug('[SyncService] Remote data check result:', remoteData ? 'User exists' : 'New user');

      if (remoteData) {
        // Existing user: merge remote with local
        syncLog.debug('[SyncService] Existing user detected, merging data');
        syncLog.debug('[SyncService] Remote data keys:', Object.keys(remoteData));
        this.mergeAndSave(remoteData);

        // Upload merged local data to ensure consistency
        const localData = this.getAllLocalStorageData();
        syncLog.debug('[SyncService] Local data keys after merge:', Object.keys(localData));
        syncLog.debug('[SyncService] Uploading merged data to Supabase in background...');
        void this.syncToSupabase(localData)
          .then((uploadResult) => {
            syncLog.debug('[SyncService] Background upload result:', uploadResult);
          })
          .catch((error) => {
            console.warn('[SyncService] Background upload failed:', error);
          });

        this.syncStatus.lastSync = new Date();
        this.syncStatus.syncInProgress = false;
        this.syncInProgress = false;

        void capture(AnalyticsEvent.SYNC_SUCCESS, {
          duration_ms: Date.now() - syncStartTime,
          synced_types: [] as string[],
          flow: 'existing_user',
        });

        return {
          success: true,
          syncedTypes: [],
        };
      } else {
        // New user: upload all local data
        syncLog.debug('[SyncService] New user detected, uploading local data');
        const localData = this.getAllLocalStorageData();
        syncLog.debug('[SyncService] Local data keys:', Object.keys(localData));
        syncLog.debug('[SyncService] Local data summary:', Object.keys(localData).reduce((acc, key) => {
          acc[key] = localData[key] ? (typeof localData[key] === 'object' ? Object.keys(localData[key]).length + ' items' : 'present') : 'null';
          return acc;
        }, {} as Record<string, string>));

        // Only upload if there's data to upload
        if (Object.keys(localData).length > 0) {
          syncLog.debug('[SyncService] Uploading local data to Supabase in background...');
          void this.syncToSupabase(localData)
            .then((uploadResult) => {
              syncLog.debug('[SyncService] Background upload result:', uploadResult);
            })
            .catch((error) => {
              console.warn('[SyncService] Background upload failed:', error);
            });
          this.syncStatus.lastSync = new Date();
          this.syncStatus.syncInProgress = false;
          this.syncInProgress = false;
          void capture(AnalyticsEvent.SYNC_SUCCESS, {
            duration_ms: Date.now() - syncStartTime,
            synced_types: [] as string[],
            flow: 'new_user_upload',
          });
          return {
            success: true,
            syncedTypes: [],
          };
        } else {
          // No local data, just mark as synced
          this.syncStatus.lastSync = new Date();
          this.syncStatus.syncInProgress = false;
          this.syncInProgress = false;
          void capture(AnalyticsEvent.SYNC_SUCCESS, {
            duration_ms: Date.now() - syncStartTime,
            synced_types: [] as string[],
            flow: 'new_user_empty',
          });
          return {
            success: true,
            syncedTypes: [],
          };
        }
      }
    } catch (error) {
      console.error('[SyncService] Initial sync failed:', error);
      this.syncStatus.syncInProgress = false;
      this.syncInProgress = false;
      const err = error instanceof Error ? error : new Error(String(error));
      void capture(AnalyticsEvent.SYNC_ERROR, {
        error_message: err.message,
        reason: 'initial_sync_exception',
        duration_ms: Date.now() - syncStartTime,
      });
      void captureException(err, { context: 'initial_sync' });
      return {
        success: false,
        syncedTypes: [],
        errors: [{ type: 'surveyResults', error: error instanceof Error ? error.message : 'Unknown error' }],
      };
    }
  }

  /**
   * Force full sync
   */
  public async forceSync(): Promise<SyncResult> {
    return this.initialSync();
  }

  /**
   * Clear sync queue
   */
  public clearQueue(): void {
    this.offlineQueue = [];
    this.saveOfflineQueue();
  }

  /**
   * Fetch user data from Supabase (including premium status)
   * Returns user data with hasPremium and premiumSignature fields
   */
  public async fetchUserData(): Promise<{ hasPremium?: boolean; premiumSignature?: any } | null> {
    // Wait for initialization
    await this.initializationPromise;

    const telegramUserIdStr = getTelegramUserId();
    if (!telegramUserIdStr) {
      return null;
    }

    const telegramUserId = parseInt(telegramUserIdStr, 10);
    if (isNaN(telegramUserId)) {
      return null;
    }

    try {
      const userData = await this.fetchFromSupabase(telegramUserId, 'fetchUserData');
      if (userData) {
        return {
          hasPremium: userData.hasPremium,
          premiumSignature: userData.premiumSignature
        };
      }
      return null;
    } catch (error) {
      console.error('[SyncService] Error fetching user data:', error);
      return null;
    }
  }

  public clearFetchCache(): void {
    this.fetchCache = {
      inFlight: null,
      result: null,
      timestamp: 0,
    };
  }
}

// Export singleton instance
let syncServiceInstance: SupabaseSyncService | null = null;

/**
 * Check if we're in Playwright test environment with mocked sync
 */
function isMockedSyncEnabled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!(window as any).__PLAYWRIGHT__ && !!(window as any).__MOCK_SUPABASE_SYNC__;
}

/**
 * Get or create sync service instance
 */
export function getSyncService(): SupabaseSyncService {
  if (!syncServiceInstance) {
    syncServiceInstance = new SupabaseSyncService();
    
    // If we're in Playwright test mode with mocked sync, override methods to do nothing
    if (isMockedSyncEnabled()) {
      syncLog.debug('[SyncService] E2E test mode detected - Supabase sync is mocked');
      
      // Override initialSync to return success without syncing
      syncServiceInstance.initialSync = async () => {
        syncLog.debug('[SyncService] Mocked: initialSync - returning success without syncing (e2e test mode)');
        return {
          success: true,
          syncedTypes: [],
          errors: [],
        };
      };
      
      // Override queueSync to do nothing (prevent incremental syncs)
      const originalQueueSync = (syncServiceInstance as any).queueSync;
      if (originalQueueSync) {
        (syncServiceInstance as any).queueSync = () => {
          syncLog.debug('[SyncService] Mocked: queueSync - skipping sync (e2e test mode)');
          // Do nothing - skip sync operations
        };
      }
    }
  }
  return syncServiceInstance;
}

