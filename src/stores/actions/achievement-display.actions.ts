import { checkAndUnlockAchievements } from '@/src/stores/achievements.store'
import { $screenParams, setEarnedAchievementIds } from '@/src/stores/screen-params.store'

export async function checkAndShowAchievements(
  delay: number = 200,
  forceCheck: boolean = false,
  options: { isMounted: () => boolean }
): Promise<void> {
  const { isMounted } = options
  const earnedAchievementIds = $screenParams.get().earnedAchievementIds

  if (!forceCheck && earnedAchievementIds.length > 0) {
    return
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, delay))
    if (!isMounted()) return

    const newlyUnlocked = await checkAndUnlockAchievements()
    if (!isMounted()) return

    if (newlyUnlocked.length > 0) {
      setEarnedAchievementIds(newlyUnlocked)
    }
  } catch (error) {
    console.error('[Achievements] Error checking achievements:', error)
  }
}
