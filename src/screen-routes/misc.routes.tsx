import React, { Suspense } from 'react'
import { LoadingScreen } from '@/components/LoadingScreen'
const BadgesScreen = React.lazy(() => import('@/components/BadgesScreen').then((m) => ({ default: m.BadgesScreen })))
import { CheckInScreen } from '@/components/CheckInScreen'
const Breathe46Screen = React.lazy(() =>
  import('@/components/breathe4-6/Breathe46Screen').then((m) => ({ default: m.Breathe46Screen })),
)
const Grounding54321Screen = React.lazy(() =>
  import('@/components/mental-techniques/Grounding54321Screen').then((m) => ({ default: m.Grounding54321Screen })),
)
const GroundingAnchorScreen = React.lazy(() =>
  import('@/components/mental-techniques/GroundingAnchorScreen').then((m) => ({ default: m.GroundingAnchorScreen })),
)
const Breathing478Screen = React.lazy(() =>
  import('@/components/mental-techniques/Breathing478Screen').then((m) => ({ default: m.Breathing478Screen })),
)
const SquareBreathingScreen = React.lazy(() =>
  import('@/components/mental-techniques/SquareBreathingScreen').then((m) => ({ default: m.SquareBreathingScreen })),
)
const RewardManager = React.lazy(() => import('@/components/RewardManager').then((m) => ({ default: m.RewardManager })))
import { goBack } from '@/src/stores/navigation.store'

import type { RouteContext } from './types'

export function renderMiscRoutes(ctx: RouteContext): React.ReactNode | null {
  const { currentScreen, wrapScreen, handlers, earnedAchievementIds, onCheckInSubmit, onRewardDone } = ctx
  const withSuspense = (screen: React.ReactNode) => <Suspense fallback={<LoadingScreen />}>{screen}</Suspense>

  switch (currentScreen) {
    case 'checkin':
      return wrapScreen(<CheckInScreen onSubmit={onCheckInSubmit} onBack={handlers.handleBackToHome} />)
    case 'breathe-4-6':
      return wrapScreen(withSuspense(<Breathe46Screen />))
    case 'breathing-4-7-8':
      return wrapScreen(withSuspense(<Breathing478Screen onBack={handlers.handleBackFromMentalTechnique} />))
    case 'breathing-square':
      return wrapScreen(withSuspense(<SquareBreathingScreen onBack={handlers.handleBackFromMentalTechnique} />))
    case 'grounding-5-4-3-2-1':
      return wrapScreen(withSuspense(<Grounding54321Screen onBack={handlers.handleBackFromMentalTechnique} />))
    case 'grounding-anchor':
      return wrapScreen(withSuspense(<GroundingAnchorScreen onBack={handlers.handleBackFromMentalTechnique} />))
    case 'reward':
      return wrapScreen(withSuspense(
        <RewardManager earnedAchievementIds={earnedAchievementIds} onComplete={onRewardDone} onBack={onRewardDone} />,
      ))
    case 'badges':
      return wrapScreen(withSuspense(<BadgesScreen onBack={goBack} />))
    default:
      return null
  }
}
