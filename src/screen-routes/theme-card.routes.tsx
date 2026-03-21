import type React from 'react'

import { CardDetailsScreen } from '@/components/CardDetailsScreen'
import { CardWelcomeScreen } from '@/components/CardWelcomeScreen'
import { CheckinDetailsScreen } from '@/components/CheckinDetailsScreen'
import { HomeScreen } from '@/components/HomeScreen'
import { RateCardScreen } from '@/components/RateCardScreen'
import { ThemeHomeScreen } from '@/components/ThemeHomeScreen'
import { ThemeWelcomeScreen } from '@/components/ThemeWelcomeScreen'
import {
  FinalCardMessageScreenWithLoader,
  QuestionScreen01WithLoader,
  QuestionScreen02WithLoader,
} from '@/components/ThemeCardQuestionLoaders'

import type { RouteContext } from './types'

export function renderThemeCardRoutes(ctx: RouteContext): React.ReactNode | null {
  const { currentScreen, wrapScreen, handlers } = ctx
  const { currentTheme, currentCard, currentCheckin, userHasPremium, currentLanguage, userAnswers, getTheme } = ctx

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
      return wrapScreen(
        <ThemeWelcomeScreen
          onBack={handlers.handleBackToHomeFromTheme}
          onStart={handlers.handleStartTheme}
          onUnlock={handlers.handleShowPayments}
          themeTitle={currentTheme}
          isPremiumTheme={themeData?.isPremium || false}
          userHasPremium={userHasPremium}
        />,
      )
    }
    case 'theme-home': {
      const themeData = getTheme(currentTheme)
      const isPremiumTheme = themeData?.isPremium || false
      return wrapScreen(
        <ThemeHomeScreen
          onBack={handlers.handleBackToHomeFromTheme}
          onCardClick={handlers.handleThemeCardClick}
          onOpenNextLevel={handlers.handleOpenNextLevel}
          themeId={currentTheme}
          userHasPremium={userHasPremium}
          onUnlock={isPremiumTheme && !userHasPremium ? handlers.handleShowPayments : undefined}
        />,
      )
    }
    case 'card-details':
      return wrapScreen(
        <CardDetailsScreen
          onBack={handlers.handleBackToThemeHome}
          onOpenCard={handlers.handleOpenCardExercise}
          onOpenCheckin={handlers.handleOpenCheckin}
          cardId={currentCard.id}
          cardTitle={currentCard.title || ''}
          cardDescription={currentCard.description}
        />,
      )
    case 'checkin-details':
      return wrapScreen(
        <CheckinDetailsScreen
          onBack={handlers.handleBackToCardDetails}
          checkinId={currentCheckin.id}
          cardTitle={currentCheckin.cardTitle}
          checkinDate={currentCheckin.date}
        />,
      )
    case 'card-welcome':
      return wrapScreen(
        <CardWelcomeScreen
          onBack={handlers.handleBackToCardDetailsFromWelcome}
          onNext={handlers.handleStartCardExercise}
          cardId={currentCard.id}
          cardTitle={currentCard.title || ''}
          cardDescription={currentCard.description}
        />,
      )
    case 'question-01':
      return wrapScreen(
        <QuestionScreen01WithLoader
          onBack={handlers.handleBackToCardDetails}
          onNext={handlers.handleNextQuestion}
          cardId={currentCard.id}
          cardTitle={currentCard.title || ''}
          getCardQuestions={ctx.getCardQuestions}
          currentLanguage={currentLanguage}
        />,
      )
    case 'question-02':
      return wrapScreen(
        <QuestionScreen02WithLoader
          onBack={handlers.handleBackToQuestion01}
          onNext={handlers.handleCompleteExercise}
          cardId={currentCard.id}
          cardTitle={currentCard.title || ''}
          getCardQuestions={ctx.getCardQuestions}
          currentLanguage={currentLanguage}
          previousAnswer={userAnswers.question1 || ''}
        />,
      )
    case 'final-message':
      return wrapScreen(
        <FinalCardMessageScreenWithLoader
          onBack={handlers.handleBackToQuestion02}
          onNext={handlers.handleCompleteFinalMessage}
          cardId={currentCard.id}
          cardTitle={currentCard.title || ''}
          getCardMessageData={ctx.getCardMessageData}
          currentLanguage={currentLanguage}
        />,
      )
    case 'rate-card':
      return wrapScreen(
        <RateCardScreen
          onBack={handlers.handleBackToFinalMessage}
          onNext={handlers.handleCompleteRating}
          cardId={currentCard.id}
          cardTitle={currentCard.title || ''}
        />,
      )
    default:
      return null
  }
}
