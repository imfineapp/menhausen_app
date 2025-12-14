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
import { getTelegramUserId, isTelegramEnvironment } from '../telegramUserUtils';
import { loadUserStats } from '../../services/userStatsService';
import { loadUserAchievements } from '../../services/achievementStorage';
import { PointsManager } from '../PointsManager';
import { loadTestResults } from '../psychologicalTestStorage';
import { DailyCheckinManager } from '../DailyCheckinManager';
import { ThemeCardManager } from '../ThemeCardManager';
import { getReferrerId, isReferralRegistered, getReferralList } from '../referralUtils';

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

  constructor(config?: Partial<SyncConfig>) {
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
    this.initializeSupabase();
    this.setupOnlineListeners();
    this.loadOfflineQueue();
  }

  /**
   * Initialize Supabase client
   */
  private initializeSupabase(): void {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase configuration missing. Sync will be disabled.');
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
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
   * Perform sync operation
   */
  private async performSync(type: SyncDataType, data: any): Promise<void> {
    // TODO: Implement actual sync logic in Phase 2
    console.log(`[SyncService] Syncing ${type}`, data);
  }

  /**
   * Process offline queue when online
   */
  private async processOfflineQueue(): Promise<void> {
    if (!this.syncStatus.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    // TODO: Process queued items
    console.log(`[SyncService] Processing ${this.offlineQueue.length} queued items`);
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
      if (checkins.length > 0) {
        const checkinsObj: Record<string, any> = {};
        checkins.forEach(checkin => {
          checkinsObj[checkin.date] = {
            mood: checkin.mood,
            value: checkin.value,
            color: checkin.color,
            completed: checkin.completed,
          };
        });
        data.dailyCheckins = transformToAPIFormat('dailyCheckins', checkinsObj);
      }
    } catch (e) {
      console.warn('Error loading checkins:', e);
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

    // Preferences
    try {
      const preferencesRaw = localStorage.getItem('menhausen_user_preferences');
      if (preferencesRaw) {
        const preferences = JSON.parse(preferencesRaw);
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

    // Language
    try {
      const language = localStorage.getItem('menhausen-language');
      if (language) {
        data.language = transformToAPIFormat('language', language);
      }
    } catch (e) {
      console.warn('Error loading language:', e);
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

    return data;
  }

  /**
   * Fetch user data from Supabase
   */
  private async fetchFromSupabase(_telegramUserId: number): Promise<UserDataFromAPI | null> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL not configured');
      }

      // Get initData from Telegram WebApp
      const initData = window.Telegram?.WebApp?.initData;
      if (!initData) {
        throw new Error('Telegram initData not available');
      }

      // Call Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/get-user-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // User doesn't exist
        }
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
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
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL not configured');
      }

      // Get initData from Telegram WebApp
      const initData = window.Telegram?.WebApp?.initData;
      if (!initData) {
        throw new Error('Telegram initData not available');
      }

      // Call Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-user-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync user data: ${response.status}`);
      }

      const result = await response.json();
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
    const localData = this.getAllLocalStorageData();

    // Merge each data type
    if (remoteData.surveyResults) {
      const merged = resolveConflict('surveyResults', localData.surveyResults, remoteData.surveyResults);
      const localFormat = transformFromAPIFormat('surveyResults', merged);
      localStorage.setItem('survey-results', JSON.stringify(localFormat));
    }

    if (remoteData.dailyCheckins) {
      const merged = resolveConflict('dailyCheckins', localData.dailyCheckins, remoteData.dailyCheckins);
      const localFormat = transformFromAPIFormat('dailyCheckins', merged);
      Object.keys(localFormat).forEach(key => {
        localStorage.setItem(key, JSON.stringify(localFormat[key]));
      });
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
      localStorage.setItem('menhausen_user_preferences', JSON.stringify(localFormat));
    }

    if (remoteData.flowProgress) {
      const merged = resolveConflict('flowProgress', localData.flowProgress, remoteData.flowProgress);
      const localFormat = transformFromAPIFormat('flowProgress', merged);
      localStorage.setItem('app-flow-progress', JSON.stringify(localFormat));
    }

    if (remoteData.psychologicalTest) {
      const merged = resolveConflict('psychologicalTest', localData.psychologicalTest, remoteData.psychologicalTest);
      const localFormat = transformFromAPIFormat('psychologicalTest', merged);
      localStorage.setItem('psychological-test-results', JSON.stringify(localFormat));
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
  }

  /**
   * Initial sync on app load
   * - If new user (no data in Supabase): upload all local data
   * - If existing user: fetch and merge with local data
   */
  public async initialSync(): Promise<SyncResult> {
    if (this.syncInProgress) {
      console.warn('[SyncService] Sync already in progress');
      return {
        success: false,
        syncedTypes: [],
        errors: [{ type: 'surveyResults', error: 'Sync already in progress' }],
      };
    }

    // Check if we're in Telegram environment
    if (!isTelegramEnvironment()) {
      console.warn('[SyncService] Not in Telegram environment, skipping sync');
      return {
        success: false,
        syncedTypes: [],
        errors: [{ type: 'surveyResults', error: 'Not in Telegram environment' }],
      };
    }

    // Check if Supabase is configured
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

    this.syncInProgress = true;
    this.syncStatus.syncInProgress = true;

    try {
      // Check if user exists in Supabase
      const remoteData = await this.fetchFromSupabase(telegramUserId);

      if (remoteData) {
        // Existing user: merge remote with local
        console.log('[SyncService] Existing user detected, merging data');
        this.mergeAndSave(remoteData);

        // Upload merged local data to ensure consistency
        const localData = this.getAllLocalStorageData();
        const uploadResult = await this.syncToSupabase(localData);

        this.syncStatus.lastSync = new Date();
        this.syncStatus.syncInProgress = false;
        this.syncInProgress = false;

        return uploadResult;
      } else {
        // New user: upload all local data
        console.log('[SyncService] New user detected, uploading local data');
        const localData = this.getAllLocalStorageData();

        // Only upload if there's data to upload
        if (Object.keys(localData).length > 0) {
          const uploadResult = await this.syncToSupabase(localData);
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
}

// Export singleton instance
let syncServiceInstance: SupabaseSyncService | null = null;

/**
 * Get or create sync service instance
 */
export function getSyncService(): SupabaseSyncService {
  if (!syncServiceInstance) {
    syncServiceInstance = new SupabaseSyncService();
  }
  return syncServiceInstance;
}

