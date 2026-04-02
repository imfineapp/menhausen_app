import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  loadUserAchievements: vi.fn(),
  saveUserAchievements: vi.fn(),
  checkAchievementCondition: vi.fn(),
  loadUserStats: vi.fn(),
  getAllAchievementsMetadata: vi.fn(),
  earn: vi.fn(),
}))

vi.mock('@/services/achievementStorage', () => ({
  loadUserAchievements: mocks.loadUserAchievements,
  saveUserAchievements: mocks.saveUserAchievements,
  updateAchievement: vi.fn(),
}))

vi.mock('@/services/achievementChecker', () => ({
  checkAchievementCondition: mocks.checkAchievementCondition,
}))

vi.mock('@/services/userStatsService', () => ({
  loadUserStats: mocks.loadUserStats,
}))

vi.mock('@/utils/achievementsMetadata', () => ({
  getAllAchievementsMetadata: mocks.getAllAchievementsMetadata,
}))

vi.mock('@/src/stores/points.store', () => ({
  earnPoints: mocks.earn,
}))

import {
  $achievementsError,
  $totalXP,
  $unlockedCount,
  checkAndUnlockAchievements,
} from '@/src/stores/achievements.store'

describe('achievements.store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.loadUserStats.mockReturnValue({})
    mocks.loadUserAchievements.mockReturnValue({
      achievements: {},
      totalXP: 0,
      unlockedCount: 0,
    })
    mocks.getAllAchievementsMetadata.mockReturnValue([
      { id: 'ach_1', pointsReward: 50, conditionType: 'streak' },
    ])
  })

  it('checkAndUnlockAchievements unlocks eligible and awards XP', async () => {
    mocks.checkAchievementCondition.mockReturnValue({ unlocked: true, progress: 1 })

    const unlocked = await checkAndUnlockAchievements()

    expect(unlocked).toEqual(['ach_1'])
    expect(mocks.earn).toHaveBeenCalledWith(50, expect.objectContaining({ correlationId: 'achievement_ach_1' }))
    expect($unlockedCount.get()).toBe(1)
    expect($totalXP.get()).toBe(50)
  })

  it('sets error and returns empty array on failure', async () => {
    mocks.checkAchievementCondition.mockImplementation(() => {
      throw new Error('checker_failed')
    })

    const unlocked = await checkAndUnlockAchievements()

    expect(unlocked).toEqual([])
    expect($achievementsError.get()).toBe('checker_failed')
  })
})

