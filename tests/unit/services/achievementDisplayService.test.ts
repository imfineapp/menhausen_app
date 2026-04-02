import { describe, expect, it, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  loadUserAchievements: vi.fn(),
  saveUserAchievements: vi.fn(),
  getAchievementMetadata: vi.fn(),
}))

vi.mock('@/services/achievementStorage', () => ({
  loadUserAchievements: mocks.loadUserAchievements,
  saveUserAchievements: mocks.saveUserAchievements,
}))

vi.mock('@/utils/achievementsMetadata', () => ({
  getAchievementMetadata: mocks.getAchievementMetadata,
}))

import { getAchievementsToShow, markAchievementsAsShown } from '@/services/achievementDisplayService'

describe('achievementDisplayService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.loadUserAchievements.mockReturnValue({
      version: 1,
      achievements: {
        a1: { achievementId: 'a1', unlocked: true, shownOnThemeHome: false },
        s1: { achievementId: 's1', unlocked: true, shownOnHomeAfterCheckin: false },
      },
      totalXP: 0,
      unlockedCount: 0,
      lastSyncedAt: null,
    })
  })

  it('returns card achievements for theme-home', () => {
    mocks.getAchievementMetadata.mockImplementation((id: string) =>
      id === 'a1' ? { conditionType: 'cards_opened' } : { conditionType: 'streak' },
    )
    const result = getAchievementsToShow({ screen: 'theme-home', earnedAchievementIds: ['a1'] })
    expect(result.achievementsToShow).toEqual(['a1'])
    expect(result.shouldNavigate).toBe(true)
  })

  it('returns streak achievements for home', () => {
    mocks.getAchievementMetadata.mockImplementation((id: string) =>
      id === 'a1' ? { conditionType: 'cards_opened' } : { conditionType: 'streak' },
    )
    const result = getAchievementsToShow({ screen: 'home', earnedAchievementIds: ['s1'] })
    expect(result.achievementsToShow).toEqual(['s1'])
  })

  it('marks achievements as shown and persists', () => {
    markAchievementsAsShown(['a1'], 'theme-home')
    expect(mocks.saveUserAchievements).toHaveBeenCalled()
  })
})
