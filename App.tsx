import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { OnboardingScreen01 } from './components/OnboardingScreen01';
import { OnboardingScreen02 } from './components/OnboardingScreen02';
import { SurveyScreen01 } from './components/SurveyScreen01';
import { SurveyScreen02 } from './components/SurveyScreen02';
import { SurveyScreen03 } from './components/SurveyScreen03';
import { SurveyScreen04 } from './components/SurveyScreen04';
import { SurveyScreen05 } from './components/SurveyScreen05';
import { SurveyScreen06 } from './components/SurveyScreen06';
import { PsychologicalTestPreambulaScreen } from './components/PsychologicalTestPreambulaScreen';
import { PsychologicalTestInstructionScreen } from './components/PsychologicalTestInstructionScreen';
import { PsychologicalTestQuestionScreen } from './components/PsychologicalTestQuestionScreen';
import { PsychologicalTestResultsScreen } from './components/PsychologicalTestResultsScreen';
import { PinSetupScreen } from './components/PinSetupScreen';
import { CheckInScreen } from './components/CheckInScreen';
import { HomeScreen } from './components/HomeScreen';
import { UserProfileScreen } from './components/UserProfileScreen';
import { AboutAppScreen } from './components/AboutAppScreen';
import { AppSettingsScreen } from './components/AppSettingsScreen';
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
import { RewardManager } from './components/RewardManager'; // Импорт менеджера наград
import { AllArticlesScreen } from './components/AllArticlesScreen'; // Импорт страницы всех статей
import { ArticleScreen } from './components/ArticleScreen'; // Импорт страницы статьи
import { LoadingScreen } from './components/LoadingScreen'; // Импорт экрана загрузки
import { PointsManager } from './utils/PointsManager';
import { getPointsForLevel } from './utils/pointsLevels';

// Telegram utilities for direct-link support
import { isTelegramEnvironment, isDirectLinkMode } from './utils/telegramUserUtils';

// Импорты ментальных техник
import { Breathing478Screen } from './components/mental-techniques/Breathing478Screen';
import { SquareBreathingScreen } from './components/mental-techniques/SquareBreathingScreen';
import { Grounding54321Screen } from './components/mental-techniques/Grounding54321Screen';
import { GroundingAnchorScreen } from './components/mental-techniques/GroundingAnchorScreen';

// Новые импорты для централизованного управления контентом
import { ContentProvider, useContent } from './components/ContentContext';
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import { AchievementsProvider } from './contexts/AchievementsContext';
// import { appContent } from './data/content'; // Unused - using ContentContext instead
import { SurveyResults } from './types/content';
import { LikertScaleAnswer, PsychologicalTestPercentages } from './types/psychologicalTest';
import { calculateTestResults } from './utils/psychologicalTestCalculator';
import { saveTestResults, hasTestBeenCompleted, loadTestResults, clearTestResults } from './utils/psychologicalTestStorage';

// Smart Navigation imports
import { UserStateManager } from './utils/userStateManager';
import { DailyCheckinManager, DailyCheckinStatus } from './utils/DailyCheckinManager';
import { capture, AnalyticsEvent } from './utils/analytics/posthog';

// Achievements system imports
import { useAchievements } from './contexts/AchievementsContext';
import { incrementCheckin, incrementCardsOpened, addTopicCompleted, incrementCardsRepeated, addTopicRepeated, markCardAsOpened, loadUserStats } from './services/userStatsService';
import { getAchievementMetadata } from './utils/achievementsMetadata';
import { processReferralCode, getReferrerId, markReferralAsRegistered, addReferralToList, updateReferrerStatsFromList } from './utils/referralUtils';
import { getAchievementsToShow, markAchievementsAsShown } from './services/achievementDisplayService';
import { getTelegramUserId } from './utils/telegramUserUtils';
import { AppScreen } from './types/userState';
import { criticalDataManager } from './utils/dataManager';
import { resetUserStats } from './services/userStatsService';

const clearTimeoutFromRef = (ref: MutableRefObject<ReturnType<typeof setTimeout> | null>) => {
  const timeoutId = ref.current;
  if (timeoutId) {
    clearTimeout(timeoutId);
    ref.current = null;
  }
};

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
  const { getUI } = useContent();
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
          <div className="text-lg animate-pulse">{getUI().common.loadingQuestions}</div>
        </div>
      </div>
    );
  }
  
  const questionText = questions[0] || getUI().cards.questionNotFound;
  
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
  const { getUI } = useContent();
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
          <div className="text-lg animate-pulse">{getUI().common.loadingQuestions}</div>
        </div>
      </div>
    );
  }
  
  const questionText = questions[1] || getUI().cards.questionNotFound;
  
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
  const { getUI } = useContent();
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
          finalMessage: getUI().cards.techniqueNotFound || 'Technique not found',
          practiceTask: getUI().cards.practiceTaskNotFound || 'Practice task not found',
          whyExplanation: getUI().cards.explanationNotFound || 'Explanation not found'
        });
      } finally {
        setLoading(false);
      }
    };
    loadMessageData();
  }, [cardId, currentLanguage, getCardMessageData, getUI]);
  
      if (loading) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-[#111111]">
          <div className="text-white text-center">
            <div className="text-lg animate-pulse">{getUI().common.loadingFinalMessage || getUI().common.loading}</div>
          </div>
        </div>
      );
    }
  
  if (!messageData) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#111111]">
        <div className="text-white text-center">
          <div className="text-lg text-red-400">{getUI().common.errorLoadingMessageData || getUI().common.error}</div>
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
  // Get language context to update language after sync
  const { language: currentLanguageFromContext, setLanguage: updateLanguage } = useLanguage();

  // =====================================================================================
  // TELEGRAM WEBAPP INITIALIZATION (Direct-Link Full Screen Support)
  // =====================================================================================
      useEffect(() => {
      if (isTelegramEnvironment()) {
        try {
          // Initialize Telegram WebApp
          if (window.Telegram?.WebApp?.ready) {
            window.Telegram.WebApp.ready();
          }

          // Expand to fullscreen mode (two-step process for direct-link compatibility)
          telegramTimeoutRefs.current.expand = setTimeout(() => {
            try {
              // Step 1: expand() - transitions from compact to fullsize mode
              if (window.Telegram?.WebApp?.expand) {
                window.Telegram.WebApp.expand();
              }

              // Step 2: requestFullscreen() - transitions from fullsize to fullscreen mode
              // This is required for direct-link opens which default to fullsize mode
              telegramTimeoutRefs.current.fullscreen = setTimeout(() => {
                try {
                  if (window.Telegram?.WebApp?.requestFullscreen) {
                    window.Telegram.WebApp.requestFullscreen();
                  }
                } catch (fullscreenError) {
                  console.warn('Failed to request fullscreen:', fullscreenError);
                }
              }, 300);
            } catch (expandError) {
              console.warn('Failed to expand WebApp:', expandError);
            }
          }, 100);

        } catch (error) {
          console.warn('Error initializing Telegram WebApp:', error);
        }
      }
      
      // Cleanup function для очистки таймеров при размонтировании
      return () => {
        if (telegramTimeoutRefs.current.expand) {
          clearTimeout(telegramTimeoutRefs.current.expand);
        }
        if (telegramTimeoutRefs.current.fullscreen) {
          clearTimeout(telegramTimeoutRefs.current.fullscreen);
        }
        telegramTimeoutRefs.current = {};
      };
    }, []);

  // =====================================================================================
  // REFERRAL CODE PROCESSING (должен вызываться при инициализации ДО проверки онбординга)
  // =====================================================================================
  useEffect(() => {
    // Обработка реферального кода при первом открытии приложения
    processReferralCode();
    
    // Обновление статистики реферера на основе списка рефералов
    // Это работает только на устройстве реферера и обновляет его статистику
    updateReferrerStatsFromList();
  }, []); // Вызывается только при монтировании компонента

  // =====================================================================================
  // INITIAL SYNC WITH SUPABASE (runs in background, app shows immediately)
  // =====================================================================================

  useEffect(() => {
    // Start with loading screen
    setCurrentScreen('loading');
    setNavigationHistory(['loading']);

    const determineInitialScreen = (progress: AppFlowProgress): AppScreen => {
      if (!progress.onboardingCompleted) {
        return 'onboarding1';
      } else if (!progress.surveyCompleted) {
        return 'survey01';
      } else if (!hasTestBeenCompleted()) {
        return 'psychological-test-preambula';
      } else {
        const checkinStatus = DailyCheckinManager.getCurrentDayStatus();
        if (checkinStatus === DailyCheckinStatus.NOT_COMPLETED) {
          return 'checkin';
        } else if (checkinStatus === DailyCheckinStatus.COMPLETED) {
          return 'home';
        } else {
          return 'checkin';
        }
      }
    };

    // Check if we have critical data in localStorage
    // Critical data = onboarding completion OR survey completion OR psychological test completion
    // We don't need to check checkin status here because it's not critical for initial screen determination
    const checkLocalCriticalData = (): boolean => {
      const progress = loadProgress();
      const hasProgress = progress.onboardingCompleted || progress.surveyCompleted;
      const hasTest = hasTestBeenCompleted();
      
      const hasCriticalData = hasProgress || hasTest;
      console.log('[App] checkLocalCriticalData:', {
        hasProgress,
        hasTest,
        hasCriticalData,
        onboardingCompleted: progress.onboardingCompleted,
        surveyCompleted: progress.surveyCompleted,
      });
      
      return hasCriticalData;
    };

    // Load critical data from Supabase if localStorage is empty
    const loadCriticalData = async (): Promise<void> => {
      try {
        console.log('[App] Loading critical data from Supabase...');
        const { getSyncService } = await import('./utils/supabaseSync');
        const syncService = getSyncService();
        const result = await syncService.fastSyncCriticalData();
        
        if (result) {
          console.log('[App] Critical data loaded successfully');
          
          // Update language if preferences were loaded from Supabase
          if (result.preferences && result.preferences.language) {
            try {
              const loadedLanguage = result.preferences.language;
              if ((loadedLanguage === 'en' || loadedLanguage === 'ru')) {
                // Check if language changed (compare with current language from context)
                if (loadedLanguage !== currentLanguageFromContext) {
                  console.log(`[App] Language changed after fast sync: ${currentLanguageFromContext} -> ${loadedLanguage}`);
                  updateLanguage(loadedLanguage as 'en' | 'ru');
                } else {
                  console.log(`[App] Language loaded from Supabase: ${loadedLanguage} (already set)`);
                }
              }
            } catch (error) {
              console.warn('[App] Error updating language after fast sync:', error);
            }
          } else {
            // Fallback: try to get language from localStorage (if it was set during sync)
            try {
              const savedLanguage = localStorage.getItem('menhausen-language');
              if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru')) {
                // Check if language changed (compare with current language from context)
                if (savedLanguage !== currentLanguageFromContext) {
                  console.log(`[App] Language changed after fast sync (from localStorage): ${currentLanguageFromContext} -> ${savedLanguage}`);
                  updateLanguage(savedLanguage as 'en' | 'ru');
                }
              }
            } catch (error) {
              console.warn('[App] Error updating language after fast sync (fallback):', error);
            }
          }
        } else {
          console.log('[App] No critical data found in Supabase (new user)');
        }
      } catch (error) {
        console.warn('[App] Failed to load critical data:', error);
        // Continue anyway - will show onboarding for new users
      }
    };

    // Load all remaining data in background (non-blocking)
    const performBackgroundSync = async () => {
      const syncStartTime = Date.now();
      try {
        console.log('[App] Starting background sync (non-blocking)...');
        const { getSyncService } = await import('./utils/supabaseSync');
        const syncService = getSyncService();
        const result = await syncService.initialSync();
        const syncDuration = Date.now() - syncStartTime;
        console.log(`[App] Background sync completed in ${syncDuration}ms:`, result.success);
        
        // After sync, update flow state from localStorage (may have been updated by mergeAndSave)
        const updatedProgress = loadProgress();
        setFlow(updatedProgress);
        
        // Update language if it was loaded from Supabase and is different from current
        try {
          const savedLanguage = localStorage.getItem('menhausen-language');
          if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru')) {
            // Check if language changed (compare with current language from context)
            if (savedLanguage !== currentLanguageFromContext) {
              console.log(`[App] Language changed after sync: ${currentLanguageFromContext} -> ${savedLanguage}`);
              updateLanguage(savedLanguage as 'en' | 'ru');
            }
          }
        } catch (error) {
          console.warn('[App] Error updating language after sync:', error);
        }
        
        // Recalculate screen after sync completes (in case data changed)
        const currentProgress = loadProgress();
        const correctScreen = determineInitialScreen(currentProgress);
        
        // Only switch screen if it's different (to avoid flickering)
        if (correctScreen !== currentScreen) {
          console.log(`[App] Screen changed after background sync: ${currentScreen} -> ${correctScreen}`);
          setCurrentScreen(correctScreen);
          setNavigationHistory([correctScreen]);
        }
      } catch (error) {
        const syncDuration = Date.now() - syncStartTime;
        console.warn(`[App] Background sync failed after ${syncDuration}ms:`, error);
        // Don't change screen on error - user is already using the app
      }
    };

    // Main initialization flow
    const initializeApp = async () => {
      const initStartTime = Date.now();
      
      // Check if we have critical data locally
      const hasLocalCriticalData = checkLocalCriticalData();
      
      if (hasLocalCriticalData) {
        // We have local data, determine screen immediately
        const progress = loadProgress();
        const initialScreen = determineInitialScreen(progress);
        const initDuration = Date.now() - initStartTime;
        
        console.log(`[App] Local critical data found, showing app after ${initDuration}ms with screen:`, initialScreen);
        setCurrentScreen(initialScreen);
        setNavigationHistory([initialScreen]);
        
        // Start background sync for remaining data
        performBackgroundSync();
      } else {
        // No local data, load critical data from Supabase first
        await loadCriticalData();
        
        // Determine screen after loading critical data
        const progress = loadProgress();
        const initialScreen = determineInitialScreen(progress);
        const initDuration = Date.now() - initStartTime;
        
        console.log(`[App] Critical data loaded, showing app after ${initDuration}ms with screen:`, initialScreen);
        setCurrentScreen(initialScreen);
        setNavigationHistory([initialScreen]);
        
        // Start background sync for remaining data
        performBackgroundSync();
      }
    };

    // Start initialization
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Вызывается только при монтировании компонента

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
    psychologicalTestCompleted: boolean;
    pinEnabled: boolean;       // feature flag, disabled for now
    pinCompleted: boolean;
    firstCheckinDone: boolean;
    firstRewardShown: boolean;
  };

  const FLOW_KEY = 'app-flow-progress';

  const defaultProgress: AppFlowProgress = {
    onboardingCompleted: false,
    surveyCompleted: false,
    psychologicalTestCompleted: false,
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
  // Note: Logic is inlined in useEffect to avoid dependency issues
  // This helper function is kept for reference but not used
  const _getInitialScreen = (): AppScreen => {
    // Primary: flow-driven initial screen
    const p = loadProgress();
    console.log('[App] getInitialScreen - Progress:', p);
    console.log('[App] getInitialScreen - hasTestBeenCompleted:', hasTestBeenCompleted());

    if (!p.onboardingCompleted) {
      return 'onboarding1';
    }

    if (!p.surveyCompleted) {
      return 'survey01';
    }

  // Проверяем, был ли пройден психологический тест
  // Используем localStorage как единственный источник истины, чтобы избежать рассинхрона
  if (!hasTestBeenCompleted()) {
      return 'psychological-test-preambula';
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

  // Initialize with a default screen - will be updated after sync completes
  // For new users without data, this will show onboarding which is correct
  // For users with data, sync will update this to the correct screen
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('loading');
  const [navigationHistory, setNavigationHistory] = useState<AppScreen[]>(['loading']);
  const [isNavigatingForward, setIsNavigatingForward] = useState(true);
  const [currentFeatureName, setCurrentFeatureName] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<string>('');
  const [currentCard, setCurrentCard] = useState<{id: string; title?: string; description?: string}>({id: ''});
  const [currentCheckin, setCurrentCheckin] = useState<{id: string; cardTitle?: string; date?: string}>({id: ''});
  const [currentArticle, setCurrentArticle] = useState<string>('');
  const [articleReturnScreen, setArticleReturnScreen] = useState<AppScreen>('home');
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

  // =====================================================================================
  // СОСТОЯНИЕ ДЛЯ ПСИХОЛОГИЧЕСКОГО ТЕСТА
  // =====================================================================================
  const [psychologicalTestAnswers, setPsychologicalTestAnswers] = useState<LikertScaleAnswer[]>([]);

  // Получение системы контента
  const { getCard: _getCard, getTheme, getLocalizedText: _getLocalizedText, currentLanguage, getUI } = useContent();
  
  // Получение системы достижений
  const { checkAndUnlockAchievements } = useAchievements();
  
// Refs для хранения ID таймеров для очистки
  const telegramTimeoutRefs = useRef<{ expand?: ReturnType<typeof setTimeout>; fullscreen?: ReturnType<typeof setTimeout> }>({});
  const checkInTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardExerciseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const themeCardClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const themeHomeProcessingRef = useRef<boolean>(false);
  
  // Ref для отслеживания состояния монтирования компонента
  const isMountedRef = useRef<boolean>(true);
  
  // Устанавливаем isMountedRef в true при монтировании
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
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
  
  // Список экранов, на которых не показываем RewardScreen автоматически
  // Эти экраны требуют завершения действия пользователя перед показом уведомлений
  const blockedScreensForReward: AppScreen[] = useMemo(() => [
    'onboarding1', 'onboarding2', 
    'survey01', 'survey02', 'survey03', 'survey04', 'survey05', 'survey06',
    'psychological-test-preambula', 'psychological-test-instruction',
    'psychological-test-question-01', 'psychological-test-question-02', 'psychological-test-question-03',
    'psychological-test-question-04', 'psychological-test-question-05', 'psychological-test-question-06',
    'psychological-test-question-07', 'psychological-test-question-08', 'psychological-test-question-09',
    'psychological-test-question-10', 'psychological-test-question-11', 'psychological-test-question-12',
    'psychological-test-question-13', 'psychological-test-question-14', 'psychological-test-question-15',
    'psychological-test-question-16', 'psychological-test-question-17', 'psychological-test-question-18',
    'psychological-test-question-19', 'psychological-test-question-20', 'psychological-test-question-21',
    'psychological-test-question-22', 'psychological-test-question-23', 'psychological-test-question-24',
    'psychological-test-question-25', 'psychological-test-question-26', 'psychological-test-question-27',
    'psychological-test-question-28', 'psychological-test-question-29', 'psychological-test-question-30',
    'psychological-test-results',
    'pin', 'checkin', 'reward', 'card-welcome', 'question-01', 'question-02', 'final-message', 'rate-card'
    // Примечание: 'card-details' не заблокирован, чтобы можно было показывать уведомления во время просмотра карточки
  ], []);
  
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
  const navigateTo = useCallback((screen: AppScreen) => {
    setIsNavigatingForward(true);
    setNavigationHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  }, []);
  
  // Вспомогательная функция для проверки и показа новых достижений
  const checkAndShowAchievements = useCallback(async (delay: number = 200, forceCheck: boolean = false) => {
    // Не показываем, если уже есть достижения для показа (если не принудительная проверка)
    // Принудительная проверка нужна для случаев, когда мы хотим проверить достижения,
    // даже если уже есть сохраненные (например, при переходе на theme-home)
    if (!forceCheck && earnedAchievementIds.length > 0) {
      console.log('[Achievements] Skipping check - already have achievements to show:', earnedAchievementIds);
      return;
    }
    
    try {
      console.log('[Achievements] Checking achievements, currentScreen:', currentScreen, 'delay:', delay, 'forceCheck:', forceCheck);
      
      // Задержка для завершения записи в localStorage
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Проверяем, что компонент все еще смонтирован перед обновлением состояния
      if (!isMountedRef.current) {
        console.log('[Achievements] Component unmounted, skipping');
        return;
      }
      
      // ВАЖНО: Проверяем и присваиваем достижения ВСЕГДА, независимо от экрана
      // Это гарантирует, что достижения будут присвоены даже на заблокированных экранах
      
      // Загружаем текущую статистику для отладки
      const { loadUserStats } = await import('./services/userStatsService');
      const currentStats = loadUserStats();
      console.log('[Achievements] Current user stats before check:', {
        cardsOpened: currentStats.cardsOpened,
        stress: currentStats.cardsOpened['stress'] || 0
      });
      
      const newlyUnlocked = await checkAndUnlockAchievements();
      console.log('[Achievements] Newly unlocked achievements:', newlyUnlocked);
      
      // Проверяем еще раз после асинхронной операции
      if (!isMountedRef.current) {
        console.log('[Achievements] Component unmounted after async check, skipping');
        return;
      }
      
      if (newlyUnlocked.length > 0) {
        // Сохраняем достижения всегда, даже если экран заблокирован
        setEarnedAchievementIds(newlyUnlocked);
        console.log('[Achievements] Saved achievements to earnedAchievementIds:', newlyUnlocked);
        
        // Проверяем, есть ли среди новых достижений те, что связаны с карточками
        // Эти достижения должны показываться только на theme-home
        const cardRelatedAchievements = newlyUnlocked.filter(achievementId => {
          const metadata = getAchievementMetadata(achievementId);
          if (!metadata) return false;
          const conditionType = metadata.conditionType;
          const conditionTypes = Array.isArray(conditionType) ? conditionType : [conditionType];
          // Проверяем, связано ли достижение с карточками
          return conditionTypes.some(type => 
            type === 'cards_opened' || 
            type === 'topic_completed' || 
            type === 'cards_repeated' || 
            type === 'topic_repeated'
          );
        });
        
        // Проверяем, есть ли среди новых достижений те, что связаны со статьями
        // Эти достижения должны показываться при нажатии "назад" из статьи
        const articleRelatedAchievements = newlyUnlocked.filter(achievementId => {
          const metadata = getAchievementMetadata(achievementId);
          if (!metadata) return false;
          const conditionType = metadata.conditionType;
          const conditionTypes = Array.isArray(conditionType) ? conditionType : [conditionType];
          // Проверяем, связано ли достижение со статьями
          return conditionTypes.some(type => 
            type === 'articles_read'
          );
        });
        
        // Проверяем, есть ли среди новых достижений те, что связаны со streak
        // Для комбинированных: если есть условия карточек, используем логику карточек
        // Иначе если есть streak, используем логику streak
        const streakRelatedAchievements = newlyUnlocked.filter(achievementId => {
          const metadata = getAchievementMetadata(achievementId);
          if (!metadata) return false;
          const conditionType = metadata.conditionType;
          const conditionTypes = Array.isArray(conditionType) ? conditionType : [conditionType];
          // Проверяем, есть ли условия карточек
          const hasCardConditions = conditionTypes.some(type => 
            type === 'cards_opened' || 
            type === 'topic_completed' || 
            type === 'cards_repeated' || 
            type === 'topic_repeated'
          );
          // Если есть условия карточек, не считаем это streak достижением (будет обработано как карточка)
          if (hasCardConditions) return false;
          // Проверяем, связано ли достижение со streak
          return conditionTypes.some(type => 
            type === 'streak' || type === 'streak_repeat'
          );
        });
        
        // Проверяем, есть ли среди новых достижений те, что связаны с referral
        // Эти достижения должны показываться при открытии profile
        const referralRelatedAchievements = newlyUnlocked.filter(achievementId => {
          const metadata = getAchievementMetadata(achievementId);
          if (!metadata) return false;
          const conditionType = metadata.conditionType;
          const conditionTypes = Array.isArray(conditionType) ? conditionType : [conditionType];
          // Проверяем, связано ли достижение с referral
          return conditionTypes.some(type => 
            type === 'referral_invite' || type === 'referral_premium'
          );
        });
        
        console.log('[Achievements] Card-related achievements:', cardRelatedAchievements, 'currentScreen:', currentScreen);
        console.log('[Achievements] Article-related achievements:', articleRelatedAchievements, 'currentScreen:', currentScreen);
        console.log('[Achievements] Streak-related achievements:', streakRelatedAchievements, 'currentScreen:', currentScreen);
        console.log('[Achievements] Referral-related achievements:', referralRelatedAchievements, 'currentScreen:', currentScreen);
        
        // Если есть достижения, связанные с карточками, и мы на card-details или theme-home,
        // не показываем их сразу - они будут показаны на theme-home через useEffect
        // Если есть достижения, связанные со статьями, и мы на article,
        // не показываем их сразу - они будут показаны при нажатии "назад"
        // Если есть достижения, связанные со streak, и мы на checkin,
        // не показываем их сразу - они будут показаны на home после чекина
        // Если есть достижения, связанные с referral, откладываем показ - они будут показаны на profile
        const shouldShowImmediately = !(
          (cardRelatedAchievements.length > 0 && (currentScreen === 'card-details' || currentScreen === 'theme-home')) ||
          (articleRelatedAchievements.length > 0 && currentScreen === 'article') ||
          (streakRelatedAchievements.length > 0 && currentScreen === 'checkin') ||
          (referralRelatedAchievements.length > 0)
        );
        
        console.log('[Achievements] shouldShowImmediately:', shouldShowImmediately, 'blockedScreensForReward includes currentScreen:', blockedScreensForReward.includes(currentScreen));
        
        // Показываем уведомление только если:
        // 1. Экран не заблокирован
        // 2. Это не достижения, связанные с карточками на экране card-details
        // 3. Это не достижения, связанные со статьями на экране article
        // 4. Это не достижения, связанные со streak на экране checkin
        // 5. Это не достижения, связанные с referral (они обновляются асинхронно)
        if (!blockedScreensForReward.includes(currentScreen) && shouldShowImmediately) {
          console.log('[Achievements] Navigating to reward screen');
          // Показываем reward screen сразу после получения достижения
          navigateTo('reward');
        } else {
          if (cardRelatedAchievements.length > 0 && (currentScreen === 'card-details' || currentScreen === 'theme-home')) {
            console.log('[Achievements] Not showing immediately - will show on theme-home');
          } else if (articleRelatedAchievements.length > 0 && currentScreen === 'article') {
            console.log('[Achievements] Not showing immediately - will show on article back');
          } else if (streakRelatedAchievements.length > 0 && currentScreen === 'checkin') {
            console.log('[Achievements] Not showing immediately - will show on home after checkin');
          } else if (referralRelatedAchievements.length > 0) {
            console.log('[Achievements] Not showing immediately - will show on profile');
          }
        }
        // Если экран заблокирован или это достижения карточек на card-details,
        // или достижения статей на article, или достижения streak на checkin,
        // или достижения referral, достижения уже присвоены и сохранены в earnedAchievementIds
        // Они будут показаны при переходе на theme-home, home, profile или при нажатии "назад" из статьи
      } else {
        console.log('[Achievements] No new achievements unlocked');
      }
    } catch (error) {
      console.error('[Achievements] Error checking achievements:', error);
    }
  }, [currentScreen, earnedAchievementIds, checkAndUnlockAchievements, blockedScreensForReward, navigateTo, setEarnedAchievementIds]);
  
  // Автоматическая проверка достижений при изменении статистики (для изменений из других вкладок)
  // В основном окне проверка происходит через вызовы checkAndShowAchievements после действий
  // Примечание: storage event срабатывает только при изменении localStorage из другого окна/вкладки
  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      // Отслеживаем изменения статистики пользователя (срабатывает только при изменении из другого окна/вкладки)
      if (e.key === 'menhausen_user_stats') {
        // Используем общую функцию проверки
        checkAndShowAchievements(300);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAndShowAchievements]);
  
  // Проверка достижений при переходе на home screen, если есть новые достижения
  // (резервная проверка на случай, если достижения были получены до перехода на home)
  useEffect(() => {
    if (currentScreen === 'home' && earnedAchievementIds.length > 0) {
      // Если мы на home screen и есть достижения для показа, показываем их
      navigateTo('reward');
    }
  }, [currentScreen, earnedAchievementIds.length, navigateTo]);
  
  // Проверка streak достижений при переходе на home (после чекина)
  useEffect(() => {
    if (currentScreen === 'home') {
      console.log('[Achievements] home screen detected, checking for streak achievements');
      
      // Небольшая задержка, чтобы убедиться, что все state обновился
      const timeoutId = setTimeout(() => {
        // Используем централизованный сервис для получения достижений для показа
        const result = getAchievementsToShow({
          screen: 'home',
          earnedAchievementIds: earnedAchievementIds.length > 0 ? earnedAchievementIds : undefined,
          excludeFromStorageCheck: earnedAchievementIds // Исключаем из проверки storage, если уже есть в earnedAchievementIds
        });
        
        if (result.shouldNavigate && result.achievementsToShow.length > 0) {
          console.log('[Achievements] Showing streak-related achievements on home:', result.achievementsToShow);
          
          // ВАЖНО: Синхронно устанавливаем флаги ПЕРЕД навигацией
          markAchievementsAsShown(result.achievementsToShow, 'home');
          
          // Устанавливаем достижения и переходим на reward screen
          setEarnedAchievementIds(result.achievementsToShow);
          navigateTo('reward');
        }
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentScreen, earnedAchievementIds, navigateTo, setEarnedAchievementIds]);
  
  // Проверка referral достижений при переходе на profile
  useEffect(() => {
    if (currentScreen === 'profile') {
      console.log('[Achievements] profile screen detected, checking for referral achievements');
      
      // Небольшая задержка, чтобы убедиться, что все state обновился
      const timeoutId = setTimeout(() => {
        // Используем централизованный сервис для получения достижений для показа
        const result = getAchievementsToShow({
          screen: 'profile',
          earnedAchievementIds: earnedAchievementIds.length > 0 ? earnedAchievementIds : undefined,
          excludeFromStorageCheck: earnedAchievementIds // Исключаем из проверки storage, если уже есть в earnedAchievementIds
        });
        
        if (result.shouldNavigate && result.achievementsToShow.length > 0) {
          console.log('[Achievements] Showing referral-related achievements on profile:', result.achievementsToShow);
          
          // ВАЖНО: Синхронно устанавливаем флаги ПЕРЕД навигацией
          markAchievementsAsShown(result.achievementsToShow, 'profile');
          
          // Устанавливаем достижения и переходим на reward screen
          setEarnedAchievementIds(result.achievementsToShow);
          navigateTo('reward');
        }
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentScreen, earnedAchievementIds, navigateTo, setEarnedAchievementIds]);
  
  // Проверка достижений при переходе на theme-home (в дополнение к проверке после завершения карточки)
  useEffect(() => {
    if (currentScreen === 'theme-home') {
      console.log('[Achievements] theme-home screen detected, earnedAchievementIds:', earnedAchievementIds);
      
      // Проверяем, возвращаемся ли мы из reward screen
      // Если предыдущий экран был 'reward', не проверяем storage, так как достижения уже были показаны
      const previousScreen = navigationHistory.length >= 2 
        ? navigationHistory[navigationHistory.length - 2] 
        : null;
      
      // Если earnedAchievementIds пустой И мы вернулись из reward screen, не проверяем storage
      // Это предотвращает повторный показ достижений при возврате из reward screen
      if (earnedAchievementIds.length === 0 && previousScreen === 'reward') {
        console.log('[Achievements] Returned from reward screen with empty earnedAchievementIds, skipping check');
        return;
      }
      
      // Если earnedAchievementIds пустой, но мы НЕ вернулись из reward screen,
      // это может быть первый вход на theme-home с уже разблокированными достижениями
      // В этом случае проверяем storage (но только если нет earnedAchievementIds)
      
      // Предотвращаем повторное выполнение только если earnedAchievementIds пустой
      // Если earnedAchievementIds содержит достижения, обрабатываем их в любом случае
      if (earnedAchievementIds.length === 0 && themeHomeProcessingRef.current) {
        console.log('[Achievements] theme-home processing already in progress, skipping');
        return;
      }
      
      // Устанавливаем флаг ДО setTimeout, чтобы предотвратить повторное выполнение
      // Но только если earnedAchievementIds пустой
      if (earnedAchievementIds.length === 0) {
        themeHomeProcessingRef.current = true;
      }
      
      // Задержка зависит от того, есть ли уже earnedAchievementIds
      // Если earnedAchievementIds пустой, используем большую задержку (800мс), 
      // чтобы дать время checkAndShowAchievements завершиться:
      // - внешняя задержка в handleCompleteRating: 300мс
      // - внутренняя задержка в checkAndShowAchievements: 300мс
      // - время на разблокировку и сохранение: ~200мс
      // Итого: ~800мс
      // Если earnedAchievementIds уже содержит достижения, используем небольшую задержку (200мс),
      // чтобы дать время state обновиться и убедиться, что достижения сохранены в storage
      const delay = earnedAchievementIds.length > 0 ? 200 : 800;
      
      // Если earnedAchievementIds содержит достижения, сбрасываем флаг, чтобы разрешить обработку
      if (earnedAchievementIds.length > 0) {
        themeHomeProcessingRef.current = false;
      }
      
      const timeoutId = setTimeout(() => {
        try {
          // Используем централизованный сервис для получения достижений для показа
          const result = getAchievementsToShow({
            screen: 'theme-home',
            earnedAchievementIds: earnedAchievementIds.length > 0 ? earnedAchievementIds : undefined,
            excludeFromStorageCheck: earnedAchievementIds // Исключаем из проверки storage, если уже есть в earnedAchievementIds
          });
          
          if (result.shouldNavigate && result.achievementsToShow.length > 0) {
            console.log('[Achievements] Showing card-related achievements on theme-home:', result.achievementsToShow);
            
            // ВАЖНО: Синхронно устанавливаем флаги ПЕРЕД навигацией
            markAchievementsAsShown(result.achievementsToShow, 'theme-home');
            
            // Устанавливаем достижения ПЕРЕД навигацией, чтобы RewardManager получил правильные данные
            setEarnedAchievementIds(result.achievementsToShow);
            
            // Небольшая задержка перед навигацией, чтобы state успел обновиться
            setTimeout(() => {
              navigateTo('reward');
            }, 0);
          } else {
            // Если нет достижений для показа, сбрасываем флаг
            themeHomeProcessingRef.current = false;
          }
        } catch (error) {
          console.error('[Achievements] Error processing achievements on theme-home:', error);
          themeHomeProcessingRef.current = false;
        }
      }, delay);
      
      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      // Сбрасываем флаг при переходе на другой экран
      themeHomeProcessingRef.current = false;
    }
  }, [currentScreen, earnedAchievementIds, navigateTo, setEarnedAchievementIds, navigationHistory]);
  
  // Общий cleanup для всех таймеров при размонтировании компонента
  useEffect(() => {
    const telegramTimeouts = telegramTimeoutRefs.current;
    return () => {
      // Очищаем все таймеры Telegram WebApp
      if (telegramTimeouts.expand) {
        clearTimeout(telegramTimeouts.expand);
        telegramTimeouts.expand = undefined;
      }
      if (telegramTimeouts.fullscreen) {
        clearTimeout(telegramTimeouts.fullscreen);
        telegramTimeouts.fullscreen = undefined;
      }
      
      // Очищаем таймер чекина
      clearTimeoutFromRef(checkInTimeoutRef);
      
      // Очищаем таймер завершения карточки
      clearTimeoutFromRef(cardExerciseTimeoutRef);
      
      // Очищаем таймер клика по карточке темы
      clearTimeoutFromRef(themeCardClickTimeoutRef);
    };
  }, []);
  
  // Функция для закрытия приложения через Telegram WebApp
  const closeApp = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    } else {
      // Fallback для тестирования вне Telegram
      console.log('App would be closed in Telegram WebApp');
    }
  };

  // Функция для возврата на предыдущий экран (Enhanced for direct-link mode)
  const goBack = () => {
    if (navigationHistory.length > 1) {
      // Standard navigation back
      setIsNavigatingForward(false);
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Удаляем текущий экран
      const previousScreen = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentScreen(previousScreen);
    } else if (isDirectLinkMode()) {
      // For direct-link mode, close app when no navigation history
      // This addresses the issue where direct-link back button should close the app
      closeApp();
    } else {
      // Fallback for non-Telegram environments
      window.history.back();
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

  const handleCheckInSubmit = async (_mood: string) => {
    // Обновляем статистику чек-ина
    incrementCheckin();
    
    // Smart Navigation: Refresh user state after check-in completion
    refreshUserState();

    // Update flow for first check-in
    updateFlow(p => ({ ...p, firstCheckinDone: true }));

    // Показываем достижение только если не показывали раньше
    if (!flow.firstRewardShown) {
      setEarnedAchievementIds(['newcomer']);
      setHasShownFirstAchievement(true);
      localStorage.setItem('has-shown-first-achievement', JSON.stringify(true));
      updateFlow(p => ({ ...p, firstRewardShown: true }));
      navigateTo('reward');
      return;
    }

    // Если уже показывали, проверяем новые достижения после чекина
    // Используем checkAndShowAchievements для правильной фильтрации и отложенного показа
    // Очищаем предыдущий таймер, если он существует
    if (checkInTimeoutRef.current) {
      clearTimeout(checkInTimeoutRef.current);
    }
    
    checkInTimeoutRef.current = setTimeout(async () => {
      try {
        // Проверяем, что компонент все еще смонтирован
        if (!isMountedRef.current) {
          return;
        }
        
        // Используем checkAndShowAchievements для правильной обработки всех типов достижений
        // Это обеспечит отложенный показ streak достижений на home
        await checkAndShowAchievements(300, true);
        
        // Проверяем еще раз после асинхронной операции
        if (!isMountedRef.current) {
          return;
        }
        
        // Если есть достижения для показа, они уже обработаны в checkAndShowAchievements
        // Если нет, переходим на home
        if (earnedAchievementIds.length === 0) {
          navigateTo('home');
        }
      } catch (error) {
        console.error('Error checking achievements after check-in:', error);
        // Проверяем mounted state перед навигацией в catch блоке
        if (isMountedRef.current) {
          navigateTo('home');
        }
      } finally {
        checkInTimeoutRef.current = null;
      }
    }, 100);
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

      // =====================================================================================
      // REFERRAL REGISTRATION (регистрация реферала после завершения опроса)
      // =====================================================================================
      const referrerId = getReferrerId();
      const currentUserId = getTelegramUserId();
      
      if (referrerId && currentUserId) {
        // Пользователь пришел по реферальной ссылке
        console.log('Registering referral:', { referrerId, currentUserId });
        
        // Добавить реферала в список реферера
        addReferralToList(referrerId, currentUserId);
        
        // Отметить, что реферал зарегистрирован
        markReferralAsRegistered();
        
        // Обновление статистики реферера произойдет при следующем открытии приложения реферером
        // через функцию updateReferrerStatsFromList, которая должна вызываться при инициализации
      }

      // После опроса переходим к психологическому тесту
      const nextScreen: AppScreen = 'psychological-test-preambula';

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

  // =====================================================================================
  // ОБРАБОТЧИКИ ДЛЯ ПСИХОЛОГИЧЕСКОГО ТЕСТА
  // =====================================================================================
  
  const handlePsychologicalTestPreambulaNext = () => {
    navigateTo('psychological-test-instruction');
  };

  const handlePsychologicalTestInstructionNext = () => {
    navigateTo('psychological-test-question-01');
  };

  const handlePsychologicalTestQuestionNext = (questionNumber: number, answer: LikertScaleAnswer) => {
    // Сохраняем ответ
    const newAnswers = [...psychologicalTestAnswers];
    newAnswers[questionNumber - 1] = answer; // questionNumber 1-based, array 0-based
    setPsychologicalTestAnswers(newAnswers);

    // Если это последний вопрос (30), переходим к результатам
    if (questionNumber === 30) {
      // Рассчитываем результаты
      const { scores, percentages } = calculateTestResults(newAnswers);
      
      // Сохраняем результаты
      saveTestResults(scores, percentages);
      
      // Обновляем flow
      updateFlow(p => ({ ...p, psychologicalTestCompleted: true }));
      
      // Переходим к экрану результатов
      navigateTo('psychological-test-results');
    } else {
      // Переходим к следующему вопросу
      const nextQuestionNumber = questionNumber + 1;
      const nextScreen = `psychological-test-question-${String(nextQuestionNumber).padStart(2, '0')}` as AppScreen;
      navigateTo(nextScreen);
    }
  };

  const handlePsychologicalTestResultsNext = () => {
    // После результатов теста переходим к чекину
    navigateTo('checkin');
  };

  const _handleGoToCheckIn = () => {
    navigateTo('checkin');
  };

  const handleGoToProfile = () => {
    navigateTo('profile');
  };

  const handleGoToBadges = () => {
    navigateTo('badges');
  };


  /**
   * Навигация к списку всех статей
   */
  const handleGoToAllArticles = () => {
    console.log('Navigating to all articles screen');
    navigateTo('all-articles');
  };

  /**
   * Навигация к конкретной статье
   */
  const handleOpenArticle = (articleId: string) => {
    console.log(`Opening article: ${articleId}`);
    const originScreen: AppScreen = currentScreen === 'all-articles' ? 'all-articles' : 'home';
    setArticleReturnScreen(originScreen);
    setCurrentArticle(articleId);
    navigateTo('article');
  };

  /**
   * Возврат из статьи к списку статей
   */
  const handleBackFromArticle = () => {
    setCurrentArticle('');
    if (articleReturnScreen === 'all-articles') {
      navigateTo('all-articles');
    } else {
      navigateTo('home');
    }
  };

  /**
   * Возврат из списка статей к главной странице
   */
  const handleBackToHomeFromArticles = () => {
    setCurrentArticle('');
    navigateTo('home');
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
    
    // Отмечаем карточку как открытую (после ответа на второй вопрос, когда показывается финальное сообщение)
    // Это правильный момент, когда карточка считается "открытой" для достижений
    const currentStats = loadUserStats();
    const wasOpenedBefore = currentStats.openedCardIds?.includes(currentCard.id) || false;
    
    if (!wasOpenedBefore) {
      console.log(`[Card] First time opening card ${currentCard.id}, marking as opened`);
      // Отмечаем карточку как открытую
      markCardAsOpened(currentCard.id);
      
      // Увеличиваем счетчик открытых карточек в теме
      const themeId = getThemeIdFromCardId(currentCard.id);
      if (themeId) {
        console.log(`[Card] Incrementing cardsOpened for theme: ${themeId}`);
        incrementCardsOpened(themeId);
        // НЕ проверяем достижения здесь - карточка еще не завершена (нужно пройти rate-card)
        // Проверка достижений будет выполнена в handleCompleteRating после перехода на theme-home
      }
    } else {
      console.log(`[Card] Card ${currentCard.id} was already opened before, skipping increment`);
    }
    
    navigateTo('final-message');
  };

  const handleCompleteFinalMessage = () => {
    console.log(`Final message completed for card: ${currentCard.id}`);
    navigateTo('rate-card');
  };

  const handleCompleteRating = (rating?: number, textMessage?: string) => {
    // Если рейтинг не указан (пропущен), используем 0
    const finalRating = rating ?? 0;
    const hasRating = rating !== undefined;
    
    console.log(
      hasRating 
        ? `Card rated: ${rating} stars for card: ${currentCard.id}${textMessage ? ` with message: ${textMessage}` : ' without message'}`
        : `Card completion skipped (no rating) for card: ${currentCard.id}`
    );
    console.log('Current userAnswers before saving:', userAnswers);
    console.log('Final answers to save:', finalAnswers);
    
    // Отправляем аналитику всегда, даже при пропуске рейтинга (для анализа отказов)
    capture(AnalyticsEvent.CARD_RATED, {
      cardId: currentCard.id,
      themeId: currentTheme,
      rating: finalRating,
      hasRating: hasRating,
      ratingComment: textMessage || undefined,
      hasComment: !!textMessage,
      language: currentLanguage,
    });
    
    try {
      // Используем finalAnswers для надежности, fallback на userAnswers
      const answersToSave = Object.keys(finalAnswers).length > 0 ? finalAnswers : userAnswers;
      
      // Сохраняем завершенную попытку через ThemeCardManager (используем 0 для рейтинга при пропуске)
      const completedAttempt = ThemeCardManager.addCompletedAttempt(
        currentCard.id,
        answersToSave, // Все ответы пользователя (question1, question2)
        finalRating, // 0 если рейтинг пропущен
        textMessage
      );
      
      console.log('Exercise completed and saved:', {
        cardId: currentCard.id,
        answers: answersToSave,
        rating: finalRating,
        hasRating: hasRating,
        attemptId: completedAttempt.completedAttempts[completedAttempt.completedAttempts.length - 1]?.attemptId,
        totalAttempts: completedAttempt.totalCompletedAttempts
      });
      
      // Обновляем статистику для достижений
      const themeId = (currentCard as any).themeId ?? getThemeIdFromCardId(currentCard.id);
      
      // Увеличиваем счетчик повторений карточки (если это повтор)
      if (completedAttempt.totalCompletedAttempts > 1) {
        incrementCardsRepeated(currentCard.id);
      }
      
      // Проверяем, завершена ли вся тема
      const theme = getTheme(themeId);
      if (theme) {
        const allCardIds = theme.cardIds || (theme.cards ? theme.cards.map((c: any) => c.id) : []);
        const allCardsCompleted = allCardIds.every((cardId: string) => {
          const attempts = ThemeCardManager.getCompletedAttempts(cardId);
          return attempts && attempts.length > 0;
        });
        
        if (allCardsCompleted) {
          // Все карточки темы завершены
          addTopicCompleted(themeId);
          
          // Проверяем, были ли все карточки повторены
          const allCardsRepeated = allCardIds.every((cardId: string) => {
            const attempts = ThemeCardManager.getCompletedAttempts(cardId);
            return attempts && attempts.length > 1;
          });
          
          if (allCardsRepeated) {
            addTopicRepeated(themeId);
          }
        }
      }
      
      // НЕ проверяем достижения здесь, так как мы еще на заблокированном экране rate-card
      // Проверка будет выполнена после перехода на theme-home (см. ниже)
      
      // Начисляем баллы за прохождение карточки по уровню сложности (синхронно)
      try {
        const lastAttempt = completedAttempt.completedAttempts[completedAttempt.completedAttempts.length - 1];
        const attemptId = `card_${lastAttempt?.attemptId || `${currentCard.id}_${Date.now()}`}`;
        const level = (currentCard as any).level ?? 1;
        const themeId = (currentCard as any).themeId ?? getThemeIdFromCardId(currentCard.id);
        const amount = getPointsForLevel(level);
        if (amount > 0) {
          const note = `Card ${currentCard.id} completed (level ${level}, theme ${themeId})`;
          PointsManager.earn(amount, { correlationId: attemptId, note });
        }
      } catch (earnError) {
        console.warn('Failed to award points for card completion', earnError);
      }

      // Обновляем локальные состояния для UI
      setCardRating(finalRating);
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
    
    // Проверяем достижения после завершения карточки (с задержкой, чтобы state обновился)
    // Очищаем предыдущий таймер, если он существует
    if (cardExerciseTimeoutRef.current) {
      clearTimeout(cardExerciseTimeoutRef.current);
    }
    
    cardExerciseTimeoutRef.current = setTimeout(() => {
      // Проверяем, что компонент все еще смонтирован перед вызовом
      if (isMountedRef.current) {
        console.log('[Achievements] Checking achievements after card completion');
        // Используем forceCheck=true, чтобы проверить достижения даже если уже есть сохраненные
        // Это нужно, так как при завершении карточки может быть разблокировано новое достижение
        checkAndShowAchievements(300, true);
      }
      cardExerciseTimeoutRef.current = null;
    }, 300);
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
    console.log(`[Card] Card clicked: ${cardId}`);
    
    // НЕ увеличиваем счетчик cardsOpened здесь - карточка еще не пройдена
    // Счетчик будет увеличен в handleCompleteExercise после ответа на второй вопрос
    
    const cardData = await getCardData(cardId, currentLanguage);
    setCurrentCard(cardData);
    navigateTo('card-details');
    
    // НЕ проверяем достижения здесь - карточка еще не пройдена
    // Проверка достижений будет выполнена в handleCompleteRating после завершения карточки
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
        description: card.introduction, // Используем introduction как описание
        level: card.level,
        themeId
      };
    } catch (error) {
      console.error('Error loading card data:', error);
      return {
        id: cardId,
        title: getUI().cards.fallbackTitle || 'Card',
        description: getUI().cards.fallbackDescription || 'Card description will be available soon.'
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
        finalMessage: card.technique || (getUI().cards.techniqueNotFound || 'Technique not found'),
        practiceTask: card.recommendation || (getUI().cards.practiceTaskNotFound || 'Practice task not found'), 
        whyExplanation: card.mechanism || (getUI().cards.explanationNotFound || 'Explanation not found')
      };
    } catch (error) {
      console.error('Error loading card message data:', error);
      return {
        finalMessage: getUI().cards.techniqueNotFound || 'Technique not found',
        practiceTask: getUI().cards.practiceTaskNotFound || 'Practice task not found',
        whyExplanation: getUI().cards.explanationNotFound || 'Explanation not found'
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

  const handleShowAppSettings = () => {
    navigateTo('app-settings');
  };

  const handleBackToProfile = () => {
    navigateTo('profile');
  };

  const handleBackToProfileFromSettings = () => {
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
    
    // Очищаем данные психологического теста
    setPsychologicalTestAnswers([]);
    clearTestResults();
    
    // Очищаем все данные из localStorage
    // 1. Удаляем основные ключи приложения
    localStorage.removeItem('survey-results');
    localStorage.removeItem('app-flow-progress');
    localStorage.removeItem('checkin-data');
    localStorage.removeItem('has-shown-first-achievement');
    
    // 2. Удаляем все данные с префиксом 'menhausen_' (через CriticalDataManager)
    criticalDataManager.clearAllData();
    
    // 3. Удаляем баллы и транзакции
    localStorage.removeItem('menhausen_points_balance');
    localStorage.removeItem('menhausen_points_transactions');
    
    // 4. Удаляем статистику пользователя
    resetUserStats();
    
    // 5. Удаляем данные карточек (theme_card_progress_*)
    const cardProgressKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('theme_card_progress_')) {
        cardProgressKeys.push(key);
      }
    }
    cardProgressKeys.forEach(key => localStorage.removeItem(key));
    
    // 6. Удаляем данные чекинов (daily_checkin_*)
    const checkinKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('daily_checkin_')) {
        checkinKeys.push(key);
      }
    }
    checkinKeys.forEach(key => localStorage.removeItem(key));
    
    // 7. Удаляем реферальные данные
    localStorage.removeItem('menhausen_referred_by');
    localStorage.removeItem('menhausen_referral_code');
    localStorage.removeItem('menhausen_referral_registered');
    // Удаляем все ключи реферальных списков
    const referralListKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('menhausen_referral_list_')) {
        referralListKeys.push(key);
      }
    }
    referralListKeys.forEach(key => localStorage.removeItem(key));
    
    // 8. Удаляем язык (опционально, можно оставить для удобства пользователя)
    // localStorage.removeItem('menhausen-language');
    
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

  const _handleShowUnderConstruction = (featureName: string) => {
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

  // Вспомогательная функция для обертки экранов в motion.div с анимацией
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
  );

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'loading':
        return wrapScreen(<LoadingScreen />);
      case 'onboarding1':
        return wrapScreen(
          <OnboardingScreen01 
            onNext={handleNextScreen}
            onShowPrivacy={handleShowPrivacy}
            onShowTerms={handleShowTerms}
          />
        );
      case 'onboarding2':
        return wrapScreen(
          <OnboardingScreen02 onComplete={handleShowSurvey} />
        );
      
      // Экраны опроса
      case 'survey01':
        return wrapScreen(
          <SurveyScreen01 
            onNext={handleSurvey01Next} 
            onBack={handleBackToOnboarding2}
            initialSelections={surveyResults.screen01}
          />
        );
      case 'survey02':
        return wrapScreen(
          <SurveyScreen02 
            onNext={handleSurvey02Next} 
            onBack={handleBackToSurvey01}
            initialSelections={surveyResults.screen02}
          />
        );
      case 'survey03':
        return wrapScreen(
          <SurveyScreen03 
            onNext={handleSurvey03Next} 
            onBack={handleBackToSurvey02}
            initialSelections={surveyResults.screen03}
          />
        );
      case 'survey04':
        return wrapScreen(
          <SurveyScreen04 
            onNext={handleSurvey04Next} 
            onBack={handleBackToSurvey03}
            initialSelections={surveyResults.screen04}
          />
        );
      case 'survey05':
        return wrapScreen(
          <SurveyScreen05 
            onNext={handleSurvey05Next} 
            onBack={handleBackToSurvey04}
            initialSelections={surveyResults.screen05}
          />
        );

      case 'survey06':
        return wrapScreen(
          <SurveyScreen06 
            onNext={handleSurvey06Next} 
            onBack={handleBackToSurvey05}
            initialSelections={surveyResults.screen06}
          />
        );

      // Экраны психологического теста
      case 'psychological-test-preambula':
        return wrapScreen(
          <PsychologicalTestPreambulaScreen 
            onNext={handlePsychologicalTestPreambulaNext}
          />
        );
      
      case 'psychological-test-instruction':
        return wrapScreen(
          <PsychologicalTestInstructionScreen 
            onNext={handlePsychologicalTestInstructionNext}
          />
        );
      
      case 'psychological-test-question-01':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={1}
            onNext={(answer) => handlePsychologicalTestQuestionNext(1, answer)}
            initialAnswer={psychologicalTestAnswers[0] || null}
          />
        );
      case 'psychological-test-question-02':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={2}
            onNext={(answer) => handlePsychologicalTestQuestionNext(2, answer)}
            initialAnswer={psychologicalTestAnswers[1] || null}
          />
        );
      case 'psychological-test-question-03':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={3}
            onNext={(answer) => handlePsychologicalTestQuestionNext(3, answer)}
            initialAnswer={psychologicalTestAnswers[2] || null}
          />
        );
      case 'psychological-test-question-04':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={4}
            onNext={(answer) => handlePsychologicalTestQuestionNext(4, answer)}
            initialAnswer={psychologicalTestAnswers[3] || null}
          />
        );
      case 'psychological-test-question-05':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={5}
            onNext={(answer) => handlePsychologicalTestQuestionNext(5, answer)}
            initialAnswer={psychologicalTestAnswers[4] || null}
          />
        );
      case 'psychological-test-question-06':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={6}
            onNext={(answer) => handlePsychologicalTestQuestionNext(6, answer)}
            initialAnswer={psychologicalTestAnswers[5] || null}
          />
        );
      case 'psychological-test-question-07':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={7}
            onNext={(answer) => handlePsychologicalTestQuestionNext(7, answer)}
            initialAnswer={psychologicalTestAnswers[6] || null}
          />
        );
      case 'psychological-test-question-08':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={8}
            onNext={(answer) => handlePsychologicalTestQuestionNext(8, answer)}
            initialAnswer={psychologicalTestAnswers[7] || null}
          />
        );
      case 'psychological-test-question-09':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={9}
            onNext={(answer) => handlePsychologicalTestQuestionNext(9, answer)}
            initialAnswer={psychologicalTestAnswers[8] || null}
          />
        );
      case 'psychological-test-question-10':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={10}
            onNext={(answer) => handlePsychologicalTestQuestionNext(10, answer)}
            initialAnswer={psychologicalTestAnswers[9] || null}
          />
        );
      case 'psychological-test-question-11':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={11}
            onNext={(answer) => handlePsychologicalTestQuestionNext(11, answer)}
            initialAnswer={psychologicalTestAnswers[10] || null}
          />
        );
      case 'psychological-test-question-12':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={12}
            onNext={(answer) => handlePsychologicalTestQuestionNext(12, answer)}
            initialAnswer={psychologicalTestAnswers[11] || null}
          />
        );
      case 'psychological-test-question-13':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={13}
            onNext={(answer) => handlePsychologicalTestQuestionNext(13, answer)}
            initialAnswer={psychologicalTestAnswers[12] || null}
          />
        );
      case 'psychological-test-question-14':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={14}
            onNext={(answer) => handlePsychologicalTestQuestionNext(14, answer)}
            initialAnswer={psychologicalTestAnswers[13] || null}
          />
        );
      case 'psychological-test-question-15':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={15}
            onNext={(answer) => handlePsychologicalTestQuestionNext(15, answer)}
            initialAnswer={psychologicalTestAnswers[14] || null}
          />
        );
      case 'psychological-test-question-16':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={16}
            onNext={(answer) => handlePsychologicalTestQuestionNext(16, answer)}
            initialAnswer={psychologicalTestAnswers[15] || null}
          />
        );
      case 'psychological-test-question-17':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={17}
            onNext={(answer) => handlePsychologicalTestQuestionNext(17, answer)}
            initialAnswer={psychologicalTestAnswers[16] || null}
          />
        );
      case 'psychological-test-question-18':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={18}
            onNext={(answer) => handlePsychologicalTestQuestionNext(18, answer)}
            initialAnswer={psychologicalTestAnswers[17] || null}
          />
        );
      case 'psychological-test-question-19':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={19}
            onNext={(answer) => handlePsychologicalTestQuestionNext(19, answer)}
            initialAnswer={psychologicalTestAnswers[18] || null}
          />
        );
      case 'psychological-test-question-20':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={20}
            onNext={(answer) => handlePsychologicalTestQuestionNext(20, answer)}
            initialAnswer={psychologicalTestAnswers[19] || null}
          />
        );
      case 'psychological-test-question-21':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={21}
            onNext={(answer) => handlePsychologicalTestQuestionNext(21, answer)}
            initialAnswer={psychologicalTestAnswers[20] || null}
          />
        );
      case 'psychological-test-question-22':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={22}
            onNext={(answer) => handlePsychologicalTestQuestionNext(22, answer)}
            initialAnswer={psychologicalTestAnswers[21] || null}
          />
        );
      case 'psychological-test-question-23':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={23}
            onNext={(answer) => handlePsychologicalTestQuestionNext(23, answer)}
            initialAnswer={psychologicalTestAnswers[22] || null}
          />
        );
      case 'psychological-test-question-24':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={24}
            onNext={(answer) => handlePsychologicalTestQuestionNext(24, answer)}
            initialAnswer={psychologicalTestAnswers[23] || null}
          />
        );
      case 'psychological-test-question-25':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={25}
            onNext={(answer) => handlePsychologicalTestQuestionNext(25, answer)}
            initialAnswer={psychologicalTestAnswers[24] || null}
          />
        );
      case 'psychological-test-question-26':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={26}
            onNext={(answer) => handlePsychologicalTestQuestionNext(26, answer)}
            initialAnswer={psychologicalTestAnswers[25] || null}
          />
        );
      case 'psychological-test-question-27':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={27}
            onNext={(answer) => handlePsychologicalTestQuestionNext(27, answer)}
            initialAnswer={psychologicalTestAnswers[26] || null}
          />
        );
      case 'psychological-test-question-28':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={28}
            onNext={(answer) => handlePsychologicalTestQuestionNext(28, answer)}
            initialAnswer={psychologicalTestAnswers[27] || null}
          />
        );
      case 'psychological-test-question-29':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={29}
            onNext={(answer) => handlePsychologicalTestQuestionNext(29, answer)}
            initialAnswer={psychologicalTestAnswers[28] || null}
          />
        );
      case 'psychological-test-question-30':
        return wrapScreen(
          <PsychologicalTestQuestionScreen 
            questionNumber={30}
            onNext={(answer) => handlePsychologicalTestQuestionNext(30, answer)}
            initialAnswer={psychologicalTestAnswers[29] || null}
          />
        );
      
      case 'psychological-test-results': {
        // Рассчитываем результаты для отображения
        // Используем сохраненные результаты из localStorage, если они есть
        const savedResults = loadTestResults();
        
        // Безопасное вычисление процентов: проверяем, что есть 30 ответов
        let percentages: PsychologicalTestPercentages;
        if (savedResults?.percentages) {
          percentages = savedResults.percentages;
        } else if (psychologicalTestAnswers.length === 30) {
          // Все ответы на месте, можем безопасно рассчитать
          percentages = calculateTestResults(psychologicalTestAnswers).percentages;
        } else {
          // Неполные данные - используем нулевые значения по умолчанию
          console.warn(`Psychological test results: incomplete answers (${psychologicalTestAnswers.length}/30). Using default zero percentages.`);
          percentages = {
            stress: 0,
            anxiety: 0,
            relationships: 0,
            selfEsteem: 0,
            anger: 0,
            depression: 0
          };
        }
        
        return wrapScreen(
          <PsychologicalTestResultsScreen 
            percentages={percentages}
            onNext={handlePsychologicalTestResultsNext}
          />
        );
      }

      case 'pin':
        return wrapScreen(
          <PinSetupScreen 
            onComplete={handleCompletePinSetup} 
            onSkip={handleSkipPinSetup}
            onBack={handleBackToSurvey} 
          />
        );
      case 'checkin':
        return wrapScreen(<CheckInScreen onSubmit={handleCheckInSubmit} onBack={handleBackToHome} />);
      case 'home':
        return wrapScreen(
          <HomeScreen
            onGoToProfile={handleGoToProfile}
            onGoToTheme={handleGoToTheme}
            onArticleClick={handleOpenArticle}
            onViewAllArticles={handleGoToAllArticles}
            userHasPremium={userHasPremium}
          />
        );
      case 'theme-welcome': {
        const themeData = getTheme(currentTheme);
        
        return wrapScreen(
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
        return wrapScreen(
          <ThemeHomeScreen
            onBack={handleBackToHomeFromTheme}
            onCardClick={handleThemeCardClick}
            onOpenNextLevel={handleOpenNextLevel}
            themeId={currentTheme}
          />
        );
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
          />
        );
      case 'checkin-details':
        return wrapScreen(
          <CheckinDetailsScreen
            onBack={handleBackToCardDetails}
            checkinId={currentCheckin.id}
            cardTitle={currentCheckin.cardTitle}
            checkinDate={currentCheckin.date}
          />
        );
      case 'card-welcome':
        return wrapScreen(
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
        return wrapScreen(
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
        return wrapScreen(
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
        return wrapScreen(
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
        return wrapScreen(
          <RateCardScreen
            onBack={handleBackToFinalMessage}
            onNext={handleCompleteRating}
            cardId={currentCard.id}
            cardTitle={currentCard.title || ''}
          />
        );
      case 'profile':
        return wrapScreen(
          <UserProfileScreen 
            onBack={handleBackToHome} 
            onShowPayments={handleShowPayments}
            onGoToBadges={handleGoToBadges}
            onShowSettings={handleShowAppSettings}
            userHasPremium={userHasPremium}
          />
        );
      case 'about':
        return wrapScreen(<AboutAppScreen onBack={handleBackToProfile} />);
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
          />
        );
      case 'pin-settings':
        return wrapScreen(
          <PinSetupScreen 
            onComplete={handleCompletePinSettings} 
            onSkip={handleSkipPinSettings}
            onBack={handleBackToProfile} 
          />
        );
      case 'privacy':
        return wrapScreen(
          <PrivacyPolicyScreen 
            onBack={goBack} 
          />
        );
      case 'terms':
        return wrapScreen(
          <TermsOfUseScreen 
            onBack={goBack} 
          />
        );
      case 'delete':
        return wrapScreen(
          <DeleteAccountScreen 
            onBack={handleBackToProfileFromDelete}
            onDeleteAccount={handleDeleteAccount}
          />
        );
      case 'payments':
        return wrapScreen(
          <PaymentsScreen 
            onBack={handleBackToProfileFromPayments}
            onPurchaseComplete={handlePurchaseComplete}
          />
        );
      case 'donations':
        return wrapScreen(
          <DonationsScreen 
            onBack={handleBackToProfileFromDonations}
          />
        );
      case 'under-construction':
        return wrapScreen(
          <UnderConstructionScreen 
            onBack={handleBackToProfileFromUnderConstruction}
            featureName={currentFeatureName}
          />
        );
      
      // Экраны ментальных техник
      case 'breathing-4-7-8':
        return wrapScreen(
          <Breathing478Screen 
            onBack={handleBackFromMentalTechnique}
          />
        );
      case 'breathing-square':
        return wrapScreen(
          <SquareBreathingScreen 
            onBack={handleBackFromMentalTechnique}
          />
        );
      case 'grounding-5-4-3-2-1':
        return wrapScreen(
          <Grounding54321Screen 
            onBack={handleBackFromMentalTechnique}
          />
        );
      case 'grounding-anchor':
        return wrapScreen(
          <GroundingAnchorScreen 
            onBack={handleBackFromMentalTechnique}
          />
        );
      
      case 'reward':
        return wrapScreen(
          <RewardManager 
            earnedAchievementIds={earnedAchievementIds}
            onComplete={() => {
              setEarnedAchievementIds([]); // Очищаем достижения
              // Определяем, на какой экран вернуться, на основе истории навигации
              // Поддерживаем возврат на theme-home, all-articles или home
              const previousScreen = navigationHistory.length >= 2 
                ? navigationHistory[navigationHistory.length - 2] 
                : 'home';
              let returnScreen: AppScreen = 'home';
              if (previousScreen === 'theme-home') {
                returnScreen = 'theme-home';
              } else if (previousScreen === 'all-articles') {
                returnScreen = 'all-articles';
              }
              console.log('[Reward] Returning to screen:', returnScreen, 'previousScreen:', previousScreen);
              navigateTo(returnScreen);
            }}
            onBack={() => {
              setEarnedAchievementIds([]); // Очищаем достижения
              // Определяем, на какой экран вернуться, на основе истории навигации
              // Поддерживаем возврат на theme-home, all-articles или home
              const previousScreen = navigationHistory.length >= 2 
                ? navigationHistory[navigationHistory.length - 2] 
                : 'home';
              let returnScreen: AppScreen = 'home';
              if (previousScreen === 'theme-home') {
                returnScreen = 'theme-home';
              } else if (previousScreen === 'all-articles') {
                returnScreen = 'all-articles';
              }
              console.log('[Reward] Back button - returning to screen:', returnScreen, 'previousScreen:', previousScreen);
              navigateTo(returnScreen);
            }}
          />
        );
      
      case 'badges':
        return wrapScreen(
          <BadgesScreen 
            onBack={goBack}
          />
        );
      
      case 'all-articles':
        return wrapScreen(
          <AllArticlesScreen
            onBack={handleBackToHomeFromArticles}
            onArticleClick={handleOpenArticle}
          />
        );
      
      case 'article':
        return wrapScreen(
          <ArticleScreen
            articleId={currentArticle}
            onBack={handleBackFromArticle}
            onGoToTheme={handleGoToTheme}
            userHasPremium={userHasPremium}
            checkAndShowAchievements={checkAndShowAchievements}
            navigateTo={navigateTo}
            earnedAchievementIds={earnedAchievementIds}
            setEarnedAchievementIds={setEarnedAchievementIds}
          />
        );
      
      default:
        return wrapScreen(<OnboardingScreen01 onNext={handleNextScreen} onShowPrivacy={handleShowPrivacy} onShowTerms={handleShowTerms} />);
    }
  };

  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden overflow-x-hidden bg-[#111111] flex flex-col">
      <div className="flex-1 relative w-full h-full overflow-hidden overflow-x-hidden">
        {/* Глобальная кнопка Back для Telegram WebApp */}
        <BackButton isHomePage={isHomePage} onBack={goBack} />
        
        <div className="relative w-full h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {renderCurrentScreen()}
          </AnimatePresence>
        </div>
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
        <AchievementsProvider>
          <AppContent />
        </AchievementsProvider>
      </ContentProvider>
    </LanguageProvider>
  );
}
