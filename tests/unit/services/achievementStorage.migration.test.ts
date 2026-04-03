import { beforeEach, describe, expect, it } from 'vitest'

import { loadUserAchievements } from '@/services/achievementStorage'

describe('achievementStorage migration paths', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('migrates legacy xp field to pointsReward', () => {
    localStorage.setItem(
      'menhausen_achievements',
      JSON.stringify({
        version: 1,
        achievements: {
          ach1: {
            achievementId: 'ach1',
            unlocked: true,
            unlockedAt: null,
            progress: 100,
            xp: 50,
            lastChecked: '2026-01-01T00:00:00.000Z',
          },
        },
        totalPointsFromAchievements: 0,
        unlockedCount: 1,
        lastSyncedAt: null,
      }),
    )

    const loaded = loadUserAchievements()
    expect(loaded.achievements.ach1.pointsReward).toBe(50)
  })

  it('preserves new pointsReward format unchanged', () => {
    localStorage.setItem(
      'menhausen_achievements',
      JSON.stringify({
        version: 1,
        achievements: {
          ach1: {
            achievementId: 'ach1',
            unlocked: true,
            unlockedAt: null,
            progress: 100,
            pointsReward: 50,
            lastChecked: '2026-01-01T00:00:00.000Z',
          },
        },
        totalPointsFromAchievements: 50,
        unlockedCount: 1,
        lastSyncedAt: null,
      }),
    )

    const loaded = loadUserAchievements()
    expect(loaded.achievements.ach1.pointsReward).toBe(50)
  })

  it('keeps existing numeric pointsReward when both xp and pointsReward exist', () => {
    localStorage.setItem(
      'menhausen_achievements',
      JSON.stringify({
        version: 1,
        achievements: {
          ach1: {
            achievementId: 'ach1',
            unlocked: true,
            unlockedAt: null,
            progress: 100,
            xp: 30,
            pointsReward: 0,
            lastChecked: '2026-01-01T00:00:00.000Z',
          },
        },
        totalPointsFromAchievements: 0,
        unlockedCount: 1,
        lastSyncedAt: null,
      }),
    )

    const loaded = loadUserAchievements()
    expect(loaded.achievements.ach1.pointsReward).toBe(0)
  })

  it('normalizes legacy totalXP state property name', () => {
    localStorage.setItem(
      'menhausen_achievements',
      JSON.stringify({
        version: 1,
        achievements: {},
        totalXP: 100,
        unlockedCount: 0,
        lastSyncedAt: null,
      }),
    )

    const loaded = loadUserAchievements()
    expect(loaded.totalPointsFromAchievements).toBe(100)
  })
})
