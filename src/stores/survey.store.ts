import { atom, onMount } from 'nanostores'

import type { SurveyResults } from '@/types/content'
import type { LikertScaleAnswer } from '@/types/psychologicalTest'
import { storageReadJson, storageWriteJson } from '@/src/effects/storage.effects'

const SURVEY_RESULTS_KEY = 'survey-results'

const defaultSurveyResults: Partial<SurveyResults> = {
  screen01: [],
  screen02: [],
  screen03: [],
  screen04: [],
  screen05: []
}

function loadSurveyResults(): Partial<SurveyResults> {
  const fallback: Partial<SurveyResults> = {}
  return storageReadJson<Partial<SurveyResults>>(SURVEY_RESULTS_KEY, fallback)
}

export const $surveyResults = atom<Partial<SurveyResults>>(defaultSurveyResults)
export const $psychologicalTestAnswers = atom<LikertScaleAnswer[]>([])

export function initSurveyState() {
  $surveyResults.set({ ...defaultSurveyResults, ...loadSurveyResults() })
  $psychologicalTestAnswers.set([])
}

export function updateSurveyResults(updater: (prev: Partial<SurveyResults>) => Partial<SurveyResults>) {
  const next = updater($surveyResults.get())
  $surveyResults.set(next)
}

export function setSurveyResultsForScreen<K extends keyof SurveyResults>(
  key: K,
  answers: SurveyResults[K] extends string[] ? string[] : never
) {
  updateSurveyResults((prev) => ({
    ...prev,
    [key]: answers
  }))
}

export function completeSurveyResults(finalResults: SurveyResults): boolean {
  storageWriteJson(SURVEY_RESULTS_KEY, finalResults)
  $surveyResults.set(finalResults)
  return true
}

export function setPsychologicalTestAnswers(nextAnswers: LikertScaleAnswer[]) {
  $psychologicalTestAnswers.set(nextAnswers)
}

onMount($surveyResults, () => {
  $surveyResults.set({ ...defaultSurveyResults, ...loadSurveyResults() })
})

