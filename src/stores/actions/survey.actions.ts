import type { SurveyResults } from '@/types/content'

import { capture, AnalyticsEvent } from '@/src/effects/analytics.effects'
import { $language } from '@/src/stores/language.store'
import { navigateTo } from '@/src/stores/navigation.store'
import { $surveyResults, setSurveyResultsForScreen, completeSurveyResults } from '@/src/stores/survey.store'
import { completeSurvey } from '@/src/stores/app-flow.store'
import { getReferrerId, markReferralAsRegistered, addReferralToList } from '@/utils/referralUtils'
import { getTelegramUserId } from '@/utils/telegramUserUtils'
import { invalidateUserStateCache } from '@/src/domain/user.domain'

function currentLang() {
  return $language.get()
}

export function handleSurvey01Next(answers: string[]): void {
  console.log('Survey 01 answers:', answers)
  setSurveyResultsForScreen('screen01', answers)
  capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey01', answers, language: currentLang() })
  navigateTo('survey02')
}

export function handleSurvey02Next(answers: string[]): void {
  setSurveyResultsForScreen('screen02', answers)
  capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey02', answers, language: currentLang() })
  navigateTo('survey03')
}

export function handleSurvey03Next(answers: string[]): void {
  setSurveyResultsForScreen('screen03', answers)
  capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey03', answers, language: currentLang() })
  navigateTo('survey04')
}

export function handleSurvey04Next(answers: string[]): void {
  setSurveyResultsForScreen('screen04', answers)
  capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey04', answers, language: currentLang() })
  navigateTo('survey05')
}

export function handleSurvey05Next(answers: string[]): void {
  setSurveyResultsForScreen('screen05', answers)
  capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey05', answers, language: currentLang() })
  navigateTo('survey06')
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

  const nextScreen = 'psychological-test-preambula' as const

  if (saveSuccess) {
    console.log('Survey completed successfully')
    invalidateUserStateCache()
    navigateTo(nextScreen)
  } else {
    console.error('Failed to save survey, but continuing...')
    navigateTo(nextScreen)
  }
}

export function handleBackToSurvey01(): void {
  navigateTo('survey01')
}
export function handleBackToSurvey02(): void {
  navigateTo('survey02')
}
export function handleBackToSurvey03(): void {
  navigateTo('survey03')
}
export function handleBackToSurvey04(): void {
  navigateTo('survey04')
}
export function handleBackToSurvey05(): void {
  navigateTo('survey05')
}

export function handleBackToOnboarding2(): void {
  navigateTo('onboarding2')
}

export function handleBackToSurvey(): void {
  navigateTo('survey01')
}
