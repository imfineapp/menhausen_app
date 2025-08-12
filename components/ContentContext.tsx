// ========================================================================================
// REACT КОНТЕКСТ ДЛЯ УПРАВЛЕНИЯ КОНТЕНТОМ И ЯЗЫКОМ
// ========================================================================================

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ContentContextType, SupportedLanguage, LocalizedContent, AppContent, ThemeData, CardData, EmergencyCardData, SurveyScreenData, SurveyContent } from '../types/content';
import { appContent } from '../data/content';

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
  // Состояние текущего языка (по умолчанию английский)
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  /**
   * Изменение языка приложения
   */
  const setLanguage = useCallback((language: SupportedLanguage) => {
    setCurrentLanguage(language);
    // Здесь можно добавить сохранение языка в localStorage
    localStorage.setItem('app-language', language);
  }, []);

  /**
   * Получение локализованного текста для текущего языка
   */
  const getLocalizedText = useCallback((text: LocalizedContent): string => {
    return text[currentLanguage] || text.en; // Fallback на английский
  }, [currentLanguage]);

  /**
   * Получение темы по ID
   */
  const getTheme = useCallback((themeId: string): ThemeData | undefined => {
    return appContent.themes[themeId];
  }, []);

  /**
   * Получение карточки по ID
   */
  const getCard = useCallback((cardId: string): CardData | undefined => {
    return appContent.cards[cardId];
  }, []);

  /**
   * Получение карточки экстренной помощи по ID
   */
  const getEmergencyCard = useCallback((cardId: string): EmergencyCardData | undefined => {
    return appContent.emergencyCards[cardId];
  }, []);

  /**
   * Получение всех карточек для конкретной темы
   */
  const getThemeCards = useCallback((themeId: string): CardData[] => {
    const theme = appContent.themes[themeId];
    if (!theme) return [];
    
    return theme.cardIds
      .map(cardId => appContent.cards[cardId])
      .filter((card): card is CardData => card !== undefined);
  }, []);

  /**
   * Получение экрана опроса по ID
   */
  const getSurveyScreen = useCallback((screenId: keyof SurveyContent): SurveyScreenData | undefined => {
    return appContent.survey[screenId];
  }, []);

  // Значение контекста
  const contextValue: ContentContextType = {
    currentLanguage,
    content: appContent,
    setLanguage,
    getLocalizedText,
    getTheme,
    getCard,
    getEmergencyCard,
    getThemeCards,
    getSurveyScreen
  };

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
      payments: getLocalizedText(content.ui.profile.payments)
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