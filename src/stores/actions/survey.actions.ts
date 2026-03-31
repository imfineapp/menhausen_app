import type { SurveyResults } from '@/types/content'
import { openPage } from '@nanostores/router'

import { capture, AnalyticsEvent } from '@/src/effects/analytics.effects'
import { $language } from '@/src/stores/language.store'
import { $router } from '@/src/stores/router.store'
import { $surveyResults, setSurveyResultsForScreen, completeSurveyResults } from '@/src/stores/survey.store'
import { completeSurvey, completePsychTest } from '@/src/stores/app-flow.store'
import { $experimentVariant } from '@/src/stores/experiment.store'
import { getReferrerId, markReferralAsRegistered, addReferralToList } from '@/utils/referralUtils'
import { getTelegramUserId } from '@/utils/telegramUserUtils'
import { invalidateUserStateCache } from '@/src/domain/user.domain'

function currentLang() {
  return $language.get()
}

function openSurvey(step: string): void {
  openPage($router, 'survey', { step })
}

export function handleSurvey01Next(answers: string[]): void {
  console.log('Survey 01 answers:', answers)
  setSurveyResultsForScreen('screen01', answers)
  capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey01', answers, language: currentLang() })
  openSurvey('02')
}

export function handleSurvey02Next(answers: string[]): void {
  setSurveyResultsForScreen('screen02', answers)
  capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey02', answers, language: currentLang() })
  openSurvey('03')
}

export function handleSurvey03Next(answers: string[]): void {
  setSurveyResultsForScreen('screen03', answers)
  capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey03', answers, language: currentLang() })
  openSurvey('04')
}

export function handleSurvey04Next(answers: string[]): void {
  setSurveyResultsForScreen('screen04', answers)
  capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey04', answers, language: currentLang() })
  openSurvey('05')
}

export function handleSurvey05Next(answers: string[]): void {
  setSurveyResultsForScreen('screen05', answers)
  capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey05', answers, language: currentLang() })
  openSurvey('06')
}

export function handleSurvey06Next(answers: string[]): void {
  const surveyResults = $surveyResults.get()
  const finalResults: SurveyResults = {
    ...surveyResults,
    screen06: answers,
    completedAt: new Date().toISOString(),
  } as SurveyResults

  capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey06', answers, language: currentLang() })
  capture(AnalyticsEvent.ONBOARDING_COMPLETED, { results: finalResults, language: currentLang() })

  const saveSuccess = completeSurveyResults(finalResults)
  completeSurvey()

  const referrerId = getReferrerId()
  const currentUserId = getTelegramUserId()

  if (referrerId && currentUserId) {
    console.log('Registering referral:', { referrerId, currentUserId })
    addReferralToList(referrerId, currentUserId)
    markReferralAsRegistered()
    capture(AnalyticsEvent.REFERRAL_REGISTERED, {
      referrer_id: String(referrerId),
      referred_user_id: String(currentUserId),
      language: currentLang(),
      referral_source: 'telegram_referral',
    })
  }

  const variant = $experimentVariant.get()
  if (variant === 'B' || variant === 'C') {
    completePsychTest()
  }
  const nextScreen = variant === 'B' || variant === 'C' ? 'checkin' : 'psychTestPreambula'

  if (saveSuccess) {
    console.log('Survey completed successfully')
    invalidateUserStateCache()
    openPage($router, nextScreen)
  } else {
    console.error('Failed to save survey, but continuing...')
    openPage($router, nextScreen)
  }
}

export function handleBackToSurvey01(): void {
  openSurvey('01')
}
export function handleBackToSurvey02(): void {
  openSurvey('02')
}
export function handleBackToSurvey03(): void {
  openSurvey('03')
}
export function handleBackToSurvey04(): void {
  openSurvey('04')
}
export function handleBackToSurvey05(): void {
  openSurvey('05')
}

export function handleBackToOnboarding2(): void {
  openPage($router, 'onboarding', { step: '2' })
}

export function handleBackToSurvey(): void {
  openSurvey('01')
}
