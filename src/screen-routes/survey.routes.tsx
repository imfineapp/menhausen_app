import React, { Suspense } from 'react'
import { LoadingScreen } from '@/components/LoadingScreen'
const SurveyScreen01 = React.lazy(() => import('@/components/SurveyScreen01').then((m) => ({ default: m.SurveyScreen01 })))
const SurveyScreen02 = React.lazy(() => import('@/components/SurveyScreen02').then((m) => ({ default: m.SurveyScreen02 })))
const SurveyScreen03 = React.lazy(() => import('@/components/SurveyScreen03').then((m) => ({ default: m.SurveyScreen03 })))
const SurveyScreen04 = React.lazy(() => import('@/components/SurveyScreen04').then((m) => ({ default: m.SurveyScreen04 })))
const SurveyScreen05 = React.lazy(() => import('@/components/SurveyScreen05').then((m) => ({ default: m.SurveyScreen05 })))
const SurveyScreen06 = React.lazy(() => import('@/components/SurveyScreen06').then((m) => ({ default: m.SurveyScreen06 })))

import type { RouteContext } from './types'

export function renderSurveyRoutes(ctx: RouteContext): React.ReactNode | null {
  const { currentScreen, wrapScreen, handlers, surveyResults } = ctx
  const withSuspense = (screen: React.ReactNode) => <Suspense fallback={<LoadingScreen />}>{screen}</Suspense>

  switch (currentScreen) {
    case 'survey01':
      return wrapScreen(withSuspense(
        <SurveyScreen01
          onNext={handlers.handleSurvey01Next}
          onBack={handlers.handleBackToOnboarding2}
          initialSelections={surveyResults.screen01 as string[]}
        />,
      ))
    case 'survey02':
      return wrapScreen(withSuspense(
        <SurveyScreen02
          onNext={handlers.handleSurvey02Next}
          onBack={handlers.handleBackToSurvey01}
          initialSelections={surveyResults.screen02 as string[]}
        />,
      ))
    case 'survey03':
      return wrapScreen(withSuspense(
        <SurveyScreen03
          onNext={handlers.handleSurvey03Next}
          onBack={handlers.handleBackToSurvey02}
          initialSelections={surveyResults.screen03 as string[]}
        />,
      ))
    case 'survey04':
      return wrapScreen(withSuspense(
        <SurveyScreen04
          onNext={handlers.handleSurvey04Next}
          onBack={handlers.handleBackToSurvey03}
          initialSelections={surveyResults.screen04 as string[]}
        />,
      ))
    case 'survey05':
      return wrapScreen(withSuspense(
        <SurveyScreen05
          onNext={handlers.handleSurvey05Next}
          onBack={handlers.handleBackToSurvey04}
          initialSelections={surveyResults.screen05 as string[]}
        />,
      ))
    case 'survey06':
      return wrapScreen(withSuspense(
        <SurveyScreen06
          onNext={handlers.handleSurvey06Next}
          onBack={handlers.handleBackToSurvey05}
          initialSelections={surveyResults.screen06 as string[]}
        />,
      ))
    default:
      return null
  }
}
