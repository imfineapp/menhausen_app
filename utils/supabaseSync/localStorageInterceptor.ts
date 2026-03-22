/**
 * Legacy hook point for Storage patching. Sync is driven by nanostore listeners (storeSyncSubscriptions).
 * Kept as a no-op singleton so existing call sites (tests, userPreferencesStorage) remain valid.
 */

import type { SyncDataType } from './types';

export type ChangeCallback = (key: string, syncType: SyncDataType | null, value: string | null) => void;

export class LocalStorageInterceptor {
  public intercept(): void {
    // no-op: incremental sync uses store listeners + queueSync
  }

  public setSilentMode(_enabled: boolean): void {
    // no-op
  }

  /** @deprecated No callbacks registered; returns a no-op unsubscribe. */
  public onKeyChange(_callback: ChangeCallback): () => void {
    return () => {};
  }

  /** Restore Storage.prototype if ever patched (tests). */
  public restorePrototype(): void {
    // no-op
  }
}

let interceptorInstance: LocalStorageInterceptor | null = null;

export function getLocalStorageInterceptor(): LocalStorageInterceptor {
  if (!interceptorInstance) {
    interceptorInstance = new LocalStorageInterceptor();
  }
  return interceptorInstance;
}

export function initializeLocalStorageInterceptor(): LocalStorageInterceptor {
  return getLocalStorageInterceptor();
}
