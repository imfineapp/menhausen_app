import { navigateTo } from '@/src/stores/navigation.store'
import { completeOnboarding, completePin } from '@/src/stores/app-flow.store'
import { updateSurveyResults } from '@/src/stores/survey.store'
import { loadSavedSurveyResults } from '@/src/domain/survey.domain'

export function handleNextScreen(): void {
  navigateTo('onboarding2')
}

export function handleShowSurvey(): void {
  completeOnboarding()
  const savedResults = loadSavedSurveyResults()
  updateSurveyResults((prev) => ({ ...prev, ...savedResults }))
  navigateTo('survey01')
}

export function handleCompletePinSetup(): void {
  console.log('PIN setup completed')
  completePin()
  navigateTo('checkin')
}

export function handleSkipPinSetup(): void {
  console.log('PIN setup skipped')
  navigateTo('checkin')
}
