import { describe, it, expect } from 'vitest'
import { shouldPullSyncOnForeground, VISIBILITY_STALE_MS } from '@/src/utils/visibilitySync'

describe('visibilitySync', () => {
  const now = 1_700_000_000_000

  it('returns true when last sync is null (never synced)', () => {
    expect(shouldPullSyncOnForeground(null, now)).toBe(true)
  })

  it('returns true when last sync is 0', () => {
    expect(shouldPullSyncOnForeground(0, now)).toBe(true)
  })

  it('returns false when last sync is within stale window', () => {
    const last = now - 30_000
    expect(shouldPullSyncOnForeground(last, now)).toBe(false)
  })

  it('returns true when last sync is older than VISIBILITY_STALE_MS', () => {
    const last = now - VISIBILITY_STALE_MS - 1
    expect(shouldPullSyncOnForeground(last, now)).toBe(true)
  })
})
