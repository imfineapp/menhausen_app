import { describe, expect, it } from 'vitest'

import { formatDateDDMMYYYY, sortByTimestampDesc } from '@/src/domain/pointsHistory.domain'

describe('pointsHistory.domain', () => {
  it('sorts transactions descending by timestamp', () => {
    const sorted = sortByTimestampDesc([
      { timestamp: '2026-04-01T10:00:00.000Z', id: '1' },
      { timestamp: '2026-04-03T10:00:00.000Z', id: '3' },
      { timestamp: '2026-04-02T10:00:00.000Z', id: '2' },
    ])
    expect(sorted.map((i) => i.id)).toEqual(['3', '2', '1'])
  })

  it('formats date to DD.MM.YYYY', () => {
    expect(formatDateDDMMYYYY('2026-04-02T00:00:00.000Z')).toBe('02.04.2026')
  })
})
