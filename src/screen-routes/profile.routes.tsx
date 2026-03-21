import type React from 'react'

import { AboutAppScreen } from '@/components/AboutAppScreen'
import { AppSettingsScreen } from '@/components/AppSettingsScreen'
import { DeleteAccountScreen } from '@/components/DeleteAccountScreen'
import { DonationsScreen } from '@/components/DonationsScreen'
import { PaymentsScreen } from '@/components/PaymentsScreen'
import { PinSetupScreen } from '@/components/PinSetupScreen'
import { PrivacyPolicyScreen } from '@/components/PrivacyPolicyScreen'
import { TermsOfUseScreen } from '@/components/TermsOfUseScreen'
import { UnderConstructionScreen } from '@/components/UnderConstructionScreen'
import { UserProfileScreen } from '@/components/UserProfileScreen'
import { goBack } from '@/src/stores/navigation.store'

import type { RouteContext } from './types'

export function renderProfileRoutes(ctx: RouteContext): React.ReactNode | null {
  const { currentScreen, wrapScreen, handlers, userHasPremium, currentFeatureName } = ctx

  switch (currentScreen) {
    case 'pin':
      return wrapScreen(
        <PinSetupScreen
          onComplete={handlers.handleCompletePinSetup}
          onSkip={handlers.handleSkipPinSetup}
          onBack={handlers.handleBackToSurvey}
        />,
      )
    case 'profile':
      return wrapScreen(
        <UserProfileScreen
          onBack={handlers.handleBackToHome}
          onShowPayments={handlers.handleShowPayments}
          onGoToBadges={handlers.handleGoToBadges}
          onShowSettings={handlers.handleShowAppSettings}
          userHasPremium={userHasPremium}
        />,
      )
    case 'about':
      return wrapScreen(<AboutAppScreen onBack={handlers.handleBackToProfile} />)
    case 'app-settings':
      return wrapScreen(
        <AppSettingsScreen
          onBack={handlers.handleBackToProfileFromSettings}
          onShowAboutApp={handlers.handleShowAboutApp}
          onShowPinSettings={handlers.handleShowPinSettings}
          onShowPrivacy={handlers.handleShowPrivacyFromProfile}
          onShowTerms={handlers.handleShowTermsFromProfile}
          onShowDeleteAccount={handlers.handleShowDeleteAccount}
          onShowDonations={handlers.handleShowDonations}
        />,
      )
    case 'pin-settings':
      return wrapScreen(
        <PinSetupScreen
          onComplete={handlers.handleCompletePinSettings}
          onSkip={handlers.handleSkipPinSettings}
          onBack={handlers.handleBackToProfile}
        />,
      )
    case 'privacy':
      return wrapScreen(<PrivacyPolicyScreen onBack={goBack} />)
    case 'terms':
      return wrapScreen(<TermsOfUseScreen onBack={goBack} />)
    case 'delete':
      return wrapScreen(
        <DeleteAccountScreen
          onBack={handlers.handleBackToProfileFromDelete}
          onDeleteAccount={handlers.handleDeleteAccount}
        />,
      )
    case 'payments':
      return wrapScreen(
        <PaymentsScreen
          onBack={handlers.handleBackToProfileFromPayments}
          onPurchaseComplete={handlers.handlePurchaseComplete}
        />,
      )
    case 'donations':
      return wrapScreen(<DonationsScreen onBack={handlers.handleBackToProfileFromDonations} />)
    case 'under-construction':
      return wrapScreen(
        <UnderConstructionScreen
          onBack={handlers.handleBackToProfileFromUnderConstruction}
          featureName={currentFeatureName}
        />,
      )
    default:
      return null
  }
}
