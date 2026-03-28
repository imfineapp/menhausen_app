import type { LikertScaleAnswer, PsychologicalTestTopic } from '@/types/psychologicalTest'

import { getTestTopicForTheme } from '@/utils/themeTestMapping'

const MAX_SCORE_TOPIC = 20

export type PsychologicalTestQuestionContent = {
  id: string
  topic: string
  text: string
  order: number
}

/**
 * Questions for embedded topic test (5 items), ordered by `order`.
 */
export function getQuestionsForPsychTopic(
  questions: PsychologicalTestQuestionContent[],
  psychTopic: PsychologicalTestTopic
): PsychologicalTestQuestionContent[] {
  return questions
    .filter((q) => q.topic === psychTopic)
    .sort((a, b) => a.order - b.order)
}

export function getQuestionsForAppTheme(
  questions: PsychologicalTestQuestionContent[],
  appThemeId: string
): PsychologicalTestQuestionContent[] | null {
  const psych = getTestTopicForTheme(appThemeId)
  if (!psych) return null
  const list = getQuestionsForPsychTopic(questions, psych)
  return list.length === 5 ? list : null
}

export function calculateTopicScoreAndPercentage(answers: LikertScaleAnswer[]): { score: number; percentage: number } {
  if (answers.length !== 5) {
    throw new Error(`Expected 5 answers for topic test, got ${answers.length}`)
  }
  const score = answers.reduce((s: number, a) => s + Number(a), 0)
  const percentage = Math.round((score / MAX_SCORE_TOPIC) * 100)
  return { score, percentage }
}
