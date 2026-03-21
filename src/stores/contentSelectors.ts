import type { ThemeData } from '@/types/content'

import { $content } from './content.store'

export function getThemeFromStore(themeId: string): ThemeData | undefined {
  return $content.get()?.themes[themeId]
}

export function getCardUiStrings() {
  const ui = $content.get()?.ui
  return {
    fallbackTitle: ui?.cards.fallbackTitle ?? 'Card',
    fallbackDescription: ui?.cards.fallbackDescription ?? 'Card description will be available soon.',
    techniqueNotFound: ui?.cards.techniqueNotFound ?? 'Technique not found',
    practiceTaskNotFound: ui?.cards.practiceTaskNotFound ?? 'Practice task not found',
    explanationNotFound: ui?.cards.explanationNotFound ?? 'Explanation not found',
    questionNotFound: ui?.cards.questionNotFound ?? 'Question not found',
    loadingQuestions: ui?.common.loadingQuestions ?? 'Please wait...',
    loadingFinalMessage: ui?.common.loadingFinalMessage ?? 'Please wait...',
    loading: ui?.common.loading ?? 'Please wait...',
    error: ui?.common.error ?? 'Error',
    errorLoadingMessageData: ui?.common.errorLoadingMessageData ?? 'Error',
  }
}
