import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/supabaseSync', () => ({
  getSyncService: vi.fn()
}))

import { getSyncService } from '@/utils/supabaseSync'
import { $lastSyncTime, $syncError, $syncStatus, initSync } from '../../src/stores/sync.store'

describe('sync.store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    $syncStatus.set('idle')
    $syncError.set(null)
    $lastSyncTime.set(null)
  })

  it('initSync sets status to idle and records last sync on success', async () => {
    vi.mocked(getSyncService).mockReturnValue({
      initialSync: vi.fn().mockResolvedValue({
        success: true,
        syncedTypes: [],
        errors: []
      })
    } as any)

    await initSync()

    expect($syncStatus.get()).toBe('idle')
    expect($lastSyncTime.get()).not.toBeNull()
    expect($syncError.get()).toBeNull()
  })

  it('initSync sets status to error on failure result', async () => {
    vi.mocked(getSyncService).mockReturnValue({
      initialSync: vi.fn().mockResolvedValue({
        success: false,
        syncedTypes: [],
        errors: [{ type: 'flowProgress', error: 'boom' }]
      })
    } as any)

    await initSync()

    expect($syncStatus.get()).toBe('error')
    expect($lastSyncTime.get()).toBeNull()
  })
})

