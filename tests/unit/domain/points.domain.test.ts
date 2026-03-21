import { describe, expect, it } from 'vitest'

import { getPointsForLevel } from '@/src/domain/points.domain'

describe('points.domain', () => {
  it('returns mapped points for valid levels', () => {
    expect(getPointsForLevel(1)).toBe(10)
    expect(getPointsForLevel(3)).toBe(30)
    expect(getPointsForLevel(5)).toBe(50)
  })

  it('returns 0 for invalid levels', () => {
    expect(getPointsForLevel(0)).toBe(0)
    expect(getPointsForLevel(6)).toBe(0)
    expect(getPointsForLevel(1.5)).toBe(0)
  })
})

