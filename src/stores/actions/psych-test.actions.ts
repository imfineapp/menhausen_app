import type { AppScreen } from '@/types/userState'
import type { LikertScaleAnswer } from '@/types/psychologicalTest'

import { navigateTo } from '@/src/stores/navigation.store'
import { $psychologicalTestAnswers, setPsychologicalTestAnswers } from '@/src/stores/survey.store'
import { completePsychTest } from '@/src/stores/app-flow.store'
import { calculateTestResults } from '@/utils/psychologicalTestCalculator'
import { saveTestResults } from '@/utils/psychologicalTestStorage'

export function handlePsychologicalTestPreambulaNext(): void {
  navigateTo('psychological-test-instruction')
}

export function handlePsychologicalTestInstructionNext(): void {
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
