import React, { Suspense } from 'react'
import { LoadingScreen } from '@/components/LoadingScreen'
const CardDetailsScreen = React.lazy(() => import('@/components/CardDetailsScreen').then((m) => ({ default: m.CardDetailsScreen })))
const CardWelcomeScreen = React.lazy(() => import('@/components/CardWelcomeScreen').then((m) => ({ default: m.CardWelcomeScreen })))
const CheckinDetailsScreen = React.lazy(() =>
  import('@/components/CheckinDetailsScreen').then((m) => ({ default: m.CheckinDetailsScreen })),
)
import { HomeScreen } from '@/components/HomeScreen'
const RateCardScreen = React.lazy(() => import('@/components/RateCardScreen').then((m) => ({ default: m.RateCardScreen })))
const ThemeHomeScreen = React.lazy(() => import('@/components/ThemeHomeScreen').then((m) => ({ default: m.ThemeHomeScreen })))
const ThemeWelcomeScreen = React.lazy(() =>
  import('@/components/ThemeWelcomeScreen').then((m) => ({ default: m.ThemeWelcomeScreen })),
)
const FinalCardMessageScreenWithLoader = React.lazy(() =>
  import('@/components/ThemeCardQuestionLoaders').then((m) => ({ default: m.FinalCardMessageScreenWithLoader })),
)
const QuestionScreen01WithLoader = React.lazy(() =>
  import('@/components/ThemeCardQuestionLoaders').then((m) => ({ default: m.QuestionScreen01WithLoader })),
)
const QuestionScreen02WithLoader = React.lazy(() =>
  import('@/components/ThemeCardQuestionLoaders').then((m) => ({ default: m.QuestionScreen02WithLoader })),
)

import type { RouteContext } from './types'

export function renderThemeCardRoutes(ctx: RouteContext): React.ReactNode | null {
  const { currentScreen, wrapScreen, handlers } = ctx
  const { currentTheme, currentCard, currentCheckin, userHasPremium, currentLanguage, userAnswers, getTheme } = ctx
  const withSuspense = (screen: React.ReactNode) => <Suspense fallback={<LoadingScreen />}>{screen}</Suspense>

  switch (currentScreen) {
    case 'home':
      return wrapScreen(
        <HomeScreen
          onGoToProfile={handlers.handleGoToProfile}
          onGoToTheme={handlers.handleGoToTheme}
          onArticleClick={handlers.handleOpenArticle}
          onViewAllArticles={handlers.handleGoToAllArticles}
          userHasPremium={userHasPremium}
        />,
      )
    case 'theme-welcome': {
      const themeData = getTheme(currentTheme)
      return wrapScreen(withSuspense(
        <ThemeWelcomeScreen
          onBack={handlers.handleBackToHomeFromTheme}
          onStart={handlers.handleStartTheme}
          onUnlock={handlers.handleShowPayments}
          themeTitle={currentTheme}
          isPremiumTheme={themeData?.isPremium || false}
          userHasPremium={userHasPremium}
        />,
      ))
    }
    case 'theme-home': {
      const themeData = getTheme(currentTheme)
      const isPremiumTheme = themeData?.isPremium || false
      return wrapScreen(withSuspense(
        <ThemeHomeScreen
          onBack={handlers.handleBackToHomeFromTheme}
          onCardClick={handlers.handleThemeCardClick}
          onOpenNextLevel={handlers.handleOpenNextLevel}
          themeId={currentTheme}
          userHasPremium={userHasPremium}
          onUnlock={isPremiumTheme && !userHasPremium ? handlers.handleShowPayments : undefined}
        />,
      ))
    }
    case 'card-details':
      return wrapScreen(withSuspense(
        <CardDetailsScreen
          onBack={handlers.handleBackToThemeHome}
          onOpenCard={handlers.handleOpenCardExercise}
          onOpenCheckin={handlers.handleOpenCheckin}
          cardId={currentCard.id}
          cardTitle={currentCard.title || ''}
          cardDescription={currentCard.description}
        />,
      ))
    case 'checkin-details':
      return wrapScreen(withSuspense(
        <CheckinDetailsScreen
          onBack={handlers.handleBackToCardDetails}
          checkinId={currentCheckin.id}
          cardTitle={currentCheckin.cardTitle}
          checkinDate={currentCheckin.date}
        />,
      ))
    case 'card-welcome':
      return wrapScreen(withSuspense(
        <CardWelcomeScreen
          onBack={handlers.handleBackToCardDetailsFromWelcome}
          onNext={handlers.handleStartCardExercise}
          cardId={currentCard.id}
          cardTitle={currentCard.title || ''}
          cardDescription={currentCard.description}
        />,
      ))
    case 'question-01':
      return wrapScreen(withSuspense(
        <QuestionScreen01WithLoader
          onBack={handlers.handleBackToCardDetails}
          onNext={handlers.handleNextQuestion}
          cardId={currentCard.id}
          cardTitle={currentCard.title || ''}
          getCardQuestions={ctx.getCardQuestions}
          currentLanguage={currentLanguage}
        />,
      ))
    case 'question-02':
      return wrapScreen(withSuspense(
        <QuestionScreen02WithLoader
          onBack={handlers.handleBackToQuestion01}
          onNext={handlers.handleCompleteExercise}
          cardId={currentCard.id}
          cardTitle={currentCard.title || ''}
          getCardQuestions={ctx.getCardQuestions}
          currentLanguage={currentLanguage}
          previousAnswer={userAnswers.question1 || ''}
        />,
      ))
    case 'final-message':
      return wrapScreen(withSuspense(
        <FinalCardMessageScreenWithLoader
          onBack={handlers.handleBackToQuestion02}
          onNext={handlers.handleCompleteFinalMessage}
          cardId={currentCard.id}
          cardTitle={currentCard.title || ''}
          getCardMessageData={ctx.getCardMessageData}
          currentLanguage={currentLanguage}
        />,
      ))
    case 'rate-card':
      return wrapScreen(withSuspense(
        <RateCardScreen
          onBack={handlers.handleBackToFinalMessage}
          onNext={handlers.handleCompleteRating}
          cardId={currentCard.id}
          cardTitle={currentCard.title || ''}
        />,
      ))
    default:
      return null
  }
}
