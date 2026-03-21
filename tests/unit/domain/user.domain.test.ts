import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  invalidateCache: vi.fn(),
  analyzeUserState: vi.fn(),
}))

vi.mock('@/utils/userStateManager', () => ({
  UserStateManager: {
    invalidateCache: mocks.invalidateCache,
    analyzeUserState: mocks.analyzeUserState,
  },
}))

import { analyzeUserState, invalidateUserStateCache } from '@/src/domain/user.domain'

describe('user.domain', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('invalidateUserStateCache delegates to UserStateManager.invalidateCache', () => {
    invalidateUserStateCache()
    expect(mocks.invalidateCache).toHaveBeenCalledTimes(1)
  })

  it('analyzeUserState returns UserStateManager.analyzeUserState result', () => {
    const expectedState = { currentStep: 'home' }
    mocks.analyzeUserState.mockReturnValue(expectedState)
    expect(analyzeUserState()).toEqual(expectedState)
  })
})

