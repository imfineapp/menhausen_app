// ========================================================================================
// ТИПЫ ДАННЫХ ДЛЯ ЦЕНТРАЛИЗОВАННОЙ СИСТЕМЫ УПРАВЛЕНИЯ КОНТЕНТОМ
// ========================================================================================

/**
 * Базовый интерфейс для локализованного контента
 */
export interface LocalizedContent {
  en: string;
  // Добавить другие языки по мере необходимости: ru, es, fr и т.д.
}

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
  };
  screen02: {
    title: LocalizedContent;
    benefits: LocalizedContent[];
    buttonText: LocalizedContent;
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
}

/**
 * Поддерживаемые языки
 */
export type SupportedLanguage = 'en'; // | 'ru' | 'es' | 'fr' - добавить по мере необходимости

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
}