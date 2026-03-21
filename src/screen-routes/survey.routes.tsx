import type React from 'react'

import { SurveyScreen01 } from '@/components/SurveyScreen01'
import { SurveyScreen02 } from '@/components/SurveyScreen02'
import { SurveyScreen03 } from '@/components/SurveyScreen03'
import { SurveyScreen04 } from '@/components/SurveyScreen04'
import { SurveyScreen05 } from '@/components/SurveyScreen05'
import { SurveyScreen06 } from '@/components/SurveyScreen06'

import type { RouteContext } from './types'

export function renderSurveyRoutes(ctx: RouteContext): React.ReactNode | null {
  const { currentScreen, wrapScreen, handlers, surveyResults } = ctx

  switch (currentScreen) {
    case 'survey01':
      return wrapScreen(
        <SurveyScreen01
          onNext={handlers.handleSurvey01Next}
          onBack={handlers.handleBackToOnboarding2}
          initialSelections={surveyResults.screen01 as string[]}
        />,
      )
    case 'survey02':
      return wrapScreen(
        <SurveyScreen02
          onNext={handlers.handleSurvey02Next}
          onBack={handlers.handleBackToSurvey01}
          initialSelections={surveyResults.screen02 as string[]}
        />,
      )
    case 'survey03':
      return wrapScreen(
        <SurveyScreen03
          onNext={handlers.handleSurvey03Next}
          onBack={handlers.handleBackToSurvey02}
          initialSelections={surveyResults.screen03 as string[]}
        />,
      )
    case 'survey04':
      return wrapScreen(
        <SurveyScreen04
          onNext={handlers.handleSurvey04Next}
          onBack={handlers.handleBackToSurvey03}
          initialSelections={surveyResults.screen04 as string[]}
        />,
      )
    case 'survey05':
      return wrapScreen(
        <SurveyScreen05
          onNext={handlers.handleSurvey05Next}
          onBack={handlers.handleBackToSurvey04}
          initialSelections={surveyResults.screen05 as string[]}
        />,
      )
    case 'survey06':
      return wrapScreen(
        <SurveyScreen06
          onNext={handlers.handleSurvey06Next}
          onBack={handlers.handleBackToSurvey05}
          initialSelections={surveyResults.screen06 as string[]}
        />,
      )
    default:
      return null
  }
}
