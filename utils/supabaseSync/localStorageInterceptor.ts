/**
 * LocalStorage Interceptor
 * 
 * Intercepts localStorage operations to trigger sync operations
 * Uses Proxy API for zero-code-change interception
 */

import type { SyncDataType } from './types';

/**
 * Map localStorage keys to sync data types
 */
const KEY_TO_SYNC_TYPE: Record<string, SyncDataType> = {
  'survey-results': 'surveyResults',
  'app-flow-progress': 'flowProgress',
  'menhausen-language': 'preferences', // Language is part of preferences
  'menhausen_user_stats': 'userStats',
  'menhausen_achievements': 'achievements',
  'menhausen_points_balance': 'points',
  'menhausen_points_transactions': 'points',
  'menhausen_user_preferences': 'preferences',
  'psychological-test-results': 'psychologicalTest',
  'menhausen_referred_by': 'referralData',
  'menhausen_referral_code': 'referralData',
  'menhausen_referral_registered': 'referralData',
};

/**
 * Check if key is for daily checkins
 */
function isDailyCheckinKey(key: string): boolean {
  return key.startsWith('daily_checkin_');
}

/**
 * Check if key is for card progress
 */
function isCardProgressKey(key: string): boolean {
  return key.startsWith('theme_card_progress_');
}

/**
 * Check if key is for referral list
 */
function isReferralListKey(key: string): boolean {
  return key.startsWith('menhausen_referral_list_');
}

/**
 * Get sync type for a localStorage key
 */
function getSyncTypeForKey(key: string): SyncDataType | null {
  // Direct mapping
  if (KEY_TO_SYNC_TYPE[key]) {
    return KEY_TO_SYNC_TYPE[key];
  }

  // Pattern matching
  if (isDailyCheckinKey(key)) {
    return 'dailyCheckins';
  }
  
  if (isCardProgressKey(key)) {
    return 'cardProgress';
  }

  if (isReferralListKey(key)) {
    return 'referralData';
  }

  return null;
}

/**
 * Callback type for change notifications
 */
export type ChangeCallback = (key: string, syncType: SyncDataType | null, value: string | null) => void;

/**
 * LocalStorage Interceptor Class
 * 
 * Intercepts localStorage operations using Proxy API
 * Notifies listeners of changes for sync operations
 */
export class LocalStorageInterceptor {
  private originalLocalStorage: Storage | null = null;
  private changeCallbacks: Set<ChangeCallback> = new Set();
  private isIntercepted = false;
  private debounceTimers: Map<string, number> = new Map();
  /** Single debounce lives in SupabaseSyncService.queueSync; notify immediately. */
  private readonly debounceMs = 0;
  private isSilent = false; // Flag to temporarily disable notifications
  private storageProto: Storage | null = null;
  private origSetItem: Storage['setItem'] | null = null;
  private origRemoveItem: Storage['removeItem'] | null = null;
  private origClear: Storage['clear'] | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.originalLocalStorage = window.localStorage;
    }
  }

  /**
   * Patch Storage.prototype for window.localStorage only (no Proxy on window).
   */
  public intercept(): void {
    if (typeof window === 'undefined' || this.isIntercepted) {
      return;
    }

    if (!this.originalLocalStorage) {
      return;
    }

    try {
      const ls = window.localStorage;
      this.storageProto = Object.getPrototypeOf(ls) as Storage;
      this.origSetItem = this.storageProto.setItem;
      this.origRemoveItem = this.storageProto.removeItem;
      this.origClear = this.storageProto.clear;

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;

      this.storageProto.setItem = function (this: Storage, key: string, value: string) {
        self.origSetItem!.call(this, key, value);
        if (this === window.localStorage) {
          self.onChange(key, value);
        }
      };

      this.storageProto.removeItem = function (this: Storage, key: string) {
        self.origRemoveItem!.call(this, key);
        if (this === window.localStorage) {
          self.onChange(key, null);
        }
      };

      this.storageProto.clear = function (this: Storage) {
        const keys: string[] = [];
        if (this === window.localStorage) {
          for (let i = 0; i < this.length; i++) {
            const k = this.key(i);
            if (k) keys.push(k);
          }
        }
        self.origClear!.call(this);
        if (this === window.localStorage) {
          keys.forEach((k) => self.onChange(k, null));
        }
      };

      this.isIntercepted = true;
    } catch (error) {
      console.warn('[LocalStorageInterceptor] Failed to patch localStorage:', error);
    }
  }

  /**
   * Handle localStorage change
   * Debounces rapid changes and notifies listeners
   */
  private onChange(key: string, value: string | null): void {
    // Skip notifications if silent mode is enabled
    if (this.isSilent) {
      return;
    }

    // Clear existing debounce timer for this key
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounce timer
    const timer = window.setTimeout(() => {
      const syncType = getSyncTypeForKey(key);
      
      // Notify all callbacks
      this.changeCallbacks.forEach(callback => {
        try {
          callback(key, syncType, value);
        } catch (error) {
          console.error('[LocalStorageInterceptor] Error in change callback:', error);
        }
      });

      this.debounceTimers.delete(key);
    }, this.debounceMs) as unknown as number;

    this.debounceTimers.set(key, timer);
  }

  /**
   * Enable silent mode (disable notifications temporarily)
   * Useful for batch operations like mergeAndSave
   */
  public setSilentMode(enabled: boolean): void {
    this.isSilent = enabled;
  }

  /**
   * Register change callback
   * @returns Unsubscribe function
   */
  public onKeyChange(callback: ChangeCallback): () => void {
    this.changeCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.changeCallbacks.delete(callback);
    };
  }

  /**
   * Restore Storage.prototype methods (tests only).
   */
  public remove(): void {
    if (!this.isIntercepted || !this.storageProto || !this.origSetItem) {
      return;
    }

    this.debounceTimers.forEach(timer => {
      clearTimeout(timer);
    });
    this.debounceTimers.clear();

    try {
      this.storageProto.setItem = this.origSetItem;
      this.storageProto.removeItem = this.origRemoveItem!;
      this.storageProto.clear = this.origClear!;
    } catch (error) {
      console.warn('[LocalStorageInterceptor] Failed to restore Storage prototype:', error);
    }

    this.isIntercepted = false;
    this.storageProto = null;
    this.origSetItem = null;
    this.origRemoveItem = null;
    this.origClear = null;
  }
}

// Export singleton instance
let interceptorInstance: LocalStorageInterceptor | null = null;

/**
 * Get or create interceptor instance
 */
export function getLocalStorageInterceptor(): LocalStorageInterceptor {
  if (!interceptorInstance) {
    interceptorInstance = new LocalStorageInterceptor();
  }
  return interceptorInstance;
}

/**
 * Initialize localStorage interceptor
 * Should be called early in app initialization
 */
export function initializeLocalStorageInterceptor(): LocalStorageInterceptor {
  const interceptor = getLocalStorageInterceptor();
  interceptor.intercept();
  return interceptor;
}

