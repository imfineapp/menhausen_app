import type { ThemeData } from '@/types/content'

import { cardsMessages } from '@/src/i18n/messages/cards'
import { commonMessages } from '@/src/i18n/messages/common'

import { $content } from './content.store'

export function getThemeFromStore(themeId: string): ThemeData | undefined {
  return $content.get()?.themes[themeId]
}

export function getCardUiStrings() {
  const c = (cardsMessages.get() ?? {}) as Record<string, unknown>
  const co = (commonMessages.get() ?? {}) as Record<string, unknown>
  return {
    fallbackTitle: (c?.fallbackTitle as string) ?? 'Card',
    fallbackDescription: (c?.fallbackDescription as string) ?? 'Card description will be available soon.',
    techniqueNotFound: (c?.techniqueNotFound as string) ?? 'Technique not found',
    practiceTaskNotFound: (c?.practiceTaskNotFound as string) ?? 'Practice task not found',
    explanationNotFound: (c?.explanationNotFound as string) ?? 'Explanation not found',
    questionNotFound: (c?.questionNotFound as string) ?? 'Question not found',
    loadingQuestions: (co?.loadingQuestions as string) ?? 'Please wait...',
    loadingFinalMessage: (co?.loadingFinalMessage as string) ?? 'Please wait...',
    loading: (co?.loading as string) ?? 'Please wait...',
    error: (co?.error as string) ?? 'Error',
    errorLoadingMessageData: (co?.errorLoadingMessageData as string) ?? 'Error',
  }
}
