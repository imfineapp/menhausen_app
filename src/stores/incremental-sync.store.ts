import { atom } from 'nanostores'
import { isPremiumReconciliationActive } from '@/src/stores/premium-reconciliation.store'

/** Last error from batched / incremental sync (not initial mount sync). */
export const $incrementalSyncError = atom<string | null>(null)

export function setIncrementalSyncError(message: string | null): void {
  $incrementalSyncError.set(message)
}

/** Suppresses user-visible sync errors while premium purchase is reconciling with the server. */
export function reportIncrementalSyncError(message: string): void {
  if (isPremiumReconciliationActive()) return
  setIncrementalSyncError(message)
}

/** Mirrors `supabase_sync_queue` length for UI visibility. */
export const $pendingSyncQueueCount = atom(0)

export function setPendingSyncQueueCount(count: number): void {
  $pendingSyncQueueCount.set(count)
}
