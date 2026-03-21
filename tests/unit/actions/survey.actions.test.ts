import { describe, expect, it, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  capture: vi.fn(),
  navigateTo: vi.fn(),
  setSurveyResultsForScreen: vi.fn(),
}))

vi.mock('@/src/effects/analytics.effects', () => ({
  capture: mocks.capture,
  AnalyticsEvent: {
    ONBOARDING_ANSWERED: 'ONBOARDING_ANSWERED',
  },
}))

vi.mock('@/src/stores/navigation.store', () => ({
  navigateTo: mocks.navigateTo,
}))

vi.mock('@/src/stores/survey.store', () => ({
  setSurveyResultsForScreen: mocks.setSurveyResultsForScreen,
  $surveyResults: { get: () => ({}) },
  completeSurveyResults: vi.fn(() => true),
  updateSurveyResults: vi.fn(),
}))

vi.mock('@/src/stores/app-flow.store', () => ({ completeSurvey: vi.fn() }))
vi.mock('@/utils/referralUtils', () => ({
  getReferrerId: vi.fn(() => null),
  markReferralAsRegistered: vi.fn(),
  addReferralToList: vi.fn(),
}))
vi.mock('@/utils/telegramUserUtils', () => ({ getTelegramUserId: vi.fn(() => null) }))
vi.mock('@/src/domain/user.domain', () => ({ invalidateUserStateCache: vi.fn() }))
vi.mock('@/src/stores/language.store', () => ({ $language: { get: () => 'en' } }))

import { handleSurvey01Next } from '@/src/stores/actions/survey.actions'

describe('survey.actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves answers and navigates to next screen', () => {
    const answers = ['a1', 'a2']

    handleSurvey01Next(answers)

    expect(mocks.setSurveyResultsForScreen).toHaveBeenCalledWith('screen01', answers)
    expect(mocks.capture).toHaveBeenCalledWith('ONBOARDING_ANSWERED', expect.objectContaining({ step: 'survey01' }))
    expect(mocks.navigateTo).toHaveBeenCalledWith('survey02')
  })
})

