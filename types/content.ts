// ========================================================================================
// ТИПЫ ДАННЫХ ДЛЯ ЦЕНТРАЛИЗОВАННОЙ СИСТЕМЫ УПРАВЛЕНИЯ КОНТЕНТОМ
// ========================================================================================

/**
 * Базовый тип для локализованного контента
 * Теперь это просто строка, так как каждый язык в отдельном файле
 */
export type LocalizedContent = string;

/**
 * Данные темы (категории упражнений)
 */
export interface ThemeData {
  id: string;
  title: LocalizedContent;
  description: LocalizedContent;
  welcomeMessage: LocalizedContent;
  isPremium: boolean;
  cardIds: string[]; // Связанные карточки
}

/**
 * Данные вопроса для упражнений
 */
export interface QuestionData {
  id: string;
  text: LocalizedContent;
  placeholder?: LocalizedContent;
  helpText?: LocalizedContent;
}

/**
 * Итоговое сообщение после завершения упражнения
 */
export interface FinalMessageData {
  message: LocalizedContent;
  practiceTask: LocalizedContent;
  whyExplanation: LocalizedContent;
}

/**
 * Полные данные карточки с уникальным контентом
 */
export interface CardData {
  id: string;
  title: LocalizedContent;
  description: LocalizedContent;
  welcomeMessage: LocalizedContent;
  duration: LocalizedContent; // "5-10 min"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: QuestionData[];
  finalMessage: FinalMessageData;
  isPremium: boolean;
  themeId: string;
}

/**
 * Карточка экстренной помощи
 */
export interface EmergencyCardData {
  id: string;
  title: LocalizedContent;
  description: LocalizedContent;
  actionUrl?: string;
  isPremium: boolean;
}

/**
 * Контент экранов онбординга
 */
export interface OnboardingContent {
  screen01: {
    title: LocalizedContent;
    subtitle: LocalizedContent;
    buttonText: LocalizedContent;
    privacyText: LocalizedContent;
    termsText: LocalizedContent;
    agreementText: LocalizedContent;
  };
  screen02: {
    title: LocalizedContent;
    benefits: LocalizedContent[];
    buttonText: LocalizedContent;
    descriptions: LocalizedContent[];
  };
}

/**
 * Опция выбора в опросе
 */
export interface SurveyOption {
  id: string;
  text: LocalizedContent;
  isMultipleChoice?: boolean;
}

/**
 * Экран опроса с вопросом и опциями
 */
export interface SurveyScreenData {
  id: string;
  step: number;
  totalSteps: number;
  title: LocalizedContent;
  subtitle?: LocalizedContent;
  questionType: 'single-choice' | 'multiple-choice' | 'text-input';
  options?: SurveyOption[];
  placeholder?: LocalizedContent;
  helpText?: LocalizedContent;
  buttonText: LocalizedContent;
  skipAllowed?: boolean;
  skipText?: LocalizedContent;
}

/**
 * Контент системы опроса (5 экранов)
 */
export interface SurveyContent {
  screen01: SurveyScreenData;
  screen02: SurveyScreenData;
  screen03: SurveyScreenData;
  screen04: SurveyScreenData;
  screen05: SurveyScreenData;
}

/**
 * Результаты опроса пользователя
 */
export interface SurveyResults {
  screen01: string[]; // выбранные ID опций или текст
  screen02: string[];
  screen03: string[];
  screen04: string[];
  screen05: string[];
  completedAt: string; // ISO timestamp
  userId?: string;
}

/**
 * Общие UI тексты
 */
export interface UITexts {
  navigation: {
    back: LocalizedContent;
    next: LocalizedContent;
    skip: LocalizedContent;
    complete: LocalizedContent;
    continue: LocalizedContent;
    send: LocalizedContent;
    start: LocalizedContent;
    unlock: LocalizedContent;
  };
  common: {
    loading: LocalizedContent;
    error: LocalizedContent;
    tryAgain: LocalizedContent;
    save: LocalizedContent;
    cancel: LocalizedContent;
    delete: LocalizedContent;
    edit: LocalizedContent;
  };
  home: {
    greeting: LocalizedContent;
    checkInPrompt: LocalizedContent;
    quickHelpTitle: LocalizedContent;
    themesTitle: LocalizedContent;
    howAreYou: LocalizedContent;
    checkInDescription: LocalizedContent;
    whatWorriesYou: LocalizedContent;
  };
  profile: {
    title: LocalizedContent;
    aboutApp: LocalizedContent;
    privacy: LocalizedContent;
    terms: LocalizedContent;
    deleteAccount: LocalizedContent;
    payments: LocalizedContent;
  };
  survey: {
    progress: LocalizedContent; // "Step {current} of {total}"
    selectAtLeastOne: LocalizedContent;
    optional: LocalizedContent;
    required: LocalizedContent;
  };
  onboarding: {
    screen01: {
      title: LocalizedContent;
      subtitle: LocalizedContent;
      buttonText: LocalizedContent;
      privacyText: LocalizedContent;
      termsText: LocalizedContent;
      agreementText: LocalizedContent;
    };
    screen02: {
      title: LocalizedContent;
      benefits: LocalizedContent[];
      buttonText: LocalizedContent;
      descriptions: LocalizedContent[];
    };
  };
  pinSetup: {
    title: LocalizedContent;
    subtitle: LocalizedContent;
    createPin: LocalizedContent;
    confirmPin: LocalizedContent;
    pinMismatch: LocalizedContent;
    pinTooShort: LocalizedContent;
    skip: LocalizedContent;
    back: LocalizedContent;
  };
  checkin: {
    title: LocalizedContent;
    subtitle: LocalizedContent;
    moodOptions: {
      down: LocalizedContent;
      anxious: LocalizedContent;
      neutral: LocalizedContent;
      energized: LocalizedContent;
      happy: LocalizedContent;
    };
    send: LocalizedContent;
    back: LocalizedContent;
  };
  themes: {
    welcome: {
      title: LocalizedContent;
      subtitle: LocalizedContent;
      start: LocalizedContent;
      unlock: LocalizedContent;
    };
    home: {
      progress: LocalizedContent;
      checkins: LocalizedContent;
      level: LocalizedContent;
      nextLevel: LocalizedContent;
    };
  };
  cards: {
    checkins: LocalizedContent;
    welcome: {
      subtitle: LocalizedContent;
    };
    question: {
      placeholder: LocalizedContent;
      encryption: LocalizedContent;
    };
    final: {
      why: LocalizedContent;
    };
    rating: {
      title: LocalizedContent;
      subtitle: LocalizedContent;
      placeholder: LocalizedContent;
      submit: LocalizedContent;
    };
    themeHome: {
      card1: LocalizedContent;
      card2: LocalizedContent;
      card3: LocalizedContent;
      card4: LocalizedContent;
      card5: LocalizedContent;
      card6: LocalizedContent;
      card7: LocalizedContent;
      card8: LocalizedContent;
      card9: LocalizedContent;
      card10: LocalizedContent;
      level1: LocalizedContent;
      level2: LocalizedContent;
      level3: LocalizedContent;
      level4: LocalizedContent;
      level5: LocalizedContent;
      description: LocalizedContent;
    };
  };
}

/**
 * Шаг ментальной техники
 */
export interface TechniqueStep {
  step: number;
  instruction: LocalizedContent;
  duration: number; // в секундах
  visual?: 'breathing' | 'square' | 'grounding' | 'body-scan';
  input?: 'text' | 'checkbox' | 'none';
  placeholder?: LocalizedContent;
}

/**
 * Элемент аккордеона с дополнительной информацией
 */
export interface AccordionItem {
  title: LocalizedContent;
  content: LocalizedContent;
}

/**
 * Данные ментальной техники
 */
export interface MentalTechniqueData {
  id: string;
  title: LocalizedContent;
  subtitle: LocalizedContent;
  duration: LocalizedContent; // "5 минут"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  emergencyLevel: 'critical' | 'high' | 'medium' | 'low';
  category: 'breathing' | 'grounding' | 'meditation' | 'relaxation';
  steps: TechniqueStep[];
  tips: LocalizedContent[];
  accordionItems: AccordionItem[];
  isPremium: boolean;
}

/**
 * Контент для меню ментальных техник
 */
export interface MentalTechniquesMenuData {
  title: LocalizedContent;
  subtitle: LocalizedContent;
  categories: {
    emergency: {
      title: LocalizedContent;
      description: LocalizedContent;
      techniqueIds: string[];
    };
    breathing: {
      title: LocalizedContent;
      description: LocalizedContent;
      techniqueIds: string[];
    };
    stabilization: {
      title: LocalizedContent;
      description: LocalizedContent;
      techniqueIds: string[];
    };
    recovery: {
      title: LocalizedContent;
      description: LocalizedContent;
      techniqueIds: string[];
    };
  };
}

/**
 * Полная структура контента приложения
 */
export interface AppContent {
  themes: Record<string, ThemeData>;
  cards: Record<string, CardData>;
  emergencyCards: Record<string, EmergencyCardData>;
  onboarding: OnboardingContent;
  survey: SurveyContent;
  ui: UITexts;
  mentalTechniques: Record<string, MentalTechniqueData>;
  mentalTechniquesMenu: MentalTechniquesMenuData;
}

/**
 * Поддерживаемые языки
 */
export type SupportedLanguage = 'en' | 'ru';

/**
 * Контекст для управления языком и контентом
 */
export interface ContentContextType {
  currentLanguage: SupportedLanguage;
  content: AppContent;
  setLanguage: (language: SupportedLanguage) => void;
  getLocalizedText: (text: LocalizedContent) => string;
  getTheme: (themeId: string) => ThemeData | undefined;
  getCard: (cardId: string) => CardData | undefined;
  getEmergencyCard: (cardId: string) => EmergencyCardData | undefined;
  getThemeCards: (themeId: string) => CardData[];
  getSurveyScreen: (screenId: keyof SurveyContent) => SurveyScreenData | undefined;
  getMentalTechnique: (techniqueId: string) => MentalTechniqueData | undefined;
  getMentalTechniques: () => MentalTechniqueData[];
  getMentalTechniquesByCategory: (category: string) => MentalTechniqueData[];
  getMentalTechniquesMenu: () => MentalTechniquesMenuData;
  getUI: () => UITexts;
  getAllThemes: () => ThemeData[];
}