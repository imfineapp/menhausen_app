import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/src/effects/storage.effects', () => ({
  storageReadJson: vi.fn(() => ({})),
  storageWriteJson: vi.fn(),
}))

import {
  $flowProgress,
  refreshFlowProgress,
  completeOnboarding,
  markFirstRewardShown,
} from '@/src/stores/app-flow.store'

describe('app-flow.store', () => {
  beforeEach(() => {
    refreshFlowProgress()
  })

  it('completeOnboarding sets onboardingCompleted', () => {
    completeOnboarding()
    expect($flowProgress.get().onboardingCompleted).toBe(true)
  })

  it('markFirstRewardShown sets firstRewardShown', () => {
    markFirstRewardShown()
    expect($flowProgress.get().firstRewardShown).toBe(true)
  })
})
