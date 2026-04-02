import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  deleteUserDataFromSupabase: vi.fn(),
  clearJWTToken: vi.fn(),
  redirectPage: vi.fn(),
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

vi.mock('@nanostores/router', () => ({
  openPage: vi.fn(),
  redirectPage: mocks.redirectPage,
}))
vi.mock('@/src/stores/router.store', () => ({ $router: {} }))
vi.mock('@/src/stores/navigation.store', () => ({ goBack: vi.fn() }))
vi.mock('@/src/stores/screen-params.store', () => ({
  $screenParams: { get: () => ({}) },
  patchScreenParams: mocks.patchScreenParams,
}))
vi.mock('@/src/stores/premium.store', () => ({ setPremium: mocks.setPremium }))
vi.mock('@/src/stores/survey.store', () => ({ initSurveyState: mocks.initSurveyState }))
vi.mock('@/src/stores/app-flow.store', () => ({ refreshFlowProgress: mocks.refreshFlowProgress }))
vi.mock('@/src/stores/auth.store', () => ({ setAuthState: mocks.setAuthState }))
vi.mock('@/utils/userPreferencesStorage', () => ({
  clearMenhausenPrefixedLocalStorage: () => {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) keys.push(key)
    }
    keys.forEach((key) => {
      if (key.startsWith('menhausen_') || key.startsWith('menhausen-')) {
        localStorage.removeItem(key)
      }
    })
  },
}))
vi.mock('@/utils/psychologicalTestStorage', () => ({ clearTestResults: mocks.clearTestResults }))
vi.mock('@/services/userStatsService', () => ({ resetUserStats: mocks.resetUserStats }))

import { handleDeleteAccount } from '@/src/stores/actions/profile.actions'

function seedDeleteAccountData(): void {
  localStorage.setItem('menhausen_points_balance', '100')
  localStorage.setItem('menhausen_achievements', '{}')
  localStorage.setItem('menhausen_user_stats', '{}')
  localStorage.setItem('menhausen_user_preferences', '{}')
  localStorage.setItem('menhausen-language', 'en')
  localStorage.setItem('menhausen_referral_code', 'abc')
  localStorage.setItem('menhausen_referred_by', '1')
  localStorage.setItem('menhausen_referral_registered', 'true')
  localStorage.setItem('menhausen_reward_offline_queue', '[]')

  localStorage.setItem('daily_checkin_2026-04-01', '{}')
  localStorage.setItem('daily_checkin_2026-04-02', '{}')
  localStorage.setItem('theme_card_progress_card1', '{}')
  localStorage.setItem('theme_card_progress_card2', '{}')

  localStorage.setItem('experiment_variant', 'A')
  localStorage.setItem('experiment-assignment-sync', '{}')
  localStorage.setItem('topic-test-results-by-theme', '{}')
  localStorage.setItem('topic-test-partial-theme1', '{}')
  localStorage.setItem('topic-test-partial-theme2', '{}')

  localStorage.setItem('survey-results', '{}')
  localStorage.setItem('app-flow-progress', '{}')
  localStorage.setItem('checkin-data', '[]')
  localStorage.setItem('has-shown-first-achievement', 'true')
  localStorage.setItem('psychological-test-results', '{}')
  localStorage.setItem('supabase_sync_queue', '[]')
  localStorage.setItem('premium-signature', '{}')
  localStorage.setItem('user-premium-status', 'true')
  localStorage.setItem('user-premium-plan', 'monthly')
  localStorage.setItem('user-premium-purchased-at', 'now')
  localStorage.setItem('user-premium-expires-at', 'later')
}

describe('handleDeleteAccount storage cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mocks.deleteUserDataFromSupabase.mockResolvedValue({ success: true })
  })

  it('removes all known gamification and account keys', async () => {
    seedDeleteAccountData()
    await handleDeleteAccount()
    expect(localStorage.getItem('experiment_variant')).toBeNull()
    expect(localStorage.getItem('experiment-assignment-sync')).toBeNull()
    expect(localStorage.getItem('topic-test-results-by-theme')).toBeNull()
    expect(localStorage.getItem('topic-test-partial-theme1')).toBeNull()
    expect(localStorage.getItem('topic-test-partial-theme2')).toBeNull()
    expect(localStorage.getItem('daily_checkin_2026-04-01')).toBeNull()
    expect(localStorage.getItem('theme_card_progress_card1')).toBeNull()
    expect(localStorage.getItem('menhausen_points_balance')).toBeNull()
  })

  it('still removes local data when server delete fails', async () => {
    seedDeleteAccountData()
    mocks.deleteUserDataFromSupabase.mockResolvedValue({ success: false, error: 'nope' })
    await handleDeleteAccount()
    expect(localStorage.getItem('experiment_variant')).toBeNull()
    expect(localStorage.getItem('topic-test-results-by-theme')).toBeNull()
    expect(localStorage.getItem('daily_checkin_2026-04-02')).toBeNull()
    expect(localStorage.getItem('theme_card_progress_card2')).toBeNull()
    expect(localStorage.getItem('menhausen_achievements')).toBeNull()
  })
})
