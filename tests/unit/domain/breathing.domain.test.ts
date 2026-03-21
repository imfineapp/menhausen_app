import { describe, it, expect } from 'vitest'

import { nextBreathingPhase, type BreathingPhase } from '@/src/domain/breathing.domain'

describe('breathing.domain', () => {
  it('cycles phases inhale -> hold -> exhale -> inhale', () => {
    let phase: BreathingPhase = 'inhale'
    phase = nextBreathingPhase(phase)
    expect(phase).toBe('hold')
    phase = nextBreathingPhase(phase)
    expect(phase).toBe('exhale')
    phase = nextBreathingPhase(phase)
    expect(phase).toBe('inhale')
  })
})
