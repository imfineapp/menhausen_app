import { describe, expect, it } from 'vitest'

import { isSurveyResultsPartial, loadSavedSurveyResults } from '@/src/domain/survey.domain'

describe('survey.domain', () => {
  it('returns empty object when storage has no key', () => {
    const storage = { getItem: () => null }
    expect(loadSavedSurveyResults('survey-results', storage)).toEqual({})
  })

  it('returns parsed data when valid json exists', () => {
    const storage = { getItem: () => '{"screen01":["a"]}' }
    expect(loadSavedSurveyResults('survey-results', storage)).toEqual({ screen01: ['a'] })
  })

  it('returns empty object on malformed json', () => {
    const storage = { getItem: () => '{broken-json' }
    expect(loadSavedSurveyResults('survey-results', storage)).toEqual({})
  })

  it('uses custom storage key', () => {
    const storage = {
      getItem: (key: string) => (key === 'custom-key' ? '{"screen02":["b"]}' : null),
    }
    expect(loadSavedSurveyResults('custom-key', storage)).toEqual({ screen02: ['b'] })
  })

  it('isSurveyResultsPartial validates object-like values', () => {
    expect(isSurveyResultsPartial({})).toBe(true)
    expect(isSurveyResultsPartial({ screen01: ['a'] })).toBe(true)
    expect(isSurveyResultsPartial(null)).toBe(false)
    expect(isSurveyResultsPartial(undefined)).toBe(false)
    expect(isSurveyResultsPartial('string')).toBe(false)
    expect(isSurveyResultsPartial(42)).toBe(false)
  })
})

