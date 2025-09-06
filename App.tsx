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
import { BackButton } from './components/ui/back-button'; // Импорт компонента BackButton

// Импорты ментальных техник
import { Breathing478Screen } from './components/mental-techniques/Breathing478Screen';
import { SquareBreathingScreen } from './components/mental-techniques/SquareBreathingScreen';
import { Grounding54321Screen } from './components/mental-techniques/Grounding54321Screen';
import { GroundingAnchorScreen } from './components/mental-techniques/GroundingAnchorScreen';

// Новые импорты для централизованного управления контентом
import { ContentProvider, useContent } from './components/ContentContext';
import { LanguageProvider } from './components/LanguageContext';
// import { appContent } from './data/content'; // Unused - using ContentContext instead
import { SurveyResults } from './types/content';

type AppScreen = 'onboarding1' | 'onboarding2' | 'survey01' | 'survey02' | 'survey03' | 'survey04' | 'survey05' | 'pin' | 'checkin' | 'home' | 'profile' | 'about' | 'privacy' | 'terms' | 'pin-settings' | 'delete' | 'payments' | 'under-construction' | 'theme-welcome' | 'theme-home' | 'card-details' | 'checkin-details' | 'card-welcome' | 'question-01' | 'question-02' | 'final-message' | 'rate-card' | 'breathing-4-7-8' | 'breathing-square' | 'grounding-5-4-3-2-1' | 'grounding-anchor';

/**
 * Основной компонент приложения с навигацией
 * Теперь использует централизованную систему управления контентом и расширенную систему опроса
 */
function AppContent() {

  // =====================================================================================
  // СОСТОЯНИЕ НАВИГАЦИИ И ДАННЫХ
  // =====================================================================================
  // В E2E тестовой среде начинаем с главной страницы
  const isE2ETestEnvironment = typeof window !== 'undefined' && 
    (window as any).__PLAYWRIGHT__ === true;
  
  if (isE2ETestEnvironment) {
    console.log('E2E test environment detected, starting with home screen');
  }
  
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(isE2ETestEnvironment ? 'home' : 'onboarding1');
  const [navigationHistory, setNavigationHistory] = useState<AppScreen[]>([isE2ETestEnvironment ? 'home' : 'onboarding1']);
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
  
  // Проверка, является ли текущий экран главной страницей
  // На первой странице онбординга кнопка Back должна закрывать приложение
  const isHomePage = currentScreen === 'home';
  
  // Функция для навигации с отслеживанием истории
  const navigateTo = (screen: AppScreen) => {
    setNavigationHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  };
  
  // Функция для закрытия приложения через Telegram WebApp
  const closeApp = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    } else {
      // Fallback для тестирования вне Telegram
      console.log('App would be closed in Telegram WebApp');
    }
  };

  // Функция для возврата на предыдущий экран
  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Удаляем текущий экран
      const previousScreen = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentScreen(previousScreen);
    } else {
      // Если это первый экран, закрываем приложение
      closeApp();
    }
  };

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
    navigateTo('onboarding2');
  };

  const handleShowSurvey = () => {
    // Загружаем сохраненные результаты если есть
    const savedResults = loadSavedSurveyResults();
    setSurveyResults(prev => ({ ...prev, ...savedResults }));
    navigateTo('survey01');
  };

  const _handleShowPinSetup = () => {
    navigateTo('pin');
  };

  const _handleShowCheckIn = () => {
    navigateTo('checkin');
  };

  const _handleShowHome = () => {
    navigateTo('home');
  };

  const handleCompletePinSetup = () => {
    console.log('PIN setup completed');
    navigateTo('checkin');
  };

  const handleSkipPinSetup = () => {
    console.log('PIN setup skipped');
    navigateTo('checkin');
  };

  const handleCheckInSubmit = (mood: string) => {
    console.log('Check-in submitted:', { mood, timestamp: new Date().toISOString() });
    navigateTo('home');
  };

  // =====================================================================================
  // ФУНКЦИИ НАВИГАЦИИ ПО ОПРОСУ
  // =====================================================================================

  const handleSurvey01Next = (answers: string[]) => {
    console.log('Survey 01 answers:', answers);
    setSurveyResults(prev => ({ ...prev, screen01: answers }));
    navigateTo('survey02');
  };

  const handleSurvey02Next = (answers: string[]) => {
    console.log('Survey 02 answers:', answers);
    setSurveyResults(prev => ({ ...prev, screen02: answers }));
    navigateTo('survey03');
  };

  const handleSurvey03Next = (answers: string[]) => {
    console.log('Survey 03 answers:', answers);
    setSurveyResults(prev => ({ ...prev, screen03: answers }));
    navigateTo('survey04');
  };

  const handleSurvey04Next = (answers: string[]) => {
    console.log('Survey 04 answers:', answers);
    setSurveyResults(prev => ({ ...prev, screen04: answers }));
    navigateTo('survey05');
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
      navigateTo('pin');
    } else {
      console.error('Failed to save survey, but continuing...');
      navigateTo('pin');
    }
  };

  // Обработчики возврата для экранов опроса
  const handleBackToSurvey01 = () => navigateTo('survey01');
  const handleBackToSurvey02 = () => navigateTo('survey02');
  const handleBackToSurvey03 = () => navigateTo('survey03');
  const handleBackToSurvey04 = () => navigateTo('survey04');

  const handleGoToCheckIn = () => {
    navigateTo('checkin');
  };

  const handleGoToProfile = () => {
    navigateTo('profile');
  };

  /**
   * Навигация к теме - теперь использует систему контента
   */
  const handleGoToTheme = (themeId: string) => {
    console.log(`Opening theme: ${themeId}`);
    
    // Проверяем, существует ли тема с таким ID
    const theme = getTheme(themeId);
    
    if (theme) {
      setCurrentTheme(themeId);
      navigateTo('theme-welcome');
    } else {
      console.error('Theme not found:', themeId);
    }
  };

  const handleBackToHomeFromTheme = () => {
    setCurrentTheme('');
    navigateTo('home');
  };

  const handleStartTheme = () => {
    console.log(`Starting theme: ${currentTheme}`);
    // Очищаем историю навигации, чтобы кнопка Back на theme-home вела сразу к home
    // theme-welcome доступна только при прямом переходе с home, не через кнопку Back
    setNavigationHistory(['home', 'theme-home']);
    setCurrentScreen('theme-home');
  };

  const _handleBackToThemeWelcome = () => {
    navigateTo('theme-welcome');
  };

  const handleBackToThemeHome = () => {
    setCurrentCard({id: ''});
    navigateTo('theme-home');
  };

  const handleBackToCardDetails = () => {
    setCurrentCheckin({id: ''});
    navigateTo('card-details');
  };

  const handleBackToCardDetailsFromWelcome = () => {
    navigateTo('card-details');
  };

  const handleBackToCardWelcome = () => {
    navigateTo('card-welcome');
  };

  const handleBackToQuestion01 = () => {
    navigateTo('question-01');
  };

  const handleBackToQuestion02 = () => {
    navigateTo('question-02');
  };

  const handleBackToFinalMessage = () => {
    navigateTo('final-message');
  };

  // =====================================================================================
  // ФУНКЦИИ РАБОТЫ С УПРАЖНЕНИЯМИ
  // =====================================================================================

  const handleNextQuestion = (answer: string) => {
    console.log(`Question 1 answered for card: ${currentCard.id}`, answer);
    setUserAnswers(prev => ({ ...prev, question1: answer }));
    navigateTo('question-02');
  };

  const handleCompleteExercise = (answer: string) => {
    console.log(`Question 2 answered for card: ${currentCard.id}`, answer);
    const finalAnswers = { ...userAnswers, question2: answer };
    setUserAnswers(finalAnswers);
    navigateTo('final-message');
  };

  const handleCompleteFinalMessage = () => {
    console.log(`Final message completed for card: ${currentCard.id}`);
    navigateTo('rate-card');
  };

  const handleCompleteRating = (rating: number, textMessage?: string) => {
    console.log(`Card rated: ${rating} stars for card: ${currentCard.id}`, textMessage ? `with message: ${textMessage}` : 'without message');
    
    setCardRating(rating);
    setCompletedCards(prev => new Set([...prev, currentCard.id]));
    setCardCompletionCounts(prev => ({
      ...prev,
      [currentCard.id]: (prev[currentCard.id] || 0) + 1
    }));
    
    const completionData = {
      cardId: currentCard.id,
      cardTitle: currentCard.title,
      rating: rating,
      hasMessage: !!textMessage,
      completedAt: new Date().toISOString(),
      completionCount: (cardCompletionCounts[currentCard.id] || 0) + 1
    };
    
    console.log('Exercise completed with data:', completionData);
    
    setUserAnswers({});
    setCardRating(0);
    setCurrentCard({id: ''});
    
    // Очищаем историю навигации и устанавливаем правильный путь для кнопки Back
    // Кнопка Back на theme-home должна вести сразу к home, минуя theme-welcome
    setNavigationHistory(['home', 'theme-home']);
    setCurrentScreen('theme-home');
  };

  const handleStartCardExercise = () => {
    console.log(`Starting exercise for card: ${currentCard.id}`);
    navigateTo('question-01');
  };

  const handleOpenCardExercise = () => {
    console.log(`Opening exercise for card: ${currentCard.id}`);
    navigateTo('card-welcome');
  };

  const handleOpenCheckin = (checkinId: string, cardTitle: string, date: string) => {
    console.log(`Opening checkin: ${checkinId} for card: ${cardTitle} on date: ${date}`);
    setCurrentCheckin({
      id: checkinId,
      cardTitle: cardTitle,
      date: date
    });
    navigateTo('checkin-details');
  };

  /**
   * Обработка клика по карточке - теперь использует систему контента
   */
  const handleThemeCardClick = (cardId: string) => {
    console.log(`Card clicked: ${cardId}`);
    const cardData = getCardData(cardId);
    setCurrentCard(cardData);
    navigateTo('card-details');
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
      navigateTo('card-details');
    } else {
      console.log('All cards have been completed!');
      alert('Congratulations! You have completed all cards in this theme.');
    }
  };

  // =====================================================================================
  // ОСТАЛЬНЫЕ ФУНКЦИИ НАВИГАЦИИ
  // =====================================================================================

  const handleShowAboutApp = () => {
    navigateTo('about');
  };

  const handleBackToProfile = () => {
    navigateTo('profile');
  };

  const handleShowPinSettings = () => {
    navigateTo('pin-settings');
  };

  const handleCompletePinSettings = () => {
    console.log('PIN settings updated');
    navigateTo('profile');
  };

  const handleSkipPinSettings = () => {
    console.log('PIN settings skipped');
    navigateTo('profile');
  };

  const handleShowPrivacy = () => {
    navigateTo('privacy');
  };

  const handleShowTerms = () => {
    navigateTo('terms');
  };

  const _handleBackToOnboarding = () => {
    navigateTo('onboarding1');
  };

  const handleShowPrivacyFromProfile = () => {
    navigateTo('privacy');
  };

  const handleShowTermsFromProfile = () => {
    navigateTo('terms');
  };

  const _handleBackToProfileFromDocuments = () => {
    navigateTo('profile');
  };

  const handleBackToOnboarding2 = () => {
    navigateTo('onboarding2');
  };

  const handleBackToSurvey = () => {
    navigateTo('survey01');
  };

  const handleBackToHome = () => {
    navigateTo('home');
  };

  const handleShowDeleteAccount = () => {
    navigateTo('delete');
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
    // Сбрасываем историю навигации
    setNavigationHistory(['onboarding1']);
    setCurrentScreen('onboarding1');
  };

  const handleBackToProfileFromDelete = () => {
    navigateTo('profile');
  };

  const handleShowPayments = () => {
    navigateTo('payments');
  };

  const handlePurchaseComplete = () => {
    console.log('Premium purchase completed, updating user subscription status');
    setUserHasPremium(true);
    navigateTo('profile');
  };

  const handleBackToProfileFromPayments = () => {
    navigateTo('profile');
  };

  const handleShowUnderConstruction = (featureName: string) => {
    console.log(`Navigating to Under Construction for: ${featureName}`);
    setCurrentFeatureName(featureName);
    navigateTo('under-construction');
  };

  const handleBackToProfileFromUnderConstruction = () => {
    console.log('Returning to profile from Under Construction');
    setCurrentFeatureName('');
    navigateTo('profile');
  };

  // =====================================================================================
  // ФУНКЦИИ НАВИГАЦИИ ДЛЯ МЕНТАЛЬНЫХ ТЕХНИК
  // =====================================================================================

  const handleOpenMentalTechnique = (techniqueId: string) => {
    console.log(`Opening mental technique: ${techniqueId}`);
    navigateTo(techniqueId as AppScreen);
  };

  const handleBackFromMentalTechnique = () => {
    navigateTo('home');
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
            onOpenMentalTechnique={handleOpenMentalTechnique}
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
      case 'theme-home': {
        const themeData = getTheme(currentTheme);
        
        return (
          <ThemeHomeScreen
            onBack={handleBackToHomeFromTheme}
            onCardClick={handleThemeCardClick}
            onOpenNextLevel={handleOpenNextLevel}
            themeTitle={themeData ? getLocalizedText(themeData.title) : currentTheme}
            completedCards={completedCards}
            cardCompletionCounts={cardCompletionCounts}
          />
        );
      }
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
            onBack={goBack} 
          />
        );
      case 'terms':
        return (
          <TermsOfUseScreen 
            onBack={goBack} 
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
      
      // Экраны ментальных техник
      case 'breathing-4-7-8':
        return (
          <Breathing478Screen 
            onBack={handleBackFromMentalTechnique}
          />
        );
      case 'breathing-square':
        return (
          <SquareBreathingScreen 
            onBack={handleBackFromMentalTechnique}
          />
        );
      case 'grounding-5-4-3-2-1':
        return (
          <Grounding54321Screen 
            onBack={handleBackFromMentalTechnique}
          />
        );
      case 'grounding-anchor':
        return (
          <GroundingAnchorScreen 
            onBack={handleBackFromMentalTechnique}
          />
        );
      
      default:
        return <OnboardingScreen01 onNext={handleNextScreen} onShowPrivacy={handleShowPrivacy} onShowTerms={handleShowTerms} />;
    }
  };

  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden bg-[#111111] flex flex-col">
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {/* Глобальная кнопка Back для Telegram WebApp */}
        <BackButton isHomePage={isHomePage} onBack={goBack} />
        
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
