import type { AppScreen } from '@/types/userState'

import {
  BLOCKED_SCREENS_FOR_REWARD,
  classifyAchievementsForDisplay,
  shouldShowRewardImmediately,
} from '@/src/domain/achievements.domain'
import { checkAndUnlockAchievements } from '@/src/stores/achievements.store'
import { $currentScreen, navigateTo } from '@/src/stores/navigation.store'
import { $screenParams, setEarnedAchievementIds } from '@/src/stores/screen-params.store'
import { loadUserStats } from '@/services/userStatsService'

export async function checkAndShowAchievements(
  delay: number = 200,
  forceCheck: boolean = false,
  options: { isMounted: () => boolean }
): Promise<void> {
  const { isMounted } = options
  const earnedAchievementIds = $screenParams.get().earnedAchievementIds
  const currentScreen = $currentScreen.get()

  if (!forceCheck && earnedAchievementIds.length > 0) {
    console.log('[Achievements] Skipping check - already have achievements to show:', earnedAchievementIds)
    return
  }

  try {
    console.log('[Achievements] Checking achievements, currentScreen:', currentScreen, 'delay:', delay, 'forceCheck:', forceCheck)

    await new Promise((resolve) => setTimeout(resolve, delay))

    if (!isMounted()) {
      console.log('[Achievements] Component unmounted, skipping')
      return
    }

    const currentStats = loadUserStats()
    console.log('[Achievements] Current user stats before check:', {
      cardsOpened: currentStats.cardsOpened,
      stress: currentStats.cardsOpened['stress'] || 0,
    })

    const newlyUnlocked = await checkAndUnlockAchievements()
    console.log('[Achievements] Newly unlocked achievements:', newlyUnlocked)

    if (!isMounted()) {
      console.log('[Achievements] Component unmounted after async check, skipping')
      return
    }

    if (newlyUnlocked.length > 0) {
      setEarnedAchievementIds(newlyUnlocked)
      console.log('[Achievements] Saved achievements to earnedAchievementIds:', newlyUnlocked)

      const buckets = classifyAchievementsForDisplay(newlyUnlocked)
      const shouldShowImmediately = shouldShowRewardImmediately(currentScreen, buckets)

      console.log(
        '[Achievements] shouldShowImmediately:',
        shouldShowImmediately,
        'blockedScreensForReward includes currentScreen:',
        BLOCKED_SCREENS_FOR_REWARD.includes(currentScreen as AppScreen),
      )

      if (!BLOCKED_SCREENS_FOR_REWARD.includes(currentScreen as AppScreen) && shouldShowImmediately) {
        console.log('[Achievements] Navigating to reward screen')
        navigateTo('reward')
      } else {
        if (buckets.cardRelated.length > 0 && (currentScreen === 'card-details' || currentScreen === 'theme-home')) {
          console.log('[Achievements] Not showing immediately - will show on theme-home')
        } else if (buckets.articleRelated.length > 0 && currentScreen === 'article') {
          console.log('[Achievements] Not showing immediately - will show on article back')
        } else if (buckets.streakRelated.length > 0 && currentScreen === 'checkin') {
          console.log('[Achievements] Not showing immediately - will show on home after checkin')
        } else if (buckets.referralRelated.length > 0) {
          console.log('[Achievements] Not showing immediately - will show on profile')
        }
      }
    } else {
      console.log('[Achievements] No new achievements unlocked')
    }
  } catch (error) {
    console.error('[Achievements] Error checking achievements:', error)
  }
}
