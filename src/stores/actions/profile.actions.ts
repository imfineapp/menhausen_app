import { navigateTo, setCurrentScreenOnly, setNavigationState } from '@/src/stores/navigation.store'
import { $screenParams, patchScreenParams } from '@/src/stores/screen-params.store'
import { setPremium } from '@/src/stores/premium.store'
import { initSurveyState } from '@/src/stores/survey.store'
import { refreshFlowProgress } from '@/src/stores/app-flow.store'
import { clearMenhausenPrefixedLocalStorage } from '@/utils/userPreferencesStorage'
import { resetUserStats } from '@/services/userStatsService'
import { clearTestResults } from '@/utils/psychologicalTestStorage'
export function handleShowAboutApp(): void {
  navigateTo('about')
}

export function handleShowAppSettings(): void {
  navigateTo('app-settings')
}

export function handleBackToProfile(): void {
  navigateTo('profile')
}

export function handleBackToProfileFromSettings(): void {
  navigateTo('profile')
}

export function handleShowPinSettings(): void {
  navigateTo('pin-settings')
}

export function handleCompletePinSettings(): void {
  console.log('PIN settings updated')
  navigateTo('profile')
}

export function handleSkipPinSettings(): void {
  console.log('PIN settings skipped')
  navigateTo('profile')
}

export function handleShowPrivacy(): void {
  navigateTo('privacy')
}

export function handleShowTerms(): void {
  navigateTo('terms')
}

export function handleShowPrivacyFromProfile(): void {
  navigateTo('privacy')
}

export function handleShowTermsFromProfile(): void {
  navigateTo('terms')
}

export function handleBackToHome(): void {
  navigateTo('home')
}

export function handleShowDeleteAccount(): void {
  navigateTo('delete')
}

export function handleBackToProfileFromDelete(): void {
  navigateTo('profile')
}

export function handleShowPayments(source: 'profile' | 'theme' | 'home' | 'article' = 'profile'): void {
  patchScreenParams({ paywallSource: source })
  navigateTo('payments')
}

export function handlePurchaseComplete(): void {
  console.log('Premium purchase completed, updating user subscription status')
  setPremium(true, { source: 'telegramEvent' })
  const { currentTheme } = $screenParams.get()
  if (currentTheme) {
    navigateTo('theme-home')
  } else {
    navigateTo('profile')
  }
}

export function handleBackToProfileFromPayments(): void {
  navigateTo('profile')
}

export function handleShowDonations(): void {
  console.log('Opening donations screen')
  setCurrentScreenOnly('donations')
}

export function handleBackToProfileFromDonations(): void {
  console.log('Returning to profile from donations')
  navigateTo('profile')
}

export function handleBackToProfileFromUnderConstruction(): void {
  console.log('Returning to profile from Under Construction')
  patchScreenParams({ currentFeatureName: '' })
  navigateTo('profile')
}

export function handleBackFromMentalTechnique(): void {
  navigateTo('home')
}

export function handleGoToProfile(): void {
  navigateTo('profile')
}

export function handleGoToBadges(): void {
  navigateTo('badges')
}

export function handleDeleteAccount(): void {
  console.log('Account deleted, returning to onboarding')

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

  localStorage.removeItem('menhausen_points_balance')
  localStorage.removeItem('menhausen_points_transactions')

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

  localStorage.removeItem('menhausen_referred_by')
  localStorage.removeItem('menhausen_referral_code')
  localStorage.removeItem('menhausen_referral_registered')

  const referralListKeys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('menhausen_referral_list_')) {
      referralListKeys.push(key)
    }
  }
  referralListKeys.forEach((key) => localStorage.removeItem(key))

  setNavigationState('onboarding1', ['onboarding1'])
}
