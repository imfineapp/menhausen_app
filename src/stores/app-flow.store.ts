import { atom, onMount } from 'nanostores'

export type AppFlowProgress = {
  onboardingCompleted: boolean
  surveyCompleted: boolean
  psychologicalTestCompleted: boolean
  pinEnabled: boolean
  pinCompleted: boolean
  firstCheckinDone: boolean
  firstRewardShown: boolean
}

const FLOW_KEY = 'app-flow-progress'

const defaultProgress: AppFlowProgress = {
  onboardingCompleted: false,
  surveyCompleted: false,
  psychologicalTestCompleted: false,
  pinEnabled: false, // skip PIN in the main flow for now
  pinCompleted: false,
  firstCheckinDone: false,
  firstRewardShown: false
}

function loadProgress(): AppFlowProgress {
  try {
    const raw = localStorage.getItem(FLOW_KEY)
    return raw ? ({ ...defaultProgress, ...JSON.parse(raw) } as AppFlowProgress) : defaultProgress
  } catch (e) {
    console.error('Failed to load app flow progress:', e)
    return defaultProgress
  }
}

function saveProgress(p: AppFlowProgress) {
  try {
    localStorage.setItem(FLOW_KEY, JSON.stringify(p))
  } catch (e) {
    console.error('Failed to save app flow progress:', e)
  }
}

export function loadFlowProgressFromLocalStorage(): AppFlowProgress {
  return loadProgress()
}

export const $flowProgress = atom<AppFlowProgress>(loadProgress())

export function updateFlowProgress(updater: (prev: AppFlowProgress) => AppFlowProgress) {
  const next = updater($flowProgress.get())
  $flowProgress.set(next)
  saveProgress(next)
}

export function refreshFlowProgress() {
  $flowProgress.set(loadProgress())
}

export function completeOnboarding() {
  updateFlowProgress((p) => ({ ...p, onboardingCompleted: true }))
}

export function completeSurvey() {
  updateFlowProgress((p) => ({ ...p, surveyCompleted: true }))
}

export function completePsychTest() {
  updateFlowProgress((p) => ({ ...p, psychologicalTestCompleted: true }))
}

export function completePin() {
  updateFlowProgress((p) => ({ ...p, pinCompleted: true }))
}

export function markFirstCheckinDone() {
  updateFlowProgress((p) => ({ ...p, firstCheckinDone: true }))
}

export function markFirstRewardShown() {
  updateFlowProgress((p) => ({ ...p, firstRewardShown: true }))
}

onMount($flowProgress, () => {
  $flowProgress.set(loadProgress())
})

