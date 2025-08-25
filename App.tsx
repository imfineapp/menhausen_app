import { useState } from 'react';

import { OnboardingScreen01 } from './components/OnboardingScreen01';
import { OnboardingScreen02 } from './components/OnboardingScreen02';
import { SurveyScreen01 } from './components/SurveyScreen01';
import { SurveyScreen02 } from './components/SurveyScreen02';
import { SurveyScreen03 } from './components/SurveyScreen03';
import { SurveyScreen04 } from './components/SurveyScreen04';
import { SurveyScreen05 } from './components/SurveyScreen05';
import { PinSetupScreen } from './components/PinSetupScreen';
import { CheckInScreen } from './components/CheckInScreen';
import { HomeScreen } from './components/HomeScreen';
import { UserProfileScreen } from './components/UserProfileScreen';
import { AboutAppScreen } from './components/AboutAppScreen';
import { PrivacyPolicyScreen } from './components/PrivacyPolicyScreen';
import { TermsOfUseScreen } from './components/TermsOfUseScreen';
import { DeleteAccountScreen } from './components/DeleteAccountScreen';
import { PaymentsScreen } from './components/PaymentsScreen';
import { UnderConstructionScreen } from './components/UnderConstructionScreen';
import { ThemeWelcomeScreen } from './components/ThemeWelcomeScreen';
import { ThemeHomeScreen } from './components/ThemeHomeScreen';
import { CardDetailsScreen } from './components/CardDetailsScreen';
import { CheckinDetailsScreen } from './components/CheckinDetailsScreen';
import { CardWelcomeScreen } from './components/CardWelcomeScreen';
import { QuestionScreen01 } from './components/QuestionScreen01';
import { QuestionScreen02 } from './components/QuestionScreen02';
import { FinalCardMessageScreen } from './components/FinalCardMessageScreen';
import { RateCardScreen } from './components/RateCardScreen';

// Новые импорты для централизованного управления контентом
import { ContentProvider, useContent } from './components/ContentContext';
import { LanguageProvider } from './components/LanguageContext';
import { appContent } from './data/content';
import { SurveyResults } from './types/content';

type AppScreen = 'onboarding1' | 'onboarding2' | 'survey01' | 'survey02' | 'survey03' | 'survey04' | 'survey05' | 'pin' | 'checkin' | 'home' | 'profile' | 'about' | 'privacy' | 'terms' | 'pin-settings' | 'delete' | 'payments' | 'under-construction' | 'theme-welcome' | 'theme-home' | 'card-details' | 'checkin-details' | 'card-welcome' | 'question-01' | 'question-02' | 'final-message' | 'rate-card';

/**
 * Основной компонент приложения с навигацией
 * Теперь использует централизованную систему управления контентом и расширенную систему опроса
 */
function AppContent() {
  // =====================================================================================
  // СОСТОЯНИЕ НАВИГАЦИИ И ДАННЫХ
  // =====================================================================================
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('onboarding1');
  const [previousScreen, setPreviousScreen] = useState<AppScreen>('onboarding1');
  const [currentFeatureName, setCurrentFeatureName] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<string>('');
  const [currentCard, setCurrentCard] = useState<{id: string; title?: string; description?: string}>({id: ''});
  const [currentCheckin, setCurrentCheckin] = useState<{id: string; cardTitle?: string; date?: string}>({id: ''});
  const [userAnswers, setUserAnswers] = useState<{question1?: string; question2?: string}>({});
  const [_cardRating, setCardRating] = useState<number>(0);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [cardCompletionCounts, setCardCompletionCounts] = useState<Record<string, number>>({});
  const [userHasPremium, setUserHasPremium] = useState<boolean>(false);

  // =====================================================================================
  // НОВОЕ СОСТОЯНИЕ ДЛЯ СИСТЕМЫ ОПРОСА
  // =====================================================================================
  const [surveyResults, setSurveyResults] = useState<Partial<SurveyResults>>({
    screen01: [],
    screen02: [],
    screen03: [],
    screen04: [],
    screen05: []
  });

  // Получение системы контента
  const { getCard, getTheme, getLocalizedText } = useContent();

  // =====================================================================================
  // ФУНКЦИИ СОХРАНЕНИЯ ДАННЫХ ОПРОСА
  // =====================================================================================

  /**
   * Сохранение результатов опроса в localStorage и подготовка к отправке в базу
   */
  const saveSurveyResults = (results: SurveyResults) => {
    try {
      // Сохраняем в localStorage для оффлайн доступа
      localStorage.setItem('survey-results', JSON.stringify(results));
      
      // Логируем для отладки и будущей интеграции с API
      console.log('Survey completed with results:', results);
      
      // TODO: Здесь будет вызов API для сохранения в базе данных
      // Пример структуры вызова:
      // await saveSurveyToDatabase(results);
      
      return true;
    } catch (error) {
      console.error('Failed to save survey results:', error);
      return false;
    }
  };

  /**
   * Загрузка сохраненных результатов опроса
   */
  const loadSavedSurveyResults = (): Partial<SurveyResults> => {
    try {
      const saved = localStorage.getItem('survey-results');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to load survey results:', error);
      return {};
    }
  };

  // =====================================================================================
  // ФУНКЦИИ НАВИГАЦИИ
  // =====================================================================================

  const handleNextScreen = () => {
    setCurrentScreen('onboarding2');
  };

  const handleShowSurvey = () => {
    // Загружаем сохраненные результаты если есть
    const savedResults = loadSavedSurveyResults();
    setSurveyResults(prev => ({ ...prev, ...savedResults }));
    setCurrentScreen('survey01');
  };

  const _handleShowPinSetup = () => {
    setCurrentScreen('pin');
  };

  const _handleShowCheckIn = () => {
    setCurrentScreen('checkin');
  };

  const _handleShowHome = () => {
    setCurrentScreen('home');
  };

  const handleCompletePinSetup = () => {
    console.log('PIN setup completed');
    setCurrentScreen('checkin');
  };

  const handleSkipPinSetup = () => {
    console.log('PIN setup skipped');
    setCurrentScreen('checkin');
  };

  const handleCheckInSubmit = (mood: string) => {
    console.log('Check-in submitted:', { mood, timestamp: new Date().toISOString() });
    setCurrentScreen('home');
  };

  // =====================================================================================
  // ФУНКЦИИ НАВИГАЦИИ ПО ОПРОСУ
  // =====================================================================================

  const handleSurvey01Next = (answers: string[]) => {
    console.log('Survey 01 answers:', answers);
    setSurveyResults(prev => ({ ...prev, screen01: answers }));
    setCurrentScreen('survey02');
  };

  const handleSurvey02Next = (answers: string[]) => {
    console.log('Survey 02 answers:', answers);
    setSurveyResults(prev => ({ ...prev, screen02: answers }));
    setCurrentScreen('survey03');
  };

  const handleSurvey03Next = (answers: string[]) => {
    console.log('Survey 03 answers:', answers);
    setSurveyResults(prev => ({ ...prev, screen03: answers }));
    setCurrentScreen('survey04');
  };

  const handleSurvey04Next = (answers: string[]) => {
    console.log('Survey 04 answers:', answers);
    setSurveyResults(prev => ({ ...prev, screen04: answers }));
    setCurrentScreen('survey05');
  };

  const handleSurvey05Next = (answers: string[]) => {
    console.log('Survey 05 answers:', answers);
    const finalResults: SurveyResults = {
      ...surveyResults,
      screen05: answers,
      completedAt: new Date().toISOString()
    } as SurveyResults;
    
    setSurveyResults(finalResults);
    
    // Сохранение результатов
    const saveSuccess = saveSurveyResults(finalResults);
    if (saveSuccess) {
      console.log('Survey completed successfully');
      setCurrentScreen('pin');
    } else {
      console.error('Failed to save survey, but continuing...');
      setCurrentScreen('pin');
    }
  };

  // Обработчики возврата для экранов опроса
  const handleBackToSurvey01 = () => setCurrentScreen('survey01');
  const handleBackToSurvey02 = () => setCurrentScreen('survey02');
  const handleBackToSurvey03 = () => setCurrentScreen('survey03');
  const handleBackToSurvey04 = () => setCurrentScreen('survey04');

  const handleGoToCheckIn = () => {
    setCurrentScreen('checkin');
  };

  const handleGoToProfile = () => {
    setCurrentScreen('profile');
  };

  /**
   * Навигация к теме - теперь использует систему контента
   */
  const handleGoToTheme = (themeTitle: string) => {
    console.log(`Opening theme: ${themeTitle}`);
    
    // Найти тему по локализованному названию
    const themeId = Object.keys(appContent.themes).find(id => {
      const theme = getTheme(id);
      return theme && getLocalizedText(theme.title) === themeTitle;
    });
    
    if (themeId) {
      setCurrentTheme(themeId);
      setCurrentScreen('theme-welcome');
    } else {
      console.error('Theme not found:', themeTitle);
    }
  };

  const handleBackToHomeFromTheme = () => {
    setCurrentTheme('');
    setCurrentScreen('home');
  };

  const handleStartTheme = () => {
    console.log(`Starting theme: ${currentTheme}`);
    setCurrentScreen('theme-home');
  };

  const _handleBackToThemeWelcome = () => {
    setCurrentScreen('theme-welcome');
  };

  const handleBackToThemeHome = () => {
    setCurrentCard({id: ''});
    setCurrentScreen('theme-home');
  };

  const handleBackToCardDetails = () => {
    setCurrentCheckin({id: ''});
    setCurrentScreen('card-details');
  };

  const handleBackToCardDetailsFromWelcome = () => {
    setCurrentScreen('card-details');
  };

  const handleBackToCardWelcome = () => {
    setCurrentScreen('card-welcome');
  };

  const handleBackToQuestion01 = () => {
    setCurrentScreen('question-01');
  };

  const handleBackToQuestion02 = () => {
    setCurrentScreen('question-02');
  };

  const handleBackToFinalMessage = () => {
    setCurrentScreen('final-message');
  };

  // =====================================================================================
  // ФУНКЦИИ РАБОТЫ С УПРАЖНЕНИЯМИ
  // =====================================================================================

  const handleNextQuestion = (answer: string) => {
    console.log(`Question 1 answered for card: ${currentCard.id}`, answer);
    setUserAnswers(prev => ({ ...prev, question1: answer }));
    setCurrentScreen('question-02');
  };

  const handleCompleteExercise = (answer: string) => {
    console.log(`Question 2 answered for card: ${currentCard.id}`, answer);
    const finalAnswers = { ...userAnswers, question2: answer };
    setUserAnswers(finalAnswers);
    setCurrentScreen('final-message');
  };

  const handleCompleteFinalMessage = () => {
    console.log(`Final message completed for card: ${currentCard.id}`);
    setCurrentScreen('rate-card');
  };

  const handleCompleteRating = (rating: number, textMessage?: string) => {
    console.log(`Card rated: ${rating} stars for card: ${currentCard.id}`, textMessage ? `with message: ${textMessage}` : 'without message');
    
    setCardRating(rating);
    setCompletedCards(prev => new Set([...prev, currentCard.id]));
    setCardCompletionCounts(prev => ({
      ...prev,
      [currentCard.id]: (prev[currentCard.id] || 0) + 1
    }));
    
    console.log('Exercise completed with data:', {
      cardId: currentCard.id,
      answers: userAnswers,
      rating: rating,
      textMessage: textMessage,
      completedAt: new Date().toISOString(),
      completionCount: (cardCompletionCounts[currentCard.id] || 0) + 1
    });
    
    setUserAnswers({});
    setCardRating(0);
    setCurrentCard({id: ''});
    setCurrentScreen('theme-home');
  };

  const handleStartCardExercise = () => {
    console.log(`Starting exercise for card: ${currentCard.id}`);
    setCurrentScreen('question-01');
  };

  const handleOpenCardExercise = () => {
    console.log(`Opening exercise for card: ${currentCard.id}`);
    setCurrentScreen('card-welcome');
  };

  const handleOpenCheckin = (checkinId: string, cardTitle: string, date: string) => {
    console.log(`Opening checkin: ${checkinId} for card: ${cardTitle} on date: ${date}`);
    setCurrentCheckin({
      id: checkinId,
      cardTitle: cardTitle,
      date: date
    });
    setCurrentScreen('checkin-details');
  };

  /**
   * Обработка клика по карточке - теперь использует систему контента
   */
  const handleThemeCardClick = (cardId: string) => {
    console.log(`Card clicked: ${cardId}`);
    const cardData = getCardData(cardId);
    setCurrentCard(cardData);
    setCurrentScreen('card-details');
  };

  /**
   * Получение данных карточки из централизованной системы
   */
  const getCardData = (cardId: string) => {
    const card = getCard(cardId);
    
    if (!card) {
      console.error('Card not found:', cardId);
      return {
        id: cardId,
        title: 'Card',
        description: 'Card description will be available soon.'
      };
    }
    
    return {
      id: cardId,
      title: getLocalizedText(card.title),
      description: getLocalizedText(card.description)
    };
  };

  /**
   * Поиск следующей доступной карточки
   */
  const handleOpenNextLevel = () => {
    console.log('Opening next level');
    
    // Получить карточки текущей темы
    const theme = getTheme(currentTheme);
    if (!theme) return;
    
    const nextCard = theme.cardIds.find(cardId => !completedCards.has(cardId));
    
    if (nextCard) {
      console.log(`Opening next available card: ${nextCard}`);
      const cardData = getCardData(nextCard);
      setCurrentCard(cardData);
      setCurrentScreen('card-details');
    } else {
      console.log('All cards have been completed!');
      alert('Congratulations! You have completed all cards in this theme.');
    }
  };

  // =====================================================================================
  // ОСТАЛЬНЫЕ ФУНКЦИИ НАВИГАЦИИ
  // =====================================================================================

  const handleShowAboutApp = () => {
    setCurrentScreen('about');
  };

  const handleBackToProfile = () => {
    setCurrentScreen('profile');
  };

  const handleShowPinSettings = () => {
    setCurrentScreen('pin-settings');
  };

  const handleCompletePinSettings = () => {
    console.log('PIN settings updated');
    setCurrentScreen('profile');
  };

  const handleSkipPinSettings = () => {
    console.log('PIN settings skipped');
    setCurrentScreen('profile');
  };

  const handleShowPrivacy = () => {
    setPreviousScreen('onboarding1');
    setCurrentScreen('privacy');
  };

  const handleShowTerms = () => {
    setPreviousScreen('onboarding1');
    setCurrentScreen('terms');
  };

  const handleBackToOnboarding = () => {
    setCurrentScreen('onboarding1');
  };

  const handleShowPrivacyFromProfile = () => {
    setPreviousScreen('profile');
    setCurrentScreen('privacy');
  };

  const handleShowTermsFromProfile = () => {
    setPreviousScreen('profile');
    setCurrentScreen('terms');
  };

  const handleBackToProfileFromDocuments = () => {
    setCurrentScreen('profile');
  };

  const handleBackToOnboarding2 = () => {
    setCurrentScreen('onboarding2');
  };

  const handleBackToSurvey = () => {
    setCurrentScreen('survey01');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  const handleShowDeleteAccount = () => {
    setCurrentScreen('delete');
  };

  const handleDeleteAccount = () => {
    console.log('Account deleted, returning to onboarding');
    // Очищаем все данные пользователя включая результаты опроса
    setCompletedCards(new Set());
    setCardCompletionCounts({});
    setUserAnswers({});
    setCardRating(0);
    setCurrentCard({id: ''});
    setCurrentCheckin({id: ''});
    setUserHasPremium(false);
    setSurveyResults({
      screen01: [],
      screen02: [],
      screen03: [],
      screen04: [],
      screen05: []
    });
    localStorage.removeItem('survey-results');
    setCurrentScreen('onboarding1');
    setPreviousScreen('onboarding1');
  };

  const handleBackToProfileFromDelete = () => {
    setCurrentScreen('profile');
  };

  const handleShowPayments = () => {
    setCurrentScreen('payments');
  };

  const handlePurchaseComplete = () => {
    console.log('Premium purchase completed, updating user subscription status');
    setUserHasPremium(true);
    setCurrentScreen('profile');
  };

  const handleBackToProfileFromPayments = () => {
    setCurrentScreen('profile');
  };

  const handleShowUnderConstruction = (featureName: string) => {
    console.log(`Navigating to Under Construction for: ${featureName}`);
    setCurrentFeatureName(featureName);
    setCurrentScreen('under-construction');
  };

  const handleBackToProfileFromUnderConstruction = () => {
    console.log('Returning to profile from Under Construction');
    setCurrentFeatureName('');
    setCurrentScreen('profile');
  };

  // =====================================================================================
  // РЕНДЕРИНГ ЭКРАНОВ С ИСПОЛЬЗОВАНИЕМ КОНТЕНТА
  // =====================================================================================

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'onboarding1':
        return (
          <OnboardingScreen01 
            onNext={handleNextScreen}
            onShowPrivacy={handleShowPrivacy}
            onShowTerms={handleShowTerms}
          />
        );
      case 'onboarding2':
        return <OnboardingScreen02 onComplete={handleShowSurvey} />;
      
      // Экраны опроса
      case 'survey01':
        return (
          <SurveyScreen01 
            onNext={handleSurvey01Next} 
            onBack={handleBackToOnboarding2}
            initialSelections={surveyResults.screen01}
          />
        );
      case 'survey02':
        return (
          <SurveyScreen02 
            onNext={handleSurvey02Next} 
            onBack={handleBackToSurvey01}
            initialSelections={surveyResults.screen02}
          />
        );
      case 'survey03':
        return (
          <SurveyScreen03 
            onNext={handleSurvey03Next} 
            onBack={handleBackToSurvey02}
            initialSelections={surveyResults.screen03}
          />
        );
      case 'survey04':
        return (
          <SurveyScreen04 
            onNext={handleSurvey04Next} 
            onBack={handleBackToSurvey03}
            initialSelections={surveyResults.screen04}
          />
        );
      case 'survey05':
        return (
          <SurveyScreen05 
            onNext={handleSurvey05Next} 
            onBack={handleBackToSurvey04}
            initialSelections={surveyResults.screen05}
          />
        );

      case 'pin':
        return (
          <PinSetupScreen 
            onComplete={handleCompletePinSetup} 
            onSkip={handleSkipPinSetup}
            onBack={handleBackToSurvey} 
          />
        );
      case 'checkin':
        return <CheckInScreen onSubmit={handleCheckInSubmit} onBack={handleBackToHome} />;
      case 'home':
        return (
          <HomeScreen 
            onGoToCheckIn={handleGoToCheckIn} 
            onGoToProfile={handleGoToProfile}
            onGoToTheme={handleGoToTheme}
            userHasPremium={userHasPremium}
          />
        );
      case 'theme-welcome': {
        const themeData = getTheme(currentTheme);
        
        return (
          <ThemeWelcomeScreen
            onBack={handleBackToHomeFromTheme}
            onStart={handleStartTheme}
            onUnlock={handleShowPayments}
            themeTitle={themeData ? getLocalizedText(themeData.title) : currentTheme}
            isPremiumTheme={themeData?.isPremium || false}
            userHasPremium={userHasPremium}
          />
        );
      }
      case 'theme-home':
        return (
          <ThemeHomeScreen
            onBack={handleBackToHomeFromTheme}
            onCardClick={handleThemeCardClick}
            onOpenNextLevel={handleOpenNextLevel}
            themeTitle={currentTheme}
            completedCards={completedCards}
            cardCompletionCounts={cardCompletionCounts}
          />
        );
      case 'card-details':
        return (
          <CardDetailsScreen
            onBack={handleBackToThemeHome}
            onOpenCard={handleOpenCardExercise}
            onOpenCheckin={handleOpenCheckin}
            cardId={currentCard.id}
            cardTitle={currentCard.title}
            cardDescription={currentCard.description}
          />
        );
      case 'checkin-details':
        return (
          <CheckinDetailsScreen
            onBack={handleBackToCardDetails}
            checkinId={currentCheckin.id}
            cardTitle={currentCheckin.cardTitle}
            checkinDate={currentCheckin.date}
          />
        );
      case 'card-welcome':
        return (
          <CardWelcomeScreen
            onBack={handleBackToCardDetailsFromWelcome}
            onNext={handleStartCardExercise}
            cardId={currentCard.id}
            cardTitle={currentCard.title}
            cardDescription={currentCard.description}
          />
        );
      case 'question-01': {
        const card1 = getCard(currentCard.id);
        const question1 = card1?.questions[0];
        
        return (
          <QuestionScreen01
            onBack={handleBackToCardWelcome}
            onNext={handleNextQuestion}
            cardId={currentCard.id}
            cardTitle={currentCard.title}
            questionText={question1 ? getLocalizedText(question1.text) : "What in other people's behavior most often irritates or offends you?"}
          />
        );
      }
      case 'question-02': {
        const card2 = getCard(currentCard.id);
        const question2 = card2?.questions[1];
        
        return (
          <QuestionScreen02
            onBack={handleBackToQuestion01}
            onNext={handleCompleteExercise}
            cardId={currentCard.id}
            cardTitle={currentCard.title}
            questionText={question2 ? getLocalizedText(question2.text) : "What are your expectations behind this reaction?"}
            previousAnswer={userAnswers.question1}
          />
        );
      }
      case 'final-message': {
        const cardFinal = getCard(currentCard.id);
        const finalMessage = cardFinal?.finalMessage;
        
        return (
          <FinalCardMessageScreen
            onBack={handleBackToQuestion02}
            onNext={handleCompleteFinalMessage}
            cardId={currentCard.id}
            cardTitle={currentCard.title}
            finalMessage={finalMessage ? getLocalizedText(finalMessage.message) : "Awareness of expectations reduces the automaticity of emotional reactions."}
            practiceTask={finalMessage ? getLocalizedText(finalMessage.practiceTask) : "Track 3 irritating reactions over the course of a week and write down what you expected to happen at those moments."}
            whyExplanation={finalMessage ? getLocalizedText(finalMessage.whyExplanation) : "You learn to distinguish people's behavior from your own projections."}
          />
        );
      }
      case 'rate-card':
        return (
          <RateCardScreen
            onBack={handleBackToFinalMessage}
            onNext={handleCompleteRating}
            cardId={currentCard.id}
            cardTitle={currentCard.title}
          />
        );
      case 'profile':
        return (
          <UserProfileScreen 
            onBack={handleBackToHome} 
            onShowAboutApp={handleShowAboutApp} 
            onShowPinSettings={handleShowPinSettings}
            onShowPrivacy={handleShowPrivacyFromProfile}
            onShowTerms={handleShowTermsFromProfile}
            onShowDeleteAccount={handleShowDeleteAccount}
            onShowPayments={handleShowPayments}
            onShowUnderConstruction={handleShowUnderConstruction}
            userHasPremium={userHasPremium}
          />
        );
      case 'about':
        return <AboutAppScreen onBack={handleBackToProfile} />;
      case 'pin-settings':
        return (
          <PinSetupScreen 
            onComplete={handleCompletePinSettings} 
            onSkip={handleSkipPinSettings}
            onBack={handleBackToProfile} 
          />
        );
      case 'privacy':
        return (
          <PrivacyPolicyScreen 
            onBack={previousScreen === 'profile' ? handleBackToProfileFromDocuments : handleBackToOnboarding} 
          />
        );
      case 'terms':
        return (
          <TermsOfUseScreen 
            onBack={previousScreen === 'profile' ? handleBackToProfileFromDocuments : handleBackToOnboarding} 
          />
        );
      case 'delete':
        return (
          <DeleteAccountScreen 
            onBack={handleBackToProfileFromDelete}
            onDeleteAccount={handleDeleteAccount}
          />
        );
      case 'payments':
        return (
          <PaymentsScreen 
            onBack={handleBackToProfileFromPayments}
            onPurchaseComplete={handlePurchaseComplete}
          />
        );
      case 'under-construction':
        return (
          <UnderConstructionScreen 
            onBack={handleBackToProfileFromUnderConstruction}
            featureName={currentFeatureName}
          />
        );
      default:
        return <OnboardingScreen01 onNext={handleNextScreen} onShowPrivacy={handleShowPrivacy} onShowTerms={handleShowTerms} />;
    }
  };

  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden bg-[#111111] flex flex-col">
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {renderCurrentScreen()}
      </div>
    </div>
  );
}

/**
 * Корневой компонент приложения с провайдерами
 */
export default function App() {
  return (
    <LanguageProvider>
      <ContentProvider>
        <AppContent />
      </ContentProvider>
    </LanguageProvider>
  );
}