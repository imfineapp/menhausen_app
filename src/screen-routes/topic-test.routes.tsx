import React, { Suspense } from 'react'
import { LoadingScreen } from '@/components/LoadingScreen'
import { TopicTestIntroScreen } from '@/components/TopicTestIntroScreen'
import { TopicTestQuestionScreen } from '@/components/TopicTestQuestionScreen'
import { TopicTestResultsScreen } from '@/components/TopicTestResultsScreen'
import { getTopicTestResultForTheme } from '@/utils/experiment/topicTestStorage'
import { TOPIC_TEST_LAST_INDEX, TOPIC_TEST_QUESTIONS_COUNT } from '@/utils/experiment/topicTestCalculator'

import type { RouteContext } from './types'

export function renderTopicTestRoutes(ctx: RouteContext): React.ReactNode | null {
  const {
    currentScreen,
    wrapScreen,
    handlers,
    userHasPremium,
    getTheme,
    topicTestQuestionOrders,
    topicTestQuestionIndex,
    topicTestAnswers,
  } = ctx
  const withSuspense = (screen: React.ReactNode) => <Suspense fallback={<LoadingScreen />}>{screen}</Suspense>
  const currentTheme = ctx.currentTheme

  if (currentScreen === 'topic-test-intro') {
    const themeData = getTheme(currentTheme)
    const title = typeof themeData?.title === 'string' ? themeData.title : currentTheme
    return wrapScreen(
      withSuspense(
        <TopicTestIntroScreen
          themeTitle={title}
          onNext={() => void handlers.handleTopicTestIntroNext()}
          onBack={handlers.handleBackFromTopicTestIntro}
        />,
      ),
    )
  }

  if (currentScreen === 'topic-test-question') {
    const orders = topicTestQuestionOrders
    const idx = topicTestQuestionIndex
    if (!orders || orders.length !== TOPIC_TEST_QUESTIONS_COUNT || idx < 0 || idx > TOPIC_TEST_LAST_INDEX) {
      return wrapScreen(withSuspense(<LoadingScreen />))
    }
    const qOrder = orders[idx]
    const initial = topicTestAnswers[idx] ?? null
    return wrapScreen(
      withSuspense(
        <TopicTestQuestionScreen
          stepNumber={idx + 1}
          questionOrder={qOrder}
          onNext={(a) => handlers.handleTopicTestQuestionAnswer(a)}
          onBack={handlers.handleBackFromTopicTestQuestion}
          initialAnswer={initial}
        />,
      ),
    )
  }

  if (currentScreen === 'topic-test-results') {
    const themeData = getTheme(currentTheme)
    const title = typeof themeData?.title === 'string' ? themeData.title : currentTheme
    const pct = currentTheme ? getTopicTestResultForTheme(currentTheme)?.percentage ?? 0 : 0
    return wrapScreen(
      withSuspense(
        <TopicTestResultsScreen
          themeTitle={title}
          percentage={pct}
          onContinue={() => handlers.handleTopicTestResultsContinue(userHasPremium)}
          onBack={handlers.handleBackFromTopicTestResults}
        />,
      ),
    )
  }

  return null
}
