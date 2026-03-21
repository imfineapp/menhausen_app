import type React from 'react'

import { LoadingScreen } from '@/components/LoadingScreen'
import { OnboardingScreen01 } from '@/components/OnboardingScreen01'
import { OnboardingScreen02 } from '@/components/OnboardingScreen02'

import type { RouteContext } from './types'

export function renderOnboardingRoutes(ctx: RouteContext): React.ReactNode | null {
  const { currentScreen, wrapScreen, handlers } = ctx

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
      return wrapScreen(<OnboardingScreen02 onComplete={handlers.handleShowSurvey} />)
    default:
      return null
  }
}
