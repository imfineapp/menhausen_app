import type { LikertScaleAnswer } from '@/types/psychologicalTest'

import { capture, AnalyticsEvent } from '@/src/effects/analytics.effects'
import { navigateTo } from '@/src/stores/navigation.store'
import { $screenParams, patchScreenParams } from '@/src/stores/screen-params.store'
import { $language } from '@/src/stores/language.store'
import { $experimentVariant } from '@/src/stores/experiment.store'
import { bumpTopicTestVersion } from '@/src/stores/topic-test.store'
import { getThemeFromStore } from '@/src/stores/contentSelectors'
import { getAllCardIdsFromTheme } from '@/src/domain/theme.domain'
import { ThemeCardManager } from '@/utils/ThemeCardManager'
import {
  calculateTopicScoreAndPercentage,
  getQuestionsForAppTheme,
  type PsychologicalTestQuestionContent,
} from '@/utils/experiment/topicTestCalculator'
import {
  saveTopicTestPartial,
  saveTopicTestResultForTheme,
  loadTopicTestPartial,
  clearTopicTestPartial,
} from '@/utils/experiment/topicTestStorage'
import { getSyncService } from '@/utils/supabaseSync/supabaseSyncService'

async function loadPsychQuestions(lang: 'en' | 'ru'): Promise<PsychologicalTestQuestionContent[]> {
  if (lang === 'ru') {
    const m = await import('../../../data/content/ru/psychologicalTest.json')
    return (m.default as { questions: PsychologicalTestQuestionContent[] }).questions
  }
  const m = await import('../../../data/content/en/psychologicalTest.json')
  return (m.default as { questions: PsychologicalTestQuestionContent[] }).questions
}

export async function handleTopicTestIntroNext(): Promise<void> {
  const themeId = $screenParams.get().currentTheme
  const lang = $language.get() === 'ru' ? 'ru' : 'en'
  const questions = await loadPsychQuestions(lang)
  const five = getQuestionsForAppTheme(questions, themeId)
  if (!five || five.length !== 5) {
    console.warn('[topic-test] No 5 questions for theme, skipping embedded test')
    proceedToThemeWelcomeOrHome()
    return
  }
  const orders = five.map((q) => q.order)
  const partial = loadTopicTestPartial(themeId)
  const startedAtMs = partial?.startedAt ? Date.parse(partial.startedAt) : Date.now()

  let startIndex = 0
  let restoredAnswers: LikertScaleAnswer[] = []
  if (partial?.answers?.length) {
    const firstGap = partial.answers.findIndex((a) => a === undefined)
    startIndex = firstGap === -1 ? 4 : firstGap
    restoredAnswers = partial.answers.filter((a): a is LikertScaleAnswer => a !== undefined)
  }

  patchScreenParams({
    topicTestQuestionOrders: orders,
    topicTestQuestionIndex: startIndex,
    topicTestAnswers: restoredAnswers,
    topicTestStartedAtMs: startedAtMs,
  })

  if (!partial) {
    saveTopicTestPartial(themeId, { themeId, answers: [], startedAt: new Date().toISOString() })
  }

  capture(AnalyticsEvent.TOPIC_TEST_STARTED, {
    topic_id: themeId,
    variant: $experimentVariant.get() ?? 'unknown',
  })
  navigateTo('topic-test-question')
}

export function handleTopicTestQuestionAnswer(answer: LikertScaleAnswer): void {
  const {
    currentTheme,
    topicTestQuestionOrders,
    topicTestQuestionIndex,
    topicTestAnswers,
    topicTestStartedAtMs,
  } = $screenParams.get()
  const themeId = currentTheme
  const orders = topicTestQuestionOrders
  const idx = topicTestQuestionIndex
  if (!themeId || orders.length !== 5 || idx < 0 || idx > 4) return

  const nextAnswers = [...(topicTestAnswers ?? []), answer]
  patchScreenParams({ topicTestAnswers: nextAnswers })

  const partial = loadTopicTestPartial(themeId) ?? {
    themeId,
    answers: [],
    startedAt: new Date().toISOString(),
  }
  const slot: (LikertScaleAnswer | undefined)[] = [...partial.answers]
  while (slot.length < 5) slot.push(undefined)
  slot[idx] = answer
  saveTopicTestPartial(themeId, { ...partial, answers: slot })

  capture(AnalyticsEvent.TOPIC_TEST_QUESTION_ANSWERED, {
    topic_id: themeId,
    question_number: idx + 1,
    variant: $experimentVariant.get() ?? 'unknown',
  })

  if (idx >= 4) {
    const { score, percentage } = calculateTopicScoreAndPercentage(nextAnswers as LikertScaleAnswer[])
    saveTopicTestResultForTheme(themeId, {
      score,
      percentage,
      answers: nextAnswers as LikertScaleAnswer[],
    })
    bumpTopicTestVersion()
    clearTopicTestPartial(themeId)
    patchScreenParams({
      topicTestQuestionOrders: [],
      topicTestQuestionIndex: 0,
      topicTestAnswers: [],
    })
    try {
      getSyncService().queueSync('topicTestResults')
    } catch {
      void 0
    }
    const durationMs = Math.max(0, Date.now() - (topicTestStartedAtMs || Date.now()))
    capture(AnalyticsEvent.TOPIC_TEST_COMPLETED, {
      topic_id: themeId,
      match_percentage: percentage,
      duration_ms: durationMs,
      variant: $experimentVariant.get() ?? 'unknown',
    })
    navigateTo('topic-test-results')
    return
  }

  patchScreenParams({ topicTestQuestionIndex: idx + 1 })
}

export function handleTopicTestResultsContinue(userHasPremium: boolean): void {
  const themeId = $screenParams.get().currentTheme
  const theme = themeId ? getThemeFromStore(themeId) : undefined
  const isPremium = theme?.isPremium ?? false
  if (isPremium && !userHasPremium) {
    patchScreenParams({ paywallSource: 'topic-test-result' })
    capture(AnalyticsEvent.PURCHASE_ATTEMPT, {
      plan_type: 'premium',
      trigger_source: 'topic_test_result',
      variant: $experimentVariant.get() ?? 'unknown',
    })
    navigateTo('payments')
    return
  }
  proceedToThemeWelcomeOrHome()
}

export function proceedToThemeWelcomeOrHome(): void {
  const themeId = $screenParams.get().currentTheme
  if (!themeId) {
    navigateTo('home')
    return
  }
  const theme = getThemeFromStore(themeId)
  if (!theme) {
    navigateTo('home')
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

export function handleBackFromTopicTestIntro(): void {
  patchScreenParams({
    topicTestQuestionOrders: [],
    topicTestQuestionIndex: 0,
    topicTestAnswers: [],
    currentTheme: '',
  })
  navigateTo('home')
}

export function handleBackFromTopicTestQuestion(): void {
  const { currentTheme, topicTestQuestionIndex } = $screenParams.get()
  if (topicTestQuestionIndex <= 0) {
    navigateTo('topic-test-intro')
    return
  }
  const nextIdx = topicTestQuestionIndex - 1
  const answers = [...($screenParams.get().topicTestAnswers ?? [])]
  answers.pop()
  patchScreenParams({ topicTestQuestionIndex: nextIdx, topicTestAnswers: answers })
  if (currentTheme) {
    const partial = loadTopicTestPartial(currentTheme)
    if (partial) {
      const slot = [...partial.answers]
      slot[nextIdx] = undefined
      saveTopicTestPartial(currentTheme, { ...partial, answers: slot })
    }
  }
}

export function handleBackFromTopicTestResults(): void {
  navigateTo('home')
}
