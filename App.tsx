import React, { useState, useEffect } from 'react';

import { OnboardingScreen01 } from './components/OnboardingScreen01';
import { OnboardingScreen02 } from './components/OnboardingScreen02';
import { SurveyScreen01 } from './components/SurveyScreen01';
import { SurveyScreen02 } from './components/SurveyScreen02';
import { SurveyScreen03 } from './components/SurveyScreen03';
import { SurveyScreen04 } from './components/SurveyScreen04';
import { SurveyScreen05 } from './components/SurveyScreen05';
import { SurveyScreen06 } from './components/SurveyScreen06';
import { PinSetupScreen } from './components/PinSetupScreen';
import { CheckInScreen } from './components/CheckInScreen';
import { HomeScreen } from './components/HomeScreen';
import { UserProfileScreen } from './components/UserProfileScreen';
import { AboutAppScreen } from './components/AboutAppScreen';
import { PrivacyPolicyScreen } from './components/PrivacyPolicyScreen';
import { TermsOfUseScreen } from './components/TermsOfUseScreen';
import { DeleteAccountScreen } from './components/DeleteAccountScreen';
import { PaymentsScreen } from './components/PaymentsScreen';
import { DonationsScreen } from './components/DonationsScreen';
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
import { BadgesScreen } from './components/BadgesScreen'; // Импорт страницы достижений
import { ThemeCardManager } from './utils/ThemeCardManager'; // Импорт для сохранения ответов
import { LevelsScreen } from './components/LevelsScreen'; // Импорт страницы уровней
import { RewardManager } from './components/RewardManager'; // Импорт менеджера наград

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

// Smart Navigation imports
import { UserStateManager } from './utils/userStateManager';
import { DailyCheckinManager, DailyCheckinStatus } from './utils/DailyCheckinManager';
import { capture, AnalyticsEvent } from './utils/analytics/posthog';

type AppScreen = 'onboarding1' | 'onboarding2' | 'survey01' | 'survey02' | 'survey03' | 'survey04' | 'survey05' | 'survey06' | 'pin' | 'checkin' | 'home' | 'profile' | 'about' | 'privacy' | 'terms' | 'pin-settings' | 'delete' | 'payments' | 'donations' | 'under-construction' | 'theme-welcome' | 'theme-home' | 'card-details' | 'checkin-details' | 'card-welcome' | 'question-01' | 'question-02' | 'final-message' | 'rate-card' | 'breathing-4-7-8' | 'breathing-square' | 'grounding-5-4-3-2-1' | 'grounding-anchor' | 'badges' | 'levels' | 'reward';

/**
 * Компонент для загрузки вопросов и отображения QuestionScreen01
 */
function QuestionScreen01WithLoader({ 
  onBack, 
  onNext, 
  cardId, 
  cardTitle, 
  getCardQuestions, 
  currentLanguage 
}: {
  onBack: () => void;
  onNext: (answer: string) => void;
  cardId: string;
  cardTitle: string;
  getCardQuestions: (cardId: string, language: string) => Promise<string[]>;
  currentLanguage: string;
}) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const cardQuestions = await getCardQuestions(cardId, currentLanguage);
        setQuestions(cardQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [cardId, currentLanguage, getCardQuestions]);
  
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#111111]">
        <div className="text-white text-center">
          <div className="text-lg animate-pulse">Loading questions...</div>
        </div>
      </div>
    );
  }
  
  const questionText = questions[0] || "Question not found";
  
  return (
    <QuestionScreen01
      onBack={onBack}
      onNext={onNext}
      cardId={cardId}
      cardTitle={cardTitle}
      questionText={questionText}
    />
  );
}

/**
 * Компонент для загрузки вопросов и отображения QuestionScreen02
 */
function QuestionScreen02WithLoader({ 
  onBack, 
  onNext, 
  cardId, 
  cardTitle, 
  getCardQuestions, 
  currentLanguage,
  previousAnswer
}: {
  onBack: () => void;
  onNext: (answer: string) => void;
  cardId: string;
  cardTitle: string;
  getCardQuestions: (cardId: string, language: string) => Promise<string[]>;
  currentLanguage: string;
  previousAnswer: string;
}) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const cardQuestions = await getCardQuestions(cardId, currentLanguage);
        setQuestions(cardQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [cardId, currentLanguage, getCardQuestions]);
  
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#111111]">
        <div className="text-white text-center">
          <div className="text-lg animate-pulse">Loading questions...</div>
        </div>
      </div>
    );
  }
  
  const questionText = questions[1] || "Question not found";
  
  return (
    <QuestionScreen02
      onBack={onBack}
      onNext={onNext}
      cardId={cardId}
      cardTitle={cardTitle}
      questionText={questionText}
      previousAnswer={previousAnswer}
    />
  );
}

/**
 * Компонент для загрузки данных и отображения FinalCardMessageScreen
 */
function FinalCardMessageScreenWithLoader({ 
  onBack, 
  onNext, 
  cardId, 
  cardTitle, 
  getCardMessageData, 
  currentLanguage
}: {
  onBack: () => void;
  onNext: () => void;
  cardId: string;
  cardTitle: string;
  getCardMessageData: (cardId: string, language: string) => Promise<{
    finalMessage: string;
    practiceTask: string;
    whyExplanation: string;
  }>;
  currentLanguage: string;
}) {
  const [messageData, setMessageData] = useState<{
    finalMessage: string;
    practiceTask: string;
    whyExplanation: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadMessageData = async () => {
      try {
        const data = await getCardMessageData(cardId, currentLanguage);
        setMessageData(data);
      } catch (error) {
        console.error('Error loading message data:', error);
        setMessageData({
          finalMessage: "Technique not found",
          practiceTask: "Practice task not found",
          whyExplanation: "Explanation not found"
        });
      } finally {
        setLoading(false);
      }
    };
    loadMessageData();
  }, [cardId, currentLanguage, getCardMessageData]);
  
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#111111]">
        <div className="text-white text-center">
          <div className="text-lg animate-pulse">Loading final message...</div>
        </div>
      </div>
    );
  }
  
  if (!messageData) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#111111]">
        <div className="text-white text-center">
          <div className="text-lg text-red-400">Error loading message data</div>
        </div>
      </div>
    );
  }
  
  return (
    <FinalCardMessageScreen
      onBack={onBack}
      onNext={onNext}
      cardId={cardId}
      cardTitle={cardTitle}
      finalMessage={messageData.finalMessage}
      practiceTask={messageData.practiceTask}
      whyExplanation={messageData.whyExplanation}
    />
  );
}

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
  
  useEffect(() => {
    // initPosthog(); // Removed as PostHogProvider handles initialization
    // capture('app_opened'); // Removed as PostHogProvider handles initialization
    return () => {
      // capture('app_backgrounded'); // Removed as PostHogProvider handles initialization
      // shutdown(); // Removed as PostHogProvider handles initialization
    };
  }, []);

  if (isE2ETestEnvironment) {
    console.log('E2E test environment detected, starting with home screen');
  }
  
  // Persisted onboarding flow progress (Variant A)
  type AppFlowProgress = {
    onboardingCompleted: boolean;
    surveyCompleted: boolean;
    pinEnabled: boolean;       // feature flag, disabled for now
    pinCompleted: boolean;
    firstCheckinDone: boolean;
    firstRewardShown: boolean;
  };

  const FLOW_KEY = 'app-flow-progress';

  const defaultProgress: AppFlowProgress = {
    onboardingCompleted: false,
    surveyCompleted: false,
    pinEnabled: false, // skip PIN in the main flow for now
    pinCompleted: false,
    firstCheckinDone: false,
    firstRewardShown: false
  };

  const loadProgress = (): AppFlowProgress => {
    try {
      const raw = localStorage.getItem(FLOW_KEY);
      return raw ? { ...defaultProgress, ...JSON.parse(raw) } : defaultProgress;
    } catch (e) {
      console.error('Failed to load app flow progress:', e);
      return defaultProgress;
    }
  };

  const saveProgress = (p: AppFlowProgress) => {
    try {
      localStorage.setItem(FLOW_KEY, JSON.stringify(p));
    } catch (e) {
      console.error('Failed to save app flow progress:', e);
    }
  };

  const [flow, setFlow] = useState<AppFlowProgress>(loadProgress());
  const updateFlow = (updater: (prev: AppFlowProgress) => AppFlowProgress) => {
    setFlow(prev => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  };
  
  // Smart Navigation: Dynamic screen determination based on user state
  const getInitialScreen = (): AppScreen => {
    if (isE2ETestEnvironment) {
      return 'home';
    }

    // Primary: flow-driven initial screen
    const p = loadProgress();

    if (!p.onboardingCompleted) {
      return 'onboarding1';
    }

    if (!p.surveyCompleted) {
      return 'survey01';
    }

    // Daily check-in logic: Check if check-in is needed today
    const checkinStatus = DailyCheckinManager.getCurrentDayStatus();
    
    if (checkinStatus === DailyCheckinStatus.NOT_COMPLETED) {
      // Check-in needed for today
      return 'checkin';
    } else if (checkinStatus === DailyCheckinStatus.COMPLETED) {
      // Check-in already completed today, go to home
      return 'home';
    } else {
      // Error state, default to check-in
      console.warn('Daily check-in status error, defaulting to check-in screen');
      return 'checkin';
    }
  };

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(getInitialScreen());
  const [navigationHistory, setNavigationHistory] = useState<AppScreen[]>([getInitialScreen()]);
  const [currentFeatureName, setCurrentFeatureName] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<string>('');
  const [currentCard, setCurrentCard] = useState<{id: string; title?: string; description?: string}>({id: ''});
  const [currentCheckin, setCurrentCheckin] = useState<{id: string; cardTitle?: string; date?: string}>({id: ''});
  const [userAnswers, setUserAnswers] = useState<{question1?: string; question2?: string}>({});
  const [finalAnswers, setFinalAnswers] = useState<{question1?: string; question2?: string}>({});
  const [_cardRating, setCardRating] = useState<number>(0);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [_cardCompletionCounts, setCardCompletionCounts] = useState<Record<string, number>>({});
  const [userHasPremium, setUserHasPremium] = useState<boolean>(false);
  const [earnedAchievementIds, setEarnedAchievementIds] = useState<string[]>([]);
  const [_hasShownFirstAchievement, setHasShownFirstAchievement] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('has-shown-first-achievement');
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.error('Failed to load hasShownFirstAchievement from localStorage:', error);
      return false;
    }
  });

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
  const { getCard: _getCard, getTheme, getLocalizedText: _getLocalizedText, currentLanguage } = useContent();
  
  // Логируем изменения currentScreen
  
  useEffect(() => {
    // Track screen changes as page views
    // try {
    //   capture('$pageview', { screen: currentScreen });
    // } catch {}
  }, [currentScreen]);

  // Проверка, является ли текущий экран главной страницей
  // На первой странице онбординга кнопка Back должна закрывать приложение
  const isHomePage = currentScreen === 'home';
  
  // Smart Navigation: Function to refresh user state when data changes
  const refreshUserState = () => {
    try {
      UserStateManager.invalidateCache();
      console.log('Smart Navigation: User state cache invalidated');
    } catch (error) {
      console.error('Smart Navigation: Failed to refresh user state:', error);
    }
  };

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

  /**
   * Проверка полученных достижений после чекина
   * В реальном приложении здесь будет логика проверки достижений
   */
  const _checkForEarnedAchievements = (mood: string): string[] => {
    const earnedAchievements: string[] = [];
    
    // Получаем данные о чекинах из localStorage
    const checkinData = localStorage.getItem('checkin-data');
    let checkinHistory: any[] = [];
    
    if (checkinData) {
      try {
        checkinHistory = JSON.parse(checkinData);
      } catch (error) {
        console.error('Failed to parse checkin data:', error);
      }
    }
    
    // Определяем текущую дату на основе локального времени (сутки начинаются в 6 утра)
    const getCurrentDay = (): string => {
      const now = new Date();
      const localTime = now.getTime() + (now.getTimezoneOffset() * 60000); // UTC to local
      const localDate = new Date(localTime);

      // Если время раньше 6 утра, считаем что это предыдущий день
      const hour = localDate.getHours();
      const adjustedDate = new Date(localDate);
      if (hour < 6) {
        adjustedDate.setDate(adjustedDate.getDate() - 1);
      }

      return adjustedDate.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    const currentDay = getCurrentDay();

    // Добавляем текущий чекин
    const currentCheckin = {
      mood,
      timestamp: new Date().toISOString(),
      date: currentDay
    };
    checkinHistory.push(currentCheckin);
    
    // Сохраняем обновленные данные
    localStorage.setItem('checkin-data', JSON.stringify(checkinHistory));
    
    // Проверяем достижения
    const checkinsToday = checkinHistory.filter(c => c.date === currentDay);

    // Если уже был чекин сегодня, не позволяем делать новый
    if (checkinsToday.length > 0) {
      console.log('Check-in already completed today');
      // TODO: Показать сообщение пользователю что чекин уже сделан
      return [];
    }
    const checkinsThisWeek = checkinHistory.filter(c => {
      const checkinDate = new Date(c.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return checkinDate >= weekAgo;
    });
    
    // Первый чекин
    if (checkinHistory.length === 1) {
      earnedAchievements.push('first_checkin');
    }
    
    // Недельная серия (7 дней подряд)
    if (checkinsThisWeek.length >= 7) {
      const consecutiveDays = getConsecutiveDays(checkinHistory);
      if (consecutiveDays >= 7) {
        earnedAchievements.push('week_streak');
      }
    }
    
    // Трекер настроения (14 дней)
    if (checkinHistory.length >= 14) {
      earnedAchievements.push('mood_tracker');
    }
    
    // Ранняя пташка (чекины в 6 утра 5 дней подряд)
    const earlyCheckins = checkinHistory.filter(c => {
      const hour = new Date(c.timestamp).getHours();
      return hour === 6;
    });
    if (earlyCheckins.length >= 5) {
      earnedAchievements.push('early_bird');
    }
    
    // Ночная сова (чекины в 11 вечера 5 дней подряд)
    const lateCheckins = checkinHistory.filter(c => {
      const hour = new Date(c.timestamp).getHours();
      return hour >= 22 || hour <= 1;
    });
    if (lateCheckins.length >= 5) {
      earnedAchievements.push('night_owl');
    }
    
    console.log('Earned achievements:', earnedAchievements);
    return earnedAchievements;
  };

  /**
   * Подсчет последовательных дней чекинов
   */
  const getConsecutiveDays = (checkinHistory: any[]): number => {
    if (checkinHistory.length === 0) return 0;
    
    const sortedCheckins = checkinHistory
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let consecutiveDays = 1;
    let currentDate = new Date(sortedCheckins[0].date);
    
    for (let i = 1; i < sortedCheckins.length; i++) {
      const checkinDate = new Date(sortedCheckins[i].date);
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() + 1);
      
      if (checkinDate.toDateString() === expectedDate.toDateString()) {
        consecutiveDays++;
        currentDate = checkinDate;
      } else {
        break;
      }
    }
    
    return consecutiveDays;
  };

  // =====================================================================================
  // ФУНКЦИИ НАВИГАЦИИ
  // =====================================================================================

  const handleNextScreen = () => {
    navigateTo('onboarding2');
  };

  const handleShowSurvey = () => {
    // Mark onboarding as completed and move to survey
    updateFlow(p => ({ ...p, onboardingCompleted: true }));
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
    updateFlow(p => ({ ...p, pinCompleted: true }));
    navigateTo('checkin');
  };

  const handleSkipPinSetup = () => {
    console.log('PIN setup skipped');
    navigateTo('checkin');
  };

  const handleCheckInSubmit = (_mood: string) => {
    // В реальном приложении здесь будет логика проверки достижений на бэкэнде
    // Smart Navigation: Refresh user state after check-in completion
    refreshUserState();

    // Update flow for first check-in
    updateFlow(p => ({ ...p, firstCheckinDone: true }));

    // Показываем достижение только если не показывали раньше
    if (!flow.firstRewardShown) {
      setEarnedAchievementIds(['first_checkin']);
      setHasShownFirstAchievement(true);
      localStorage.setItem('has-shown-first-achievement', JSON.stringify(true));
      updateFlow(p => ({ ...p, firstRewardShown: true }));
      navigateTo('reward');
      return;
    }

    // If reward already shown, go home directly
    setEarnedAchievementIds([]);
    navigateTo('home');
  };

  // =====================================================================================
  // ФУНКЦИИ НАВИГАЦИИ ПО ОПРОСУ
  // =====================================================================================

  const handleSurvey01Next = (answers: string[]) => {
    console.log('Survey 01 answers:', answers);
    setSurveyResults(prev => ({ ...prev, screen01: answers }));
    capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey01', answers, language: currentLanguage });
    navigateTo('survey02');
  };

  const handleSurvey02Next = (answers: string[]) => {
    console.log('Survey 02 answers:', answers);
    setSurveyResults(prev => ({ ...prev, screen02: answers }));
    capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey02', answers, language: currentLanguage });
    navigateTo('survey03');
  };

  const handleSurvey03Next = (answers: string[]) => {
    console.log('Survey 03 answers:', answers);
    setSurveyResults(prev => ({ ...prev, screen03: answers }));
    capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey03', answers, language: currentLanguage });
    navigateTo('survey04');
  };

  const handleSurvey04Next = (answers: string[]) => {
    console.log('Survey 04 answers:', answers);
    setSurveyResults(prev => ({ ...prev, screen04: answers }));
    capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey04', answers, language: currentLanguage });
    navigateTo('survey05');
  };

  const handleSurvey05Next = (answers: string[]) => {
    console.log('Survey 05 answers:', answers);
    setSurveyResults(prev => ({ ...prev, screen05: answers }));
    capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey05', answers, language: currentLanguage });
    navigateTo('survey06');
  };

  const handleSurvey06Next = (answers: string[]) => {
    console.log('Survey 06 answers:', answers);
    const finalResults: SurveyResults = {
      ...surveyResults,
      screen06: answers,
      completedAt: new Date().toISOString()
    } as SurveyResults;
    
    setSurveyResults(finalResults);
    capture(AnalyticsEvent.ONBOARDING_ANSWERED, { step: 'survey06', answers, language: currentLanguage });
    capture(AnalyticsEvent.ONBOARDING_COMPLETED, { results: finalResults, language: currentLanguage });
    
    // Сохранение результатов
    const saveSuccess = saveSurveyResults(finalResults);

    // Mark survey completed in flow
    updateFlow(p => ({ ...p, surveyCompleted: true }));

    // Decide next step: skip PIN if disabled
    const nextScreen: AppScreen = flow.pinEnabled ? 'pin' : 'checkin';

    if (saveSuccess) {
      console.log('Survey completed successfully');
      
      // Smart Navigation: Refresh user state after survey completion
      refreshUserState();
      
      navigateTo(nextScreen);
    } else {
      console.error('Failed to save survey, but continuing...');
      navigateTo(nextScreen);
    }
  };

  // Обработчики возврата для экранов опроса
  const handleBackToSurvey01 = () => navigateTo('survey01');
  const handleBackToSurvey02 = () => navigateTo('survey02');
  const handleBackToSurvey03 = () => navigateTo('survey03');
  const handleBackToSurvey04 = () => navigateTo('survey04');
  const handleBackToSurvey05 = () => navigateTo('survey05');

  const _handleGoToCheckIn = () => {
    navigateTo('checkin');
  };

  const handleGoToProfile = () => {
    navigateTo('profile');
  };

  const handleGoToBadges = () => {
    navigateTo('badges');
  };

  const handleGoToLevels = () => {
    console.log('Navigating to levels screen');
    navigateTo('levels');
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

      // Собираем список всех карточек темы в правильном порядке
      const allCardIds: string[] = Array.isArray(theme.cards)
        ? theme.cards.map((c: any) => c.id)
        : Array.isArray(theme.cardIds)
          ? theme.cardIds
          : [];

      // Если нет карточек — безопасно перейти на список карточек
      if (allCardIds.length === 0) {
        navigateTo('theme-home');
        return;
      }

      // Показываем Welcome только если первая карточка не начиналась
      const shouldShowWelcome = ThemeCardManager.shouldShowWelcomeScreen(themeId, allCardIds);
      navigateTo(shouldShowWelcome ? 'theme-welcome' : 'theme-home');
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

  const _handleBackToCardWelcome = () => {
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
    console.log('Current userAnswers before updating:', userAnswers);
    const finalAnswers = { ...userAnswers, question2: answer };
    console.log('Final answers to be set:', finalAnswers);
    setUserAnswers(finalAnswers);
    
    // Сохраняем финальные ответы в дополнительном состоянии для надежности
    setFinalAnswers(finalAnswers);
    navigateTo('final-message');
  };

  const handleCompleteFinalMessage = () => {
    console.log(`Final message completed for card: ${currentCard.id}`);
    navigateTo('rate-card');
  };

  const handleCompleteRating = (rating: number, textMessage?: string) => {
    console.log(`Card rated: ${rating} stars for card: ${currentCard.id}`, textMessage ? `with message: ${textMessage}` : 'without message');
    console.log('Current userAnswers before saving:', userAnswers);
    console.log('Final answers to save:', finalAnswers);
    
    capture(AnalyticsEvent.CARD_RATED, {
      cardId: currentCard.id,
      themeId: currentTheme,
      rating,
      ratingComment: textMessage || undefined,
      hasComment: !!textMessage,
      language: currentLanguage,
    });
    
    try {
      // Используем finalAnswers для надежности, fallback на userAnswers
      const answersToSave = Object.keys(finalAnswers).length > 0 ? finalAnswers : userAnswers;
      
      // Сохраняем завершенную попытку через ThemeCardManager
      const completedAttempt = ThemeCardManager.addCompletedAttempt(
        currentCard.id,
        answersToSave, // Все ответы пользователя (question1, question2)
        rating,
        textMessage
      );
      
      console.log('Exercise completed and saved:', {
        cardId: currentCard.id,
        answers: answersToSave,
        rating: rating,
        attemptId: completedAttempt.completedAttempts[completedAttempt.completedAttempts.length - 1]?.attemptId,
        totalAttempts: completedAttempt.totalCompletedAttempts
      });
      
      // Обновляем локальные состояния для UI
      setCardRating(rating);
      setCompletedCards(prev => new Set([...prev, currentCard.id]));
      setCardCompletionCounts(prev => ({
        ...prev,
        [currentCard.id]: completedAttempt.totalCompletedAttempts
      }));
      
    } catch (error) {
      console.error('Error saving completed attempt:', error);
      // Показываем пользователю ошибку, но не блокируем навигацию
    }
    
    // Очищаем состояние и переходим к домашней странице темы
    setUserAnswers({});
    setFinalAnswers({});
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
    // Пропускаем CardWelcomeScreen и сразу переходим к первому вопросу
    navigateTo('question-01');
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
   * Получение themeId из префикса cardId
   */
  const getThemeIdFromCardId = (cardId: string): string => {
    if (cardId.startsWith('STRESS')) return 'stress';
    if (cardId.startsWith('REL')) return 'relationships';
    if (cardId.startsWith('IDNT')) return 'self-identity';
    if (cardId.startsWith('ANGR')) return 'anger';
    if (cardId.startsWith('DEPR')) return 'depression-coping';
    if (cardId.startsWith('LOSS')) return 'grief-loss';
    if (cardId.startsWith('BURN')) return 'burnout-recovery';
    if (cardId.startsWith('ANX')) return 'anxiety';
    return 'stress'; // fallback
  };

  /**
   * Обработка клика по карточке - теперь использует систему контента
   */
  const handleThemeCardClick = async (cardId: string) => {
    console.log(`Card clicked: ${cardId}`);
    const cardData = await getCardData(cardId, currentLanguage);
    setCurrentCard(cardData);
    navigateTo('card-details');
  };

  /**
   * Получение данных карточки из централизованной системы
   */
  const getCardData = async (cardId: string, language: string) => {
    try {
      // Используем ThemeLoader для получения данных карточки
      const { ThemeLoader } = await import('./utils/ThemeLoader');
      
      // Определяем themeId из префикса cardId
      const themeId = getThemeIdFromCardId(cardId);
      
      const theme = await ThemeLoader.loadTheme(themeId, language);
      if (!theme) {
        throw new Error(`Theme ${themeId} not found`);
      }
      
      const card = theme.cards.find(c => c.id === cardId);
      if (!card) {
        throw new Error(`Card ${cardId} not found in theme ${themeId}`);
      }
      
      return {
        id: cardId,
        title: card.id, // Используем ID как заголовок
        description: card.introduction // Используем introduction как описание
      };
    } catch (error) {
      console.error('Error loading card data:', error);
      return {
        id: cardId,
        title: 'Card',
        description: 'Card description will be available soon.'
      };
    }
  };

  /**
   * Получение вопросов карточки из новой системы
   */
  const getCardQuestions = async (cardId: string, language: string) => {
    try {
      const { ThemeLoader } = await import('./utils/ThemeLoader');
      
      const themeId = getThemeIdFromCardId(cardId);
      
      const theme = await ThemeLoader.loadTheme(themeId, language);
      if (!theme) {
        throw new Error(`Theme ${themeId} not found`);
      }
      
      const card = theme.cards.find(c => c.id === cardId);
      if (!card) {
        throw new Error(`Card ${cardId} not found in theme ${themeId}`);
      }
      
      return card.questions || [];
    } catch (error) {
      console.error('Error loading card questions:', error);
      return [];
    }
  };

  /**
   * Получение данных карточки для FinalCardMessageScreen
   */
  const getCardMessageData = async (cardId: string, language: string) => {
    try {
      const { ThemeLoader } = await import('./utils/ThemeLoader');
      
      const themeId = getThemeIdFromCardId(cardId);
      
      const theme = await ThemeLoader.loadTheme(themeId, language);
      if (!theme) {
        throw new Error(`Theme ${themeId} not found`);
      }
      
      const card = theme.cards.find(c => c.id === cardId);
      if (!card) {
        throw new Error(`Card ${cardId} not found in theme ${themeId}`);
      }
      
      return {
        finalMessage: card.technique || "Technique not found",
        practiceTask: card.recommendation || "Practice task not found", 
        whyExplanation: card.mechanism || "Explanation not found"
      };
    } catch (error) {
      console.error('Error loading card message data:', error);
      return {
        finalMessage: "Technique not found",
        practiceTask: "Practice task not found",
        whyExplanation: "Explanation not found"
      };
    }
  };

  /**
   * Поиск следующей доступной карточки
   */
  const handleOpenNextLevel = async () => {
    console.log('Opening next level');
    
    // Получить карточки текущей темы
    const theme = getTheme(currentTheme);
    if (!theme) return;
    
    const nextCard = theme.cardIds?.find(cardId => !completedCards.has(cardId));
    
    if (nextCard) {
      console.log(`Opening next available card: ${nextCard}`);
      const cardData = await getCardData(nextCard, currentLanguage);
      setCurrentCard(cardData);
      navigateTo('card-details');
    } else {
      console.log('All cards have been completed! Navigating to home.');
      navigateTo('home');
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
    // Если пользователь покупал премиум из контекста темы, возвращаем его в текущую тему
    if (currentTheme) {
      navigateTo('theme-home');
    } else {
      navigateTo('profile');
    }
  };

  const handleBackToProfileFromPayments = () => {
    navigateTo('profile');
  };

  const handleShowUnderConstruction = (featureName: string) => {
    console.log(`Navigating to Under Construction for: ${featureName}`);
    setCurrentFeatureName(featureName);
    navigateTo('under-construction');
  };

  const handleShowDonations = () => {
    console.log('Opening donations screen');
    setCurrentScreen('donations');
  };

  const handleBackToProfileFromDonations = () => {
    console.log('Returning to profile from donations');
    navigateTo('profile');
  };

  const handleBackToProfileFromUnderConstruction = () => {
    console.log('Returning to profile from Under Construction');
    setCurrentFeatureName('');
    navigateTo('profile');
  };

  // =====================================================================================
  // ФУНКЦИИ НАВИГАЦИИ ДЛЯ МЕНТАЛЬНЫХ ТЕХНИК
  // =====================================================================================

  const _handleOpenMentalTechnique = (techniqueId: string) => {
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

      case 'survey06':
        return (
          <SurveyScreen06 
            onNext={handleSurvey06Next} 
            onBack={handleBackToSurvey05}
            initialSelections={surveyResults.screen06}
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
            themeTitle={currentTheme}
            isPremiumTheme={themeData?.isPremium || false}
            userHasPremium={userHasPremium}
          />
        );
      }
      case 'theme-home': {
        return (
          <ThemeHomeScreen
            onBack={handleBackToHomeFromTheme}
            onCardClick={handleThemeCardClick}
            onOpenNextLevel={handleOpenNextLevel}
            themeId={currentTheme}
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
            cardTitle={currentCard.title || ''}
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
            cardTitle={currentCard.title || ''}
            cardDescription={currentCard.description}
          />
        );
      case 'question-01': {
        // Используем новую систему для получения вопросов
        return (
          <QuestionScreen01WithLoader
            onBack={handleBackToCardDetails}
            onNext={handleNextQuestion}
            cardId={currentCard.id}
            cardTitle={currentCard.title || ''}
            getCardQuestions={getCardQuestions}
            currentLanguage={currentLanguage}
          />
        );
      }
      case 'question-02': {
        // Используем новую систему для получения вопросов
        return (
          <QuestionScreen02WithLoader
            onBack={handleBackToQuestion01}
            onNext={handleCompleteExercise}
            cardId={currentCard.id}
            cardTitle={currentCard.title || ''}
            getCardQuestions={getCardQuestions}
            currentLanguage={currentLanguage}
            previousAnswer={userAnswers.question1 || ''}
          />
        );
      }
      case 'final-message': {
        // Используем новую систему для получения данных финального сообщения
        return (
          <FinalCardMessageScreenWithLoader
            onBack={handleBackToQuestion02}
            onNext={handleCompleteFinalMessage}
            cardId={currentCard.id}
            cardTitle={currentCard.title || ''}
            getCardMessageData={getCardMessageData}
            currentLanguage={currentLanguage}
          />
        );
      }
      case 'rate-card':
        return (
          <RateCardScreen
            onBack={handleBackToFinalMessage}
            onNext={handleCompleteRating}
            cardId={currentCard.id}
            cardTitle={currentCard.title || ''}
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
            onShowDonations={handleShowDonations}
            onShowUnderConstruction={handleShowUnderConstruction}
            onGoToBadges={handleGoToBadges}
            onGoToLevels={handleGoToLevels}
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
      case 'donations':
        return (
          <DonationsScreen 
            onBack={handleBackToProfileFromDonations}
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
      
      case 'reward':
        return (
          <RewardManager 
            earnedAchievementIds={earnedAchievementIds}
            onComplete={() => {
              setEarnedAchievementIds([]); // Очищаем достижения
              navigateTo('home');
            }}
            onBack={() => {
              setEarnedAchievementIds([]); // Очищаем достижения
              navigateTo('home');
            }}
          />
        );
      
      case 'badges':
        return (
          <BadgesScreen 
            onBack={goBack}
          />
        );
      
      case 'levels':
        return (
          <LevelsScreen 
            onBack={goBack}
            onGoToBadges={handleGoToBadges}
          />
        );
      
      default:
        return <OnboardingScreen01 onNext={handleNextScreen} onShowPrivacy={handleShowPrivacy} onShowTerms={handleShowTerms} />;
    }
  };

  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden overflow-x-hidden bg-[#111111] flex flex-col">
      <div className="flex-1 relative w-full h-full overflow-hidden overflow-x-hidden">
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
