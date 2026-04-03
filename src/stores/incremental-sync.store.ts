import { atom } from 'nanostores'

/** Last error from batched / incremental sync (not initial mount sync). */
export const $incrementalSyncError = atom<string | null>(null)

export function setIncrementalSyncError(message: string | null): void {
  $incrementalSyncError.set(message)
}

/** Mirrors `supabase_sync_queue` length for UI visibility. */
export const $pendingSyncQueueCount = atom(0)

export function setPendingSyncQueueCount(count: number): void {
  $pendingSyncQueueCount.set(count)
}
