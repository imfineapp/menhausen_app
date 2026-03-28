import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  navigateTo: vi.fn(),
  setNavigationState: vi.fn(),
  earn: vi.fn(),
  addTopicCompleted: vi.fn(),
  getThemeFromStore: vi.fn(),
}))

vi.mock('@/src/stores/actions/achievement-display.actions', () => ({
  checkAndShowAchievements: vi.fn(),
}))
vi.mock('@/src/effects/analytics.effects', () => ({
  capture: vi.fn(),
  AnalyticsEvent: { CARD_RATED: 'CARD_RATED' },
}))
vi.mock('@/src/domain/points.domain', () => ({ getPointsForLevel: vi.fn(() => 20) }))
vi.mock('@/src/domain/theme.domain', () => ({
  getThemeIdFromCardId: vi.fn(() => 'stress'),
  getAllCardIdsFromTheme: vi.fn(() => ['c1']),
}))
vi.mock('@/src/stores/navigation.store', () => ({
  navigateTo: mocks.navigateTo,
  setNavigationState: mocks.setNavigationState,
}))
vi.mock('@/src/stores/language.store', () => ({ $language: { get: () => 'en' } }))
vi.mock('@/src/stores/contentSelectors', () => ({
  getThemeFromStore: mocks.getThemeFromStore,
  getCardUiStrings: vi.fn(() => ({
    fallbackTitle: 'Fallback',
    fallbackDescription: 'Fallback desc',
    techniqueNotFound: 'Not found',
    practiceTaskNotFound: 'Not found',
    explanationNotFound: 'Not found',
  })),
}))
vi.mock('@/utils/ThemeCardManager', () => ({
  ThemeCardManager: {
    addCompletedAttempt: vi.fn(() => ({
      completedAttempts: [{ attemptId: 'a1' }],
      totalCompletedAttempts: 1,
    })),
    getCompletedAttempts: vi.fn(() => [{ attemptId: 'a1' }]),
    shouldShowWelcomeScreen: vi.fn(() => false),
  },
}))
vi.mock('@/src/stores/points.store', () => ({ earnPoints: mocks.earn }))
vi.mock('@/services/userStatsService', () => ({
  incrementCardsOpened: vi.fn(),
  addTopicCompleted: mocks.addTopicCompleted,
  incrementCardsRepeated: vi.fn(),
  addTopicRepeated: vi.fn(),
  markCardAsOpened: vi.fn(),
  loadUserStats: vi.fn(() => ({ openedCardIds: [] })),
}))

import { patchScreenParams, resetCardExerciseAnswers } from '@/src/stores/screen-params.store'
import { handleCompleteRating } from '@/src/stores/actions/theme-card.actions'

describe('theme-card.actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getThemeFromStore.mockReturnValue({ id: 'stress', cardIds: ['c1'] })
    patchScreenParams({
      currentTheme: 'stress',
      currentCard: { id: 'c1', level: 2, themeId: 'stress' } as any,
      userAnswers: { question1: 'a' } as any,
      finalAnswers: { question1: 'a', question2: 'b' } as any,
    })
  })

  it('awards points and checks theme completion after rating', () => {
    handleCompleteRating(4, 'ok')

    expect(mocks.addTopicCompleted).toHaveBeenCalledWith('stress')
    expect(mocks.earn).toHaveBeenCalledWith(
      20,
      expect.objectContaining({ note: expect.stringContaining('Card c1 completed') })
    )
    expect(resetCardExerciseAnswers).toBeTypeOf('function')
    expect(mocks.setNavigationState).toHaveBeenCalledWith('theme-home', ['home', 'theme-home'])
  })
})

