import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@nanostores/react'
import { openPage } from '@nanostores/router'

import { $isNavigatingForward, $navigationHistory } from './stores/navigation.store'
import { $router } from '@/src/stores/router.store'
import { resolveScreenFromRoute } from '@/src/utils/route-screen-map'
import { calculateTestResults } from '@/utils/psychologicalTestCalculator'
import { loadTestResults } from '@/utils/psychologicalTestStorage'
import type { LikertScaleAnswer, PsychologicalTestPercentages } from '@/types/psychologicalTest'
import { OnboardingScreen01 } from '@/components/OnboardingScreen01'

import { $surveyResults, $psychologicalTestAnswers } from '@/src/stores/survey.store'
import { $isPremium } from '@/src/stores/premium.store'
import { $language } from '@/src/stores/language.store'
import { $screenParams, setEarnedAchievementIds } from '@/src/stores/screen-params.store'
import { getThemeFromStore } from '@/src/stores/contentSelectors'
import { checkAndShowAchievements } from '@/src/stores/actions/achievement-display.actions'
import { handleCheckInSubmit } from '@/src/stores/actions/checkin.actions'
import * as onboardingActions from '@/src/stores/actions/onboarding.actions'
import * as surveyActions from '@/src/stores/actions/survey.actions'
import * as psychTestActions from '@/src/stores/actions/psych-test.actions'
import * as articleActions from '@/src/stores/actions/article.actions'
import * as profileActions from '@/src/stores/actions/profile.actions'
import * as themeCardActions from '@/src/stores/actions/theme-card.actions'
import * as topicTestActions from '@/src/stores/actions/topic-test.actions'
import { renderOnboardingRoutes } from '@/src/screen-routes/onboarding.routes'
import { renderSurveyRoutes } from '@/src/screen-routes/survey.routes'
import { renderPsychTestRoutes } from '@/src/screen-routes/psych-test.routes'
import { renderThemeCardRoutes } from '@/src/screen-routes/theme-card.routes'
import { renderProfileRoutes } from '@/src/screen-routes/profile.routes'
import { renderArticleRoutes } from '@/src/screen-routes/article.routes'
import { renderMiscRoutes } from '@/src/screen-routes/misc.routes'
import { renderTopicTestRoutes } from '@/src/screen-routes/topic-test.routes'
import type { RouteContext } from '@/src/screen-routes/types'

const handlers = {
  ...onboardingActions,
  ...surveyActions,
  ...psychTestActions,
  ...articleActions,
  ...profileActions,
  ...themeCardActions,
  ...topicTestActions,
}

export type ScreenRouterProps = {
  renderCurrentScreen?: () => React.ReactNode
}

function getPsychologicalTestPercentages(psychologicalTestAnswers: LikertScaleAnswer[]): PsychologicalTestPercentages {
  const savedResults = loadTestResults()
  if (savedResults?.percentages) {
    return savedResults.percentages
  }

  if (psychologicalTestAnswers.length === 30) {
    return calculateTestResults(psychologicalTestAnswers).percentages
  }

  console.warn(
    `Psychological test results: incomplete answers (${psychologicalTestAnswers.length}/30). Using default zero percentages.`,
  )
  return {
    stress: 0,
    anxiety: 0,
    relationships: 0,
    selfEsteem: 0,
    anger: 0,
    depression: 0,
  }
}

export default function ScreenRouter(props: ScreenRouterProps = {}) {
  const routerPage = useStore($router)
  const currentScreen = useMemo(
    () =>
      resolveScreenFromRoute(
        routerPage?.route as string | undefined,
        (routerPage?.params as Record<string, string> | undefined) ?? undefined,
      ),
    [routerPage],
  )
  const isNavigatingForward = useStore($isNavigatingForward)
  const surveyResults = useStore($surveyResults)
  const psychologicalTestAnswers = useStore($psychologicalTestAnswers)
  const userHasPremium = useStore($isPremium)
  const navigationHistory = useStore($navigationHistory)
  const currentLanguage = useStore($language)
  const screenParams = useStore($screenParams)
  const {
    currentTheme,
    currentCard,
    currentCheckin,
    currentArticle,
    currentFeatureName,
    earnedAchievementIds,
    userAnswers,
    topicTestQuestionOrders,
    topicTestQuestionIndex,
    topicTestAnswers,
  } = screenParams
  const routeParams = (routerPage?.params as Record<string, string | undefined> | undefined) ?? {}
  const currentThemeFromRoute = routeParams.themeId || currentTheme
  const currentCardFromRoute = useMemo(
    () => (routeParams.cardId ? { ...currentCard, id: routeParams.cardId, themeId: routeParams.themeId } : currentCard),
    [currentCard, routeParams.cardId, routeParams.themeId],
  )
  const currentCheckinFromRoute = useMemo(
    () => (routeParams.checkinId ? { ...currentCheckin, id: routeParams.checkinId } : currentCheckin),
    [currentCheckin, routeParams.checkinId],
  )
  const currentArticleFromRoute = routeParams.articleId || currentArticle

  const isMountedRef = useRef(true)
  const checkInTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardExerciseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const checkAndShowAchievementsBound = useCallback(
    (delay?: number, forceCheck?: boolean) =>
      checkAndShowAchievements(delay ?? 200, forceCheck ?? false, { isMounted: () => isMountedRef.current }),
    [],
  )

  const setEarnedAchievementIdsForArticle = useCallback((ids: string[] | ((prev: string[]) => string[])) => {
    if (typeof ids === 'function') {
      setEarnedAchievementIds(ids($screenParams.get().earnedAchievementIds))
    } else {
      setEarnedAchievementIds(ids)
    }
  }, [])

  const onCheckInSubmit = useCallback(
    (mood: string) => {
      handleCheckInSubmit(mood, {
        isMounted: () => isMountedRef.current,
        checkInTimeoutRef,
        checkAndShowAchievements: checkAndShowAchievementsBound,
      })
    },
    [checkAndShowAchievementsBound],
  )

  const onRewardDone = useCallback(() => {
    setEarnedAchievementIds([])
    if (currentThemeFromRoute) {
      openPage($router, 'themeHome', { themeId: currentThemeFromRoute })
      return
    }
    openPage($router, 'home')
  }, [currentThemeFromRoute])

  const getTheme = useCallback((themeId: string) => getThemeFromStore(themeId), [])

  const completeRatingHandler = useCallback(
    (rating?: number, text?: string) =>
      handlers.handleCompleteRating(rating, text, { cardExerciseTimeoutRef, isMountedRef }),
    [],
  )

  const wrapScreen = useCallback(
    (screen: React.ReactNode) => (
      <motion.div
        key={currentScreen}
        initial={{ x: isNavigatingForward ? '100%' : '-100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: isNavigatingForward ? '-100%' : '100%', opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}
      >
        {screen}
      </motion.div>
    ),
    [currentScreen, isNavigatingForward],
  )

  const routeContext: RouteContext = useMemo(
    () => ({
      currentScreen,
      routeName: routerPage?.route,
      wrapScreen,
      userHasPremium,
      currentLanguage,
      currentTheme: currentThemeFromRoute,
      currentCard: currentCardFromRoute,
      currentCheckin: currentCheckinFromRoute,
      currentArticle: currentArticleFromRoute,
      currentFeatureName,
      earnedAchievementIds,
      navigationHistory,
      userAnswers,
      topicTestQuestionOrders,
      topicTestQuestionIndex,
      topicTestAnswers,
      surveyResults,
      psychologicalTestAnswers,
      getTheme,
      getCardQuestions: handlers.getCardQuestions,
      getCardMessageData: handlers.getCardMessageData,
      checkAndShowAchievementsBound,
      setEarnedAchievementIdsForArticle,
      onCheckInSubmit,
      onRewardDone,
      handlers: {
        ...handlers,
        getPsychologicalTestPercentages: () => getPsychologicalTestPercentages(psychologicalTestAnswers),
        handleCompleteRating: completeRatingHandler,
      },
    }),
    [
      checkAndShowAchievementsBound,
      completeRatingHandler,
      currentArticleFromRoute,
      currentCardFromRoute,
      currentCheckinFromRoute,
      currentFeatureName,
      currentLanguage,
      currentScreen,
      routerPage?.route,
      currentThemeFromRoute,
      earnedAchievementIds,
      getTheme,
      navigationHistory,
      onCheckInSubmit,
      onRewardDone,
      psychologicalTestAnswers,
      setEarnedAchievementIdsForArticle,
      surveyResults,
      topicTestAnswers,
      topicTestQuestionIndex,
      topicTestQuestionOrders,
      userAnswers,
      userHasPremium,
      wrapScreen,
    ],
  )

  const screenFromRoutes =
    renderOnboardingRoutes(routeContext) ??
    renderSurveyRoutes(routeContext) ??
    renderPsychTestRoutes(routeContext) ??
    renderTopicTestRoutes(routeContext) ??
    renderThemeCardRoutes(routeContext) ??
    renderProfileRoutes(routeContext) ??
    renderArticleRoutes(routeContext) ??
    renderMiscRoutes(routeContext) ??
    wrapScreen(
      <OnboardingScreen01
        onNext={handlers.handleNextScreen}
        onShowPrivacy={handlers.handleShowPrivacy}
        onShowTerms={handlers.handleShowTerms}
      />,
    )

  if (typeof props.renderCurrentScreen === 'function') {
    return props.renderCurrentScreen()
  }

  return screenFromRoutes
}

