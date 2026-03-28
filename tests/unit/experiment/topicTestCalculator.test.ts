import { describe, expect, it } from 'vitest'

import {
  calculateTopicScoreAndPercentage,
  TOPIC_TEST_QUESTIONS_COUNT,
} from '@/utils/experiment/topicTestCalculator'

describe('calculateTopicScoreAndPercentage', () => {
  it('computes score 14 and percentage 70 for [1,2,3,4,4]', () => {
    const { score, percentage } = calculateTopicScoreAndPercentage([1, 2, 3, 4, 4])
    expect(score).toBe(14)
    expect(percentage).toBe(70)
  })

  it('throws when answer count is not TOPIC_TEST_QUESTIONS_COUNT', () => {
    expect(() => calculateTopicScoreAndPercentage([1, 2, 3])).toThrow(
      new RegExp(`Expected ${TOPIC_TEST_QUESTIONS_COUNT} answers`),
    )
  })
})
