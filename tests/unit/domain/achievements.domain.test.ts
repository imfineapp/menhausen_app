import { describe, it, expect } from 'vitest'

import {
  classifyAchievementsForDisplay,
  shouldShowRewardImmediately,
  BLOCKED_SCREENS_FOR_REWARD,
} from '@/src/domain/achievements.domain'

describe('achievements.domain', () => {
  it('classifyAchievementsForDisplay returns buckets', () => {
    const buckets = classifyAchievementsForDisplay(['newcomer'])
    expect(buckets.cardRelated).toBeDefined()
    expect(buckets.articleRelated).toBeDefined()
  })

  it('blocked list includes onboarding', () => {
    expect(BLOCKED_SCREENS_FOR_REWARD).toContain('onboarding1')
  })

  it('shouldShowRewardImmediately is true when no deferral rules', () => {
    const buckets = classifyAchievementsForDisplay([])
    expect(shouldShowRewardImmediately('home', buckets)).toBe(true)
  })
})
