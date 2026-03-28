import type { LikertScaleAnswer, PsychologicalTestTopic } from '@/types/psychologicalTest'

import { getTestTopicForTheme } from '@/utils/themeTestMapping'

/** Embedded topic test: number of Likert questions per theme. */
export const TOPIC_TEST_QUESTIONS_COUNT = 5

/** Max sum of Likert answers (5 questions × 4). */
export const TOPIC_TEST_MAX_SCORE = TOPIC_TEST_QUESTIONS_COUNT * 4

/** Last zero-based question index. */
export const TOPIC_TEST_LAST_INDEX = TOPIC_TEST_QUESTIONS_COUNT - 1

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
  return list.length === TOPIC_TEST_QUESTIONS_COUNT ? list : null
}

export function calculateTopicScoreAndPercentage(answers: LikertScaleAnswer[]): { score: number; percentage: number } {
  if (answers.length !== TOPIC_TEST_QUESTIONS_COUNT) {
    throw new Error(`Expected ${TOPIC_TEST_QUESTIONS_COUNT} answers for topic test, got ${answers.length}`)
  }
  const score = answers.reduce((s: number, a) => s + Number(a), 0)
  const percentage = Math.round((score / TOPIC_TEST_MAX_SCORE) * 100)
  return { score, percentage }
}
