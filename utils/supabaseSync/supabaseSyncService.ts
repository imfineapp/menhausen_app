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
import { transformToAPIFormat, transformFromAPIFormat } from './dataTransformers';
import { resolveConflict } from './conflictResolver';
import { getTelegramUserId } from '../telegramUserUtils';
import { loadUserStats } from '../../services/userStatsService';
import { loadUserAchievements } from '../../services/achievementStorage';
import { PointsManager } from '../PointsManager';
import { loadTestResults } from '../psychologicalTestStorage';
import { DailyCheckinManager } from '../DailyCheckinManager';
import { ThemeCardManager } from '../ThemeCardManager';
import { getReferrerId, isReferralRegistered, getReferralList } from '../referralUtils';
import { initializeLocalStorageInterceptor, getLocalStorageInterceptor } from './localStorageInterceptor';
import { getValidJWTToken } from './authService';

/**
 * Supabase Sync Service Class
 * 
 * Manages synchronization between localStorage and Supabase
 */
export class SupabaseSyncService {
  private supabase: SupabaseClient | null = null;
  private syncInProgress = false;
  private offlineQueue: SyncQueueItem[] = [];
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    lastSync: null,
    pendingItems: 0,
    syncInProgress: false,
    errors: [],
  };
  private config: SyncConfig;
  private debounceTimers: Map<SyncDataType, number> = new Map();
  private initializationPromise: Promise<void>;

  constructor(config?: Partial<SyncConfig>) {
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
    // Initialize Supabase asynchronously and track the promise
    this.initializationPromise = this.initializeSupabase().catch((error) => {
      console.error('Error initializing Supabase:', error);
    });
    this.setupOnlineListeners();
    this.loadOfflineQueue();
    this.setupLocalStorageInterceptor();
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
        this.offlineQueue = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
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
   * Queue a sync operation
   */
  public queueSync(type: SyncDataType, data: any): void {
    // Check if sync is mocked (e2e tests)
    if (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT__ && (window as any).__MOCK_SUPABASE_SYNC__) {
      console.log(`[SyncService] Mocked: queueSync(${type}) - skipping sync (e2e test mode)`);
      return;
    }
    
    if (!this.config.enableOfflineQueue) {
      return;
    }

    // Clear existing debounce timer for this type
    const existingTimer = this.debounceTimers.get(type);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounce timer
    const timer = window.setTimeout(() => {
      this.performSync(type, data);
      this.debounceTimers.delete(type);
    }, this.config.debounceMs);

    this.debounceTimers.set(type, timer);
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
      console.log('[SyncService] Using mock initData for local development (user ID 111)');
      return mockInitData;
    }
    return initData;
  }

  /**
   * Perform incremental sync operation for a specific data type
   */
  private async performSync(type: SyncDataType, data: any): Promise<void> {
    // Check if sync is mocked (e2e tests)
    if (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT__ && (window as any).__MOCK_SUPABASE_SYNC__) {
      console.log(`[SyncService] Mocked: performSync(${type}) - skipping sync (e2e test mode)`);
      return;
    }
    
    if (!this.supabase || !this.syncStatus.isOnline) {
      // Queue for later if offline
      if (this.config.enableOfflineQueue) {
        this.offlineQueue.push({
          type,
          data,
          timestamp: new Date(),
          retryCount: 0,
        });
        this.saveOfflineQueue();
      }
      return;
    }

    try {
      // Get data for this specific type
      const localData = this.getAllLocalStorageData();
      const typeData = localData[type];

      if (!typeData) {
        return; // No data to sync
      }

      // Sync to Supabase using incremental sync (PATCH)
      await this.syncIncremental(type, typeData);
      
      // Update sync status
      this.syncStatus.lastSync = new Date();
      this.syncStatus.syncInProgress = false;
    } catch (error) {
      console.error(`[SyncService] Error syncing ${type}:`, error);
      
      // Add to offline queue if retryable
      if (this.config.enableOfflineQueue) {
        this.offlineQueue.push({
          type,
          data,
          timestamp: new Date(),
          retryCount: 0,
        });
        this.saveOfflineQueue();
      }

      // Track error
      this.syncStatus.errors.push({
        type,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        retryable: true,
      });
    }
  }

  /**
   * Setup localStorage interceptor for real-time sync
   */
  private setupLocalStorageInterceptor(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const interceptor = initializeLocalStorageInterceptor();
      
      // Register change handler
      interceptor.onKeyChange((key: string, syncType: SyncDataType | null, _value: string | null) => {
        if (syncType) {
          // Get current data for this type
          const localData = this.getAllLocalStorageData();
          const typeData = localData[syncType];
          
          if (typeData) {
            // Queue sync operation (will be debounced)
            this.queueSync(syncType, typeData);
          }
        }
      });
    } catch (error) {
      console.warn('[SyncService] Failed to setup localStorage interceptor:', error);
    }
  }

  /**
   * Perform incremental sync for a specific data type
   */
  private async syncIncremental(type: SyncDataType, data: any): Promise<void> {
    // Check if sync is mocked (e2e tests)
    if (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT__ && (window as any).__MOCK_SUPABASE_SYNC__) {
      console.log(`[SyncService] Mocked: syncIncremental(${type}) - skipping sync (e2e test mode)`);
      return;
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

      console.log(`[SyncService] syncIncremental - Syncing ${type}`);
      console.log(`[SyncService] syncIncremental - Data preview:`, typeof data === 'object' ? JSON.stringify(data).substring(0, 200) : data);
      console.log(`[SyncService] syncIncremental - Using JWT:`, !!jwtToken);

      const url = `${supabaseUrl}/functions/v1/sync-user-data`;
      const body = JSON.stringify({
        dataType: type,
        data,
      });
      console.log(`[SyncService] syncIncremental - URL:`, url);
      console.log(`[SyncService] syncIncremental - Body size:`, body.length, 'bytes');

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

      // Call Edge Function with PATCH method for incremental sync
      console.log('[SyncService] Making PATCH request to:', url);
      console.log('[SyncService] Request headers:', Object.keys(headers));
      
      const response = await fetch(url, {
        method: 'PATCH',
        mode: 'cors',
        credentials: 'omit',
        headers,
        body,
      });
      
      console.log('[SyncService] Response headers:', Object.fromEntries(response.headers.entries()));

      console.log(`[SyncService] syncIncremental - Response status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[SyncService] syncIncremental - Error response:`, errorText);
        throw new Error(`Failed to sync ${type}: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`[SyncService] syncIncremental - Response success:`, result.success);
      
      if (!result.success) {
        console.error(`[SyncService] syncIncremental - Sync failed:`, result.error);
        throw new Error(result.error || 'Sync failed');
      }
      
      console.log(`[SyncService] syncIncremental - Successfully synced ${type}`);
    } catch (error) {
      console.error(`[SyncService] Error in incremental sync for ${type}:`, error);
      throw error;
    }
  }

  /**
   * Process offline queue when online
   */
  private async processOfflineQueue(): Promise<void> {
    if (!this.syncStatus.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    // Process queued items with retry logic
    const itemsToProcess = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of itemsToProcess) {
      try {
        await this.performSync(item.type, item.data);
      } catch {
        // Re-queue if retries not exhausted
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
   * Get sync status
   */
  public getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Get all localStorage data in API format
   */
  private getAllLocalStorageData(): any {
    console.log('[SyncService] getAllLocalStorageData - Starting data collection');
    const data: any = {};

    // Survey results
    try {
      const surveyResultsRaw = localStorage.getItem('survey-results');
      if (surveyResultsRaw) {
        const surveyResults = JSON.parse(surveyResultsRaw);
        data.surveyResults = transformToAPIFormat('surveyResults', surveyResults);
      }
    } catch (e) {
      console.warn('Error loading survey results:', e);
    }

    // Daily checkins
    try {
      const checkins = DailyCheckinManager.getAllCheckins();
      console.log('[SyncService] getAllLocalStorageData - Daily checkins count:', checkins.length);
      if (checkins.length > 0) {
        // Transform array to API format: { "YYYY-MM-DD": { ...checkinData } }
        // This is already in API format, no need for transformToAPIFormat
        const checkinsObj: Record<string, any> = {};
        checkins.forEach(checkin => {
          // Skip checkins without a valid date to prevent "daily_checkin_undefined"
          if (!checkin.date || typeof checkin.date !== 'string') {
            console.warn('[SyncService] getAllLocalStorageData - Skipping checkin with invalid date:', checkin);
            return;
          }
          
          // Validate date format (should be YYYY-MM-DD)
          if (!/^\d{4}-\d{2}-\d{2}$/.test(checkin.date)) {
            console.warn('[SyncService] getAllLocalStorageData - Skipping checkin with invalid date format:', checkin.date);
            return;
          }
          
          checkinsObj[checkin.date] = {
            mood: checkin.mood,
            value: checkin.value,
            color: checkin.color,
            completed: checkin.completed,
          };
        });
        console.log('[SyncService] getAllLocalStorageData - Daily checkins dates:', Object.keys(checkinsObj));
        data.dailyCheckins = checkinsObj;
      } else {
        console.log('[SyncService] getAllLocalStorageData - No daily checkins found');
      }
    } catch (e) {
      console.warn('[SyncService] Error loading checkins:', e);
    }

    // User stats
    try {
      const userStats = loadUserStats();
      if (userStats) {
        data.userStats = transformToAPIFormat('userStats', userStats);
      }
    } catch (e) {
      console.warn('Error loading user stats:', e);
    }

    // Achievements
    try {
      const achievements = loadUserAchievements();
      if (achievements) {
        data.achievements = transformToAPIFormat('achievements', achievements);
      }
    } catch (e) {
      console.warn('Error loading achievements:', e);
    }

    // Points
    try {
      const balance = PointsManager.getBalance();
      const transactions = PointsManager.getTransactions();
      if (balance > 0 || transactions.length > 0) {
        data.points = transformToAPIFormat('points', {
          balance,
          transactions,
        });
      }
    } catch (e) {
      console.warn('Error loading points:', e);
    }

    // Preferences (include language)
    try {
      let preferences: any = {};
      
      // Load existing preferences if available
      const preferencesRaw = localStorage.getItem('menhausen_user_preferences');
      if (preferencesRaw) {
        try {
          preferences = JSON.parse(preferencesRaw);
        } catch (e) {
          console.warn('Error parsing preferences:', e);
        }
      }
      
      // Include language from localStorage if available
      const language = localStorage.getItem('menhausen-language');
      if (language && (language === 'en' || language === 'ru')) {
        preferences.language = language;
      }
      
      // Only include preferences if we have at least language
      if (preferences.language || Object.keys(preferences).length > 0) {
        data.preferences = transformToAPIFormat('preferences', preferences);
      }
    } catch (e) {
      console.warn('Error loading preferences:', e);
    }

    // Flow progress
    try {
      const flowProgressRaw = localStorage.getItem('app-flow-progress');
      if (flowProgressRaw) {
        const flowProgress = JSON.parse(flowProgressRaw);
        data.flowProgress = transformToAPIFormat('flowProgress', flowProgress);
      }
    } catch (e) {
      console.warn('Error loading flow progress:', e);
    }

    // Psychological test
    try {
      const psychologicalTest = loadTestResults();
      if (psychologicalTest) {
        data.psychologicalTest = transformToAPIFormat('psychologicalTest', psychologicalTest);
      }
    } catch (e) {
      console.warn('Error loading psychological test:', e);
    }

    // Card progress
    try {
      const cardProgressObj: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('theme_card_progress_')) {
          const cardId = key.replace('theme_card_progress_', '');
          const cardProgress = ThemeCardManager.getCardProgress(cardId);
          if (cardProgress) {
            cardProgressObj[cardId] = cardProgress;
          }
        }
      }
      if (Object.keys(cardProgressObj).length > 0) {
        data.cardProgress = transformToAPIFormat('cardProgress', cardProgressObj);
      }
    } catch (e) {
      console.warn('Error loading card progress:', e);
    }

    // Referral data
    try {
      const telegramUserId = getTelegramUserId();
      if (telegramUserId) {
        const referralData: any = {
          referredBy: getReferrerId(),
          referralRegistered: isReferralRegistered(),
          referralList: [],
        };
        // Try to get referral list if exists
        try {
          const referralList = getReferralList(telegramUserId);
          referralData.referralList = referralList.referrals.map(r => r.userId);
        } catch {
          // Ignore if referral list doesn't exist
        }
        data.referralData = transformToAPIFormat('referralData', referralData);
      }
    } catch (e) {
      console.warn('Error loading referral data:', e);
    }

    // Has shown first achievement
    try {
      const hasShown = localStorage.getItem('has-shown-first-achievement');
      if (hasShown) {
        data.hasShownFirstAchievement = transformToAPIFormat('hasShownFirstAchievement', hasShown === 'true');
      }
    } catch (e) {
      console.warn('Error loading has-shown-first-achievement:', e);
    }

    console.log('[SyncService] getAllLocalStorageData - Collected data keys:', Object.keys(data));
    console.log('[SyncService] getAllLocalStorageData - Data summary:', Object.keys(data).reduce((acc, key) => {
      const value = data[key];
      acc[key] = value ? (typeof value === 'object' ? 'present' : typeof value) : 'null';
      return acc;
    }, {} as Record<string, string>));

    return data;
  }

  /**
   * Fetch user data from Supabase
   */
  private async fetchFromSupabase(_telegramUserId: number): Promise<UserDataFromAPI | null> {
    // Check if sync is mocked (e2e tests)
    if (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT__ && (window as any).__MOCK_SUPABASE_SYNC__) {
      console.log('[SyncService] Mocked: fetchFromSupabase - returning null (e2e test mode)');
      return null;
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
      console.log('[SyncService] fetchFromSupabase - User ID:', _telegramUserId);
      console.log('[SyncService] fetchFromSupabase - Using JWT:', !!jwtToken);

      const url = `${supabaseUrl}/functions/v1/get-user-data`;
      console.log('[SyncService] fetchFromSupabase - Calling URL:', url);

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

      console.log('[SyncService] Making GET request to:', url);
      console.log('[SyncService] Request headers:', Object.keys(headers));
      
      // Call Edge Function
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers,
      });
      
      console.log('[SyncService] Response headers:', Object.fromEntries(response.headers.entries()));

      console.log('[SyncService] fetchFromSupabase - Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SyncService] fetchFromSupabase - Error response:', errorText);
        if (response.status === 404) {
          console.log('[SyncService] fetchFromSupabase - User not found (404)');
          return null; // User doesn't exist
        }
        throw new Error(`Failed to fetch user data: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('[SyncService] fetchFromSupabase - Response success:', result.success);
      console.log('[SyncService] fetchFromSupabase - Response data keys:', result.data ? Object.keys(result.data) : 'no data');
      console.log('[SyncService] fetchFromSupabase - hasPremium:', result.hasPremium);
      console.log('[SyncService] fetchFromSupabase - premiumSignature:', result.premiumSignature ? 'present' : 'missing');
      
      // Debug: Check dailyCheckins data
      if (result.data && result.data.dailyCheckins) {
        const checkinsCount = Object.keys(result.data.dailyCheckins).length;
        const checkinsDates = Object.keys(result.data.dailyCheckins);
        console.log('[SyncService] fetchFromSupabase - dailyCheckins found:', checkinsCount, 'checkins');
        console.log('[SyncService] fetchFromSupabase - dailyCheckins dates:', checkinsDates);
      } else {
        console.log('[SyncService] fetchFromSupabase - No dailyCheckins in response data');
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
    } catch (error) {
      console.error('Error fetching from Supabase:', error);
      throw error;
    }
  }

  /**
   * Sync data to Supabase
   */
  private async syncToSupabase(data: any): Promise<SyncResult> {
    // Check if sync is mocked (e2e tests)
    if (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT__ && (window as any).__MOCK_SUPABASE_SYNC__) {
      console.log('[SyncService] Mocked: syncToSupabase - returning success without syncing (e2e test mode)');
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

      console.log('[SyncService] syncToSupabase - Starting full sync');
      console.log('[SyncService] syncToSupabase - Data keys:', Object.keys(data));
      console.log('[SyncService] syncToSupabase - Using JWT:', !!jwtToken);
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
      console.log('[SyncService] syncToSupabase - Data summary:', dataSummary);

      const url = `${supabaseUrl}/functions/v1/sync-user-data`;
      const body = JSON.stringify({ data });
      console.log('[SyncService] syncToSupabase - URL:', url);
      console.log('[SyncService] syncToSupabase - Body size:', body.length, 'bytes');

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

      console.log('[SyncService] syncToSupabase - Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SyncService] syncToSupabase - Error response:', errorText);
        throw new Error(`Failed to sync user data: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('[SyncService] syncToSupabase - Response success:', result.success);
      console.log('[SyncService] syncToSupabase - Synced types:', result.syncedTypes);
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
    // Disable interceptor notifications during merge to avoid infinite loops
    const interceptor = getLocalStorageInterceptor();
    interceptor.setSilentMode(true);

    try {
      const localData = this.getAllLocalStorageData();

    // Merge each data type
    if (remoteData.surveyResults) {
      const merged = resolveConflict('surveyResults', localData.surveyResults, remoteData.surveyResults);
      const localFormat = transformFromAPIFormat('surveyResults', merged);
      localStorage.setItem('survey-results', JSON.stringify(localFormat));
    }

    if (remoteData.dailyCheckins) {
      console.log('[SyncService] mergeAndSave - Processing dailyCheckins');
      const remoteCheckins = remoteData.dailyCheckins;
      const remoteDates = Object.keys(remoteCheckins);
      console.log('[SyncService] mergeAndSave - remoteData.dailyCheckins dates:', remoteDates);
      
      const merged = resolveConflict('dailyCheckins', localData.dailyCheckins, remoteCheckins);
      const mergedDates = Object.keys(merged);
      console.log('[SyncService] mergeAndSave - merged dailyCheckins dates:', mergedDates);
      
      const localFormat = transformFromAPIFormat('dailyCheckins', merged);
      const localFormatKeys = Object.keys(localFormat);
      console.log('[SyncService] mergeAndSave - localFormat keys (localStorage):', localFormatKeys);
      console.log('[SyncService] mergeAndSave - Saving', localFormatKeys.length, 'checkins to localStorage');
      
      localFormatKeys.forEach(key => {
        console.log('[SyncService] mergeAndSave - Saving checkin key:', key);
        localStorage.setItem(key, JSON.stringify(localFormat[key]));
      });
      console.log('[SyncService] mergeAndSave - dailyCheckins saved successfully');
    } else {
      console.log('[SyncService] mergeAndSave - No remoteData.dailyCheckins');
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
      console.log('[SyncService] mergeAndSave - Updating app-flow-progress:', localFormat);
      localStorage.setItem('app-flow-progress', JSON.stringify(localFormat));
    } else {
      console.log('[SyncService] mergeAndSave - No remote flowProgress data');
    }

    if (remoteData.psychologicalTest) {
      const merged = resolveConflict('psychologicalTest', localData.psychologicalTest, remoteData.psychologicalTest);
      const localFormat = transformFromAPIFormat('psychologicalTest', merged);
      console.log('[SyncService] mergeAndSave - Updating psychological-test-results, hasResults:', !!localFormat);
      localStorage.setItem('psychological-test-results', JSON.stringify(localFormat));
    } else {
      console.log('[SyncService] mergeAndSave - No remote psychologicalTest data');
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
      console.log('[SyncService] mergeAndSave - Updating premium status:', remoteData.hasPremium);
      // Save legacy format for backward compatibility
      localStorage.setItem('user-premium-status', remoteData.hasPremium ? 'true' : 'false');
    }

    // Handle premium signature (Ed25519 signed data)
    if (remoteData.premiumSignature) {
      console.log('[SyncService] mergeAndSave - Saving premium signature');
      // Save signature synchronously to localStorage (no async needed)
      try {
        localStorage.setItem('premium-signature', JSON.stringify(remoteData.premiumSignature));
      } catch (error) {
        console.warn('[SyncService] Error saving premium signature:', error);
        // Continue without signature - will use legacy format
      }
    }
    } finally {
      // Re-enable interceptor notifications
      interceptor.setSilentMode(false);
    }
  }

  /**
   * Fast sync of critical data only (flowProgress + psychologicalTest + today's checkin)
   * Used for initial screen determination when local data is missing
   * Uses optimized get-user-data Edge Function (which uses PostgreSQL RPC function for single-query optimization)
   */
  public async fastSyncCriticalData(): Promise<{ flowProgress?: any; psychologicalTest?: any; todayCheckin?: any; preferences?: any } | null> {
    // Check if sync is mocked (e2e tests)
    if (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT__ && (window as any).__MOCK_SUPABASE_SYNC__) {
      console.log('[SyncService] Mocked: fastSyncCriticalData - returning null (e2e test mode)');
      return null;
    }
    
    // Wait for initialization to complete
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
      const syncStartTime = Date.now();
      
      // Use optimized get-user-data Edge Function instead of multiple REST calls
      // This now uses PostgreSQL RPC function for single-query optimization
      const userData = await this.fetchFromSupabase(telegramUserId);
      
      const syncDuration = Date.now() - syncStartTime;
      console.log(`[SyncService] Fast critical data sync completed in ${syncDuration}ms`);
      
      if (!userData) {
        return null;
      }

      const result: { flowProgress?: any; psychologicalTest?: any; todayCheckin?: any; preferences?: any } = {};
      const todayDateKey = DailyCheckinManager.getCurrentDayKey();

      // Extract critical data from userData
      if (userData.flowProgress) {
        result.flowProgress = userData.flowProgress;
        // Save to localStorage immediately
        localStorage.setItem('app-flow-progress', JSON.stringify(result.flowProgress));
      }

      if (userData.preferences) {
        result.preferences = userData.preferences;
        // Save preferences to localStorage immediately
        localStorage.setItem('menhausen_user_preferences', JSON.stringify(result.preferences));
        
        // Also save language separately for compatibility with existing code
        if (result.preferences.language) {
          localStorage.setItem('menhausen-language', result.preferences.language);
        }
      }

      if (userData.psychologicalTest?.lastCompletedAt) {
        result.psychologicalTest = {
          lastCompletedAt: userData.psychologicalTest.lastCompletedAt,
        };
        // Save minimal test data to indicate test was completed
        const existingTest = localStorage.getItem('psychological-test-results');
        if (!existingTest) {
          localStorage.setItem('psychological-test-results', JSON.stringify({
            lastCompletedAt: result.psychologicalTest.lastCompletedAt,
            scores: userData.psychologicalTest.scores || {},
            percentages: userData.psychologicalTest.percentages || {},
            history: userData.psychologicalTest.history || [],
          }));
        }
      }

      // Extract today's checkin from dailyCheckins object
      if (userData.dailyCheckins?.[todayDateKey]) {
        const checkin = userData.dailyCheckins[todayDateKey];
        result.todayCheckin = {
          mood: checkin.mood,
          value: checkin.value,
          color: checkin.color,
          completed: checkin.completed !== undefined ? checkin.completed : true,
        };
        // Save today's checkin to localStorage immediately
        const storageKey = DailyCheckinManager.getStorageKey(todayDateKey);
        const fullCheckinData = {
          id: `checkin_${todayDateKey}_${Date.now()}`,
          date: todayDateKey,
          timestamp: Date.now(),
          mood: checkin.mood,
          value: checkin.value,
          color: checkin.color,
          completed: checkin.completed !== undefined ? checkin.completed : true,
        };
        localStorage.setItem(storageKey, JSON.stringify(fullCheckinData));
      }

      return Object.keys(result).length > 0 ? result : null;
    } catch (error) {
      console.warn('[SyncService] Fast critical data sync failed:', error);
      return null;
    }
  }

  /**
   * Initial sync on app load
   * - If new user (no data in Supabase): upload all local data
   * - If existing user: fetch and merge with local data
   */
  public async initialSync(): Promise<SyncResult> {
    // Check if sync is mocked (e2e tests)
    if (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT__ && (window as any).__MOCK_SUPABASE_SYNC__) {
      console.log('[SyncService] Mocked: initialSync - returning success without syncing (e2e test mode)');
      return {
        success: true,
        syncedTypes: [],
        errors: [],
      };
    }
    
    if (this.syncInProgress) {
      console.warn('[SyncService] Sync already in progress');
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
      return {
        success: false,
        syncedTypes: [],
        errors: [{ type: 'surveyResults', error: 'Supabase not configured' }],
      };
    }

    const telegramUserIdStr = getTelegramUserId();
    if (!telegramUserIdStr) {
      console.warn('[SyncService] Telegram user ID not available, skipping sync');
      return {
        success: false,
        syncedTypes: [],
        errors: [{ type: 'surveyResults', error: 'Telegram user ID not available' }],
      };
    }

    const telegramUserId = parseInt(telegramUserIdStr, 10);
    if (isNaN(telegramUserId)) {
      console.warn('[SyncService] Invalid Telegram user ID, skipping sync');
      return {
        success: false,
        syncedTypes: [],
        errors: [{ type: 'surveyResults', error: 'Invalid Telegram user ID' }],
      };
    }

    console.log('[SyncService] Starting initial sync for user ID:', telegramUserId);
    console.log('[SyncService] Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

    this.syncInProgress = true;
    this.syncStatus.syncInProgress = true;

    try {
      // Check if user exists in Supabase
      console.log('[SyncService] Checking if user exists in Supabase...');
      const remoteData = await this.fetchFromSupabase(telegramUserId);
      console.log('[SyncService] Remote data check result:', remoteData ? 'User exists' : 'New user');

      if (remoteData) {
        // Existing user: merge remote with local
        console.log('[SyncService] Existing user detected, merging data');
        console.log('[SyncService] Remote data keys:', Object.keys(remoteData));
        this.mergeAndSave(remoteData);

        // Upload merged local data to ensure consistency
        const localData = this.getAllLocalStorageData();
        console.log('[SyncService] Local data keys after merge:', Object.keys(localData));
        console.log('[SyncService] Uploading merged data to Supabase...');
        const uploadResult = await this.syncToSupabase(localData);
        console.log('[SyncService] Upload result:', uploadResult);

        this.syncStatus.lastSync = new Date();
        this.syncStatus.syncInProgress = false;
        this.syncInProgress = false;

        return uploadResult;
      } else {
        // New user: upload all local data
        console.log('[SyncService] New user detected, uploading local data');
        const localData = this.getAllLocalStorageData();
        console.log('[SyncService] Local data keys:', Object.keys(localData));
        console.log('[SyncService] Local data summary:', Object.keys(localData).reduce((acc, key) => {
          acc[key] = localData[key] ? (typeof localData[key] === 'object' ? Object.keys(localData[key]).length + ' items' : 'present') : 'null';
          return acc;
        }, {} as Record<string, string>));

        // Only upload if there's data to upload
        if (Object.keys(localData).length > 0) {
          console.log('[SyncService] Uploading local data to Supabase...');
          const uploadResult = await this.syncToSupabase(localData);
          console.log('[SyncService] Upload result:', uploadResult);
          this.syncStatus.lastSync = new Date();
          this.syncStatus.syncInProgress = false;
          this.syncInProgress = false;
          return uploadResult;
        } else {
          // No local data, just mark as synced
          this.syncStatus.lastSync = new Date();
          this.syncStatus.syncInProgress = false;
          this.syncInProgress = false;
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
      const userData = await this.fetchFromSupabase(telegramUserId);
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
      console.log('[SyncService] E2E test mode detected - Supabase sync is mocked');
      
      // Override fastSyncCriticalData to return null (no data from Supabase)
      syncServiceInstance.fastSyncCriticalData = async () => {
        console.log('[SyncService] Mocked: fastSyncCriticalData - returning null (e2e test mode)');
        return null;
      };
      
      // Override initialSync to return success without syncing
      syncServiceInstance.initialSync = async () => {
        console.log('[SyncService] Mocked: initialSync - returning success without syncing (e2e test mode)');
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
          console.log('[SyncService] Mocked: queueSync - skipping sync (e2e test mode)');
          // Do nothing - skip sync operations
        };
      }
    }
  }
  return syncServiceInstance;
}

