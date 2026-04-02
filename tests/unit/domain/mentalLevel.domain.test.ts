import { describe, expect, it } from 'vitest'

import { buildMentalLevelChartData } from '@/src/domain/mentalLevel.domain'

describe('mentalLevel.domain', () => {
  it('builds fixed-size chart points and maps values', () => {
    const points = buildMentalLevelChartData({
      today: new Date('2026-04-02T00:00:00.000Z'),
      daysCount: 3,
      checkins: [{ date: '2026-04-01', value: 2 } as any],
    })
    expect(points).toHaveLength(3)
    expect(points[1].value).toBe(3)
  })

  it('ignores out-of-range checkins', () => {
    const points = buildMentalLevelChartData({
      today: new Date('2026-04-02T00:00:00.000Z'),
      daysCount: 3,
      checkins: [{ date: '2026-03-20', value: 4 } as any],
    })
    expect(points.every((p) => p.value === 0)).toBe(true)
  })
})
