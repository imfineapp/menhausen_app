// UserStateManager - Centralized state manager for user progress analysis
// Based on creative phase architecture decisions

import { UserState, UserStateAnalysis, Recommendation, ProgressIndicator, AppScreen } from '../types/userState';

export class UserStateManager {
  private static cache: Map<string, any> = new Map();
  private static lastAnalysis: UserState | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static lastCacheTime: number = 0;

  /**
   * Main function to analyze user state from localStorage data
   */
  static analyzeUserState(): UserState {
    // Check cache first
    if (this.isCacheValid()) {
      return this.lastAnalysis!;
    }

    try {
      const analysis = this.performUserStateAnalysis();
      const userState = this.determineUserState(analysis);
      
      // Cache the result
      this.cacheResult(userState);
      
      return userState;
    } catch (error) {
      console.error('Failed to analyze user state:', error);
      return this.getDefaultUserState();
    }
  }

  /**
   * Get the appropriate initial screen based on user state
   */
  static getInitialScreen(userState: UserState): AppScreen {
    switch (userState.nextRecommendedAction) {
      case 'onboarding':
        return 'onboarding1';
      case 'survey':
        return 'survey01';
      case 'checkin':
        return 'checkin';
      case 'exercise':
        return 'home'; // with exercise focus
      case 'home':
        return 'home';
      default:
        return 'onboarding1';
    }
  }

  /**
   * Get personalized recommendations based on user state
   */
  static getRecommendations(userState: UserState): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // High priority recommendations
    if (!userState.hasCompletedSurvey) {
      recommendations.push({
        type: 'action',
        title: 'Complete Your Assessment',
        description: 'Finish your mental health survey to get personalized recommendations',
        action: 'Continue Survey',
        priority: 'high',
        icon: '📋',
        visible: true
      });
    }

    if (!userState.hasCompletedFirstCheckin) {
      recommendations.push({
        type: 'action',
        title: 'First Check-in',
        description: 'Start tracking your daily mood and mental state',
        action: 'Start Check-in',
        priority: 'high',
        icon: '💭',
        visible: true
      });
    }

    // Medium priority recommendations
    if (userState.hasCompletedSurvey && userState.hasCompletedFirstCheckin) {
      if (userState.daysSinceLastActivity > 1) {
        recommendations.push({
          type: 'action',
          title: 'Daily Check-in',
          description: 'How are you feeling today?',
          action: 'Check-in Now',
          priority: 'medium',
          icon: '💭',
          visible: true
        });
      }

      if (userState.totalCheckins < 3) {
        recommendations.push({
          type: 'motivation',
          title: 'Building a Habit',
          description: 'Keep up the great work! Regular check-ins help track your progress',
          action: 'View Progress',
          priority: 'medium',
          icon: '🎯',
          visible: true
        });
      }
    }

    // Low priority recommendations
    if (userState.isActiveUser && userState.totalCheckins >= 7) {
      recommendations.push({
        type: 'feature',
        title: 'Try New Exercises',
        description: 'Explore mental health techniques and breathing exercises',
        action: 'Browse Exercises',
        priority: 'low',
        icon: '🧘',
        visible: true
      });
    }

    if (userState.isReturningUser) {
      recommendations.push({
        type: 'motivation',
        title: 'Welcome Back!',
        description: 'Great to see you again. Ready to continue your mental health journey?',
        action: 'Continue Journey',
        priority: 'low',
        icon: '👋',
        visible: true
      });
    }

    return recommendations;
  }

  /**
   * Get progress indicators for the user
   */
  static getProgressIndicators(userState: UserState): ProgressIndicator[] {
    const indicators: ProgressIndicator[] = [];

    // Survey progress
    indicators.push({
      title: 'Survey Completion',
      progress: userState.hasCompletedSurvey ? 100 : 0,
      status: userState.hasCompletedSurvey ? 'completed' : 'not-started',
      icon: '📋',
      description: userState.hasCompletedSurvey 
        ? 'Mental health assessment completed' 
        : 'Complete your mental health assessment'
    });

    // Check-in progress
    const checkinProgress = Math.min((userState.totalCheckins / 7) * 100, 100);
    indicators.push({
      title: 'Check-in Streak',
      progress: checkinProgress,
      status: userState.totalCheckins > 0 ? 'in-progress' : 'not-started',
      icon: '🔥',
      description: userState.totalCheckins > 0 
        ? `${userState.streakDays} days in a row!` 
        : 'Start your daily check-in habit'
    });

    // Exercise progress
    const exerciseProgress = userState.hasCompletedFirstExercise ? 100 : 0;
    indicators.push({
      title: 'Exercise Progress',
      progress: exerciseProgress,
      status: userState.hasCompletedFirstExercise ? 'completed' : 'not-started',
      icon: '🧘',
      description: userState.hasCompletedFirstExercise 
        ? 'Mental health exercises completed' 
        : 'Try your first mental health exercise'
    });

    // Overall progress
    indicators.push({
      title: 'Overall Progress',
      progress: userState.completionPercentage,
      status: userState.completionPercentage === 100 ? 'completed' : 'in-progress',
      icon: '📊',
      description: `${userState.completionPercentage}% of core features completed`
    });

    return indicators;
  }

  /**
   * Invalidate cache to force fresh analysis
   */
  static invalidateCache(): void {
    this.cache.clear();
    this.lastAnalysis = null;
    this.lastCacheTime = 0;
  }

  /**
   * Get cached user state if available
   */
  static getCachedUserState(): UserState | null {
    if (this.isCacheValid()) {
      return this.lastAnalysis;
    }
    return null;
  }

  // Private methods

  private static performUserStateAnalysis(): UserStateAnalysis {
    // Read all localStorage data
    const surveyData = this.getLocalStorageData('survey-results');
    const checkinData = this.getLocalStorageData('checkin-data') || [];
    const exerciseData = this.getLocalStorageData('menhausen_exercise_completions') || [];
    const progressData = this.getLocalStorageData('menhausen_progress_data');
    const preferencesData = this.getLocalStorageData('menhausen_user_preferences');
    const languageData = this.getLocalStorageData('menhausen-language');

    // Analyze the data
    const hasAnyData = !!(surveyData || checkinData.length > 0 || exerciseData.length > 0 || progressData || preferencesData);
    
    const lastCheckinDate = checkinData.length > 0 
      ? checkinData[checkinData.length - 1]?.date || null 
      : null;

    const consecutiveDays = this.calculateConsecutiveDays(checkinData);
    const totalExercises = exerciseData.length;
    const completedSurveyScreens = surveyData ? Object.keys(surveyData).filter(key => 
      key.startsWith('screen') && surveyData[key] && surveyData[key].length > 0
    ).length : 0;

    return {
      surveyData,
      checkinData,
      exerciseData,
      progressData,
      preferencesData,
      languageData,
      hasAnyData,
      lastCheckinDate,
      consecutiveDays,
      totalExercises,
      completedSurveyScreens
    };
  }

  private static determineUserState(analysis: UserStateAnalysis): UserState {
    const hasCompletedOnboarding = analysis.hasAnyData;
    const hasCompletedSurvey = !!(analysis.surveyData?.completedAt);
    const hasCompletedFirstCheckin = analysis.checkinData.length > 0;
    const hasCompletedFirstExercise = analysis.totalExercises > 0;

    // Calculate days since last activity
    const daysSinceLastActivity = analysis.lastCheckinDate 
      ? this.calculateDaysSince(analysis.lastCheckinDate)
      : 999; // Large number for users with no activity

    // Determine user type
    const isNewUser = !analysis.hasAnyData;
    const isReturningUser = analysis.hasAnyData && daysSinceLastActivity > 7;
    const isActiveUser = analysis.hasAnyData && daysSinceLastActivity <= 1;

    // Determine next recommended action
    let nextRecommendedAction: UserState['nextRecommendedAction'] = 'onboarding';
    if (!hasCompletedSurvey) {
      nextRecommendedAction = 'survey';
    } else if (!hasCompletedFirstCheckin) {
      nextRecommendedAction = 'checkin';
    } else if (isReturningUser) {
      nextRecommendedAction = 'home';
    } else if (isActiveUser) {
      nextRecommendedAction = 'home';
    } else {
      nextRecommendedAction = 'home';
    }

    // Calculate completion percentage
    const completionPercentage = this.calculateCompletionPercentage(
      hasCompletedSurvey,
      hasCompletedFirstCheckin,
      hasCompletedFirstExercise
    );

    return {
      hasCompletedOnboarding,
      hasCompletedSurvey,
      hasCompletedFirstCheckin,
      hasCompletedFirstExercise,
      lastActivityDate: analysis.lastCheckinDate || new Date().toISOString(),
      nextRecommendedAction,
      completionPercentage,
      streakDays: analysis.consecutiveDays,
      totalCheckins: analysis.checkinData.length,
      daysSinceLastActivity,
      isNewUser,
      isReturningUser,
      isActiveUser
    };
  }

  private static getLocalStorageData(key: string): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Failed to parse localStorage data for key ${key}:`, error);
      return null;
    }
  }

  private static calculateConsecutiveDays(checkinData: any[]): number {
    if (checkinData.length === 0) return 0;

    // Sort by date
    const sortedCheckins = checkinData
      .filter(checkin => checkin.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedCheckins.length === 0) return 0;

    let consecutiveDays = 1;
    let currentDate = new Date(sortedCheckins[0].date);

    for (let i = 1; i < sortedCheckins.length; i++) {
      const checkinDate = new Date(sortedCheckins[i].date);
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() + 1);

      if (checkinDate.toDateString() === expectedDate.toDateString()) {
        consecutiveDays++;
        currentDate = checkinDate;
      } else {
        break;
      }
    }

    return consecutiveDays;
  }

  private static calculateDaysSince(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private static calculateCompletionPercentage(
    hasCompletedSurvey: boolean,
    hasCompletedFirstCheckin: boolean,
    hasCompletedFirstExercise: boolean
  ): number {
    let completed = 0;
    const total = 3; // survey, check-in, exercise

    if (hasCompletedSurvey) completed++;
    if (hasCompletedFirstCheckin) completed++;
    if (hasCompletedFirstExercise) completed++;

    return Math.round((completed / total) * 100);
  }

  private static getDefaultUserState(): UserState {
    return {
      hasCompletedOnboarding: false,
      hasCompletedSurvey: false,
      hasCompletedFirstCheckin: false,
      hasCompletedFirstExercise: false,
      lastActivityDate: new Date().toISOString(),
      nextRecommendedAction: 'onboarding',
      completionPercentage: 0,
      streakDays: 0,
      totalCheckins: 0,
      daysSinceLastActivity: 999,
      isNewUser: true,
      isReturningUser: false,
      isActiveUser: false
    };
  }

  private static isCacheValid(): boolean {
    return this.lastAnalysis !== null && 
           (Date.now() - this.lastCacheTime) < this.CACHE_DURATION;
  }

  private static cacheResult(userState: UserState): void {
    this.lastAnalysis = userState;
    this.lastCacheTime = Date.now();
  }
}
