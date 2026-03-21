import type React from 'react'

import { BadgesScreen } from '@/components/BadgesScreen'
import { CheckInScreen } from '@/components/CheckInScreen'
import { Grounding54321Screen } from '@/components/mental-techniques/Grounding54321Screen'
import { GroundingAnchorScreen } from '@/components/mental-techniques/GroundingAnchorScreen'
import { Breathing478Screen } from '@/components/mental-techniques/Breathing478Screen'
import { SquareBreathingScreen } from '@/components/mental-techniques/SquareBreathingScreen'
import { RewardManager } from '@/components/RewardManager'
import { goBack } from '@/src/stores/navigation.store'

import type { RouteContext } from './types'

export function renderMiscRoutes(ctx: RouteContext): React.ReactNode | null {
  const { currentScreen, wrapScreen, handlers, earnedAchievementIds, onCheckInSubmit, onRewardDone } = ctx

  switch (currentScreen) {
    case 'checkin':
      return wrapScreen(<CheckInScreen onSubmit={onCheckInSubmit} onBack={handlers.handleBackToHome} />)
    case 'breathing-4-7-8':
      return wrapScreen(<Breathing478Screen onBack={handlers.handleBackFromMentalTechnique} />)
    case 'breathing-square':
      return wrapScreen(<SquareBreathingScreen onBack={handlers.handleBackFromMentalTechnique} />)
    case 'grounding-5-4-3-2-1':
      return wrapScreen(<Grounding54321Screen onBack={handlers.handleBackFromMentalTechnique} />)
    case 'grounding-anchor':
      return wrapScreen(<GroundingAnchorScreen onBack={handlers.handleBackFromMentalTechnique} />)
    case 'reward':
      return wrapScreen(
        <RewardManager earnedAchievementIds={earnedAchievementIds} onComplete={onRewardDone} onBack={onRewardDone} />,
      )
    case 'badges':
      return wrapScreen(<BadgesScreen onBack={goBack} />)
    default:
      return null
  }
}
