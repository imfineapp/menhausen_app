import React, { Suspense } from 'react'

import { LoadingScreen } from '@/components/LoadingScreen'
import { OnboardingScreen01 } from '@/components/OnboardingScreen01'
const OnboardingScreen02 = React.lazy(() =>
  import('@/components/OnboardingScreen02').then((m) => ({ default: m.OnboardingScreen02 })),
)

import type { RouteContext } from './types'

export function renderOnboardingRoutes(ctx: RouteContext): React.ReactNode | null {
  const { currentScreen, wrapScreen, handlers } = ctx
  const withSuspense = (screen: React.ReactNode) => <Suspense fallback={<LoadingScreen />}>{screen}</Suspense>

  switch (currentScreen) {
    case 'loading':
      return wrapScreen(<LoadingScreen />)
    case 'onboarding1':
      return wrapScreen(
        <OnboardingScreen01
          onNext={handlers.handleNextScreen}
          onShowPrivacy={handlers.handleShowPrivacy}
          onShowTerms={handlers.handleShowTerms}
        />,
      )
    case 'onboarding2':
      return wrapScreen(withSuspense(<OnboardingScreen02 onComplete={handlers.handleShowSurvey} />))
    default:
      return null
  }
}
