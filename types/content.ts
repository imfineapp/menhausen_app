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
  cardIds?: string[]; // Связанные карточки (для старой архитектуры)
  cards?: CardData[]; // Карточки темы (для новой архитектуры)
  order?: number; // Порядок сортировки из имени файла (01, 02, и т.д.)
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
 * Контент системы опроса (6 экранов)
 */
export interface SurveyContent {
  screen01: SurveyScreenData;
  screen02: SurveyScreenData;
  screen03: SurveyScreenData;
  screen04: SurveyScreenData;
  screen05: SurveyScreenData;
  screen06: SurveyScreenData;
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
  screen06: string[];
  completedAt: string; // ISO timestamp
  userId?: string;
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
 * Контент для страницы "О приложении"
 */
export interface AboutContent {
  title: LocalizedContent;
  description: LocalizedContent;
  keyFeatures: LocalizedContent;
  features: {
    moodTracking: LocalizedContent;
    exercises: LocalizedContent;
    progress: LocalizedContent;
    privacy: LocalizedContent;
    telegram: LocalizedContent;
  };
  developmentTeam: LocalizedContent;
  teamDescription: LocalizedContent;
  madeWithLove: LocalizedContent;
  copyright: LocalizedContent;
  technicalInformation: LocalizedContent;
  importantNote: LocalizedContent;
  disclaimer: LocalizedContent;
  emergency: LocalizedContent;
  version: LocalizedContent;
  platform: LocalizedContent;
  builtWith: LocalizedContent;
  lastUpdated: LocalizedContent;
}

export interface LegalSection {
  title: LocalizedContent;
  paragraphs: LocalizedContent[];
  bullets?: LocalizedContent[];
}

export interface LegalContent {
  privacyPolicy: {
    title: LocalizedContent;
    effectiveDate: LocalizedContent;
    lastUpdated: LocalizedContent;
    intro: LocalizedContent[];
    sections: {
      noPii: LegalSection;
      dataCollection: LegalSection;
      telegramIntegration: LegalSection;
      contact: LegalSection;
    };
    closing: LocalizedContent;
  };
  termsOfUse: {
    title: LocalizedContent;
    lastUpdated: LocalizedContent;
    warning: LocalizedContent;
    intro: LocalizedContent;
    sections: {
      legalDisclaimer: LegalSection;
      noWarranty: LegalSection;
      eligibility: LegalSection;
      privacy: LegalSection;
      contact: LegalSection;
    };
    closing: LocalizedContent;
  };
}

/**
 * Данные статьи
 */
export interface ArticleData {
  id: string;
  title: LocalizedContent;
  preview: LocalizedContent;
  content: LocalizedContent;
  relatedThemeIds: string[];
  order?: number;
}

/**
 * Коллекция статей
 */
export interface ArticlesCollection {
  [articleId: string]: ArticleData;
}

/**
 * Контент психологического теста
 */
export interface PsychologicalTestContent {
  preambula: LocalizedContent;
  instruction: LocalizedContent;
  topics: {
    stress: LocalizedContent;
    anxiety: LocalizedContent;
    relationships: LocalizedContent;
    'self-esteem': LocalizedContent;
    anger: LocalizedContent;
    depression: LocalizedContent;
  };
  questions: Array<{
    id: string;
    topic: 'stress' | 'anxiety' | 'relationships' | 'self-esteem' | 'anger' | 'depression';
    text: LocalizedContent;
    order: number;
  }>;
  results: {
    title: LocalizedContent;
    subtitle: LocalizedContent;
    buttonText: LocalizedContent;
    depressionWarning?: {
      title: LocalizedContent;
      text: LocalizedContent;
    };
  };
  likertScale: {
    '0': LocalizedContent;
    '1': LocalizedContent;
    '2': LocalizedContent;
    '3': LocalizedContent;
    '4': LocalizedContent;
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
  psychologicalTest: PsychologicalTestContent;
  mentalTechniques: Record<string, MentalTechniqueData>;
  mentalTechniquesMenu: MentalTechniquesMenuData;
  about: AboutContent;
  badges: BadgesContent;
  activityData?: ActivityData;
  payments: PaymentsContent;
  articles: ArticlesCollection;
  legal?: LegalContent;
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
  getAllThemes: () => ThemeData[];
  getBadges: () => BadgesContent;
  getArticle: (articleId: string) => ArticleData | undefined;
  getAllArticles: () => ArticleData[];
  getPsychologicalTest: () => PsychologicalTestContent | undefined;
  getLocalizedBadges: () => {
    title: string;
    subtitle: string;
    congratulations: string;
    unlockedBadge: string;
    shareButton: string;
    shareMessage: string;
    shareDescription: string;
    appLink: string;
    lockedBadge: string;
    unlockCondition: string;
    progress: string;
    totalBadges: string;
    unlockedCount: string;
    inProgress: string;
    points: string;
    motivatingText: string;
    motivatingTextNoBadges: string;
    received: string;
    locked: string;
    cancel: string;
    unlocked: string;
    achievements: Record<string, {
      title: string;
      description: string;
    }>;
    reward: {
      title: string;
      subtitle: string;
      continueButton: string;
      nextAchievement: string;
      congratulations: string;
      earnedAchievement: string;
    };
  };
}

export interface ActivityData {
  streakDays: number;
  currentPoints: number;
  targetPoints: number;
  weeklyCheckins: {
    [key: string]: boolean;
  };
}

/**
 * Данные для страницы достижений
 */
export interface BadgesContent {
  title: LocalizedContent;
  subtitle: LocalizedContent;
  congratulations: LocalizedContent;
  unlockedBadge: LocalizedContent;
  shareButton: LocalizedContent;
  shareMessage: LocalizedContent;
  shareDescription: LocalizedContent;
  appLink: LocalizedContent;
  lockedBadge: LocalizedContent;
  unlockCondition: LocalizedContent;
  progress: LocalizedContent;
  totalBadges: LocalizedContent;
  unlockedCount: LocalizedContent;
  inProgress: LocalizedContent;
  points: LocalizedContent;
  motivatingText: LocalizedContent;
  motivatingTextNoBadges: LocalizedContent;
  received: LocalizedContent;
  locked: LocalizedContent;
  cancel: LocalizedContent;
  unlocked: LocalizedContent;
  reward: {
    title: LocalizedContent;
    subtitle: LocalizedContent;
    continueButton: LocalizedContent;
    nextAchievement: LocalizedContent;
    congratulations: LocalizedContent;
    earnedAchievement: LocalizedContent;
  };
  achievements: Record<string, {
    title: LocalizedContent;
    description: LocalizedContent;
  }>;
}

/**
 * Контент для страницы донатов
 */
export interface DonationsContent {
  title: LocalizedContent;
  description: LocalizedContent;
  currency_ton: LocalizedContent;
  currency_usdt_ton: LocalizedContent;
  copy: LocalizedContent;
  copied: LocalizedContent;
}

/**
 * Контент для страницы оплаты/подписки
 */
export interface PaymentsContent {
  currentPlan: LocalizedContent;
  freePlan: LocalizedContent;
  freePlanDetails?: LocalizedContent[];
  premiumTitle: LocalizedContent;
  benefitsTitle: LocalizedContent;
  keyBenefits?: LocalizedContent[];
  premiumThemes?: LocalizedContent[];
  premiumIntro?: LocalizedContent;
  premiumProgress?: LocalizedContent;
  starsInfo?: LocalizedContent;
  benefits: {
    angry: LocalizedContent;
    sadness: LocalizedContent;
    anxiety: LocalizedContent;
    confidence: LocalizedContent;
    relationships: LocalizedContent;
  };
  plans: {
    monthly: LocalizedContent;
    annually: LocalizedContent;
    lifetime: LocalizedContent;
    perMonth: LocalizedContent;
    perYear: LocalizedContent;
    perLifetime: LocalizedContent;
    savingsBadge?: LocalizedContent; // e.g., "Save 40%"
    mostPopularBadge?: LocalizedContent; // e.g., "Most popular"
  };
  cta: {
    buy: LocalizedContent;
    processing: LocalizedContent;
  };
  messages: {
    successWithPlan: LocalizedContent; // содержит {plan}
    error: LocalizedContent;
    telegramNotAvailable?: LocalizedContent;
  };
  legal?: {
    disclaimer: LocalizedContent;
    termsText: LocalizedContent;
    privacyText: LocalizedContent;
    termsHref?: LocalizedContent;
    privacyHref?: LocalizedContent;
  };
  promo?: {
    havePromoLink?: LocalizedContent;
    placeholder: LocalizedContent;
    apply: LocalizedContent;
    applied: LocalizedContent;
    invalid: LocalizedContent;
  };
}