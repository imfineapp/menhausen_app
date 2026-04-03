/**
 * Achievements API backed by nanostores (no React Context).
 */

import type { UserAchievement } from '../types/achievements'
import { useStore } from '@nanostores/react'

import {
  $achievements,
  $totalPointsFromAchievements,
  $unlockedCount,
  $isAchievementsLoading,
  $achievementsError,
  checkAndUnlockAchievements,
  updateAchievementProgress,
  refreshAchievements,
} from '@/src/stores/achievements.store'

interface AchievementsContextType {
  achievements: Record<string, UserAchievement>
  totalPointsFromAchievements: number
  unlockedCount: number
  isLoading: boolean
  error: string | null
  checkAndUnlockAchievements: () => Promise<string[]>
  updateAchievementProgress: (achievementId: string) => void
  refreshAchievements: () => Promise<void>
}

export function useAchievements(): AchievementsContextType {
  const achievements = useStore($achievements)
  const totalPointsFromAchievements = useStore($totalPointsFromAchievements)
  const unlockedCount = useStore($unlockedCount)
  const isLoading = useStore($isAchievementsLoading)
  const error = useStore($achievementsError)

  return {
    achievements,
    totalPointsFromAchievements,
    unlockedCount,
    isLoading,
    error,
    checkAndUnlockAchievements,
    updateAchievementProgress,
    refreshAchievements,
  }
}

