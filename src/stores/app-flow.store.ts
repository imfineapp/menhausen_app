import { atom, onMount } from 'nanostores'
import { storageReadJson, storageWriteJson } from '@/src/effects/storage.effects'

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
  const parsed = storageReadJson<Partial<AppFlowProgress>>(FLOW_KEY, {})
  return { ...defaultProgress, ...parsed } as AppFlowProgress
}

function saveProgress(p: AppFlowProgress) {
  storageWriteJson(FLOW_KEY, p)
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

