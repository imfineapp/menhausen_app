import { describe, expect, it } from 'vitest'

import { computeVariantFromUserId, fnv1aHash } from '@/utils/experiment/experimentAssignment'

describe('fnv1aHash', () => {
  it('returns deterministic output for the same input', () => {
    expect(fnv1aHash('12345')).toBe(fnv1aHash('12345'))
    expect(fnv1aHash('user-abc')).toBe(fnv1aHash('user-abc'))
  })

  it('returns different hashes for different inputs', () => {
    expect(fnv1aHash('a')).not.toBe(fnv1aHash('b'))
  })
})

describe('computeVariantFromUserId', () => {
  it('returns consistent variant for the same user id', () => {
    const id = '987654321'
    expect(computeVariantFromUserId(id)).toBe(computeVariantFromUserId(id))
  })

  it('distributes roughly across A, B, C for many ids', () => {
    const counts = { A: 0, B: 0, C: 0 }
    for (let i = 0; i < 3000; i++) {
      const v = computeVariantFromUserId(String(i))
      counts[v]++
    }
    // Allow statistical slack; expect each bucket ~33%
    expect(counts.A).toBeGreaterThan(700)
    expect(counts.B).toBeGreaterThan(700)
    expect(counts.C).toBeGreaterThan(700)
  })
})
