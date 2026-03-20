// ========================================================================================
// REACT КОНТЕКСТ ДЛЯ УПРАВЛЕНИЯ КОНТЕНТОМ И ЯЗЫКОМ
// ========================================================================================

import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { useStore } from '@nanostores/react';
import { ContentContextType, SupportedLanguage, LocalizedContent, ThemeData, CardData, EmergencyCardData, SurveyScreenData, SurveyContent, MentalTechniqueData, MentalTechniquesMenuData, AppContent, UITexts, BadgesContent, ArticleData, PsychologicalTestContent } from '../types/content';
import { useLanguage } from './LanguageContext';
import { $content, $contentError, $isContentLoading, loadContentForLanguage } from '@/src/stores/content.store';
import { loadUserStats } from '../services/userStatsService';
import { PINNED_ARTICLE_IDS } from '../utils/articlesList';
import { sortArticlesForDisplay } from '../utils/articleOrdering';
// Моки больше не используются - все тесты используют реальный контент

/**
 * React контекст для централизованного управления контентом
 */
const ContentContext = createContext<ContentContextType | null>(null);

/**
 * Провайдер контента - оборачивает все приложение
 */
interface ContentProviderProps {
  children: ReactNode;
}

export function ContentProvider({ children }: ContentProviderProps) {
  // Получаем язык и функцию изменения языка из LanguageContext
  const { language, setLanguage: setLanguageFromContext } = useLanguage();
  const currentLanguage = language as SupportedLanguage;
  console.log('ContentProvider: Current language from LanguageContext:', currentLanguage);
  
  // Nanostores as the single source of truth for content loading state.
  const content = useStore($content);
  const isLoading = useStore($isContentLoading);
  const error = useStore($contentError);

  /**
   * Изменение языка приложения
   */
  const setLanguage = useCallback((language: SupportedLanguage) => {
    // Используем функцию из LanguageContext
    setLanguageFromContext(language as 'en' | 'ru');
  }, [setLanguageFromContext]);

  /**
   * Получение локализованного текста для текущего языка
   * Теперь text уже является строкой нужного языка
   */
  const getLocalizedText = useCallback((text: LocalizedContent): string => {
    return text || ''; // text уже является строкой нужного языка
  }, []);

  /**
   * Получение темы по ID
   */
  const getTheme = useCallback((themeId: string): ThemeData | undefined => {
    return content?.themes[themeId];
  }, [content]);

  /**
   * Получение карточки по ID
   */
  const getCard = useCallback((cardId: string): CardData | undefined => {
    return content?.cards[cardId];
  }, [content]);

  /**
   * Получение карточки экстренной помощи по ID
   */
  const getEmergencyCard = useCallback((cardId: string): EmergencyCardData | undefined => {
    return content?.emergencyCards[cardId];
  }, [content]);

  /**
   * Получение всех карточек для конкретной темы
   */
  const getThemeCards = useCallback((themeId: string): CardData[] => {
    const theme = content?.themes[themeId];
    if (!theme) return [];
    
    // В новой архитектуре карточки находятся внутри темы
    if (theme.cards && Array.isArray(theme.cards)) {
      return theme.cards;
    }
    
    // Fallback для старой структуры
    return theme.cardIds
      ?.map(cardId => content?.cards[cardId])
      .filter((card): card is CardData => card !== undefined) || [];
  }, [content]);

  /**
   * Получение экрана опроса по ID
   */
  const getSurveyScreen = useCallback((screenId: keyof SurveyContent): SurveyScreenData | undefined => {
    return content?.survey[screenId];
  }, [content]);

  /**
   * Получение ментальной техники по ID
   */
  const getMentalTechnique = useCallback((techniqueId: string): MentalTechniqueData | undefined => {
    return content?.mentalTechniques[techniqueId];
  }, [content]);

  /**
   * Получение ментальных техник по категории
   */
  const getMentalTechniquesByCategory = useCallback((category: string): MentalTechniqueData[] => {
    if (!content?.mentalTechniques) return [];
    return Object.values(content.mentalTechniques)
      .filter(technique => technique.category === category);
  }, [content]);

  /**
   * Получение меню ментальных техник
   */
  const getMentalTechniquesMenu = useCallback((): MentalTechniquesMenuData => {
    return content?.mentalTechniquesMenu || {
      title: 'Techniques',
      subtitle: 'Loading...',
      categories: {
        emergency: {
          title: 'Emergency',
          description: '1-2 min',
          techniqueIds: []
        },
        breathing: {
          title: 'Breathing',
          description: '3-5 min',
          techniqueIds: []
        },
        stabilization: {
          title: 'Stabilization',
          description: '5-10 min',
          techniqueIds: []
        },
        recovery: {
          title: 'Recovery',
          description: '10-20 min',
          techniqueIds: []
        }
      }
    };
  }, [content]);

  /**
   * Получение UI текстов
   */
  const getUI = useCallback((): UITexts => {
    if (content?.ui) {
      return content.ui;
    }
    
    // Fallback UI с правильными типами
    return {
      navigation: {
        back: 'Back',
        next: 'Next',
        skip: 'Skip',
        complete: 'Complete',
        continue: 'Continue',
        send: 'Send',
        start: 'Start',
        unlock: 'Unlock',
        previous: 'Previous',
        morePages: 'More pages',
        more: 'More'
      },
      common: {
        loading: 'Loading...',
        error: 'Error',
        tryAgain: 'Try again',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        loadingQuestions: 'Loading questions...',
        loadingFinalMessage: 'Loading final message...',
        errorLoadingMessageData: 'Error loading message data'
      },
      home: {
        greeting: 'Hello',
        checkInPrompt: 'How are you?',
        quickHelpTitle: 'Quick help',
        themesTitle: 'Themes',
        howAreYou: 'How are you?',
        checkInDescription: 'Check in with yourself — it\'s the first step to self-care! Do it everyday.',
        checkInButton: 'Send',
        checkInInfo: {
          title: 'Why daily check-in matters?',
          content: 'Daily check-in is a simple yet powerful tool for improving your mental health. Here\'s why it\'s important:\n\n• Self-awareness: Regular emotional check-ins help you better understand your feelings and reactions\n\n• Early detection: Allows you to notice mood changes before they become serious problems\n\n• Care habit: Forms a beneficial habit of paying attention to your psychological state\n\n• Progress tracking: Helps track changes in your emotional state over time\n\n• Motivation: Understanding your emotions is the first step to managing them and improving your quality of life\n\nJust a few minutes a day can significantly impact your overall well-being.'
        },
        whatWorriesYou: 'What worries you?',
        heroTitle: 'Welcome back! #MNHSNDEV', // Dynamic: Telegram user ID or development fallback
        level: 'Level',
        progress: 'Progress',
        use80PercentUsers: 'Use 80% users',
        themeMatchPercentage: 'Matches you {percentage}%',
        activity: {
          title: 'Activity',
          streak: '4 days',
          description: 'Only by doing exercises regularly will you achieve results.',
          streakLabel: 'days streak',
          progressLabel: 'Progress',
          weeklyCheckins: 'Weekly check-ins'
        },
        emergencyHelp: {
          breathing: {
            title: 'Emergency breathing patterns',
            description: 'Calm your mind with guided breathing exercises for immediate relief.'
          },
          meditation: {
            title: 'Quick meditation techniques',
            description: 'Calm your mind with guided meditation exercises for immediate relief.'
          },
          grounding: {
            title: 'Grounding techniques',
            description: 'Ground yourself in the present moment with proven techniques.'
          }
        }
      },
      profile: {
        title: 'Profile',
        aboutApp: 'About',
        privacy: 'Privacy',
        terms: 'Terms',
        deleteAccount: 'Delete account',
        payments: 'Payments',
        heroTitle: 'Welcome back! #MNHSNDEV', // Dynamic: Telegram user ID or development fallback
        level: 'Level',
        premium: 'Premium',
        free: 'Free',
        openProfile: 'Open user profile',
        status: 'Status',
        yourActivity: 'Your activity',
        heatmap: {
          checkinAndExercise: 'Check-in + {count} exercise',
          checkinAndExercisePlural: 'Check-in + {count} exercises',
          checkinOnly: 'Check-in only',
          noActivity: 'No activity'
        }
      },
      survey: {
        progress: 'Step {current} of {total}',
        selectAtLeastOne: 'Select at least one',
        optional: 'Optional',
        required: 'Required'
      },
      onboarding: {
        screen01: {
          title: 'Welcome',
          subtitle: 'Get started',
          buttonText: 'Next',
          privacyText: 'Privacy',
          termsText: 'Terms',
          agreementText: 'By clicking'
        },
        screen02: {
          title: 'Benefits',
          benefits: ['Benefit 1'],
          buttonText: 'Start',
          descriptions: ['Description 1']
        }
      },
      pinSetup: {
        title: 'PIN Setup',
        subtitle: 'Create PIN',
        createPin: 'Create PIN',
        confirmPin: 'Confirm PIN',
        pinMismatch: 'PIN mismatch',
        pinTooShort: 'PIN too short',
        skip: 'Skip',
        back: 'Back'
      },
      checkin: {
        title: 'Check-in',
        subtitle: 'How are you?',
        moodOptions: {
          down: 'Down',
          anxious: 'Anxious',
          neutral: 'Neutral',
          energized: 'Energized',
          happy: 'Happy'
        },
        send: 'Send',
        back: 'Back'
      },
      themes: {
        welcome: {
          title: 'Theme Welcome',
          subtitle: 'Welcome to theme',
          start: 'Start',
          unlock: 'Unlock',
          freeWarning: {
            title: 'Important Warning',
            text: 'Cards in the free version have not yet been validated by a psychologist and are placed only as an example (prototype). All responsibility for consequences arising after completing this technique lies with the user. By clicking the button, you confirm that you understand all risks and take them upon yourself.'
          }
        },
        home: {
          progress: 'Progress',
          attempts: 'Attempts',
          attemptsCounter: 'attempts',
          level: 'Level',
          nextLevel: 'Next Level'
        }
      },
      cards: {
        attempts: 'Attempts',
        noAttempts: 'No attempts yet. Start your first attempt by opening the card!',
        startExercise: 'Ready to start the exercise?',
        welcome: {
          subtitle: 'Welcome to card'
        },
        question: {
          placeholder: 'Enter your answer',
          encryption: 'Your answer is encrypted'
        },
        final: {
          why: 'Mechanism:'
        },
        rating: {
          title: 'Rate Card',
          subtitle: 'How was it?',
          placeholder: 'Share your thoughts',
          submit: 'Submit',
          thankYou: 'Thank you!',
          skipRating: "I don't want to answer"
        },
        themeHome: {
          card1: 'Card #1',
          card2: 'Card #2',
          card3: 'Card #3',
          card4: 'Card #4',
          card5: 'Card #5',
          card6: 'Card #6',
          card7: 'Card #7',
          card8: 'Card #8',
          card9: 'Card #9',
          card10: 'Card #10',
          level1: 'Level 1',
          level2: 'Level 2',
          level3: 'Level 3',
          level4: 'Level 4',
          level5: 'Level 5',
          description: 'Card description'
        },
        questionNotFound: 'Question not found',
        techniqueNotFound: 'Technique not found',
        practiceTaskNotFound: 'Practice task not found',
        explanationNotFound: 'Explanation not found',
        fallbackTitle: 'Card',
        fallbackDescription: 'Card description will be available soon.'
      },
      levels: {
        title: 'Levels',
        yourLevel: 'Your Level',
        toNextLevel: 'To Next Level',
        pointsHistory: 'Points History',
        actions: {
          dailyCheckin: 'Daily Check-in',
          exerciseComplete: 'Exercise Complete',
          achievementEarned: 'Achievement Earned'
        }
      },
      deleteAccount: {
        title: 'Danger zone',
        description: 'In this section you can delete all information about yourself and your account from the application',
        warning: 'By clicking the button I understand that all data about me will be deleted without the possibility of return',
        button: 'Delete',
        buttonDeleting: 'Deleting...',
        confirmTitle: 'Are you sure?',
        confirmMessage: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
        successTitle: 'Account deleted',
        successMessage: 'Your account has been successfully deleted. You will be redirected to the welcome screen.',
        errorTitle: 'Error',
        errorMessage: 'An error occurred while deleting your account. Please try again.'
      },
        about: {
          title: 'About Menhausen',
          description: 'Menhausen is your personal mental health companion, created specifically for Telegram.\n\nOur app helps you track your emotional state, develop healthy habits, and support your psychological well-being through daily check-ins and mindful exercises.\n\nKey features:\n• Daily mood tracking and emotional state monitoring\n• Personalized mental health exercises\n• Progress tracking with levels and achievements\n• Complete privacy — your data stays yours\n• Telegram Mini Apps integration\n\nMenhausen uses scientifically proven methods from cognitive behavioral therapy (CBT), acceptance and commitment therapy (ACT), and positive psychology to help you cope with anxiety, stress, and other emotional challenges.\n\nThe app is developed by a team of mental health and technology specialists who believe that psychological well-being care should be accessible, convenient, and effective for everyone.\n\nMade with ❤️ for the Telegram community.',
        keyFeatures: 'Key Features',
        features: {
          moodTracking: 'Daily mood tracking and emotional check-ins',
          exercises: 'Personalized mental health exercises and activities',
          progress: 'Progress tracking with levels and achievements',
          privacy: 'Secure and private - your data stays yours',
          telegram: 'Built specifically for Telegram Mini Apps'
        },
        developmentTeam: 'Development Team',
        teamDescription: 'Created with care by a dedicated team of developers and mental health advocates. Our mission is to make mental wellness accessible and engaging for everyone.',
        madeWithLove: 'Made with ❤️ for the Telegram community',
        copyright: '© 2024 Menhausen Team. All rights reserved.',
        technicalInformation: 'Technical Information',
        importantNote: 'Important Note',
        disclaimer: 'Menhausen is designed to support your mental wellness journey, but it is not a substitute for professional medical advice, diagnosis, or treatment. If you\'re experiencing serious mental health concerns, please consult with qualified healthcare professionals.',
        emergency: 'For emergencies, please contact your local emergency services or mental health crisis hotline.',
        version: 'Version:',
        platform: 'Platform:',
        builtWith: 'Built with:',
        lastUpdated: 'Last updated:'
      }
    };
  }, [content]);

  /**
   * Получение всех тем
   */
  const getAllThemes = useCallback((): ThemeData[] => {
    if (!content?.themes) return [];
    return Object.values(content.themes);
  }, [content]);

  /**
   * Получение статьи по ID
   */
  const getArticle = useCallback((articleId: string): ArticleData | undefined => {
    return content?.articles?.[articleId];
  }, [content]);

  /**
   * Получение всех статей, отсортированных по order
   */
  const getAllArticles = useCallback((): ArticleData[] => {
    if (!content?.articles) return [];
    const articles = Object.values(content.articles);
    return articles.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [content]);

  /**
   * Получение контента психологического теста
   */
  const getPsychologicalTest = useCallback((): PsychologicalTestContent | undefined => {
    return content?.psychologicalTest;
  }, [content]);

  /**
   * Получение всех ментальных техник
   */
  const getMentalTechniques = useCallback((): MentalTechniqueData[] => {
    if (!content?.mentalTechniques) return [];
    return Object.values(content.mentalTechniques);
  }, [content]);

  /**
   * Получение контента достижений
   */
  const getBadges = useCallback((): BadgesContent => {
    if (!content?.badges) {
      // Fallback контент для достижений
      return {
        title: 'Achievements',
        subtitle: 'Your mental health progress',
        congratulations: 'Congratulations!',
        unlockedBadge: 'You unlocked a new achievement!',
        shareButton: 'Share',
        shareMessage: 'I got a new achievement in Menhausen! 🎉',
        shareDescription: 'Join me in caring for mental health',
        appLink: 'https://t.me/menhausen_bot/app',
        lockedBadge: 'Locked',
        unlockCondition: 'Unlock condition:',
        progress: 'Progress',
        totalBadges: 'Total achievements',
        unlockedCount: 'Unlocked',
        inProgress: 'In Progress',
        points: 'points',
        motivatingText: 'Your dedication helped you get a new achievement! Keep up the great work!',
        motivatingTextNoBadges: 'Start your journey to mental well-being. Every day is a new opportunity for growth.',
        received: 'Received',
        locked: 'Locked',
        cancel: 'Cancel',
        unlocked: 'Unlocked',
        reward: {
          title: 'Congratulations!',
          subtitle: 'You earned an achievement!',
          continueButton: 'Continue',
          nextAchievement: 'Next Achievement',
          congratulations: 'Great!',
          earnedAchievement: 'You earned an achievement'
        },
        achievements: {}
      };
    }
    return content.badges;
  }, [content]);

  /**
   * Получение локализованных текстов достижений
   */
  const getLocalizedBadges = useCallback(() => {
    const badgesContent = getBadges();
    
    return {
      title: getLocalizedText(badgesContent.title),
      subtitle: getLocalizedText(badgesContent.subtitle),
      congratulations: getLocalizedText(badgesContent.congratulations),
      unlockedBadge: getLocalizedText(badgesContent.unlockedBadge),
      shareButton: getLocalizedText(badgesContent.shareButton),
      shareMessage: getLocalizedText(badgesContent.shareMessage),
      shareDescription: getLocalizedText(badgesContent.shareDescription),
      appLink: getLocalizedText(badgesContent.appLink),
      lockedBadge: getLocalizedText(badgesContent.lockedBadge),
      unlockCondition: getLocalizedText(badgesContent.unlockCondition),
      progress: getLocalizedText(badgesContent.progress),
      totalBadges: getLocalizedText(badgesContent.totalBadges),
      unlockedCount: getLocalizedText(badgesContent.unlockedCount),
      inProgress: getLocalizedText(badgesContent.inProgress),
      points: getLocalizedText(badgesContent.points),
      motivatingText: getLocalizedText(badgesContent.motivatingText),
      motivatingTextNoBadges: getLocalizedText(badgesContent.motivatingTextNoBadges),
      received: getLocalizedText(badgesContent.received),
      locked: getLocalizedText(badgesContent.locked),
      cancel: getLocalizedText(badgesContent.cancel),
      unlocked: getLocalizedText(badgesContent.unlocked),
      reward: {
        title: getLocalizedText(badgesContent.reward.title),
        subtitle: getLocalizedText(badgesContent.reward.subtitle),
        continueButton: getLocalizedText(badgesContent.reward.continueButton),
        nextAchievement: getLocalizedText(badgesContent.reward.nextAchievement),
        congratulations: getLocalizedText(badgesContent.reward.congratulations),
        earnedAchievement: getLocalizedText(badgesContent.reward.earnedAchievement)
      },
      achievements: Object.keys(badgesContent.achievements).reduce((acc, key) => {
        const achievement = badgesContent.achievements[key];
        if (achievement) {
          acc[key] = {
            title: getLocalizedText(achievement.title),
            description: getLocalizedText(achievement.description)
          };
        }
        return acc;
      }, {} as Record<string, { title: string; description: string }>)
    };
  }, [getBadges, getLocalizedText]);

  // Значение контекста
  const contextValue: ContentContextType = {
    currentLanguage,
    content: content || {} as AppContent, // Fallback на пустой объект
    setLanguage,
    getLocalizedText,
    getTheme,
    getCard,
    getEmergencyCard,
    getThemeCards,
    getSurveyScreen,
    getMentalTechnique,
    getMentalTechniques,
    getMentalTechniquesByCategory,
    getMentalTechniquesMenu,
    getUI,
    getAllThemes,
    getBadges,
    getArticle,
    getAllArticles,
    getPsychologicalTest,
    getLocalizedBadges
  };

  // E2E тесты теперь используют реальный контент из JSON файлов

  // Показываем загрузку или ошибку
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading content...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600">Error loading content: {error}</div>
          <button 
            onClick={() => loadContentForLanguage(currentLanguage)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
}

/**
 * Хук для использования контента в компонентах
 * Автоматически получает локализованные тексты
 */
export function useContent() {
  const context = useContext(ContentContext);
  
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  
  return context;
}

/**
 * Удобный хук для получения UI текстов
 */
export function useUIText() {
  const { content, getLocalizedText } = useContent();
  
  return {
    navigation: {
      back: getLocalizedText(content.ui.navigation.back),
      next: getLocalizedText(content.ui.navigation.next),
      skip: getLocalizedText(content.ui.navigation.skip),
      complete: getLocalizedText(content.ui.navigation.complete),
      continue: getLocalizedText(content.ui.navigation.continue)
    },
    common: {
      loading: getLocalizedText(content.ui.common.loading),
      error: getLocalizedText(content.ui.common.error),
      tryAgain: getLocalizedText(content.ui.common.tryAgain),
      save: getLocalizedText(content.ui.common.save),
      cancel: getLocalizedText(content.ui.common.cancel),
      delete: getLocalizedText(content.ui.common.delete),
      edit: getLocalizedText(content.ui.common.edit)
    },
    home: {
      greeting: getLocalizedText(content.ui.home.greeting),
      checkInPrompt: getLocalizedText(content.ui.home.checkInPrompt),
      quickHelpTitle: getLocalizedText(content.ui.home.quickHelpTitle),
      themesTitle: getLocalizedText(content.ui.home.themesTitle)
    },
    profile: {
      title: getLocalizedText(content.ui.profile.title),
      aboutApp: getLocalizedText(content.ui.profile.aboutApp),
      privacy: getLocalizedText(content.ui.profile.privacy),
      terms: getLocalizedText(content.ui.profile.terms),
      deleteAccount: getLocalizedText(content.ui.profile.deleteAccount),
      payments: getLocalizedText(content.ui.profile.payments),
      openProfile: getLocalizedText(content.ui.profile.openProfile || '')
    },
    survey: {
      progress: getLocalizedText(content.ui.survey.progress),
      selectAtLeastOne: getLocalizedText(content.ui.survey.selectAtLeastOne),
      optional: getLocalizedText(content.ui.survey.optional),
      required: getLocalizedText(content.ui.survey.required)
    }
  };
}

/**
 * Хук для работы с контентом конкретной темы
 */
export function useTheme(themeId: string) {
  const { getTheme, getThemeCards, getLocalizedText } = useContent();
  
  const theme = getTheme(themeId);
  const cards = getThemeCards(themeId);
  
  if (!theme) {
    return null;
  }
  
  return {
    theme,
    cards,
    localizedTheme: {
      title: getLocalizedText(theme.title),
      description: getLocalizedText(theme.description),
      welcomeMessage: getLocalizedText(theme.welcomeMessage)
    }
  };
}

/**
 * Хук для работы с контентом конкретной карточки
 */
export function useCard(cardId: string) {
  const { getCard, getLocalizedText } = useContent();
  
  const card = getCard(cardId);
  
  if (!card) {
    return null;
  }
  
  return {
    card,
    localizedCard: {
      title: getLocalizedText(card.title),
      description: getLocalizedText(card.description),
      welcomeMessage: getLocalizedText(card.welcomeMessage),
      duration: getLocalizedText(card.duration),
      questions: card.questions.map(q => ({
        id: q.id,
        text: getLocalizedText(q.text),
        placeholder: q.placeholder ? getLocalizedText(q.placeholder) : undefined,
        helpText: q.helpText ? getLocalizedText(q.helpText) : undefined
      })),
      finalMessage: {
        message: getLocalizedText(card.finalMessage.message),
        practiceTask: getLocalizedText(card.finalMessage.practiceTask),
        whyExplanation: getLocalizedText(card.finalMessage.whyExplanation)
      }
    }
  };
}

/**
 * Хук для работы с карточками экстренной помощи
 */
export function useEmergencyCards() {
  const { content, getLocalizedText } = useContent();
  
  const emergencyCards = Object.values(content.emergencyCards).map(card => ({
    ...card,
    title: getLocalizedText(card.title),
    description: getLocalizedText(card.description)
  }));
  
  return emergencyCards;
}

/**
 * Хук для работы с экранами опроса
 */
export function useSurveyScreen(screenId: keyof SurveyContent) {
  const { getSurveyScreen, getLocalizedText } = useContent();
  
  const screen = getSurveyScreen(screenId);
  
  if (!screen) {
    return null;
  }
  
  return {
    screen,
    localizedScreen: {
      title: getLocalizedText(screen.title),
      subtitle: screen.subtitle ? getLocalizedText(screen.subtitle) : undefined,
      buttonText: getLocalizedText(screen.buttonText),
      skipText: screen.skipText ? getLocalizedText(screen.skipText) : undefined,
      placeholder: screen.placeholder ? getLocalizedText(screen.placeholder) : undefined,
      helpText: screen.helpText ? getLocalizedText(screen.helpText) : undefined,
      options: screen.options?.map(option => ({
        id: option.id,
        text: getLocalizedText(option.text),
        isMultipleChoice: option.isMultipleChoice
      }))
    }
  };
}

/**
 * Хук для работы с ментальными техниками
 */
export function useMentalTechnique(techniqueId: string) {
  const { getMentalTechnique, getLocalizedText } = useContent();
  
  const technique = getMentalTechnique(techniqueId);
  
  if (!technique) {
    return null;
  }
  
  return {
    technique,
    localizedTechnique: {
      title: getLocalizedText(technique.title),
      subtitle: getLocalizedText(technique.subtitle),
      duration: getLocalizedText(technique.duration),
      steps: technique.steps.map(step => ({
        ...step,
        instruction: getLocalizedText(step.instruction),
        placeholder: step.placeholder ? getLocalizedText(step.placeholder) : undefined
      })),
      tips: technique.tips.map(tip => getLocalizedText(tip)),
      accordionItems: technique.accordionItems.map(item => ({
        title: getLocalizedText(item.title),
        content: getLocalizedText(item.content)
      }))
    }
  };
}

/**
 * Хук для работы с ментальными техниками по категории
 */
export function useMentalTechniquesByCategory(category: string) {
  const { getMentalTechniquesByCategory, getLocalizedText } = useContent();
  
  const techniques = getMentalTechniquesByCategory(category);
  
  return techniques.map(technique => ({
    ...technique,
    title: getLocalizedText(technique.title),
    subtitle: getLocalizedText(technique.subtitle),
    duration: getLocalizedText(technique.duration)
  }));
}

/**
 * Хук для работы с меню ментальных техник
 */
export function useMentalTechniquesMenu() {
  const { getMentalTechniquesMenu, getLocalizedText } = useContent();
  
  const menu = getMentalTechniquesMenu();
  
  return {
    menu,
    localizedMenu: {
      title: getLocalizedText(menu.title),
      subtitle: getLocalizedText(menu.subtitle),
      categories: {
        emergency: {
          title: getLocalizedText(menu.categories.emergency.title),
          description: getLocalizedText(menu.categories.emergency.description),
          techniqueIds: menu.categories.emergency.techniqueIds
        },
        breathing: {
          title: getLocalizedText(menu.categories.breathing.title),
          description: getLocalizedText(menu.categories.breathing.description),
          techniqueIds: menu.categories.breathing.techniqueIds
        },
        stabilization: {
          title: getLocalizedText(menu.categories.stabilization.title),
          description: getLocalizedText(menu.categories.stabilization.description),
          techniqueIds: menu.categories.stabilization.techniqueIds
        },
        recovery: {
          title: getLocalizedText(menu.categories.recovery.title),
          description: getLocalizedText(menu.categories.recovery.description),
          techniqueIds: menu.categories.recovery.techniqueIds
        }
      }
    }
  };
}

/**
 * Хук для получения всех статей
 */
export function useArticles() {
  const { getAllArticles, getLocalizedText } = useContent();

  const [readArticleIdsSnapshot, setReadArticleIdsSnapshot] = useState<string[]>(() => {
    const stats = loadUserStats();
    return Array.isArray(stats.readArticleIds) ? stats.readArticleIds : [];
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== 'menhausen_user_stats') return;
      const stats = loadUserStats();
      setReadArticleIdsSnapshot(Array.isArray(stats.readArticleIds) ? stats.readArticleIds : []);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const articles = getAllArticles();
  const sorted = sortArticlesForDisplay({
    articles,
    readArticleIds: readArticleIdsSnapshot,
    pinnedArticleIds: PINNED_ARTICLE_IDS,
  });

  return sorted.map(article => ({
    id: article.id,
    title: getLocalizedText(article.title),
    preview: getLocalizedText(article.preview),
    content: getLocalizedText(article.content),
    relatedThemeIds: article.relatedThemeIds,
    order: article.order || 0
  }));
}

/**
 * Хук для получения конкретной статьи
 */
export function useArticle(articleId: string) {
  const { getArticle, getLocalizedText } = useContent();
  
  const article = getArticle(articleId);
  
  if (!article) {
    return null;
  }
  
  return {
    id: article.id,
    title: getLocalizedText(article.title),
    preview: getLocalizedText(article.preview),
    content: getLocalizedText(article.content),
    relatedThemeIds: article.relatedThemeIds,
    order: article.order || 0
  };
}