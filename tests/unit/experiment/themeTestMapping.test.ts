import { beforeEach, describe, expect, it, vi } from 'vitest'

import { $experimentVariant } from '@/src/stores/experiment.store'
import { getThemeMatchPercentage } from '@/utils/themeTestMapping'
import * as psychStorage from '@/utils/psychologicalTestStorage'
import * as topicTestStorage from '@/utils/experiment/topicTestStorage'

import type { PsychologicalTestResults } from '@/types/psychologicalTest'

describe('getThemeMatchPercentage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    $experimentVariant.set(null)
  })

  it('variant B: always returns null', () => {
    $experimentVariant.set('B')
    expect(getThemeMatchPercentage('stress')).toBeNull()
  })

  it('variant A: returns full psychological test percentage for stress', () => {
    $experimentVariant.set('A')
    const results: PsychologicalTestResults = {
      lastCompletedAt: '2020-01-01T00:00:00.000Z',
      scores: {
        stress: 1,
        anxiety: 1,
        relationships: 1,
        selfEsteem: 1,
        anger: 1,
        depression: 1,
      },
      percentages: {
        stress: 55,
        anxiety: 10,
        relationships: 10,
        selfEsteem: 10,
        anger: 10,
        depression: 10,
      },
      history: [],
    }
    vi.spyOn(psychStorage, 'loadTestResults').mockReturnValue(results)
    expect(getThemeMatchPercentage('stress')).toBe(55)
  })

  it('variant C: returns per-topic embedded result only', () => {
    $experimentVariant.set('C')
    const loadSpy = vi.spyOn(psychStorage, 'loadTestResults')
    vi.spyOn(topicTestStorage, 'getTopicTestResultForTheme').mockReturnValue({
      percentage: 72,
      score: 14,
      answers: [1, 2, 3, 4, 4],
      completedAt: '2020-01-01T00:00:00.000Z',
    })
    expect(getThemeMatchPercentage('stress')).toBe(72)
    expect(loadSpy).not.toHaveBeenCalled()
  })
})
