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
} from './types';
import { DEFAULT_SYNC_CONFIG } from './types';

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
   * Force full sync
   */
  public async forceSync(): Promise<SyncResult> {
    // TODO: Implement full sync in Phase 2
    return {
      success: false,
      syncedTypes: [],
      errors: [{ type: 'surveyResults', error: 'Not implemented yet' }],
    };
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

