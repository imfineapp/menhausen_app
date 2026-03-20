import type { SyncResult } from '@/utils/supabaseSync/types'
import { getSyncService } from '@/utils/supabaseSync'

export async function initialSync(): Promise<SyncResult> {
  const syncService = getSyncService()
  return await syncService.initialSync()
}

export async function fetchUserData(): Promise<any> {
  const syncService = getSyncService()
  return await syncService.fetchUserData()
}

