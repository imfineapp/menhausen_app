import type React from 'react'

import type { AppScreen } from '@/types/userState'
import type { SupportedLanguage, SurveyResults } from '@/types/content'
import type { LikertScaleAnswer } from '@/types/psychologicalTest'

type UserAnswers = {
  question1?: string
}

type CurrentCard = {
  id: string
  title?: string
  description?: string
}

type CurrentCheckin = {
  id: string
  cardTitle?: string
  date?: string
}

type ThemeData = {
  isPremium?: boolean
}

export type RouteContext = {
  currentScreen: AppScreen
  wrapScreen: (screen: React.ReactNode) => React.ReactNode
  userHasPremium: boolean
  currentLanguage: SupportedLanguage
  currentTheme: string
  currentCard: CurrentCard
  currentCheckin: CurrentCheckin
  currentArticle: string
  currentFeatureName: string
  earnedAchievementIds: string[]
  navigationHistory: AppScreen[]
  userAnswers: UserAnswers
  surveyResults: Partial<SurveyResults>
  psychologicalTestAnswers: LikertScaleAnswer[]
  getTheme: (themeId: string) => ThemeData | undefined
  getCardQuestions: (cardId: string, language: string) => Promise<string[]>
  getCardMessageData: (
    cardId: string,
    language: string
  ) => Promise<{ finalMessage: string; practiceTask: string; whyExplanation: string }>
  checkAndShowAchievementsBound: (delay?: number, forceCheck?: boolean) => Promise<void>
  setEarnedAchievementIdsForArticle: (ids: string[] | ((prev: string[]) => string[])) => void
  onCheckInSubmit: (mood: string) => void
  onRewardDone: () => void
  handlers: Record<string, (...args: any[]) => any>
}
