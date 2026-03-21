import { describe, it, expect } from 'vitest'

import { getConsecutiveDays, type CheckinHistoryEntry } from '@/src/domain/checkin.domain'

describe('checkin.domain', () => {
  it('returns 0 for empty history', () => {
    expect(getConsecutiveDays([])).toBe(0)
  })

  it('counts consecutive days from sorted history', () => {
    const h: CheckinHistoryEntry[] = [
      { date: '2025-01-01' },
      { date: '2025-01-02' },
      { date: '2025-01-03' },
    ]
    expect(getConsecutiveDays(h)).toBe(3)
  })

  it('stops at first gap', () => {
    const h: CheckinHistoryEntry[] = [
      { date: '2025-01-01' },
      { date: '2025-01-03' },
      { date: '2025-01-04' },
    ]
    expect(getConsecutiveDays(h)).toBe(1)
  })
})
