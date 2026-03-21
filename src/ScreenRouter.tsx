import React, { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@nanostores/react'

import { goBack, navigateTo, $currentScreen, $isNavigatingForward, $navigationHistory } from './stores/navigation.store'
import type { AppScreen } from '@/types/userState'
import { calculateTestResults } from '@/utils/psychologicalTestCalculator'
import { loadTestResults } from '@/utils/psychologicalTestStorage'
import type { PsychologicalTestPercentages } from '@/types/psychologicalTest'

import { OnboardingScreen01 } from '@/components/OnboardingScreen01'
import { OnboardingScreen02 } from '@/components/OnboardingScreen02'
import { SurveyScreen01 } from '@/components/SurveyScreen01'
import { SurveyScreen02 } from '@/components/SurveyScreen02'
import { SurveyScreen03 } from '@/components/SurveyScreen03'
import { SurveyScreen04 } from '@/components/SurveyScreen04'
import { SurveyScreen05 } from '@/components/SurveyScreen05'
import { SurveyScreen06 } from '@/components/SurveyScreen06'
import { PsychologicalTestPreambulaScreen } from '@/components/PsychologicalTestPreambulaScreen'
import { PsychologicalTestInstructionScreen } from '@/components/PsychologicalTestInstructionScreen'
import { PsychologicalTestQuestionScreen } from '@/components/PsychologicalTestQuestionScreen'
import { PsychologicalTestResultsScreen } from '@/components/PsychologicalTestResultsScreen'
import { PinSetupScreen } from '@/components/PinSetupScreen'
import { CheckInScreen } from '@/components/CheckInScreen'
import { HomeScreen } from '@/components/HomeScreen'
import { UserProfileScreen } from '@/components/UserProfileScreen'
import { AboutAppScreen } from '@/components/AboutAppScreen'
import { AppSettingsScreen } from '@/components/AppSettingsScreen'
import { PrivacyPolicyScreen } from '@/components/PrivacyPolicyScreen'
import { TermsOfUseScreen } from '@/components/TermsOfUseScreen'
import { DeleteAccountScreen } from '@/components/DeleteAccountScreen'
import { PaymentsScreen } from '@/components/PaymentsScreen'
import { DonationsScreen } from '@/components/DonationsScreen'
import { UnderConstructionScreen } from '@/components/UnderConstructionScreen'
import { ThemeWelcomeScreen } from '@/components/ThemeWelcomeScreen'
import { ThemeHomeScreen } from '@/components/ThemeHomeScreen'
import { CardDetailsScreen } from '@/components/CardDetailsScreen'
import { CheckinDetailsScreen } from '@/components/CheckinDetailsScreen'
import { CardWelcomeScreen } from '@/components/CardWelcomeScreen'
import { RateCardScreen } from '@/components/RateCardScreen'
import { BadgesScreen } from '@/components/BadgesScreen'
import { AllArticlesScreen } from '@/components/AllArticlesScreen'
import { ArticleScreen } from '@/components/ArticleScreen'
import { LoadingScreen } from '@/components/LoadingScreen'
import { RewardManager } from '@/components/RewardManager'

import { Breathing478Screen } from '@/components/mental-techniques/Breathing478Screen'
import { SquareBreathingScreen } from '@/components/mental-techniques/SquareBreathingScreen'
import { Grounding54321Screen } from '@/components/mental-techniques/Grounding54321Screen'
import { GroundingAnchorScreen } from '@/components/mental-techniques/GroundingAnchorScreen'

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
import {
  QuestionScreen01WithLoader,
  QuestionScreen02WithLoader,
  FinalCardMessageScreenWithLoader,
} from '@/components/ThemeCardQuestionLoaders'

const {
  handleNextScreen,
  handleShowSurvey,
  handleCompletePinSetup,
  handleSkipPinSetup,
} = onboardingActions
const {
  handleSurvey01Next,
  handleSurvey02Next,
  handleSurvey03Next,
  handleSurvey04Next,
  handleSurvey05Next,
  handleSurvey06Next,
  handleBackToSurvey01,
  handleBackToSurvey02,
  handleBackToSurvey03,
  handleBackToSurvey04,
  handleBackToSurvey05,
  handleBackToOnboarding2,
  handleBackToSurvey,
} = surveyActions
const {
  handlePsychologicalTestPreambulaNext,
  handlePsychologicalTestInstructionNext,
  handlePsychologicalTestQuestionNext,
  handlePsychologicalTestResultsNext,
} = psychTestActions
const {
  handleOpenArticle,
  handleGoToAllArticles,
  handleBackFromArticle,
  handleBackToHomeFromArticles,
} = articleActions
const {
  handleShowAboutApp,
  handleShowAppSettings,
  handleBackToProfile,
  handleBackToProfileFromSettings,
  handleShowPinSettings,
  handleCompletePinSettings,
  handleSkipPinSettings,
  handleShowPrivacy,
  handleShowTerms,
  handleShowPrivacyFromProfile,
  handleShowTermsFromProfile,
  handleBackToHome,
  handleShowDeleteAccount,
  handleDeleteAccount,
  handleBackToProfileFromDelete,
  handleShowPayments,
  handlePurchaseComplete,
  handleBackToProfileFromPayments,
  handleShowDonations,
  handleBackToProfileFromDonations,
  handleBackToProfileFromUnderConstruction,
  handleBackFromMentalTechnique,
  handleGoToProfile,
  handleGoToBadges,
} = profileActions
const {
  handleGoToTheme,
  handleBackToHomeFromTheme,
  handleStartTheme,
  handleThemeCardClick,
  handleOpenNextLevel,
  handleBackToThemeHome,
  handleOpenCardExercise,
  handleOpenCheckin,
  handleBackToCardDetails,
  handleBackToCardDetailsFromWelcome,
  handleStartCardExercise,
  handleNextQuestion,
  handleBackToQuestion01,
  handleBackToQuestion02,
  handleCompleteExercise,
  handleCompleteFinalMessage,
  handleBackToFinalMessage,
  handleCompleteRating,
  getCardQuestions,
  getCardMessageData,
} = themeCardActions

export type ScreenRouterProps = {
  renderCurrentScreen?: () => React.ReactNode
}

export default function ScreenRouter(props: ScreenRouterProps = {}) {
  const currentScreen = useStore($currentScreen)
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
  } = screenParams

  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const checkInTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardExerciseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const checkAndShowAchievementsBound = useCallback(
    (delay?: number, forceCheck?: boolean) =>
      checkAndShowAchievements(delay ?? 200, forceCheck ?? false, { isMounted: () => isMountedRef.current }),
    []
  )

  const setEarnedAchievementIdsForArticle = useCallback(
    (ids: string[] | ((prev: string[]) => string[])) => {
      if (typeof ids === 'function') {
        const prev = $screenParams.get().earnedAchievementIds
        setEarnedAchievementIds(ids(prev))
      } else {
        setEarnedAchievementIds(ids)
      }
    },
    []
  )

  const onCheckInSubmit = useCallback(
    (mood: string) => {
      handleCheckInSubmit(mood, {
        isMounted: () => isMountedRef.current,
        checkInTimeoutRef,
        checkAndShowAchievements: checkAndShowAchievementsBound,
      })
    },
    [checkAndShowAchievementsBound]
  )

  const getTheme = useCallback((themeId: string) => getThemeFromStore(themeId), [])

  if (typeof props.renderCurrentScreen === 'function') {
    return props.renderCurrentScreen()
  }

  const wrapScreen = (screen: React.ReactNode) => (
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
  )

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'loading':
        return wrapScreen(<LoadingScreen />)
      case 'onboarding1':
        return wrapScreen(
          <OnboardingScreen01
            onNext={handleNextScreen}
            onShowPrivacy={handleShowPrivacy}
            onShowTerms={handleShowTerms}
          />
        )
      case 'onboarding2':
        return wrapScreen(<OnboardingScreen02 onComplete={handleShowSurvey} />)

      case 'survey01':
        return wrapScreen(
          <SurveyScreen01
            onNext={handleSurvey01Next}
            onBack={handleBackToOnboarding2}
            initialSelections={surveyResults.screen01}
          />
        )
      case 'survey02':
        return wrapScreen(
          <SurveyScreen02
            onNext={handleSurvey02Next}
            onBack={handleBackToSurvey01}
            initialSelections={surveyResults.screen02}
          />
        )
      case 'survey03':
        return wrapScreen(
          <SurveyScreen03
            onNext={handleSurvey03Next}
            onBack={handleBackToSurvey02}
            initialSelections={surveyResults.screen03}
          />
        )
      case 'survey04':
        return wrapScreen(
          <SurveyScreen04
            onNext={handleSurvey04Next}
            onBack={handleBackToSurvey03}
            initialSelections={surveyResults.screen04}
          />
        )
      case 'survey05':
        return wrapScreen(
          <SurveyScreen05
            onNext={handleSurvey05Next}
            onBack={handleBackToSurvey04}
            initialSelections={surveyResults.screen05}
          />
        )
      case 'survey06':
        return wrapScreen(
          <SurveyScreen06
            onNext={handleSurvey06Next}
            onBack={handleBackToSurvey05}
            initialSelections={surveyResults.screen06}
          />
        )

      case 'psychological-test-preambula':
        return wrapScreen(<PsychologicalTestPreambulaScreen onNext={handlePsychologicalTestPreambulaNext} />)

      case 'psychological-test-instruction':
        return wrapScreen(<PsychologicalTestInstructionScreen onNext={handlePsychologicalTestInstructionNext} />)

      case 'psychological-test-question-01':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={1}
            onNext={(answer) => handlePsychologicalTestQuestionNext(1, answer)}
            initialAnswer={psychologicalTestAnswers[0] || null}
          />
        )
      case 'psychological-test-question-02':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={2}
            onNext={(answer) => handlePsychologicalTestQuestionNext(2, answer)}
            initialAnswer={psychologicalTestAnswers[1] || null}
          />
        )
      case 'psychological-test-question-03':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={3}
            onNext={(answer) => handlePsychologicalTestQuestionNext(3, answer)}
            initialAnswer={psychologicalTestAnswers[2] || null}
          />
        )
      case 'psychological-test-question-04':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={4}
            onNext={(answer) => handlePsychologicalTestQuestionNext(4, answer)}
            initialAnswer={psychologicalTestAnswers[3] || null}
          />
        )
      case 'psychological-test-question-05':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={5}
            onNext={(answer) => handlePsychologicalTestQuestionNext(5, answer)}
            initialAnswer={psychologicalTestAnswers[4] || null}
          />
        )
      case 'psychological-test-question-06':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={6}
            onNext={(answer) => handlePsychologicalTestQuestionNext(6, answer)}
            initialAnswer={psychologicalTestAnswers[5] || null}
          />
        )
      case 'psychological-test-question-07':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={7}
            onNext={(answer) => handlePsychologicalTestQuestionNext(7, answer)}
            initialAnswer={psychologicalTestAnswers[6] || null}
          />
        )
      case 'psychological-test-question-08':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={8}
            onNext={(answer) => handlePsychologicalTestQuestionNext(8, answer)}
            initialAnswer={psychologicalTestAnswers[7] || null}
          />
        )
      case 'psychological-test-question-09':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={9}
            onNext={(answer) => handlePsychologicalTestQuestionNext(9, answer)}
            initialAnswer={psychologicalTestAnswers[8] || null}
          />
        )
      case 'psychological-test-question-10':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={10}
            onNext={(answer) => handlePsychologicalTestQuestionNext(10, answer)}
            initialAnswer={psychologicalTestAnswers[9] || null}
          />
        )
      case 'psychological-test-question-11':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={11}
            onNext={(answer) => handlePsychologicalTestQuestionNext(11, answer)}
            initialAnswer={psychologicalTestAnswers[10] || null}
          />
        )
      case 'psychological-test-question-12':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={12}
            onNext={(answer) => handlePsychologicalTestQuestionNext(12, answer)}
            initialAnswer={psychologicalTestAnswers[11] || null}
          />
        )
      case 'psychological-test-question-13':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={13}
            onNext={(answer) => handlePsychologicalTestQuestionNext(13, answer)}
            initialAnswer={psychologicalTestAnswers[12] || null}
          />
        )
      case 'psychological-test-question-14':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={14}
            onNext={(answer) => handlePsychologicalTestQuestionNext(14, answer)}
            initialAnswer={psychologicalTestAnswers[13] || null}
          />
        )
      case 'psychological-test-question-15':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={15}
            onNext={(answer) => handlePsychologicalTestQuestionNext(15, answer)}
            initialAnswer={psychologicalTestAnswers[14] || null}
          />
        )
      case 'psychological-test-question-16':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={16}
            onNext={(answer) => handlePsychologicalTestQuestionNext(16, answer)}
            initialAnswer={psychologicalTestAnswers[15] || null}
          />
        )
      case 'psychological-test-question-17':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={17}
            onNext={(answer) => handlePsychologicalTestQuestionNext(17, answer)}
            initialAnswer={psychologicalTestAnswers[16] || null}
          />
        )
      case 'psychological-test-question-18':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={18}
            onNext={(answer) => handlePsychologicalTestQuestionNext(18, answer)}
            initialAnswer={psychologicalTestAnswers[17] || null}
          />
        )
      case 'psychological-test-question-19':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={19}
            onNext={(answer) => handlePsychologicalTestQuestionNext(19, answer)}
            initialAnswer={psychologicalTestAnswers[18] || null}
          />
        )
      case 'psychological-test-question-20':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={20}
            onNext={(answer) => handlePsychologicalTestQuestionNext(20, answer)}
            initialAnswer={psychologicalTestAnswers[19] || null}
          />
        )
      case 'psychological-test-question-21':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={21}
            onNext={(answer) => handlePsychologicalTestQuestionNext(21, answer)}
            initialAnswer={psychologicalTestAnswers[20] || null}
          />
        )
      case 'psychological-test-question-22':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={22}
            onNext={(answer) => handlePsychologicalTestQuestionNext(22, answer)}
            initialAnswer={psychologicalTestAnswers[21] || null}
          />
        )
      case 'psychological-test-question-23':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={23}
            onNext={(answer) => handlePsychologicalTestQuestionNext(23, answer)}
            initialAnswer={psychologicalTestAnswers[22] || null}
          />
        )
      case 'psychological-test-question-24':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={24}
            onNext={(answer) => handlePsychologicalTestQuestionNext(24, answer)}
            initialAnswer={psychologicalTestAnswers[23] || null}
          />
        )
      case 'psychological-test-question-25':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={25}
            onNext={(answer) => handlePsychologicalTestQuestionNext(25, answer)}
            initialAnswer={psychologicalTestAnswers[24] || null}
          />
        )
      case 'psychological-test-question-26':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={26}
            onNext={(answer) => handlePsychologicalTestQuestionNext(26, answer)}
            initialAnswer={psychologicalTestAnswers[25] || null}
          />
        )
      case 'psychological-test-question-27':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={27}
            onNext={(answer) => handlePsychologicalTestQuestionNext(27, answer)}
            initialAnswer={psychologicalTestAnswers[26] || null}
          />
        )
      case 'psychological-test-question-28':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={28}
            onNext={(answer) => handlePsychologicalTestQuestionNext(28, answer)}
            initialAnswer={psychologicalTestAnswers[27] || null}
          />
        )
      case 'psychological-test-question-29':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={29}
            onNext={(answer) => handlePsychologicalTestQuestionNext(29, answer)}
            initialAnswer={psychologicalTestAnswers[28] || null}
          />
        )
      case 'psychological-test-question-30':
        return wrapScreen(
          <PsychologicalTestQuestionScreen
            questionNumber={30}
            onNext={(answer) => handlePsychologicalTestQuestionNext(30, answer)}
            initialAnswer={psychologicalTestAnswers[29] || null}
          />
        )

      case 'psychological-test-results': {
        const savedResults = loadTestResults()

        let percentages: PsychologicalTestPercentages
        if (savedResults?.percentages) {
          percentages = savedResults.percentages
        } else if (psychologicalTestAnswers.length === 30) {
          percentages = calculateTestResults(psychologicalTestAnswers).percentages
        } else {
          console.warn(
            `Psychological test results: incomplete answers (${psychologicalTestAnswers.length}/30). Using default zero percentages.`,
          )
          percentages = {
            stress: 0,
            anxiety: 0,
            relationships: 0,
            selfEsteem: 0,
            anger: 0,
            depression: 0,
          }
        }

        return wrapScreen(
          <PsychologicalTestResultsScreen
            percentages={percentages}
            onNext={handlePsychologicalTestResultsNext}
          />,
        )
      }

      case 'pin':
        return wrapScreen(
          <PinSetupScreen
            onComplete={handleCompletePinSetup}
            onSkip={handleSkipPinSetup}
            onBack={handleBackToSurvey}
          />,
        )

      case 'checkin':
        return wrapScreen(<CheckInScreen onSubmit={onCheckInSubmit} onBack={handleBackToHome} />)

      case 'home':
        return wrapScreen(
          <HomeScreen
            onGoToProfile={handleGoToProfile}
            onGoToTheme={handleGoToTheme}
            onArticleClick={handleOpenArticle}
            onViewAllArticles={handleGoToAllArticles}
            userHasPremium={userHasPremium}
          />,
        )

      case 'theme-welcome': {
        const themeData = getTheme(currentTheme)
        return wrapScreen(
          <ThemeWelcomeScreen
            onBack={handleBackToHomeFromTheme}
            onStart={handleStartTheme}
            onUnlock={handleShowPayments}
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
            onBack={handleBackToHomeFromTheme}
            onCardClick={handleThemeCardClick}
            onOpenNextLevel={handleOpenNextLevel}
            themeId={currentTheme}
            userHasPremium={userHasPremium}
            onUnlock={isPremiumTheme && !userHasPremium ? handleShowPayments : undefined}
          />,
        )
      }

      case 'card-details':
        return wrapScreen(
          <CardDetailsScreen
            onBack={handleBackToThemeHome}
            onOpenCard={handleOpenCardExercise}
            onOpenCheckin={handleOpenCheckin}
            cardId={currentCard.id}
            cardTitle={currentCard.title || ''}
            cardDescription={currentCard.description}
          />,
        )

      case 'checkin-details':
        return wrapScreen(
          <CheckinDetailsScreen
            onBack={handleBackToCardDetails}
            checkinId={currentCheckin.id}
            cardTitle={currentCheckin.cardTitle}
            checkinDate={currentCheckin.date}
          />,
        )

      case 'card-welcome':
        return wrapScreen(
          <CardWelcomeScreen
            onBack={handleBackToCardDetailsFromWelcome}
            onNext={handleStartCardExercise}
            cardId={currentCard.id}
            cardTitle={currentCard.title || ''}
            cardDescription={currentCard.description}
          />,
        )

      case 'question-01':
        return wrapScreen(
          <QuestionScreen01WithLoader
            onBack={handleBackToCardDetails}
            onNext={handleNextQuestion}
            cardId={currentCard.id}
            cardTitle={currentCard.title || ''}
            getCardQuestions={getCardQuestions}
            currentLanguage={currentLanguage}
          />,
        )

      case 'question-02':
        return wrapScreen(
          <QuestionScreen02WithLoader
            onBack={handleBackToQuestion01}
            onNext={handleCompleteExercise}
            cardId={currentCard.id}
            cardTitle={currentCard.title || ''}
            getCardQuestions={getCardQuestions}
            currentLanguage={currentLanguage}
            previousAnswer={userAnswers.question1 || ''}
          />,
        )

      case 'final-message':
        return wrapScreen(
          <FinalCardMessageScreenWithLoader
            onBack={handleBackToQuestion02}
            onNext={handleCompleteFinalMessage}
            cardId={currentCard.id}
            cardTitle={currentCard.title || ''}
            getCardMessageData={getCardMessageData}
            currentLanguage={currentLanguage}
          />,
        )

      case 'rate-card':
        return wrapScreen(
          <RateCardScreen
            onBack={handleBackToFinalMessage}
            onNext={(rating, text) =>
              handleCompleteRating(rating, text, { cardExerciseTimeoutRef, isMountedRef })
            }
            cardId={currentCard.id}
            cardTitle={currentCard.title || ''}
          />,
        )

      case 'profile':
        return wrapScreen(
          <UserProfileScreen
            onBack={handleBackToHome}
            onShowPayments={handleShowPayments}
            onGoToBadges={handleGoToBadges}
            onShowSettings={handleShowAppSettings}
            userHasPremium={userHasPremium}
          />,
        )

      case 'about':
        return wrapScreen(<AboutAppScreen onBack={handleBackToProfile} />)

      case 'app-settings':
        return wrapScreen(
          <AppSettingsScreen
            onBack={handleBackToProfileFromSettings}
            onShowAboutApp={handleShowAboutApp}
            onShowPinSettings={handleShowPinSettings}
            onShowPrivacy={handleShowPrivacyFromProfile}
            onShowTerms={handleShowTermsFromProfile}
            onShowDeleteAccount={handleShowDeleteAccount}
            onShowDonations={handleShowDonations}
          />,
        )

      case 'pin-settings':
        return wrapScreen(
          <PinSetupScreen
            onComplete={handleCompletePinSettings}
            onSkip={handleSkipPinSettings}
            onBack={handleBackToProfile}
          />,
        )

      case 'privacy':
        return wrapScreen(<PrivacyPolicyScreen onBack={goBack} />)

      case 'terms':
        return wrapScreen(<TermsOfUseScreen onBack={goBack} />)

      case 'delete':
        return wrapScreen(
          <DeleteAccountScreen
            onBack={handleBackToProfileFromDelete}
            onDeleteAccount={handleDeleteAccount}
          />,
        )

      case 'payments':
        return wrapScreen(
          <PaymentsScreen
            onBack={handleBackToProfileFromPayments}
            onPurchaseComplete={handlePurchaseComplete}
          />,
        )

      case 'donations':
        return wrapScreen(<DonationsScreen onBack={handleBackToProfileFromDonations} />)

      case 'under-construction':
        return wrapScreen(
          <UnderConstructionScreen
            onBack={handleBackToProfileFromUnderConstruction}
            featureName={currentFeatureName}
          />,
        )

      case 'breathing-4-7-8':
        return wrapScreen(<Breathing478Screen onBack={handleBackFromMentalTechnique} />)
      case 'breathing-square':
        return wrapScreen(<SquareBreathingScreen onBack={handleBackFromMentalTechnique} />)
      case 'grounding-5-4-3-2-1':
        return wrapScreen(<Grounding54321Screen onBack={handleBackFromMentalTechnique} />)
      case 'grounding-anchor':
        return wrapScreen(<GroundingAnchorScreen onBack={handleBackFromMentalTechnique} />)

      case 'reward':
        return wrapScreen(
          <RewardManager
            earnedAchievementIds={earnedAchievementIds}
            onComplete={() => {
              setEarnedAchievementIds([])

              const previousScreen = navigationHistory.length >= 2 ? navigationHistory[navigationHistory.length - 2] : 'home'
              let returnScreen: AppScreen = 'home'
              if (previousScreen === 'theme-home') {
                returnScreen = 'theme-home'
              } else if (previousScreen === 'all-articles') {
                returnScreen = 'all-articles'
              }
              navigateTo(returnScreen)
            }}
            onBack={() => {
              setEarnedAchievementIds([])

              const previousScreen = navigationHistory.length >= 2 ? navigationHistory[navigationHistory.length - 2] : 'home'
              let returnScreen: AppScreen = 'home'
              if (previousScreen === 'theme-home') {
                returnScreen = 'theme-home'
              } else if (previousScreen === 'all-articles') {
                returnScreen = 'all-articles'
              }
              navigateTo(returnScreen)
            }}
          />,
        )

      case 'badges':
        return wrapScreen(<BadgesScreen onBack={goBack} />)

      case 'all-articles':
        return wrapScreen(
          <AllArticlesScreen onBack={handleBackToHomeFromArticles} onArticleClick={handleOpenArticle} />,
        )

      case 'article':
        return wrapScreen(
          <ArticleScreen
            articleId={currentArticle}
            onBack={handleBackFromArticle}
            onGoToTheme={handleGoToTheme}
            userHasPremium={userHasPremium}
            checkAndShowAchievements={checkAndShowAchievementsBound}
            navigateTo={navigateTo}
            earnedAchievementIds={earnedAchievementIds}
            setEarnedAchievementIds={setEarnedAchievementIdsForArticle}
          />,
        )

      default:
        return wrapScreen(
          <OnboardingScreen01
            onNext={handleNextScreen}
            onShowPrivacy={handleShowPrivacy}
            onShowTerms={handleShowTerms}
          />,
        )
    }
  }

  return renderCurrentScreen()
}

