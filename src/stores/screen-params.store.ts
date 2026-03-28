import { map } from 'nanostores'

import type { AppScreen } from '@/types/userState'
import type { LikertScaleAnswer } from '@/types/psychologicalTest'

const FIRST_ACHIEVEMENT_KEY = 'has-shown-first-achievement'

export type ScreenCardState = {
  id: string
  title?: string
  description?: string
  level?: number
  themeId?: string
}

export type ScreenCheckinState = {
  id: string
  cardTitle?: string
  date?: string
}

export type ScreenUserAnswers = {
  question1?: string
  question2?: string
}

export type PaywallSource = 'profile' | 'theme' | 'home' | 'article' | 'topic-test-result' | ''

export type ScreenParamsState = {
  currentFeatureName: string
  currentTheme: string
  currentCard: ScreenCardState
  currentCheckin: ScreenCheckinState
  currentArticle: string
  articleReturnScreen: AppScreen
  /** Set before navigating to payments for paywall_shown analytics */
  paywallSource: PaywallSource
  userAnswers: ScreenUserAnswers
  finalAnswers: ScreenUserAnswers
  cardRating: number
  completedCards: Set<string>
  cardCompletionCounts: Record<string, number>
  earnedAchievementIds: string[]
  hasShownFirstAchievement: boolean
  /** Embedded topic test (Segment C) — global question orders from psychologicalTest.json */
  topicTestQuestionOrders: number[]
  topicTestQuestionIndex: number
  topicTestAnswers: LikertScaleAnswer[]
  topicTestStartedAtMs: number
}

function loadHasShownFirstAchievement(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false
    const saved = localStorage.getItem(FIRST_ACHIEVEMENT_KEY)
    return saved ? JSON.parse(saved) : false
  } catch (error) {
    console.error('Failed to load hasShownFirstAchievement from localStorage:', error)
    return false
  }
}

export const $screenParams = map<ScreenParamsState>({
  currentFeatureName: '',
  currentTheme: '',
  currentCard: { id: '' },
  currentCheckin: { id: '' },
  currentArticle: '',
  articleReturnScreen: 'home',
  paywallSource: '',
  userAnswers: {},
  finalAnswers: {},
  cardRating: 0,
  completedCards: new Set<string>(),
  cardCompletionCounts: {},
  earnedAchievementIds: [],
  hasShownFirstAchievement: loadHasShownFirstAchievement(),
  topicTestQuestionOrders: [],
  topicTestQuestionIndex: 0,
  topicTestAnswers: [],
  topicTestStartedAtMs: 0,
})

export function setHasShownFirstAchievementFlag(value: boolean): void {
  try {
    localStorage.setItem(FIRST_ACHIEVEMENT_KEY, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to persist hasShownFirstAchievement:', e)
  }
  $screenParams.setKey('hasShownFirstAchievement', value)
}

export function patchScreenParams(partial: Partial<ScreenParamsState>): void {
  $screenParams.set({ ...$screenParams.get(), ...partial })
}

export function addCompletedCardId(cardId: string): void {
  const prev = $screenParams.get().completedCards
  const next = new Set(prev)
  next.add(cardId)
  $screenParams.setKey('completedCards', next)
}

export function resetCardExerciseAnswers(): void {
  $screenParams.setKey('userAnswers', {})
  $screenParams.setKey('finalAnswers', {})
  $screenParams.setKey('cardRating', 0)
}

export function setEarnedAchievementIds(ids: string[]): void {
  $screenParams.setKey('earnedAchievementIds', ids)
}
