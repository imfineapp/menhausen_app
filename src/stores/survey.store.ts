import { atom, onMount } from 'nanostores'

import type { SurveyResults } from '@/types/content'
import type { LikertScaleAnswer } from '@/types/psychologicalTest'

const SURVEY_RESULTS_KEY = 'survey-results'

const defaultSurveyResults: Partial<SurveyResults> = {
  screen01: [],
  screen02: [],
  screen03: [],
  screen04: [],
  screen05: []
}

function loadSurveyResults(): Partial<SurveyResults> {
  try {
    const saved = localStorage.getItem(SURVEY_RESULTS_KEY)
    return saved ? (JSON.parse(saved) as Partial<SurveyResults>) : {}
  } catch (e) {
    console.error('Failed to load survey results:', e)
    return {}
  }
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
  try {
    localStorage.setItem(SURVEY_RESULTS_KEY, JSON.stringify(finalResults))
    $surveyResults.set(finalResults)
    return true
  } catch (e) {
    console.error('Failed to persist survey results:', e)
    return false
  }
}

export function setPsychologicalTestAnswers(nextAnswers: LikertScaleAnswer[]) {
  $psychologicalTestAnswers.set(nextAnswers)
}

onMount($surveyResults, () => {
  $surveyResults.set({ ...defaultSurveyResults, ...loadSurveyResults() })
})

