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
  'has-shown-first-achievement': 'hasShownFirstAchievement',
  'menhausen-language': 'language',
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
  return key.startsWith('referral_list_');
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
  private readonly debounceMs = 150;
  private isSilent = false; // Flag to temporarily disable notifications

  constructor() {
    if (typeof window !== 'undefined') {
      this.originalLocalStorage = window.localStorage;
    }
  }

  /**
   * Initialize interceptor
   * Replaces window.localStorage with proxy
   */
  public intercept(): void {
    if (typeof window === 'undefined' || this.isIntercepted) {
      return;
    }

    if (!this.originalLocalStorage) {
      return;
    }

    // Create proxy for localStorage
    // Use arrow functions to preserve 'this' context instead of aliasing
    const localStorageProxy = new Proxy(this.originalLocalStorage, {
      get: (target: Storage, prop: string | symbol): any => {
        const propStr = String(prop);

        // Intercept setItem
        if (propStr === 'setItem') {
          return (key: string, value: string) => {
            target.setItem(key, value);
            this.onChange(key, value);
          };
        }

        // Intercept removeItem
        if (propStr === 'removeItem') {
          return (key: string) => {
            target.removeItem(key);
            this.onChange(key, null);
          };
        }

        // Intercept clear
        if (propStr === 'clear') {
          return () => {
            // Notify about all keys being cleared
            const keys: string[] = [];
            for (let i = 0; i < target.length; i++) {
              const key = target.key(i);
              if (key) keys.push(key);
            }
            target.clear();
            keys.forEach(key => this.onChange(key, null));
          };
        }

        // Pass through other operations
        const value = target[propStr as keyof Storage];
        if (typeof value === 'function') {
          return value.bind(target);
        }
        return value;
      },

      set: (target: Storage, prop: string | symbol, value: any): boolean => {
        // Allow setting properties directly (for compatibility)
        // But also notify about changes
        const propStr = String(prop);
        if (propStr !== 'length') {
          Reflect.set(target, prop, value);
          if (typeof propStr === 'string' && propStr.startsWith('setItem')) {
            // This is unlikely but handle it
            this.onChange(propStr, value);
          }
        }
        return true;
      },
    });

    // Replace window.localStorage
    try {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageProxy,
        writable: true,
        configurable: true,
      });
      this.isIntercepted = true;
    } catch (error) {
      console.warn('[LocalStorageInterceptor] Failed to intercept localStorage:', error);
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
   * Remove interceptor (restore original localStorage)
   */
  public remove(): void {
    if (!this.isIntercepted) {
      return;
    }

    // Clear all timers
    this.debounceTimers.forEach(timer => {
      clearTimeout(timer);
    });
    this.debounceTimers.clear();

    // Restore original localStorage
    if (this.originalLocalStorage) {
      try {
        Object.defineProperty(window, 'localStorage', {
          value: this.originalLocalStorage,
          writable: true,
          configurable: true,
        });
        this.isIntercepted = false;
      } catch (error) {
        console.warn('[LocalStorageInterceptor] Failed to remove interceptor:', error);
      }
    }
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

