/** Stale threshold for pull sync when returning from background (matches AppContent). */
export const VISIBILITY_STALE_MS = 60_000

export function shouldPullSyncOnForeground(lastSyncMs: number | null, nowMs: number = Date.now()): boolean {
  if (lastSyncMs == null || lastSyncMs <= 0) return true
  return nowMs - lastSyncMs > VISIBILITY_STALE_MS
}
