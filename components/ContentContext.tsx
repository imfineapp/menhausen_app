// ========================================================================================
// REACT КОНТЕКСТ ДЛЯ УПРАВЛЕНИЯ КОНТЕНТОМ И ЯЗЫКОМ
// ========================================================================================

import React, { useCallback, useEffect, useState, ReactNode } from 'react';
import { useStore } from '@nanostores/react';
import { ContentContextType, SupportedLanguage, LocalizedContent, ThemeData, CardData, EmergencyCardData, SurveyScreenData, SurveyContent, MentalTechniqueData, MentalTechniquesMenuData, AppContent, BadgesContent, ArticleData, PsychologicalTestContent } from '../types/content';
import { LoadingScreen } from './LoadingScreen';
import { $language, setLanguage as setLanguageFromStore } from '@/src/stores/language.store';
import { $content, $contentError, $isContentLoading, loadContentForLanguage } from '@/src/stores/content.store';
import { loadUserStats } from '../services/userStatsService';
import { PINNED_ARTICLE_IDS } from '../utils/articlesList';
import { sortArticlesForDisplay } from '../utils/articleOrdering';
// Моки больше не используются - все тесты используют реальный контент

/** Content API backed by nanostores. Use `useContent()` from any component. */
export function useContent(): ContentContextType {
  const language = useStore($language);
  const currentLanguage = language as SupportedLanguage;

  const content = useStore($content);
  void useStore($isContentLoading);
  void useStore($contentError);

  /**
   * Изменение языка приложения
   */
  const setLanguage = useCallback((language: SupportedLanguage) => {
    setLanguageFromStore(language as 'en' | 'ru');
  }, []);

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
      subtitle: 'Please wait...',
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
    getAllThemes,
    getBadges,
    getArticle,
    getAllArticles,
    getPsychologicalTest,
    getLocalizedBadges
  };

  return contextValue;
}

/** Loading / error UI for content store — use in app shell (e.g. AppContent). */
export function ContentLoadingGate({ children }: { children: ReactNode }) {
  // Ensure `$content` has an active subscriber so its `onMount` loader runs.
  void useStore($content);
  const isLoading = useStore($isContentLoading);
  const error = useStore($contentError);
  const currentLanguage = useStore($language) as SupportedLanguage;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600">Content is unavailable: {error}</div>
          <button
            type="button"
            onClick={() => loadContentForLanguage(currentLanguage)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
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