// TypeScript interfaces for user state management
// Based on creative phase architecture decisions

export interface UserState {
  // Completion flags
  hasCompletedOnboarding: boolean;
  hasCompletedSurvey: boolean;
  hasCompletedFirstCheckin: boolean;
  hasCompletedFirstExercise: boolean;
  
  // Activity tracking
  lastActivityDate: string;
  nextRecommendedAction: 'onboarding' | 'survey' | 'checkin' | 'home' | 'exercise';
  
  // Progress metrics
  completionPercentage: number;
  streakDays: number;
  totalCheckins: number;
  
  // Additional context
  daysSinceLastActivity: number;
  isNewUser: boolean;
  isReturningUser: boolean;
  isActiveUser: boolean;
}

export interface UserStateAnalysis {
  // Raw data from localStorage
  surveyData: any;
  checkinData: any[];
  exerciseData: any[];
  progressData: any;
  preferencesData: any;
  languageData: string | null;
  
  // Analysis results
  hasAnyData: boolean;
  lastCheckinDate: string | null;
  consecutiveDays: number;
  totalExercises: number;
  completedSurveyScreens: number;
}

export interface Recommendation {
  type: 'action' | 'motivation' | 'feature';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  visible: boolean;
}

export interface ProgressIndicator {
  title: string;
  progress: number; // 0-100
  status: 'completed' | 'in-progress' | 'not-started';
  icon: string;
  description: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
  visible: boolean;
}

// Points system types

// Тип транзакции баллов
export type PointsTransactionType = 
  | 'checkin_daily'           // Ежедневный чекин
  | 'exercise_completed'      // Завершение упражнения
  | 'achievement_earned'      // Получение достижения
  | 'streak_bonus'            // Бонус за серию
  | 'survey_completed'        // Завершение опроса
  | 'manual_adjustment';      // Ручная корректировка

// Категория источника баллов
export type PointsSourceCategory = 
  | 'checkin'     // Чекины
  | 'exercise'    // Упражнения
  | 'achievement' // Достижения
  | 'bonus'       // Бонусы
  | 'other';      // Прочее

// Одна транзакция баллов
export interface PointsTransaction {
  id: string;                           // Уникальный ID транзакции
  type: PointsTransactionType;          // Тип действия
  category: PointsSourceCategory;       // Категория источника
  amount: number;                       // Количество баллов (+/-)
  timestamp: string;                    // ISO timestamp
  date: string;                         // YYYY-MM-DD
  relatedEntityId?: string;             // ID связанной сущности (cardId, achievementId и т.д.)
  metadata?: Record<string, any>;       // Дополнительные данные
}

// Полная структура баллов пользователя
export interface UserPoints {
  totalPoints: number;                  // Общий баланс баллов
  transactions: PointsTransaction[];    // История всех транзакций
  breakdown: {                          // Разбивка по источникам
    checkins: number;                   // Баллы от чекинов
    exercises: number;                  // Баллы от упражнений
    achievements: number;               // Баллы от достижений
    bonuses: number;                    // Бонусные баллы
    other: number;                      // Прочие баллы
  };
  lastUpdated: string;                  // Последнее обновление
  createdAt: string;                    // Дата создания аккаунта
}

// App screen type for navigation
export type AppScreen = 'onboarding1' | 'onboarding2' | 'survey01' | 'survey02' | 'survey03' | 'survey04' | 'survey05' | 'survey06' | 'pin' | 'checkin' | 'home' | 'profile' | 'about' | 'privacy' | 'terms' | 'pin-settings' | 'delete' | 'payments' | 'donations' | 'under-construction' | 'theme-welcome' | 'theme-home' | 'card-details' | 'checkin-details' | 'card-welcome' | 'question-01' | 'question-02' | 'final-message' | 'rate-card' | 'breathing-4-7-8' | 'breathing-square' | 'grounding-5-4-3-2-1' | 'grounding-anchor' | 'badges' | 'levels' | 'reward' | 'article' | 'all-articles';
