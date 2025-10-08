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
export type AppScreen = 'onboarding1' | 'onboarding2' | 'survey01' | 'survey02' | 'survey03' | 'survey04' | 'survey05' | 'survey06' | 'pin' | 'checkin' | 'home' | 'profile' | 'about' | 'privacy' | 'terms' | 'pin-settings' | 'delete' | 'payments' | 'donations' | 'under-construction' | 'theme-welcome' | 'theme-home' | 'card-details' | 'checkin-details' | 'card-welcome' | 'question-01' | 'question-02' | 'final-message' | 'rate-card' | 'breathing-4-7-8' | 'breathing-square' | 'grounding-5-4-3-2-1' | 'grounding-anchor' | 'badges' | 'levels' | 'reward';
