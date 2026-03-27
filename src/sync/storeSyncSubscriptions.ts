/**
 * Domain stores are the source of truth for UI; localStorage is a cache.
 * When a store changes, enqueue incremental sync (replaces localStorage interceptor → queueSync).
 */

import { onSet } from 'nanostores'

import { $achievementsState } from '@/src/stores/achievements.store'
import { $flowProgress } from '@/src/stores/app-flow.store'
import { $todayCheckin } from '@/src/stores/checkin.store'
import { $language } from '@/src/stores/language.store'
import { $surveyResults } from '@/src/stores/survey.store'
import { $themeProgressVersion } from '@/src/stores/theme-progress.store'
import { getSyncService } from '@/utils/supabaseSync/supabaseSyncService'
import type { SyncDataType } from '@/utils/supabaseSync/types'

import { isHydratingFromMerge } from './storeHydration'

let storeSyncEnqueueEnabled = false

function queueIfNeeded(type: SyncDataType): void {
  if (typeof window === 'undefined') return
  if (!storeSyncEnqueueEnabled) return
  if (isHydratingFromMerge()) return
  try {
    getSyncService().queueSync(type)
  } catch {
    // ignore
  }
}

/**
 * Register listeners once at app startup. Enqueue is disabled until the next macrotask
 * so initial store values do not trigger spurious syncs.
 */
export function initStoreSyncSubscriptions(): void {
  onSet($surveyResults, () => queueIfNeeded('surveyResults'))
  onSet($flowProgress, () => queueIfNeeded('flowProgress'))
  onSet($todayCheckin, () => queueIfNeeded('dailyCheckins'))
  onSet($achievementsState, () => queueIfNeeded('achievements'))
  onSet($language, () => queueIfNeeded('preferences'))
  onSet($themeProgressVersion, () => queueIfNeeded('cardProgress'))

  if (typeof window !== 'undefined') {
    window.setTimeout(() => {
      storeSyncEnqueueEnabled = true
    }, 0)
  } else {
    storeSyncEnqueueEnabled = true
  }
}
