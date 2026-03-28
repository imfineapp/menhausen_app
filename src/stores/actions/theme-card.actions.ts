import type { MutableRefObject } from 'react'

import type { AppScreen } from '@/types/userState'

import { checkAndShowAchievements } from '@/src/stores/actions/achievement-display.actions'
import { capture, AnalyticsEvent } from '@/src/effects/analytics.effects'
import { $experimentVariant } from '@/src/stores/experiment.store'
import { getPointsForLevel } from '@/src/domain/points.domain'
import { getThemeIdFromCardId, getAllCardIdsFromTheme } from '@/src/domain/theme.domain'
import { getTestTopicForTheme, getThemeMatchPercentage } from '@/utils/themeTestMapping'
import { isTopicTestCompletedForTheme } from '@/utils/experiment/topicTestStorage'
import { navigateTo, setNavigationState } from '@/src/stores/navigation.store'
import { $language } from '@/src/stores/language.store'
import {
  $screenParams,
  patchScreenParams,
  addCompletedCardId,
  resetCardExerciseAnswers,
} from '@/src/stores/screen-params.store'
import { getThemeFromStore, getCardUiStrings } from '@/src/stores/contentSelectors'
import { ThemeCardManager } from '@/utils/ThemeCardManager'
import { earnPoints } from '@/src/stores/points.store'
import { RewardEventType } from '@/utils/supabaseSync/rewardService'
import {
  incrementCardsOpened,
  addTopicCompleted,
  incrementCardsRepeated,
  addTopicRepeated,
  markCardAsOpened,
  loadUserStats,
} from '@/services/userStatsService'

function stressThemeHasAnyCompletedCard(): boolean {
  const theme = getThemeFromStore('stress')
  if (!theme) return false
  const ids = getAllCardIdsFromTheme(theme)
  return ids.some((id) => (ThemeCardManager.getCompletedAttempts(id)?.length ?? 0) > 0)
}

export async function getCardData(cardId: string, language: string) {
  const ui = getCardUiStrings()
  try {
    const { ThemeLoader } = await import('@/utils/ThemeLoader')
    const themeId = getThemeIdFromCardId(cardId)
    const theme = await ThemeLoader.loadTheme(themeId, language)
    if (!theme) {
      throw new Error(`Theme ${themeId} not found`)
    }
    const card = theme.cards.find((c) => c.id === cardId)
    if (!card) {
      throw new Error(`Card ${cardId} not found in theme ${themeId}`)
    }
    return {
      id: cardId,
      title: card.id,
      description: card.introduction,
      level: card.level,
      themeId,
    }
  } catch (error) {
    console.error('Error loading card data:', error)
    return {
      id: cardId,
      title: ui.fallbackTitle,
      description: ui.fallbackDescription,
    }
  }
}

export async function getCardQuestions(cardId: string, language: string): Promise<string[]> {
  try {
    const { ThemeLoader } = await import('@/utils/ThemeLoader')
    const themeId = getThemeIdFromCardId(cardId)
    const theme = await ThemeLoader.loadTheme(themeId, language)
    if (!theme) {
      throw new Error(`Theme ${themeId} not found`)
    }
    const card = theme.cards.find((c) => c.id === cardId)
    if (!card) {
      throw new Error(`Card ${cardId} not found in theme ${themeId}`)
    }
    return card.questions || []
  } catch (error) {
    console.error('Error loading card questions:', error)
    return []
  }
}

export async function getCardMessageData(cardId: string, language: string) {
  const ui = getCardUiStrings()
  try {
    const { ThemeLoader } = await import('@/utils/ThemeLoader')
    const themeId = getThemeIdFromCardId(cardId)
    const theme = await ThemeLoader.loadTheme(themeId, language)
    if (!theme) {
      throw new Error(`Theme ${themeId} not found`)
    }
    const card = theme.cards.find((c) => c.id === cardId)
    if (!card) {
      throw new Error(`Card ${cardId} not found in theme ${themeId}`)
    }
    return {
      finalMessage: card.technique || ui.techniqueNotFound,
      practiceTask: card.recommendation || ui.practiceTaskNotFound,
      whyExplanation: card.mechanism || ui.explanationNotFound,
    }
  } catch (error) {
    console.error('Error loading card message data:', error)
    return {
      finalMessage: ui.techniqueNotFound,
      practiceTask: ui.practiceTaskNotFound,
      whyExplanation: ui.explanationNotFound,
    }
  }
}

export function handleGoToTheme(themeId: string): void {
  console.log(`Opening theme: ${themeId}`)
  const theme = getThemeFromStore(themeId)
  if (!theme) {
    console.error('Theme not found:', themeId)
    return
  }
  patchScreenParams({ currentTheme: themeId })
  const variant = $experimentVariant.get()
  const psychTopic = getTestTopicForTheme(themeId)
  const matchPct = getThemeMatchPercentage(themeId)
  void capture(AnalyticsEvent.TOPIC_OPENED, {
    theme_id: themeId,
    is_premium: !!theme.isPremium,
    has_match_percentage: matchPct !== null,
  })

  if (variant === 'C' && psychTopic && !isTopicTestCompletedForTheme(themeId)) {
    navigateTo('topic-test-intro')
    return
  }

  const allCardIds = getAllCardIdsFromTheme(theme)
  if (allCardIds.length === 0) {
    navigateTo('theme-home')
    return
  }
  const shouldShowWelcome = ThemeCardManager.shouldShowWelcomeScreen(themeId, allCardIds)
  navigateTo(shouldShowWelcome ? 'theme-welcome' : 'theme-home')
}

export function handleBackToHomeFromTheme(): void {
  patchScreenParams({ currentTheme: '' })
  navigateTo('home')
}

export function handleStartTheme(): void {
  console.log(`Starting theme: ${$screenParams.get().currentTheme}`)
  setNavigationState('theme-home', ['home', 'theme-home'])
}

export function handleBackToThemeHome(): void {
  patchScreenParams({ currentCard: { id: '' } })
  navigateTo('theme-home')
}

export function handleBackToCardDetails(): void {
  patchScreenParams({ currentCheckin: { id: '' } })
  navigateTo('card-details')
}

export function handleBackToCardDetailsFromWelcome(): void {
  navigateTo('card-details')
}

export function handleBackToQuestion01(): void {
  navigateTo('question-01')
}

export function handleBackToQuestion02(): void {
  navigateTo('question-02')
}

export function handleBackToFinalMessage(): void {
  navigateTo('final-message')
}

export function handleNextQuestion(answer: string): void {
  const { currentCard } = $screenParams.get()
  console.log(`Question 1 answered for card: ${currentCard.id}`, answer)
  const themeId = (currentCard as { themeId?: string }).themeId ?? getThemeIdFromCardId(currentCard.id)
  void capture(AnalyticsEvent.CARD_QUESTION_1_ANSWERED, {
    card_id: currentCard.id,
    theme_id: themeId,
  })
  patchScreenParams({ userAnswers: { ...$screenParams.get().userAnswers, question1: answer } })
  navigateTo('question-02')
}

export function handleCompleteExercise(answer: string): void {
  const { currentCard, userAnswers } = $screenParams.get()
  console.log(`Question 2 answered for card: ${currentCard.id}`, answer)
  const themeIdForQ2 = (currentCard as { themeId?: string }).themeId ?? getThemeIdFromCardId(currentCard.id)
  void capture(AnalyticsEvent.CARD_QUESTION_2_ANSWERED, {
    card_id: currentCard.id,
    theme_id: themeIdForQ2,
  })
  const finalAnswers = { ...userAnswers, question2: answer }
  patchScreenParams({ userAnswers: finalAnswers, finalAnswers })

  const currentStats = loadUserStats()
  const wasOpenedBefore = currentStats.openedCardIds?.includes(currentCard.id) || false

  if (!wasOpenedBefore) {
    console.log(`[Card] First time opening card ${currentCard.id}, marking as opened`)
    markCardAsOpened(currentCard.id)
    const themeId = (currentCard as { themeId?: string }).themeId ?? getThemeIdFromCardId(currentCard.id)
    if (themeId) {
      console.log(`[Card] Incrementing cardsOpened for theme: ${themeId}`)
      incrementCardsOpened(themeId)
    }
  } else {
    console.log(`[Card] Card ${currentCard.id} was already opened before, skipping increment`)
  }

  navigateTo('final-message')
}

export function handleCompleteFinalMessage(): void {
  const { currentCard } = $screenParams.get()
  console.log(`Final message completed for card: ${currentCard.id}`)
  navigateTo('rate-card')
}

export function handleCompleteRating(
  rating?: number,
  textMessage?: string,
  timerCtx?: {
    cardExerciseTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
    isMountedRef: MutableRefObject<boolean>
  }
): void {
  const { currentCard, currentTheme, userAnswers, finalAnswers } = $screenParams.get()
  const currentLanguage = $language.get()

  const finalRating = rating ?? 0
  const hasRating = rating !== undefined

  console.log(
    hasRating
      ? `Card rated: ${rating} stars for card: ${currentCard.id}${textMessage ? ` with message: ${textMessage}` : ' without message'}`
      : `Card completion skipped (no rating) for card: ${currentCard.id}`
  )

  const themeIdForFirst = (currentCard as { themeId?: string }).themeId ?? getThemeIdFromCardId(currentCard.id)
  if (themeIdForFirst === 'stress' && !stressThemeHasAnyCompletedCard()) {
    void capture(AnalyticsEvent.FIRST_CARD_COMPLETED, {
      card_id: currentCard.id,
      theme_id: themeIdForFirst,
    })
  }

  capture(AnalyticsEvent.CARD_RATED, {
    cardId: currentCard.id,
    themeId: currentTheme,
    rating: finalRating,
    hasRating,
    ratingComment: textMessage || undefined,
    hasComment: !!textMessage,
    language: currentLanguage,
  })

  try {
    const answersToSave = Object.keys(finalAnswers).length > 0 ? finalAnswers : userAnswers

    const completedAttempt = ThemeCardManager.addCompletedAttempt(
      currentCard.id,
      answersToSave,
      finalRating,
      textMessage
    )

    console.log('Exercise completed and saved:', {
      cardId: currentCard.id,
      answers: answersToSave,
      rating: finalRating,
      hasRating,
      attemptId: completedAttempt.completedAttempts[completedAttempt.completedAttempts.length - 1]?.attemptId,
      totalAttempts: completedAttempt.totalCompletedAttempts,
    })

    const themeId = (currentCard as { themeId?: string }).themeId ?? getThemeIdFromCardId(currentCard.id)
    const theme = getThemeFromStore(themeId)

    if (completedAttempt.totalCompletedAttempts > 1) {
      incrementCardsRepeated(currentCard.id)
    }

    if (theme) {
      const allCardIds = theme.cardIds || (theme.cards ? theme.cards.map((c: { id: string }) => c.id) : [])
      const allCardsCompleted = allCardIds.every((cardId: string) => {
        const attempts = ThemeCardManager.getCompletedAttempts(cardId)
        return attempts && attempts.length > 0
      })

      if (allCardsCompleted) {
        addTopicCompleted(themeId)

        const allCardsRepeated = allCardIds.every((cardId: string) => {
          const attempts = ThemeCardManager.getCompletedAttempts(cardId)
          return attempts && attempts.length > 1
        })

        if (allCardsRepeated) {
          addTopicRepeated(themeId)
        }
      }
    }

    try {
      const lastAttempt = completedAttempt.completedAttempts[completedAttempt.completedAttempts.length - 1]
      const attemptId = `card_${lastAttempt?.attemptId || `${currentCard.id}_${Date.now()}`}`
      const level = (currentCard as { level?: number }).level ?? 1
      const tid = (currentCard as { themeId?: string }).themeId ?? getThemeIdFromCardId(currentCard.id)
      const amount = getPointsForLevel(level)
      if (amount > 0) {
        const note = `Card ${currentCard.id} completed (level ${level}, theme ${tid})`
        const eventType = `card_complete_level_${Math.max(1, Math.min(5, level))}` as RewardEventType
        void earnPoints(amount, {
          correlationId: attemptId,
          note,
          eventType,
          referenceId: attemptId,
          payload: {
            cardId: currentCard.id,
            level,
            themeId: tid,
          },
        })
      }
    } catch (earnError) {
      console.warn('Failed to award points for card completion', earnError)
    }

    patchScreenParams({
      cardRating: finalRating,
    })
    addCompletedCardId(currentCard.id)
    const counts = { ...$screenParams.get().cardCompletionCounts }
    counts[currentCard.id] = completedAttempt.totalCompletedAttempts
    patchScreenParams({ cardCompletionCounts: counts })
  } catch (error) {
    console.error('Error saving completed attempt:', error)
  }

  resetCardExerciseAnswers()
  patchScreenParams({ currentCard: { id: '' } })
  setNavigationState('theme-home', ['home', 'theme-home'])

  if (timerCtx) {
    const { cardExerciseTimeoutRef, isMountedRef } = timerCtx
    if (cardExerciseTimeoutRef.current) {
      clearTimeout(cardExerciseTimeoutRef.current)
    }
    cardExerciseTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        void checkAndShowAchievements(300, true, { isMounted: () => isMountedRef.current })
      }
      cardExerciseTimeoutRef.current = null
    }, 300)
  }
}

export function handleStartCardExercise(): void {
  const { currentCard } = $screenParams.get()
  console.log(`Starting exercise for card: ${currentCard.id}`)
  const themeId = (currentCard as { themeId?: string }).themeId ?? getThemeIdFromCardId(currentCard.id)
  if (themeId === 'stress' && !stressThemeHasAnyCompletedCard()) {
    void capture(AnalyticsEvent.FIRST_CARD_STARTED, {
      card_id: currentCard.id,
      theme_id: themeId,
    })
  }
  navigateTo('question-01')
}

export function handleOpenCardExercise(): void {
  const { currentCard } = $screenParams.get()
  console.log(`Opening exercise for card: ${currentCard.id}`)
  const themeId = (currentCard as { themeId?: string }).themeId ?? getThemeIdFromCardId(currentCard.id)
  if (themeId === 'stress' && !stressThemeHasAnyCompletedCard()) {
    void capture(AnalyticsEvent.FIRST_CARD_STARTED, {
      card_id: currentCard.id,
      theme_id: themeId,
    })
  }
  navigateTo('question-01')
}

export function handleOpenCheckin(checkinId: string, cardTitle: string, date: string): void {
  console.log(`Opening checkin: ${checkinId} for card: ${cardTitle} on date: ${date}`)
  patchScreenParams({
    currentCheckin: {
      id: checkinId,
      cardTitle,
      date,
    },
  })
  navigateTo('checkin-details')
}

export async function handleThemeCardClick(cardId: string): Promise<void> {
  console.log(`[Card] Card clicked: ${cardId}`)
  const language = $language.get()
  const cardData = await getCardData(cardId, language)
  const themeId = cardData.themeId ?? getThemeIdFromCardId(cardId)
  void capture(AnalyticsEvent.CARD_OPENED, {
    card_id: cardId,
    theme_id: themeId,
  })
  patchScreenParams({ currentCard: cardData })
  navigateTo('card-details')
}

export async function handleOpenNextLevel(): Promise<void> {
  console.log('Opening next level')
  const { currentTheme, completedCards } = $screenParams.get()
  const theme = getThemeFromStore(currentTheme)
  if (!theme) return

  const ids = getAllCardIdsFromTheme(theme)
  const nextCard = ids.find((cardId) => !completedCards.has(cardId))

  if (nextCard) {
    console.log(`Opening next available card: ${nextCard}`)
    const language = $language.get()
    const cardData = await getCardData(nextCard, language)
    const themeId = cardData.themeId ?? getThemeIdFromCardId(nextCard)
    void capture(AnalyticsEvent.CARD_OPENED, {
      card_id: nextCard,
      theme_id: themeId,
    })
    patchScreenParams({ currentCard: cardData })
    navigateTo('card-details')
  } else {
    console.log('All cards have been completed! Navigating to home.')
    navigateTo('home')
  }
}

export function handleShowUnderConstruction(featureName: string): void {
  console.log(`Navigating to Under Construction for: ${featureName}`)
  patchScreenParams({ currentFeatureName: featureName })
  navigateTo('under-construction' as AppScreen)
}
