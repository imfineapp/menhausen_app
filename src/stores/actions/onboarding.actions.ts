import { openPage } from '@nanostores/router'

import { $router } from '@/src/stores/router.store'
import { completeOnboarding, completePin } from '@/src/stores/app-flow.store'
import { updateSurveyResults } from '@/src/stores/survey.store'
import { loadSavedSurveyResults } from '@/src/domain/survey.domain'

export function handleNextScreen(): void {
  openPage($router, 'onboarding', { step: '2' })
}

export function handleShowSurvey(): void {
  completeOnboarding()
  const savedResults = loadSavedSurveyResults()
  updateSurveyResults((prev) => ({ ...prev, ...savedResults }))
  openPage($router, 'survey', { step: '01' })
}

export function handleCompletePinSetup(): void {
  console.log('PIN setup completed')
  completePin()
  openPage($router, 'checkin')
}

export function handleSkipPinSetup(): void {
  console.log('PIN setup skipped')
  openPage($router, 'checkin')
}
