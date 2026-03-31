import type { MutableRefObject } from 'react'
import { openPage } from '@nanostores/router'

import { invalidateUserStateCache } from '@/src/domain/user.domain'
import { $router } from '@/src/stores/router.store'
import { $flowProgress } from '@/src/stores/app-flow.store'
import { markFirstCheckinDone, markFirstRewardShown } from '@/src/stores/app-flow.store'
import {
  setEarnedAchievementIds,
  setHasShownFirstAchievementFlag,
  $screenParams,
} from '@/src/stores/screen-params.store'
import { incrementCheckin } from '@/services/userStatsService'

export function handleCheckInSubmit(
  _mood: string,
  deps: {
    isMounted: () => boolean
    checkInTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
    checkAndShowAchievements: (delay: number, forceCheck?: boolean) => Promise<void>
  }
): void {
  incrementCheckin()
  invalidateUserStateCache()
  markFirstCheckinDone()

  const flow = $flowProgress.get()
  if (!flow.firstRewardShown) {
    setEarnedAchievementIds(['newcomer'])
    setHasShownFirstAchievementFlag(true)
    markFirstRewardShown()
    openPage($router, 'reward')
    return
  }

  const { checkInTimeoutRef, isMounted, checkAndShowAchievements } = deps
  if (checkInTimeoutRef.current) {
    clearTimeout(checkInTimeoutRef.current)
  }

  checkInTimeoutRef.current = setTimeout(async () => {
    try {
      if (!isMounted()) {
        return
      }
      await checkAndShowAchievements(300, true)
      if (!isMounted()) {
        return
      }
      if ($screenParams.get().earnedAchievementIds.length === 0) {
        openPage($router, 'home')
      }
    } catch (error) {
      console.error('Error checking achievements after check-in:', error)
      if (isMounted()) {
        openPage($router, 'home')
      }
    } finally {
      checkInTimeoutRef.current = null
    }
  }, 100)
}
