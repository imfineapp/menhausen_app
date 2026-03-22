import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  deleteUserDataFromSupabase: vi.fn(),
  clearJWTToken: vi.fn(),
  setNavigationState: vi.fn(),
  setAuthState: vi.fn(),
  patchScreenParams: vi.fn(),
  setPremium: vi.fn(),
  initSurveyState: vi.fn(),
  refreshFlowProgress: vi.fn(),
  clearTestResults: vi.fn(),
  resetUserStats: vi.fn(),
}))

vi.mock('@/utils/supabaseSync', () => ({
  deleteUserDataFromSupabase: mocks.deleteUserDataFromSupabase,
  clearJWTToken: mocks.clearJWTToken,
}))

vi.mock('@/src/stores/navigation.store', () => ({
  navigateTo: vi.fn(),
  setNavigationState: mocks.setNavigationState,
}))

vi.mock('@/src/stores/screen-params.store', () => ({
  $screenParams: { get: () => ({}) },
  patchScreenParams: mocks.patchScreenParams,
}))

vi.mock('@/src/stores/premium.store', () => ({
  setPremium: mocks.setPremium,
}))

vi.mock('@/src/stores/survey.store', () => ({
  initSurveyState: mocks.initSurveyState,
}))

vi.mock('@/src/stores/app-flow.store', () => ({
  refreshFlowProgress: mocks.refreshFlowProgress,
}))

vi.mock('@/src/stores/auth.store', () => ({
  setAuthState: mocks.setAuthState,
}))

vi.mock('@/utils/userPreferencesStorage', () => ({
  clearMenhausenPrefixedLocalStorage: vi.fn(),
}))

vi.mock('@/utils/psychologicalTestStorage', () => ({
  clearTestResults: mocks.clearTestResults,
}))

vi.mock('@/services/userStatsService', () => ({
  resetUserStats: mocks.resetUserStats,
}))

import { handleDeleteAccount } from '@/src/stores/actions/profile.actions'

describe('profile.actions handleDeleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mocks.deleteUserDataFromSupabase.mockResolvedValue({ success: true })
  })

  it('returns serverDeleted true and clears state when server succeeds', async () => {
    const result = await handleDeleteAccount()
    expect(result).toEqual({ serverDeleted: true })
    expect(mocks.deleteUserDataFromSupabase).toHaveBeenCalled()
    expect(mocks.clearJWTToken).toHaveBeenCalled()
    expect(mocks.setAuthState).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'unauthenticated', telegramUserId: null, jwtExpiresAt: null })
    )
    expect(mocks.setNavigationState).toHaveBeenCalledWith('onboarding1', ['onboarding1'])
  })

  it('returns serverDeleted false but still clears locally when server fails', async () => {
    mocks.deleteUserDataFromSupabase.mockResolvedValue({ success: false, error: 'nope' })
    const result = await handleDeleteAccount()
    expect(result).toEqual({ serverDeleted: false })
    expect(mocks.clearJWTToken).toHaveBeenCalled()
    expect(mocks.setNavigationState).toHaveBeenCalledWith('onboarding1', ['onboarding1'])
  })

  it('returns serverDeleted false when delete throws', async () => {
    mocks.deleteUserDataFromSupabase.mockRejectedValue(new Error('network'))
    const result = await handleDeleteAccount()
    expect(result).toEqual({ serverDeleted: false })
    expect(mocks.clearJWTToken).toHaveBeenCalled()
  })
})
