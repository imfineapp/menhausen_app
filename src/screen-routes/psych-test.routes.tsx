import React, { Suspense } from 'react'
import { LoadingScreen } from '@/components/LoadingScreen'
const PsychologicalTestInstructionScreen = React.lazy(() =>
  import('@/components/PsychologicalTestInstructionScreen').then((m) => ({ default: m.PsychologicalTestInstructionScreen })),
)
const PsychologicalTestPreambulaScreen = React.lazy(() =>
  import('@/components/PsychologicalTestPreambulaScreen').then((m) => ({ default: m.PsychologicalTestPreambulaScreen })),
)
const PsychologicalTestQuestionScreen = React.lazy(() =>
  import('@/components/PsychologicalTestQuestionScreen').then((m) => ({ default: m.PsychologicalTestQuestionScreen })),
)
const PsychologicalTestResultsScreen = React.lazy(() =>
  import('@/components/PsychologicalTestResultsScreen').then((m) => ({ default: m.PsychologicalTestResultsScreen })),
)

import type { RouteContext } from './types'

export function renderPsychTestRoutes(ctx: RouteContext): React.ReactNode | null {
  const { currentScreen, wrapScreen, handlers, psychologicalTestAnswers } = ctx
  const withSuspense = (screen: React.ReactNode) => <Suspense fallback={<LoadingScreen />}>{screen}</Suspense>

  if (currentScreen === 'psychological-test-preambula') {
    return wrapScreen(withSuspense(<PsychologicalTestPreambulaScreen onNext={handlers.handlePsychologicalTestPreambulaNext} />))
  }

  if (currentScreen === 'psychological-test-instruction') {
    return wrapScreen(withSuspense(<PsychologicalTestInstructionScreen onNext={handlers.handlePsychologicalTestInstructionNext} />))
  }

  if (currentScreen.startsWith('psychological-test-question-')) {
    const num = Number.parseInt(currentScreen.split('-').pop() ?? '', 10)
    if (Number.isNaN(num) || num < 1 || num > 30) {
      return null
    }

    return wrapScreen(withSuspense(
      <PsychologicalTestQuestionScreen
        questionNumber={num}
        onNext={(answer) => handlers.handlePsychologicalTestQuestionNext(num, answer)}
        initialAnswer={psychologicalTestAnswers[num - 1] || null}
      />,
    ))
  }

  if (currentScreen === 'psychological-test-results') {
    return wrapScreen(withSuspense(
      <PsychologicalTestResultsScreen
        percentages={handlers.getPsychologicalTestPercentages()}
        onNext={handlers.handlePsychologicalTestResultsNext}
      />,
    ))
  }

  return null
}
