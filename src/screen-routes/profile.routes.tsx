import React, { Suspense } from 'react'
import { LoadingScreen } from '@/components/LoadingScreen'
const AboutAppScreen = React.lazy(() => import('@/components/AboutAppScreen').then((m) => ({ default: m.AboutAppScreen })))
const AppSettingsScreen = React.lazy(() =>
  import('@/components/AppSettingsScreen').then((m) => ({ default: m.AppSettingsScreen })),
)
const DeleteAccountScreen = React.lazy(() =>
  import('@/components/DeleteAccountScreen').then((m) => ({ default: m.DeleteAccountScreen })),
)
const DonationsScreen = React.lazy(() => import('@/components/DonationsScreen').then((m) => ({ default: m.DonationsScreen })))
const PaymentsScreen = React.lazy(() => import('@/components/PaymentsScreen').then((m) => ({ default: m.PaymentsScreen })))
const PinSetupScreen = React.lazy(() => import('@/components/PinSetupScreen').then((m) => ({ default: m.PinSetupScreen })))
const PrivacyPolicyScreen = React.lazy(() =>
  import('@/components/PrivacyPolicyScreen').then((m) => ({ default: m.PrivacyPolicyScreen })),
)
const TermsOfUseScreen = React.lazy(() => import('@/components/TermsOfUseScreen').then((m) => ({ default: m.TermsOfUseScreen })))
const UnderConstructionScreen = React.lazy(() =>
  import('@/components/UnderConstructionScreen').then((m) => ({ default: m.UnderConstructionScreen })),
)
const UserProfileScreen = React.lazy(() => import('@/components/UserProfileScreen').then((m) => ({ default: m.UserProfileScreen })))
import { goBack } from '@/src/stores/navigation.store'

import type { RouteContext } from './types'

export function renderProfileRoutes(ctx: RouteContext): React.ReactNode | null {
  const { currentScreen, wrapScreen, handlers, userHasPremium, currentFeatureName } = ctx
  const withSuspense = (screen: React.ReactNode) => <Suspense fallback={<LoadingScreen />}>{screen}</Suspense>

  switch (currentScreen) {
    case 'pin':
      return wrapScreen(withSuspense(
        <PinSetupScreen
          onComplete={handlers.handleCompletePinSetup}
          onSkip={handlers.handleSkipPinSetup}
          onBack={handlers.handleBackToSurvey}
        />,
      ))
    case 'profile':
      return wrapScreen(withSuspense(
        <UserProfileScreen
          onBack={handlers.handleBackToHome}
          onShowPayments={handlers.handleShowPayments}
          onGoToBadges={handlers.handleGoToBadges}
          onShowSettings={handlers.handleShowAppSettings}
          userHasPremium={userHasPremium}
        />,
      ))
    case 'about':
      return wrapScreen(withSuspense(<AboutAppScreen onBack={handlers.handleBackToProfile} />))
    case 'app-settings':
      return wrapScreen(withSuspense(
        <AppSettingsScreen
          onBack={handlers.handleBackToProfileFromSettings}
          onShowAboutApp={handlers.handleShowAboutApp}
          onShowPinSettings={handlers.handleShowPinSettings}
          onShowPrivacy={handlers.handleShowPrivacyFromProfile}
          onShowTerms={handlers.handleShowTermsFromProfile}
          onShowDeleteAccount={handlers.handleShowDeleteAccount}
          onShowDonations={handlers.handleShowDonations}
        />,
      ))
    case 'pin-settings':
      return wrapScreen(withSuspense(
        <PinSetupScreen
          onComplete={handlers.handleCompletePinSettings}
          onSkip={handlers.handleSkipPinSettings}
          onBack={handlers.handleBackToProfile}
        />,
      ))
    case 'privacy':
      return wrapScreen(withSuspense(<PrivacyPolicyScreen onBack={goBack} />))
    case 'terms':
      return wrapScreen(withSuspense(<TermsOfUseScreen onBack={goBack} />))
    case 'delete':
      return wrapScreen(withSuspense(
        <DeleteAccountScreen
          onBack={handlers.handleBackToProfileFromDelete}
          onDeleteAccount={handlers.handleDeleteAccount}
        />,
      ))
    case 'payments':
      return wrapScreen(withSuspense(
        <PaymentsScreen
          onBack={handlers.handleBackToProfileFromPayments}
          onPurchaseComplete={handlers.handlePurchaseComplete}
        />,
      ))
    case 'donations':
      return wrapScreen(withSuspense(<DonationsScreen onBack={handlers.handleBackToProfileFromDonations} />))
    case 'under-construction':
      return wrapScreen(withSuspense(
        <UnderConstructionScreen
          onBack={handlers.handleBackToProfileFromUnderConstruction}
          featureName={currentFeatureName}
        />,
      ))
    default:
      return null
  }
}
