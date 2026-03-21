import type { SurveyResults } from '@/types/content'

const SURVEY_RESULTS_STORAGE_KEY = 'survey-results'

/**
 * Load partial survey results from localStorage (offline / resume survey).
 */
export function loadSavedSurveyResults(
  storageKey: string = SURVEY_RESULTS_STORAGE_KEY,
  storage: Pick<Storage, 'getItem'> = typeof localStorage !== 'undefined' ? localStorage : { getItem: () => null }
): Partial<SurveyResults> {
  try {
    const saved = storage.getItem(storageKey)
    return saved ? (JSON.parse(saved) as Partial<SurveyResults>) : {}
  } catch (error) {
    console.error('Failed to load survey results:', error)
    return {}
  }
}

/**
 * Whether partial survey data has enough structure to merge safely.
 */
export function isSurveyResultsPartial(value: unknown): value is Partial<SurveyResults> {
  return value !== null && typeof value === 'object'
}
