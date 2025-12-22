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

// App screen type for navigation
export type AppScreen = 'loading' | 'onboarding1' | 'onboarding2' | 'survey01' | 'survey02' | 'survey03' | 'survey04' | 'survey05' | 'survey06' | 'psychological-test-preambula' | 'psychological-test-instruction' | 'psychological-test-question-01' | 'psychological-test-question-02' | 'psychological-test-question-03' | 'psychological-test-question-04' | 'psychological-test-question-05' | 'psychological-test-question-06' | 'psychological-test-question-07' | 'psychological-test-question-08' | 'psychological-test-question-09' | 'psychological-test-question-10' | 'psychological-test-question-11' | 'psychological-test-question-12' | 'psychological-test-question-13' | 'psychological-test-question-14' | 'psychological-test-question-15' | 'psychological-test-question-16' | 'psychological-test-question-17' | 'psychological-test-question-18' | 'psychological-test-question-19' | 'psychological-test-question-20' | 'psychological-test-question-21' | 'psychological-test-question-22' | 'psychological-test-question-23' | 'psychological-test-question-24' | 'psychological-test-question-25' | 'psychological-test-question-26' | 'psychological-test-question-27' | 'psychological-test-question-28' | 'psychological-test-question-29' | 'psychological-test-question-30' | 'psychological-test-results' | 'pin' | 'checkin' | 'home' | 'profile' | 'about' | 'privacy' | 'terms' | 'pin-settings' | 'delete' | 'payments' | 'donations' | 'under-construction' | 'theme-welcome' | 'theme-home' | 'card-details' | 'checkin-details' | 'card-welcome' | 'question-01' | 'question-02' | 'final-message' | 'rate-card' | 'breathing-4-7-8' | 'breathing-square' | 'grounding-5-4-3-2-1' | 'grounding-anchor' | 'badges' | 'reward' | 'all-articles' | 'article' | 'app-settings';
