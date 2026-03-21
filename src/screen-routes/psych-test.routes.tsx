import type React from 'react'

import { PsychologicalTestInstructionScreen } from '@/components/PsychologicalTestInstructionScreen'
import { PsychologicalTestPreambulaScreen } from '@/components/PsychologicalTestPreambulaScreen'
import { PsychologicalTestQuestionScreen } from '@/components/PsychologicalTestQuestionScreen'
import { PsychologicalTestResultsScreen } from '@/components/PsychologicalTestResultsScreen'

import type { RouteContext } from './types'

export function renderPsychTestRoutes(ctx: RouteContext): React.ReactNode | null {
  const { currentScreen, wrapScreen, handlers, psychologicalTestAnswers } = ctx

  if (currentScreen === 'psychological-test-preambula') {
    return wrapScreen(<PsychologicalTestPreambulaScreen onNext={handlers.handlePsychologicalTestPreambulaNext} />)
  }

  if (currentScreen === 'psychological-test-instruction') {
    return wrapScreen(<PsychologicalTestInstructionScreen onNext={handlers.handlePsychologicalTestInstructionNext} />)
  }

  if (currentScreen.startsWith('psychological-test-question-')) {
    const num = Number.parseInt(currentScreen.split('-').pop() ?? '', 10)
    if (Number.isNaN(num) || num < 1 || num > 30) {
      return null
    }

    return wrapScreen(
      <PsychologicalTestQuestionScreen
        questionNumber={num}
        onNext={(answer) => handlers.handlePsychologicalTestQuestionNext(num, answer)}
        initialAnswer={psychologicalTestAnswers[num - 1] || null}
      />,
    )
  }

  if (currentScreen === 'psychological-test-results') {
    return wrapScreen(
      <PsychologicalTestResultsScreen
        percentages={handlers.getPsychologicalTestPercentages()}
        onNext={handlers.handlePsychologicalTestResultsNext}
      />,
    )
  }

  return null
}
