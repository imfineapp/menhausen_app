import { describe, it, expect } from 'vitest'

import { getThemeIdFromCardId, computeThemeCompletionFlags } from '@/src/domain/theme.domain'

describe('theme.domain', () => {
  it('maps card id prefixes to theme ids', () => {
    expect(getThemeIdFromCardId('STRESS_01')).toBe('stress')
    expect(getThemeIdFromCardId('ANX_01')).toBe('anxiety')
  })

  it('computeThemeCompletionFlags reflects attempts', () => {
    const flags = computeThemeCompletionFlags(['a', 'b'], () => 2)
    expect(flags.allCardsCompleted).toBe(true)
    expect(flags.allCardsRepeated).toBe(true)
  })
})
