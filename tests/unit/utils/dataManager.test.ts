import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CriticalDataManager } from '@/utils/dataManager';
import { TestDataFactory } from '../../config/setup';

/**
 * CriticalDataManager Unit Tests
 * 
 * This test suite covers:
 * - Data encryption and decryption
 * - Data integrity validation
 * - Basic functionality testing
 * - Error handling and graceful degradation
 */

describe('CriticalDataManager', () => {
  let dataManager: CriticalDataManager;
  let mockStorage: { [key: string]: string };

  beforeEach(() => {
    dataManager = new CriticalDataManager();
    mockStorage = {};
    
    // Create a working localStorage mock
    const storage = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
      key: vi.fn(),
      length: Object.keys(mockStorage).length,
    };
    
    Object.defineProperty(global, 'localStorage', {
      value: storage,
      writable: true,
    });
  });

  describe('Basic Save and Load Operations', () => {
    it('should save and load survey results successfully', async () => {
      const testData = TestDataFactory.surveyResults();
      
      const saveResult = await dataManager.saveSurveyResults(testData);
      expect(saveResult).toBe(true);
      
      const loadedData = await dataManager.loadSurveyResults();
      expect(loadedData).toEqual(testData);
    });

    it('should save and load user preferences successfully', async () => {
      const testPreferences = TestDataFactory.userPreferences();
      
      const saveResult = await dataManager.saveUserPreferences(testPreferences);
      expect(saveResult).toBe(true);
      
      const loadedPreferences = await dataManager.loadUserPreferences();
      expect(loadedPreferences).toEqual(testPreferences);
    });

    it('should save and load exercise completions successfully', async () => {
      const completion = TestDataFactory.exerciseCompletion();
      
      const saveResult = await dataManager.saveExerciseCompletion(completion);
      expect(saveResult).toBe(true);
      
      const loadedCompletions = await dataManager.loadExerciseCompletions();
      expect(loadedCompletions).toBeTruthy();
      expect(loadedCompletions).toHaveLength(1);
      expect(loadedCompletions![0]).toEqual(completion);
    });

    it('should save and load progress data successfully', async () => {
      const progress = TestDataFactory.progressData();
      
      const saveResult = await dataManager.saveProgressData(progress);
      expect(saveResult).toBe(true);
      
      const loadedProgress = await dataManager.loadProgressData();
      expect(loadedProgress).toEqual(progress);
    });
  });

  describe('Default Value Handling', () => {
    it('should return default user preferences when none exist', async () => {
      const loadedPreferences = await dataManager.loadUserPreferences();
      
      expect(loadedPreferences).toEqual({
        language: 'en',
        theme: 'light',
        notifications: true,
        analytics: false
      });
    });

    it('should return default progress when none exists', async () => {
      const loadedProgress = await dataManager.loadProgressData();
      
      expect(loadedProgress).toEqual({
        completedSurveys: 0,
        completedExercises: 0,
        lastActivity: expect.any(String),
        achievements: []
      });
    });

    it('should return null for survey results when none exist', async () => {
      const loadedData = await dataManager.loadSurveyResults();
      expect(loadedData).toBeNull();
    });

    it('should return null for exercise completions when none exist', async () => {
      const loadedCompletions = await dataManager.loadExerciseCompletions();
      expect(loadedCompletions).toBeNull();
    });
  });

  describe('Exercise Completion Management', () => {
    it('should update existing completion for same card', async () => {
      const completion1 = TestDataFactory.exerciseCompletion();
      const completion2 = {
        ...TestDataFactory.exerciseCompletion(),
        cardId: completion1.cardId,
        rating: 5,
        completionCount: 2,
      };
      
      await dataManager.saveExerciseCompletion(completion1);
      await dataManager.saveExerciseCompletion(completion2);
      
      const loadedCompletions = await dataManager.loadExerciseCompletions();
      expect(loadedCompletions).toBeTruthy();
      expect(loadedCompletions).toHaveLength(1);
      expect(loadedCompletions![0].rating).toBe(5);
      expect(loadedCompletions![0].completionCount).toBe(2);
    });

    it('should handle multiple exercise completions', async () => {
      const completion1 = TestDataFactory.exerciseCompletion();
      const completion2 = {
        ...TestDataFactory.exerciseCompletion(),
        cardId: 'different-card-id',
      };
      
      await dataManager.saveExerciseCompletion(completion1);
      await dataManager.saveExerciseCompletion(completion2);
      
      const loadedCompletions = await dataManager.loadExerciseCompletions();
      expect(loadedCompletions).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage.setItem to throw error
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const testData = TestDataFactory.surveyResults();
      const result = await dataManager.saveSurveyResults(testData);
      
      expect(result).toBe(false);
    });

    it('should handle localStorage.getItem errors gracefully', async () => {
      // Mock localStorage.getItem to throw error
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      
      const result = await dataManager.loadSurveyResults();
      
      expect(result).toBeNull();
    });
  });

  describe('Storage Management', () => {
    it('should clear all data when requested', () => {
      mockStorage['menhausen_survey_results'] = 'data1';
      mockStorage['menhausen_exercise_completions'] = 'data2';
      mockStorage['other_app_data'] = 'should_remain';
      
      // Mock Object.keys(localStorage) to return our mock keys
      vi.spyOn(Object, 'keys').mockReturnValue(Object.keys(mockStorage));
      
      dataManager.clearAllData();
      
      expect(mockStorage['menhausen_survey_results']).toBeUndefined();
      expect(mockStorage['menhausen_exercise_completions']).toBeUndefined();
      expect(mockStorage['other_app_data']).toBe('should_remain');
    });

    it('should calculate storage info correctly', () => {
      mockStorage['menhausen_test'] = 'test data';
      
      const storageInfo = dataManager.getStorageInfo();
      
      expect(storageInfo.used).toBeGreaterThan(0);
      expect(storageInfo.available).toBe(5 * 1024 * 1024); // 5MB
      expect(storageInfo.efficiency).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should complete save operations quickly', async () => {
      const testData = TestDataFactory.surveyResults();
      const startTime = performance.now();
      
      await dataManager.saveSurveyResults(testData);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // <100ms requirement
    });

    it('should complete load operations quickly', async () => {
      const testData = TestDataFactory.surveyResults();
      await dataManager.saveSurveyResults(testData);
      
      const startTime = performance.now();
      await dataManager.loadSurveyResults();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // <100ms requirement
    });
  });
});
