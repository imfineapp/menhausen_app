import type { LikertScaleAnswer } from '@/types/psychologicalTest'
import { openPage } from '@nanostores/router'

import { capture, AnalyticsEvent } from '@/src/effects/analytics.effects'
import { $router } from '@/src/stores/router.store'
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
  openPage($router, 'psychTestInstruction')
}

export function handlePsychologicalTestInstructionNext(): void {
  fullPsychTestStartedAtMs = Date.now()
  openPage($router, 'psychTestQuestion', { num: '01' })
}

export function handlePsychologicalTestQuestionNext(questionNumber: number, answer: LikertScaleAnswer): void {
  const newAnswers = [...$psychologicalTestAnswers.get()]
  newAnswers[questionNumber - 1] = answer
  setPsychologicalTestAnswers(newAnswers)

  void capture(AnalyticsEvent.TEST_QUESTION_ANSWERED, {
    test_type: 'full',
    question_number: questionNumber,
    variant: $experimentVariant.get() ?? 'unknown',
  })

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
    openPage($router, 'psychTestResults')
  } else {
    const nextQuestionNumber = questionNumber + 1
    openPage($router, 'psychTestQuestion', { num: String(nextQuestionNumber).padStart(2, '0') })
  }
}

export function handlePsychologicalTestResultsNext(): void {
  openPage($router, 'checkin')
}
