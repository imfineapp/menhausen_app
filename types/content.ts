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
    previous: LocalizedContent;
    morePages: LocalizedContent;
    more: LocalizedContent;
  };
  common: {
    loading: LocalizedContent;
    error: LocalizedContent;
    tryAgain: LocalizedContent;
    save: LocalizedContent;
    cancel: LocalizedContent;
    delete: LocalizedContent;
    edit: LocalizedContent;
    close: LocalizedContent;
    loadingQuestions?: LocalizedContent;
    loadingFinalMessage?: LocalizedContent;
    errorLoadingMessageData?: LocalizedContent;
  };
  home: {
    greeting: LocalizedContent;
    checkInPrompt: LocalizedContent;
    quickHelpTitle: LocalizedContent;
    themesTitle: LocalizedContent;
    howAreYou: LocalizedContent;
    checkInDescription: LocalizedContent;
    checkInButton: LocalizedContent;
    checkInInfo: {
      title: LocalizedContent;
      content: LocalizedContent;
    };
    whatWorriesYou: LocalizedContent;
    heroTitle: LocalizedContent;
    level: LocalizedContent;
    progress: LocalizedContent;
    use80PercentUsers: LocalizedContent;
    activity: {
      title: LocalizedContent;
      streak: LocalizedContent;
      description: LocalizedContent;
      streakLabel: LocalizedContent;
      progressLabel: LocalizedContent;
      weeklyCheckins: LocalizedContent;
    };
    emergencyHelp: {
      breathing: {
        title: LocalizedContent;
        description: LocalizedContent;
      };
      meditation: {
        title: LocalizedContent;
        description: LocalizedContent;
      };
      grounding: {
        title: LocalizedContent;
        description: LocalizedContent;
      };
    };
  };
  profile: {
    title: LocalizedContent;
    aboutApp: LocalizedContent;
    privacy: LocalizedContent;
    terms: LocalizedContent;
    deleteAccount: LocalizedContent;
    payments: LocalizedContent;
    heroTitle: LocalizedContent;
    level: LocalizedContent;
    premium: LocalizedContent;
    free: LocalizedContent;
    follow?: LocalizedContent;
    openProfile?: LocalizedContent;
  };
  about: {
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
    betaVersion: LocalizedContent;
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
      freeWarning: {
        title: LocalizedContent;
        text: LocalizedContent;
      };
    };
    home: {
      progress: LocalizedContent;
      attempts: LocalizedContent;
      attemptsCounter: LocalizedContent;
      level: LocalizedContent;
      nextLevel: LocalizedContent;
      allCardsAttempted?: LocalizedContent;
    };
  };
    cards: {
      attempts: LocalizedContent;
      noAttempts: LocalizedContent;
      startExercise: LocalizedContent;
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
      thankYou: LocalizedContent;
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
    questionNotFound?: LocalizedContent;
    techniqueNotFound?: LocalizedContent;
    practiceTaskNotFound?: LocalizedContent;
    explanationNotFound?: LocalizedContent;
    fallbackTitle?: LocalizedContent;
    fallbackDescription?: LocalizedContent;
  };
  levels: {
    title: LocalizedContent;
    yourLevel: LocalizedContent;
    toNextLevel: LocalizedContent;
    pointsHistory: LocalizedContent;
    actions: {
      dailyCheckin: LocalizedContent;
      exerciseComplete: LocalizedContent;
      achievementEarned: LocalizedContent;
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
  betaVersion: LocalizedContent;
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
  about: AboutContent;
  badges: BadgesContent;
  activityData?: ActivityData;
  payments: PaymentsContent;
  donations: DonationsContent;
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
  getBadges: () => BadgesContent;
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
    achievements: {
      first_checkin: {
        title: string;
        description: string;
      };
      week_streak: {
        title: string;
        description: string;
      };
      month_streak: {
        title: string;
        description: string;
      };
      first_exercise: {
        title: string;
        description: string;
      };
      exercise_master: {
        title: string;
        description: string;
      };
      mood_tracker: {
        title: string;
        description: string;
      };
      early_bird: {
        title: string;
        description: string;
      };
      night_owl: {
        title: string;
        description: string;
      };
    };
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
  achievements: {
    first_checkin: {
      title: LocalizedContent;
      description: LocalizedContent;
    };
    week_streak: {
      title: LocalizedContent;
      description: LocalizedContent;
    };
    month_streak: {
      title: LocalizedContent;
      description: LocalizedContent;
    };
    first_exercise: {
      title: LocalizedContent;
      description: LocalizedContent;
    };
    exercise_master: {
      title: LocalizedContent;
      description: LocalizedContent;
    };
    mood_tracker: {
      title: LocalizedContent;
      description: LocalizedContent;
    };
    early_bird: {
      title: LocalizedContent;
      description: LocalizedContent;
    };
    night_owl: {
      title: LocalizedContent;
      description: LocalizedContent;
    };
  };
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
  premiumTitle: LocalizedContent;
  benefitsTitle: LocalizedContent;
  keyBenefits?: LocalizedContent[];
  premiumThemes?: LocalizedContent[];
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
  };
  legal?: {
    disclaimer: LocalizedContent;
    termsText: LocalizedContent;
    privacyText: LocalizedContent;
    termsHref?: LocalizedContent;
    privacyHref?: LocalizedContent;
  };
  promo?: {
    placeholder: LocalizedContent;
    apply: LocalizedContent;
    applied: LocalizedContent;
    invalid: LocalizedContent;
  };
}