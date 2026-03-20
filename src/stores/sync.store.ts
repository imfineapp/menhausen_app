import { atom } from 'nanostores'
import type { SyncResult } from '@/utils/supabaseSync/types'
import { getSyncService } from '@/utils/supabaseSync'

export type SyncStatus = 'idle' | 'syncing' | 'error'

export const $syncStatus = atom<SyncStatus>('idle')
export const $lastSyncTime = atom<Date | null>(null)
export const $syncError = atom<string | null>(null)

export async function initSync(): Promise<SyncResult> {
  $syncError.set(null)
  $syncStatus.set('syncing')

  try {
    const syncService = getSyncService()
    const result = await syncService.initialSync()

    if (result?.success) {
      $syncStatus.set('idle')
      $lastSyncTime.set(new Date())
    } else {
      $syncStatus.set('error')
    }

    return result
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    $syncError.set(message)
    $syncStatus.set('error')
    return {
      success: false,
      syncedTypes: [],
      errors: [{ type: 'flowProgress', error: message }]
    }
  }
}

export async function forceSync(): Promise<SyncResult> {
  return initSync()
}

