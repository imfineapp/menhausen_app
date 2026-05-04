import { describe, expect, it } from 'vitest'

import { buildMentalLevelChartData } from '@/src/domain/mentalLevel.domain'

describe('mentalLevel.domain', () => {
  it('builds fixed-size chart points and maps values (value+1 normalization)', () => {
    const points = buildMentalLevelChartData({
      today: new Date('2026-04-02T00:00:00.000Z'),
      daysCount: 3,
      checkins: [{ date: '2026-04-01', value: 2 } as any],
    })
    expect(points).toHaveLength(3)
    expect(points[1].value).toBe(3) // value 2 + 1 = 3
  })

  it('returns null for days without check-ins', () => {
    const points = buildMentalLevelChartData({
      today: new Date('2026-04-02T00:00:00.000Z'),
      daysCount: 3,
      checkins: [{ date: '2026-03-20', value: 4 } as any],
    })
    expect(points.every((p) => p.value === null)).toBe(true)
  })

  it('computes average when multiple check-ins exist for the same day', () => {
    const points = buildMentalLevelChartData({
      today: new Date('2026-04-02T00:00:00.000Z'),
      daysCount: 3,
      checkins: [
        { date: '2026-04-01', value: 2 } as any, // normalised: 3
        { date: '2026-04-01', value: 4 } as any, // normalised: 5
      ],
    })
    // average of 3 and 5 = 4
    expect(points[1].value).toBe(4)
  })

  it('returns null for all empty days when no checkins provided', () => {
    const points = buildMentalLevelChartData({
      today: new Date('2026-04-02T00:00:00.000Z'),
      daysCount: 5,
      checkins: [],
    })
    expect(points).toHaveLength(5)
    expect(points.every((p) => p.value === null)).toBe(true)
  })
})
