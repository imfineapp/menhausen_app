import { openPage, redirectPage } from '@nanostores/router'

import { $router } from '@/src/stores/router.store'
import { $screenParams, patchScreenParams } from '@/src/stores/screen-params.store'
import { setPremium } from '@/src/stores/premium.store'
import { initSurveyState } from '@/src/stores/survey.store'
import { refreshFlowProgress } from '@/src/stores/app-flow.store'
import { clearMenhausenPrefixedLocalStorage } from '@/utils/userPreferencesStorage'
import { clearJWTToken, deleteUserDataFromSupabase } from '@/utils/supabaseSync'
import { setAuthState } from '@/src/stores/auth.store'
import { resetUserStats } from '@/services/userStatsService'
import { clearTestResults } from '@/utils/psychologicalTestStorage'
export function handleShowAboutApp(): void {
  openPage($router, 'about')
}

export function handleShowAppSettings(): void {
  openPage($router, 'appSettings')
}

export function handleBackToProfile(): void {
  openPage($router, 'profile')
}

export function handleBackToProfileFromSettings(): void {
  openPage($router, 'profile')
}

export function handleShowPinSettings(): void {
  openPage($router, 'pinSettings')
}

export function handleCompletePinSettings(): void {
  console.log('PIN settings updated')
  openPage($router, 'profile')
}

export function handleSkipPinSettings(): void {
  console.log('PIN settings skipped')
  openPage($router, 'profile')
}

export function handleShowPrivacy(): void {
  openPage($router, 'privacy')
}

export function handleShowTerms(): void {
  openPage($router, 'terms')
}

export function handleShowPrivacyFromProfile(): void {
  openPage($router, 'privacy')
}

export function handleShowTermsFromProfile(): void {
  openPage($router, 'terms')
}

export function handleBackToHome(): void {
  openPage($router, 'home')
}

export function handleShowDeleteAccount(): void {
  openPage($router, 'deleteAccount')
}

export function handleBackToProfileFromDelete(): void {
  openPage($router, 'profile')
}

export function handleShowPayments(
  source: 'profile' | 'theme' | 'home' | 'article' | 'topic-test-result' = 'profile',
): void {
  patchScreenParams({ paywallSource: source })
  openPage($router, 'payments')
}

export function handlePurchaseComplete(): void {
  console.log('Premium purchase completed, updating user subscription status')
  setPremium(true, { source: 'telegramEvent' })
  const { currentTheme } = $screenParams.get()
  if (currentTheme) {
    openPage($router, 'themeHome', { themeId: currentTheme })
  } else {
    openPage($router, 'profile')
  }
}

export function handleBackToProfileFromPayments(): void {
  openPage($router, 'profile')
}

export function handleShowDonations(): void {
  console.log('Opening donations screen')
  redirectPage($router, 'donations')
}

export function handleBackToProfileFromDonations(): void {
  console.log('Returning to profile from donations')
  openPage($router, 'profile')
}

export function handleBackToProfileFromUnderConstruction(): void {
  console.log('Returning to profile from Under Construction')
  patchScreenParams({ currentFeatureName: '' })
  openPage($router, 'profile')
}

export function handleBackFromMentalTechnique(): void {
  openPage($router, 'home')
}

export function handleGoToProfile(): void {
  openPage($router, 'profile')
}

export function handleGoToBadges(): void {
  openPage($router, 'badges')
}

export async function handleDeleteAccount(): Promise<{ serverDeleted: boolean }> {
  console.log('Account deleted, returning to onboarding')

  let serverDeleted = false
  try {
    const result = await deleteUserDataFromSupabase()
    serverDeleted = result.success
    if (!result.success) {
      console.warn('[handleDeleteAccount] Server delete failed:', result.error)
    }
  } catch (e) {
    console.warn('[handleDeleteAccount] Server delete error:', e)
  }

  // End local session even if server DELETE failed (user chose to leave the app)
  clearJWTToken()

  patchScreenParams({
    completedCards: new Set(),
    cardCompletionCounts: {},
    userAnswers: {},
    finalAnswers: {},
    cardRating: 0,
    currentCard: { id: '' },
    currentCheckin: { id: '' },
  })
  setPremium(false, { source: 'unknown' })
  clearTestResults()

  localStorage.removeItem('survey-results')
  localStorage.removeItem('app-flow-progress')
  initSurveyState()
  refreshFlowProgress()
  localStorage.removeItem('checkin-data')
  localStorage.removeItem('has-shown-first-achievement')

  clearMenhausenPrefixedLocalStorage()

  resetUserStats()

  const cardProgressKeys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('theme_card_progress_')) {
      cardProgressKeys.push(key)
    }
  }
  cardProgressKeys.forEach((key) => localStorage.removeItem(key))

  const checkinKeys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('daily_checkin_')) {
      checkinKeys.push(key)
    }
  }
  checkinKeys.forEach((key) => localStorage.removeItem(key))

  try {
    localStorage.removeItem('supabase_sync_queue')
    localStorage.removeItem('premium-signature')
    localStorage.removeItem('user-premium-status')
    localStorage.removeItem('user-premium-plan')
    localStorage.removeItem('user-premium-purchased-at')
    localStorage.removeItem('user-premium-expires-at')
  } catch {
    // ignore
  }

  setAuthState({
    status: 'unauthenticated',
    telegramUserId: null,
    jwtExpiresAt: null,
    lastError: null,
  })

  redirectPage($router, 'onboarding', { step: '1' })

  return { serverDeleted }
}
