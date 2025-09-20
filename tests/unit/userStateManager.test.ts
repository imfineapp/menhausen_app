// Unit tests for UserStateManager
// Tests smart navigation functionality and user state analysis

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserStateManager } from '../../utils/userStateManager';
import { UserState } from '../../types/userState';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock localStorage globally
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Also mock window.localStorage for browser environment
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('UserStateManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    UserStateManager.invalidateCache();
    // Reset localStorage mock to return null by default
    localStorageMock.getItem.mockReturnValue(null);
    // Clear any existing localStorage data
    localStorageMock.clear.mockClear();
  });

  describe('analyzeUserState', () => {
    it('should return default state for new user with no data', () => {
      const userState = UserStateManager.analyzeUserState();

      expect(userState.hasCompletedOnboarding).toBe(false);
      expect(userState.hasCompletedSurvey).toBe(false);
      expect(userState.hasCompletedFirstCheckin).toBe(false);
      expect(userState.hasCompletedFirstExercise).toBe(false);
      expect(userState.nextRecommendedAction).toBe('survey');
      expect(userState.completionPercentage).toBe(0);
      expect(userState.streakDays).toBe(0);
      expect(userState.totalCheckins).toBe(0);
      expect(userState.daysSinceLastActivity).toBe(999);
      expect(userState.isNewUser).toBe(true);
      expect(userState.isReturningUser).toBe(false);
      expect(userState.isActiveUser).toBe(false);
    });

    it('should detect completed survey', () => {
      // Test the logic directly by setting localStorage data
      const surveyData = {
        screen01: ['answer1'],
        screen02: ['answer2'],
        screen03: ['answer3'],
        screen04: ['answer4'],
        screen05: ['answer5'],
        completedAt: '2024-01-01T00:00:00.000Z'
      };

      // Clear cache first
      UserStateManager.invalidateCache();
      
      // Set localStorage data directly
      localStorage.setItem('survey-results', JSON.stringify(surveyData));

      const userState = UserStateManager.analyzeUserState();

      expect(userState.hasCompletedSurvey).toBe(true);
      expect(userState.hasCompletedOnboarding).toBe(true);
      expect(userState.nextRecommendedAction).toBe('checkin');
      
      // Clean up
      localStorage.removeItem('survey-results');
    });

    it('should detect completed check-ins', () => {
      const checkinData = [
        { mood: 'happy', timestamp: '2024-01-01T10:00:00.000Z', date: '2024-01-01' },
        { mood: 'neutral', timestamp: '2024-01-02T10:00:00.000Z', date: '2024-01-02' }
      ];

      // Clear cache first
      UserStateManager.invalidateCache();
      
      // Set localStorage data directly
      localStorage.setItem('checkin-data', JSON.stringify(checkinData));

      const userState = UserStateManager.analyzeUserState();

      expect(userState.hasCompletedFirstCheckin).toBe(true);
      expect(userState.hasCompletedOnboarding).toBe(true); // Should be true because hasAnyData is true
      expect(userState.totalCheckins).toBe(2);
      expect(userState.streakDays).toBe(2);
      
      // Clean up
      localStorage.removeItem('checkin-data');
    });

    it('should detect completed exercises', () => {
      const exerciseData = [
        { cardId: 'card1', answers: { question1: 'answer1' }, rating: 5, completedAt: '2024-01-01T00:00:00.000Z', completionCount: 1 }
      ];

      // Clear cache first
      UserStateManager.invalidateCache();
      
      // Set localStorage data directly
      localStorage.setItem('menhausen_exercise_completions', JSON.stringify(exerciseData));

      const userState = UserStateManager.analyzeUserState();

      expect(userState.hasCompletedFirstExercise).toBe(true);
      expect(userState.hasCompletedOnboarding).toBe(true); // Should be true because hasAnyData is true
      
      // Clean up
      localStorage.removeItem('menhausen_exercise_completions');
    });

    it('should calculate completion percentage correctly', () => {
      const surveyData = { completedAt: '2024-01-01T00:00:00.000Z' };
      const checkinData = [{ mood: 'happy', timestamp: '2024-01-01T10:00:00.000Z', date: '2024-01-01' }];
      const exerciseData = [{ cardId: 'card1', answers: {}, rating: 5, completedAt: '2024-01-01T00:00:00.000Z', completionCount: 1 }];

      // Clear cache first
      UserStateManager.invalidateCache();
      
      // Set localStorage data directly
      localStorage.setItem('survey-results', JSON.stringify(surveyData));
      localStorage.setItem('checkin-data', JSON.stringify(checkinData));
      localStorage.setItem('menhausen_exercise_completions', JSON.stringify(exerciseData));

      const userState = UserStateManager.analyzeUserState();

      expect(userState.completionPercentage).toBe(100);
      expect(userState.hasCompletedOnboarding).toBe(true);
      
      // Clean up
      localStorage.removeItem('survey-results');
      localStorage.removeItem('checkin-data');
      localStorage.removeItem('menhausen_exercise_completions');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'survey-results') return 'invalid-json';
        return null;
      });

      const userState = UserStateManager.analyzeUserState();

      expect(userState.hasCompletedSurvey).toBe(false);
      expect(userState.isNewUser).toBe(true);
    });
  });

  describe('getInitialScreen', () => {
    it('should return onboarding1 for new users', () => {
      const userState: UserState = {
        hasCompletedOnboarding: false,
        hasCompletedSurvey: false,
        hasCompletedFirstCheckin: false,
        hasCompletedFirstExercise: false,
        lastActivityDate: '2024-01-01T00:00:00.000Z',
        nextRecommendedAction: 'onboarding',
        completionPercentage: 0,
        streakDays: 0,
        totalCheckins: 0,
        daysSinceLastActivity: 999,
        isNewUser: true,
        isReturningUser: false,
        isActiveUser: false,
      };

      const screen = UserStateManager.getInitialScreen(userState);

      expect(screen).toBe('onboarding1');
    });

    it('should return survey01 for users who need to complete survey', () => {
      const userState: UserState = {
        hasCompletedOnboarding: true,
        hasCompletedSurvey: false,
        hasCompletedFirstCheckin: false,
        hasCompletedFirstExercise: false,
        lastActivityDate: '2024-01-01T00:00:00.000Z',
        nextRecommendedAction: 'survey',
        completionPercentage: 0,
        streakDays: 0,
        totalCheckins: 0,
        daysSinceLastActivity: 1,
        isNewUser: false,
        isReturningUser: false,
        isActiveUser: false,
      };

      const screen = UserStateManager.getInitialScreen(userState);

      expect(screen).toBe('survey01');
    });

    it('should return checkin for users who need to do first check-in', () => {
      const userState: UserState = {
        hasCompletedOnboarding: true,
        hasCompletedSurvey: true,
        hasCompletedFirstCheckin: false,
        hasCompletedFirstExercise: false,
        lastActivityDate: '2024-01-01T00:00:00.000Z',
        nextRecommendedAction: 'checkin',
        completionPercentage: 33,
        streakDays: 0,
        totalCheckins: 0,
        daysSinceLastActivity: 1,
        isNewUser: false,
        isReturningUser: false,
        isActiveUser: false,
      };

      const screen = UserStateManager.getInitialScreen(userState);

      expect(screen).toBe('checkin');
    });

    it('should return home for active users', () => {
      const userState: UserState = {
        hasCompletedOnboarding: true,
        hasCompletedSurvey: true,
        hasCompletedFirstCheckin: true,
        hasCompletedFirstExercise: true,
        lastActivityDate: '2024-01-01T00:00:00.000Z',
        nextRecommendedAction: 'home',
        completionPercentage: 100,
        streakDays: 7,
        totalCheckins: 7,
        daysSinceLastActivity: 1,
        isNewUser: false,
        isReturningUser: false,
        isActiveUser: true,
      };

      const screen = UserStateManager.getInitialScreen(userState);

      expect(screen).toBe('home');
    });
  });

  describe('getRecommendations', () => {
    it('should recommend survey completion for users who have not completed survey', () => {
      const userState: UserState = {
        hasCompletedOnboarding: true,
        hasCompletedSurvey: false,
        hasCompletedFirstCheckin: false,
        hasCompletedFirstExercise: false,
        lastActivityDate: '2024-01-01T00:00:00.000Z',
        nextRecommendedAction: 'survey',
        completionPercentage: 0,
        streakDays: 0,
        totalCheckins: 0,
        daysSinceLastActivity: 1,
        isNewUser: false,
        isReturningUser: false,
        isActiveUser: false,
      };

      const recommendations = UserStateManager.getRecommendations(userState);

      expect(recommendations.length).toBeGreaterThanOrEqual(1);
      const surveyRecommendation = recommendations.find(r => r.title === 'Complete Your Assessment');
      expect(surveyRecommendation).toBeDefined();
      expect(surveyRecommendation?.priority).toBe('high');
    });

    it('should recommend check-in for users who have not done first check-in', () => {
      const userState: UserState = {
        hasCompletedOnboarding: true,
        hasCompletedSurvey: true,
        hasCompletedFirstCheckin: false,
        hasCompletedFirstExercise: false,
        lastActivityDate: '2024-01-01T00:00:00.000Z',
        nextRecommendedAction: 'checkin',
        completionPercentage: 33,
        streakDays: 0,
        totalCheckins: 0,
        daysSinceLastActivity: 1,
        isNewUser: false,
        isReturningUser: false,
        isActiveUser: false,
      };

      const recommendations = UserStateManager.getRecommendations(userState);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].title).toBe('First Check-in');
      expect(recommendations[0].priority).toBe('high');
    });

    it('should recommend daily check-in for active users', () => {
      const userState: UserState = {
        hasCompletedOnboarding: true,
        hasCompletedSurvey: true,
        hasCompletedFirstCheckin: true,
        hasCompletedFirstExercise: true,
        lastActivityDate: '2024-01-01T00:00:00.000Z',
        nextRecommendedAction: 'home',
        completionPercentage: 100,
        streakDays: 7,
        totalCheckins: 7,
        daysSinceLastActivity: 2,
        isNewUser: false,
        isReturningUser: false,
        isActiveUser: false,
      };

      const recommendations = UserStateManager.getRecommendations(userState);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].title).toBe('Daily Check-in');
      expect(recommendations[0].priority).toBe('medium');
    });

    it('should show welcome back message for returning users', () => {
      const userState: UserState = {
        hasCompletedOnboarding: true,
        hasCompletedSurvey: true,
        hasCompletedFirstCheckin: true,
        hasCompletedFirstExercise: true,
        lastActivityDate: '2024-01-01T00:00:00.000Z',
        nextRecommendedAction: 'home',
        completionPercentage: 100,
        streakDays: 7,
        totalCheckins: 7,
        daysSinceLastActivity: 10,
        isNewUser: false,
        isReturningUser: true,
        isActiveUser: false,
      };

      const recommendations = UserStateManager.getRecommendations(userState);

      const welcomeRecommendation = recommendations.find(r => r.title === 'Welcome Back!');
      expect(welcomeRecommendation).toBeDefined();
      expect(welcomeRecommendation?.priority).toBe('low');
    });
  });

  describe('getProgressIndicators', () => {
    it('should return progress indicators for new user', () => {
      const userState: UserState = {
        hasCompletedOnboarding: false,
        hasCompletedSurvey: false,
        hasCompletedFirstCheckin: false,
        hasCompletedFirstExercise: false,
        lastActivityDate: '2024-01-01T00:00:00.000Z',
        nextRecommendedAction: 'onboarding',
        completionPercentage: 0,
        streakDays: 0,
        totalCheckins: 0,
        daysSinceLastActivity: 999,
        isNewUser: true,
        isReturningUser: false,
        isActiveUser: false,
      };

      const indicators = UserStateManager.getProgressIndicators(userState);

      expect(indicators).toHaveLength(4);
      expect(indicators[0].title).toBe('Survey Completion');
      expect(indicators[0].progress).toBe(0);
      expect(indicators[0].status).toBe('not-started');
      expect(indicators[1].title).toBe('Check-in Streak');
      expect(indicators[1].progress).toBe(0);
      expect(indicators[1].status).toBe('not-started');
    });

    it('should return progress indicators for completed user', () => {
      const userState: UserState = {
        hasCompletedOnboarding: true,
        hasCompletedSurvey: true,
        hasCompletedFirstCheckin: true,
        hasCompletedFirstExercise: true,
        lastActivityDate: '2024-01-01T00:00:00.000Z',
        nextRecommendedAction: 'home',
        completionPercentage: 100,
        streakDays: 7,
        totalCheckins: 7,
        daysSinceLastActivity: 1,
        isNewUser: false,
        isReturningUser: false,
        isActiveUser: true,
      };

      const indicators = UserStateManager.getProgressIndicators(userState);

      expect(indicators).toHaveLength(4);
      expect(indicators[0].title).toBe('Survey Completion');
      expect(indicators[0].progress).toBe(100);
      expect(indicators[0].status).toBe('completed');
      expect(indicators[1].title).toBe('Check-in Streak');
      expect(indicators[1].progress).toBe(100);
      expect(indicators[1].status).toBe('in-progress');
    });
  });

  describe('caching', () => {
    it('should cache results and return cached data on subsequent calls', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const userState1 = UserStateManager.analyzeUserState();
      const userState2 = UserStateManager.analyzeUserState();

      expect(userState1).toEqual(userState2);
      // Verify that the cached result is returned (same object reference)
      expect(userState1).toBe(userState2);
    });

    it('should invalidate cache when requested', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const userState1 = UserStateManager.analyzeUserState();
      UserStateManager.invalidateCache();
      const userState2 = UserStateManager.analyzeUserState();

      // Both should have the same content but different object references after cache invalidation
      // Note: lastActivityDate will be slightly different due to timestamp generation
      expect(userState1.hasCompletedOnboarding).toBe(userState2.hasCompletedOnboarding);
      expect(userState1.hasCompletedSurvey).toBe(userState2.hasCompletedSurvey);
      expect(userState1.hasCompletedFirstCheckin).toBe(userState2.hasCompletedFirstCheckin);
      expect(userState1.hasCompletedFirstExercise).toBe(userState2.hasCompletedFirstExercise);
      expect(userState1.nextRecommendedAction).toBe(userState2.nextRecommendedAction);
      expect(userState1.completionPercentage).toBe(userState2.completionPercentage);
      expect(userState1.streakDays).toBe(userState2.streakDays);
      expect(userState1.totalCheckins).toBe(userState2.totalCheckins);
      expect(userState1.daysSinceLastActivity).toBe(userState2.daysSinceLastActivity);
      expect(userState1.isNewUser).toBe(userState2.isNewUser);
      expect(userState1.isReturningUser).toBe(userState2.isReturningUser);
      expect(userState1.isActiveUser).toBe(userState2.isActiveUser);
      expect(userState1).not.toBe(userState2);
    });

    it('should return cached data when available', () => {
      localStorageMock.getItem.mockReturnValue(null);

      UserStateManager.analyzeUserState();
      const cachedState = UserStateManager.getCachedUserState();

      expect(cachedState).toBeDefined();
      expect(cachedState?.isNewUser).toBe(true);
    });
  });
});
