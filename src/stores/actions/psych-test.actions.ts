import type { AppScreen } from '@/types/userState'
import type { LikertScaleAnswer } from '@/types/psychologicalTest'

import { capture, AnalyticsEvent } from '@/src/effects/analytics.effects'
import { navigateTo } from '@/src/stores/navigation.store'
import { $psychologicalTestAnswers, setPsychologicalTestAnswers } from '@/src/stores/survey.store'
import { completePsychTest } from '@/src/stores/app-flow.store'
import { $experimentVariant } from '@/src/stores/experiment.store'
import { calculateTestResults } from '@/utils/psychologicalTestCalculator'
import { saveTestResults } from '@/utils/psychologicalTestStorage'

let fullPsychTestStartedAtMs = 0

export function handlePsychologicalTestPreambulaNext(): void {
  void capture(AnalyticsEvent.TEST_STARTED, {
    test_type: 'full',
    variant: $experimentVariant.get() ?? 'unknown',
  })
  navigateTo('psychological-test-instruction')
}

export function handlePsychologicalTestInstructionNext(): void {
  fullPsychTestStartedAtMs = Date.now()
  navigateTo('psychological-test-question-01')
}

export function handlePsychologicalTestQuestionNext(questionNumber: number, answer: LikertScaleAnswer): void {
  const newAnswers = [...$psychologicalTestAnswers.get()]
  newAnswers[questionNumber - 1] = answer
  setPsychologicalTestAnswers(newAnswers)

  if (questionNumber === 30) {
    const { scores, percentages } = calculateTestResults(newAnswers)
    saveTestResults(scores, percentages)
    completePsychTest()
    const durationMs = fullPsychTestStartedAtMs > 0 ? Math.max(0, Date.now() - fullPsychTestStartedAtMs) : 0
    void capture(AnalyticsEvent.TEST_COMPLETED, {
      test_type: 'full',
      questions_answered: 30,
      duration_ms: durationMs,
      variant: $experimentVariant.get() ?? 'unknown',
    })
    navigateTo('psychological-test-results')
  } else {
    const nextQuestionNumber = questionNumber + 1
    const nextScreen = `psychological-test-question-${String(nextQuestionNumber).padStart(2, '0')}` as AppScreen
    navigateTo(nextScreen)
  }
}

export function handlePsychologicalTestResultsNext(): void {
  navigateTo('checkin')
}
