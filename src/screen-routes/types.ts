import type React from 'react'

import type { AppScreen } from '@/types/userState'

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
  currentScreen: string
  wrapScreen: (screen: React.ReactNode) => React.ReactNode
  userHasPremium: boolean
  currentLanguage: string
  currentTheme: string
  currentCard: CurrentCard
  currentCheckin: CurrentCheckin
  currentArticle: string
  currentFeatureName: string
  earnedAchievementIds: string[]
  navigationHistory: AppScreen[]
  userAnswers: UserAnswers
  surveyResults: Record<string, unknown>
  psychologicalTestAnswers: string[]
  getTheme: (themeId: string) => ThemeData | undefined
  getCardQuestions: (...args: unknown[]) => unknown
  getCardMessageData: (...args: unknown[]) => unknown
  checkAndShowAchievementsBound: (delay?: number, forceCheck?: boolean) => Promise<void>
  setEarnedAchievementIdsForArticle: (ids: string[] | ((prev: string[]) => string[])) => void
  onCheckInSubmit: (mood: string) => void
  onRewardDone: () => void
  handlers: Record<string, (...args: any[]) => any>
}
