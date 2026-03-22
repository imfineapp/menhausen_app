/**
 * Rehydrate domain nanostores from localStorage after server merge (pull sync).
 * While hydrating, store listeners must not enqueue incremental sync (see storeSyncSubscriptions).
 */

import { loadUserAchievements } from '@/services/achievementStorage'
import { $achievementsState } from '@/src/stores/achievements.store'
import { refreshFlowProgress } from '@/src/stores/app-flow.store'
import { refreshCheckin } from '@/src/stores/checkin.store'
import { initLanguage } from '@/src/stores/language.store'
import { initPremiumFromLocalStorage } from '@/src/stores/premium.store'
import { refreshPoints } from '@/src/stores/points.store'
import { initSurveyState } from '@/src/stores/survey.store'
import { refreshThemeProgress } from '@/src/stores/theme-progress.store'

let hydratingFromMerge = false

export function setHydratingFromMerge(v: boolean): void {
  hydratingFromMerge = v
}

export function isHydratingFromMerge(): boolean {
  return hydratingFromMerge
}

/** Call after mergeAndSave writes remote-merged data into localStorage. */
export function refreshAllStoresFromStorage(): void {
  setHydratingFromMerge(true)
  try {
    initSurveyState()
    refreshFlowProgress()
    refreshCheckin()
    refreshPoints()
    $achievementsState.set(loadUserAchievements())
    initLanguage()
    initPremiumFromLocalStorage()
    refreshThemeProgress()
  } finally {
    setHydratingFromMerge(false)
  }
}
