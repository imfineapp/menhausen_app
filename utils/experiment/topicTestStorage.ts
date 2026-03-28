import type { LikertScaleAnswer } from '@/types/psychologicalTest'

import { storageGetItem, storageReadJson, storageWriteJson } from '@/src/effects/storage.effects'

const RESULTS_KEY = 'topic-test-results-by-theme'
const PARTIAL_PREFIX = 'topic-test-partial-'

export type TopicTestResultStored = {
  percentage: number
  score: number
  answers: LikertScaleAnswer[]
  completedAt: string
}

export type TopicTestPartialStored = {
  themeId: string
  answers: (LikertScaleAnswer | undefined)[]
  startedAt: string
}

function partialKey(themeId: string): string {
  return `${PARTIAL_PREFIX}${themeId}`
}

export function loadTopicTestResultsMap(): Record<string, TopicTestResultStored> {
  return storageReadJson<Record<string, TopicTestResultStored>>(RESULTS_KEY, {})
}

export function saveTopicTestResultsMap(map: Record<string, TopicTestResultStored>): void {
  storageWriteJson(RESULTS_KEY, map)
}

export function getTopicTestResultForTheme(themeId: string): TopicTestResultStored | null {
  const m = loadTopicTestResultsMap()
  return m[themeId] ?? null
}

export function isTopicTestCompletedForTheme(themeId: string): boolean {
  return getTopicTestResultForTheme(themeId) !== null
}

export function saveTopicTestResultForTheme(
  themeId: string,
  payload: Omit<TopicTestResultStored, 'completedAt'> & { completedAt?: string }
): void {
  const prev = loadTopicTestResultsMap()
  const completedAt = payload.completedAt ?? new Date().toISOString()
  prev[themeId] = {
    percentage: payload.percentage,
    score: payload.score,
    answers: payload.answers,
    completedAt,
  }
  saveTopicTestResultsMap(prev)
  try {
    localStorage.removeItem(partialKey(themeId))
  } catch {
    void 0
  }
}

export function loadTopicTestPartial(themeId: string): TopicTestPartialStored | null {
  const raw = storageGetItem(partialKey(themeId))
  if (!raw) return null
  try {
    return JSON.parse(raw) as TopicTestPartialStored
  } catch {
    return null
  }
}

export function saveTopicTestPartial(themeId: string, partial: TopicTestPartialStored): void {
  storageWriteJson(partialKey(themeId), partial)
}

export function clearTopicTestPartial(themeId: string): void {
  try {
    localStorage.removeItem(partialKey(themeId))
  } catch {
    void 0
  }
}
