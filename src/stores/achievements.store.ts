import { atom, computed, onMount } from 'nanostores'

import type { UserAchievement, UserAchievementsState } from '@/types/achievements'
import { earnPoints } from '@/src/stores/points.store'
import { RewardEventType } from '@/utils/supabaseSync/rewardService'
import { loadUserAchievements, saveUserAchievements, updateAchievement } from '@/services/achievementStorage'
import { checkAchievementCondition } from '@/services/achievementChecker'
import { loadUserStats } from '@/services/userStatsService'
import { getAllAchievementsMetadata } from '@/utils/achievementsMetadata'

export const $achievementsState = atom<UserAchievementsState>(loadUserAchievements())
export const $isAchievementsLoading = atom<boolean>(false)
export const $achievementsError = atom<string | null>(null)

export const $achievements = computed($achievementsState, (state) => state.achievements)
export const $totalXP = computed($achievementsState, (state) => state.totalXP)
export const $unlockedCount = computed($achievementsState, (state) => state.unlockedCount)

function awardAchievementXP(achievementId: string, xp: number) {
  if (xp <= 0) return
  const correlationId = `achievement_${achievementId}`
  void earnPoints(xp, {
    correlationId,
    note: `Achievement unlocked: ${achievementId}`,
    eventType: RewardEventType.ACHIEVEMENT_XP,
    referenceId: achievementId,
    payload: {
      achievementId,
      points: xp,
    },
  })
}

export async function checkAndUnlockAchievements(): Promise<string[]> {
  $isAchievementsLoading.set(true)
  $achievementsError.set(null)

  const newlyUnlocked: string[] = []

  try {
    const userStats = loadUserStats()
    const achievementsDef = getAllAchievementsMetadata()

    // Use a snapshot of current state so we can compute next state in one pass.
    const currentState = $achievementsState.get()
    const storageState = loadUserAchievements()

    const updatedAchievements: Record<string, UserAchievement> = { ...currentState.achievements }

    for (const achievement of achievementsDef) {
      const result = checkAchievementCondition(achievement, userStats)
      const existing = updatedAchievements[achievement.id]
      const storageAchievement = storageState.achievements[achievement.id]

      const wasUnlocked = existing?.unlocked || false
      const isNowUnlocked = result.unlocked

      if (isNowUnlocked && !wasUnlocked) {
        newlyUnlocked.push(achievement.id)
        awardAchievementXP(achievement.id, achievement.xp)
      }

      const now = new Date().toISOString()

      const conditionType = achievement.conditionType
      const conditionTypes = Array.isArray(conditionType) ? conditionType : [conditionType]
      const isCardRelated = conditionTypes.some((type) =>
        type === 'cards_opened' ||
        type === 'topic_completed' ||
        type === 'cards_repeated' ||
        type === 'topic_repeated'
      )

      const isArticleRelated = conditionTypes.some((type) => type === 'articles_read')

      const isStreakRelated = !isCardRelated && conditionTypes.some((type) => type === 'streak' || type === 'streak_repeat')

      const isReferralRelated = conditionTypes.some(
        (type) => type === 'referral_invite' || type === 'referral_premium'
      )

      const shouldShowOnThemeHome = isCardRelated && isNowUnlocked && !wasUnlocked
      const shouldShowOnArticleBack = isArticleRelated && isNowUnlocked && !wasUnlocked
      const shouldShowOnHomeAfterCheckin = isStreakRelated && isNowUnlocked && !wasUnlocked
      const shouldShowOnProfile = isReferralRelated && isNowUnlocked && !wasUnlocked

      const currentShownOnThemeHome = storageAchievement?.shownOnThemeHome ?? existing?.shownOnThemeHome ?? false
      const currentShownOnArticleBack = storageAchievement?.shownOnArticleBack ?? existing?.shownOnArticleBack ?? false
      const currentShownOnHomeAfterCheckin =
        storageAchievement?.shownOnHomeAfterCheckin ?? existing?.shownOnHomeAfterCheckin ?? false
      const currentShownOnProfile = storageAchievement?.shownOnProfile ?? existing?.shownOnProfile ?? false

      updatedAchievements[achievement.id] = {
        achievementId: achievement.id,
        unlocked: result.unlocked,
        unlockedAt: isNowUnlocked && !wasUnlocked ? now : existing?.unlockedAt ?? null,
        progress: result.progress,
        xp: achievement.xp,
        lastChecked: now,
        shownOnThemeHome: shouldShowOnThemeHome ? false : currentShownOnThemeHome,
        shownOnArticleBack: shouldShowOnArticleBack ? false : currentShownOnArticleBack,
        shownOnHomeAfterCheckin: shouldShowOnHomeAfterCheckin ? false : currentShownOnHomeAfterCheckin,
        shownOnProfile: shouldShowOnProfile ? false : currentShownOnProfile
      }
    }

    const totalXP = Object.values(updatedAchievements)
      .filter((a) => a.unlocked)
      .reduce((sum, a) => sum + a.xp, 0)

    const unlockedCount = Object.values(updatedAchievements).filter((a) => a.unlocked).length

    const finalState: UserAchievementsState = {
      ...currentState,
      achievements: updatedAchievements,
      totalXP,
      unlockedCount
    }

    saveUserAchievements(finalState)
    $achievementsState.set(finalState)
    return newlyUnlocked
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    $achievementsError.set(errorMessage)
    return []
  } finally {
    $isAchievementsLoading.set(false)
  }
}

export function updateAchievementProgress(achievementId: string) {
  try {
    const userStats = loadUserStats()
    const achievementsDef = getAllAchievementsMetadata()
    const achievement = achievementsDef.find((a) => a.id === achievementId)

    if (!achievement) return

    const result = checkAchievementCondition(achievement, userStats)
    const updatedState = updateAchievement(achievementId, {
      unlocked: result.unlocked,
      progress: result.progress,
      xp: achievement.xp
    })

    $achievementsState.set(updatedState)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    $achievementsError.set(errorMessage)
  }
}

export async function refreshAchievements(): Promise<void> {
  await checkAndUnlockAchievements()
}

onMount($achievementsState, () => {
  $achievementsState.set(loadUserAchievements())
})

