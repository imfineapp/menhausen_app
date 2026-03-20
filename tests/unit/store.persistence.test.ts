import { describe, it, expect, beforeEach } from 'vitest'
import { cleanStores } from 'nanostores'

import {
  $surveyResults,
  $psychologicalTestAnswers,
  initSurveyState,
  completeSurveyResults,
  setPsychologicalTestAnswers,
} from '@/src/stores/survey.store'

import {
  $flowProgress,
  refreshFlowProgress,
  completeOnboarding,
} from '@/src/stores/app-flow.store'

const SURVEY_RESULTS_KEY = 'survey-results'
const FLOW_KEY = 'app-flow-progress'

describe('store persistence', () => {
  beforeEach(() => {
    // Ensure atoms reset between tests.
    cleanStores($surveyResults, $psychologicalTestAnswers, $flowProgress)
    window.localStorage.clear()
  })

  it('hydrates survey state from storage', () => {
    window.localStorage.setItem(
      SURVEY_RESULTS_KEY,
      JSON.stringify({
        screen01: ['a1', 'a2'],
        screen02: [],
        screen03: [],
        screen04: [],
        screen05: [],
      })
    )

    initSurveyState()

    expect($surveyResults.get().screen01).toEqual(['a1', 'a2'])
    expect($psychologicalTestAnswers.get()).toEqual([])
  })

  it('persists completed survey results', () => {
    const finalResults = {
      screen01: ['x'],
      screen02: ['y'],
      screen03: [],
      screen04: [],
      screen05: [],
    }

    const ok = completeSurveyResults(finalResults as any)
    expect(ok).toBe(true)

    expect($surveyResults.get()).toEqual(finalResults)
    expect(JSON.parse(window.localStorage.getItem(SURVEY_RESULTS_KEY) as string)).toEqual(finalResults)
  })

  it('updates psychological test answers atom', () => {
    setPsychologicalTestAnswers([{ questionId: 'q1', value: 3 } as any])
    expect($psychologicalTestAnswers.get()).toHaveLength(1)
  })

  it('hydrates and persists app flow progress', () => {
    window.localStorage.setItem(
      FLOW_KEY,
      JSON.stringify({
        onboardingCompleted: false,
        surveyCompleted: false,
        psychologicalTestCompleted: false,
        pinEnabled: false,
        pinCompleted: false,
        firstCheckinDone: false,
        firstRewardShown: false,
      })
    )

    refreshFlowProgress()
    expect($flowProgress.get().onboardingCompleted).toBe(false)

    completeOnboarding()
    expect($flowProgress.get().onboardingCompleted).toBe(true)

    const stored = JSON.parse(window.localStorage.getItem(FLOW_KEY) as string)
    expect(stored.onboardingCompleted).toBe(true)
  })
})

