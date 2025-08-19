import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CriticalDataManager } from '@/utils/dataManager';
import { TestDataFactory } from '../../config/setup';

/**
 * CriticalDataManager Unit Tests
 * 
 * This test suite covers:
 * - Data encryption and decryption
 * - Data integrity validation
 * - Backup and recovery mechanisms
 * - Data migration (v1 to v2)
 * - Error handling and graceful degradation
 */

describe('CriticalDataManager', () => {
  let dataManager: CriticalDataManager;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    dataManager = new CriticalDataManager();
    localStorageMock = {};
    
    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => localStorageMock[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      localStorageMock[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete localStorageMock[key];
    });
  });

  describe('Data Encryption', () => {
    it('should encrypt sensitive data before storage', async () => {
      const testData = TestDataFactory.surveyResults();
      
      await dataManager.saveSurveyResults(testData);
      
      // Check that stored data is encrypted (not plain JSON)
      const storedValue = localStorageMock['menhausen_survey_results'];
      expect(storedValue).toBeTruthy();
      expect(() => JSON.parse(storedValue)).toThrow();
      
      // Verify it's base64 encoded
      expect(storedValue).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
    });

    it('should decrypt data correctly on retrieval', async () => {
      const testData = TestDataFactory.surveyResults();
      
      await dataManager.saveSurveyResults(testData);
      const retrievedData = await dataManager.loadSurveyResults();
      
      expect(retrievedData).toEqual(testData);
    });

    it('should handle encryption failures gracefully', async () => {
      // Mock btoa to throw error
      const originalBtoa = global.btoa;
      global.btoa = vi.fn().mockImplementation(() => {
        throw new Error('Encoding failed');
      });
      
      const testData = TestDataFactory.surveyResults();
      const result = await dataManager.saveSurveyResults(testData);
      
      expect(result).toBe(false);
      
      // Restore original btoa
      global.btoa = originalBtoa;
    });

    it('should handle decryption failures gracefully', async () => {
      // Store invalid encrypted data
      localStorageMock['menhausen_survey_results'] = 'invalid-encrypted-data';
      
      const result = await dataManager.loadSurveyResults();
      
      expect(result).toBeNull();
    });
  });

  describe('Data Integrity', () => {
    it('should include checksum in stored data', async () => {
      const testData = TestDataFactory.surveyResults();
      
      await dataManager.saveSurveyResults(testData);
      
      // Decrypt and parse stored data to check structure
      const storedValue = localStorageMock['menhausen_survey_results'];
      const decryptedData = JSON.parse(
        decodeURIComponent(escape(atob(storedValue)))
      );
      
      expect(decryptedData.checksum).toBeTruthy();
      expect(decryptedData.version).toBe(2);
      expect(decryptedData.createdAt).toBeTruthy();
      expect(decryptedData.updatedAt).toBeTruthy();
    });

    it('should validate data integrity on load', async () => {
      const testData = TestDataFactory.surveyResults();
      
      await dataManager.saveSurveyResults(testData);
      
      // Corrupt the checksum
      const storedValue = localStorageMock['menhausen_survey_results'];
      const decryptedData = JSON.parse(
        decodeURIComponent(escape(atob(storedValue)))
      );
      decryptedData.checksum = 'corrupted-checksum';
      
      const corruptedValue = btoa(unescape(encodeURIComponent(JSON.stringify(decryptedData))));
      localStorageMock['menhausen_survey_results'] = corruptedValue;
      
      // Should attempt backup recovery
      const result = await dataManager.loadSurveyResults();
      expect(result).toBeNull(); // No backup exists, so null
    });

    it('should detect and handle corrupted data', async () => {
      // Store completely corrupted data
      localStorageMock['menhausen_survey_results'] = 'completely-corrupted-data';
      
      const result = await dataManager.loadSurveyResults();
      
      expect(result).toBeNull();
    });

    it('should calculate consistent checksums', async () => {
      const testData = TestDataFactory.surveyResults();
      
      await dataManager.saveSurveyResults(testData);
      const storedValue1 = localStorageMock['menhausen_survey_results'];
      
      // Clear and save same data again
      delete localStorageMock['menhausen_survey_results'];
      await dataManager.saveSurveyResults(testData);
      const storedValue2 = localStorageMock['menhausen_survey_results'];
      
      // Checksums should be the same for identical data
      const data1 = JSON.parse(decodeURIComponent(escape(atob(storedValue1))));
      const data2 = JSON.parse(decodeURIComponent(escape(atob(storedValue2))));
      
      expect(data1.checksum).toBe(data2.checksum);
    });
  });

  describe('Backup and Recovery', () => {
    it('should create backup copies automatically', async () => {
      const testData = TestDataFactory.surveyResults();
      
      await dataManager.saveSurveyResults(testData);
      
      // Verify backup exists
      expect(localStorageMock['menhausen_survey_results_backup']).toBeTruthy();
      expect(localStorageMock['menhausen_survey_results_backup'])
        .toBe(localStorageMock['menhausen_survey_results']);
    });

    it('should recover from backup when main data is corrupted', async () => {
      const testData = TestDataFactory.surveyResults();
      
      await dataManager.saveSurveyResults(testData);
      
      // Corrupt main data but keep backup intact
      localStorageMock['menhausen_survey_results'] = 'corrupted-main-data';
      
      const recoveredData = await dataManager.loadSurveyResults();
      
      expect(recoveredData).toEqual(testData);
      
      // Verify main data was restored from backup
      expect(localStorageMock['menhausen_survey_results'])
        .toBe(localStorageMock['menhausen_survey_results_backup']);
    });

    it('should return null when both main and backup data are corrupted', async () => {
      localStorageMock['menhausen_survey_results'] = 'corrupted-main';
      localStorageMock['menhausen_survey_results_backup'] = 'corrupted-backup';
      
      const result = await dataManager.loadSurveyResults();
      
      expect(result).toBeNull();
    });

    it('should handle missing backup gracefully', async () => {
      localStorageMock['menhausen_survey_results'] = 'corrupted-main';
      // No backup exists
      
      const result = await dataManager.loadSurveyResults();
      
      expect(result).toBeNull();
    });
  });

  describe('Data Migration', () => {
    it('should migrate v1 data to v2 format', async () => {
      const v1Data = {
        version: 1,
        data: {
          screen01: ['old_option'],
          completedAt: new Date().toISOString(),
        },
        checksum: 'old_checksum'
      };
      
      // Store v1 data directly
      const encryptedV1 = btoa(unescape(encodeURIComponent(JSON.stringify(v1Data))));
      localStorageMock['menhausen_survey_results'] = encryptedV1;
      
      const migratedData = await dataManager.loadSurveyResults();
      
      expect(migratedData).toBeTruthy();
      if (migratedData) {
        expect((migratedData as any).version).toBe(2);
        expect(migratedData.screen01).toContain('old_option');
        expect((migratedData as any).migratedAt).toBeTruthy();
      }
    });

    it('should preserve existing data during migration', async () => {
      const v1Data = {
        version: 1,
        data: {
          screen01: ['preserved_option'],
          screen02: ['another_option'],
          completedAt: '2023-01-01T00:00:00.000Z',
        },
        checksum: 'old_checksum'
      };
      
      const encryptedV1 = btoa(unescape(encodeURIComponent(JSON.stringify(v1Data))));
      localStorageMock['menhausen_survey_results'] = encryptedV1;
      
      const migratedData = await dataManager.loadSurveyResults();
      
      expect(migratedData).toBeTruthy();
      if (migratedData) {
        expect(migratedData.screen01).toContain('preserved_option');
        expect(migratedData.screen02).toContain('another_option');
        expect(migratedData.completedAt).toBe('2023-01-01T00:00:00.000Z');
      }
    });

    it('should add default values for missing fields in migration', async () => {
      const v1Data = {
        version: 1,
        data: {
          screen01: ['option'],
          // Missing other required fields
        },
        checksum: 'old_checksum'
      };
      
      const encryptedV1 = btoa(unescape(encodeURIComponent(JSON.stringify(v1Data))));
      localStorageMock['menhausen_survey_results'] = encryptedV1;
      
      const migratedData = await dataManager.loadSurveyResults();
      
      expect(migratedData).toBeTruthy();
      if (migratedData) {
        expect((migratedData as any).userPreferences).toEqual({
          language: 'en',
          theme: 'light',
          notifications: true,
          analytics: false
        });
        
        expect((migratedData as any).progressData).toEqual({
          completedSurveys: 0,
          completedExercises: 0,
          lastActivity: expect.any(String),
          achievements: []
        });
      }
    });

    it('should not migrate data that is already v2', async () => {
      const testData = TestDataFactory.surveyResults();
      
      await dataManager.saveSurveyResults(testData);
      const originalData = await dataManager.loadSurveyResults();
      
      // Load again to ensure no double migration
      const loadedAgain = await dataManager.loadSurveyResults();
      
      expect(loadedAgain).toEqual(originalData);
      expect(loadedAgain).toBeTruthy();
      if (loadedAgain) {
        expect((loadedAgain as any).version).toBe(2);
      }
    });
  });

  describe('Exercise Completion Management', () => {
    it('should save and load exercise completions', async () => {
      const completion = TestDataFactory.exerciseCompletion();
      
      const result = await dataManager.saveExerciseCompletion(completion);
      expect(result).toBe(true);
      
      const loadedCompletions = await dataManager.loadExerciseCompletions();
      expect(loadedCompletions).toBeTruthy();
      expect(loadedCompletions).toHaveLength(1);
      if (loadedCompletions) {
        expect(loadedCompletions[0]).toEqual(completion);
      }
    });

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
      if (loadedCompletions) {
        expect(loadedCompletions[0].rating).toBe(5);
        expect(loadedCompletions[0].completionCount).toBe(2);
      }
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

  describe('User Preferences Management', () => {
    it('should save and load user preferences', async () => {
      const preferences = TestDataFactory.userPreferences();
      
      const result = await dataManager.saveUserPreferences(preferences);
      expect(result).toBe(true);
      
      const loadedPreferences = await dataManager.loadUserPreferences();
      expect(loadedPreferences).toEqual(preferences);
    });

    it('should return default preferences when none exist', async () => {
      const loadedPreferences = await dataManager.loadUserPreferences();
      
      expect(loadedPreferences).toEqual({
        language: 'en',
        theme: 'light',
        notifications: true,
        analytics: false
      });
    });
  });

  describe('Progress Data Management', () => {
    it('should save and load progress data', async () => {
      const progress = TestDataFactory.progressData();
      
      const result = await dataManager.saveProgressData(progress);
      expect(result).toBe(true);
      
      const loadedProgress = await dataManager.loadProgressData();
      expect(loadedProgress).toEqual(progress);
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
  });

  describe('Storage Management', () => {
    it('should clear all data when requested', () => {
      localStorageMock['menhausen_survey_results'] = 'data1';
      localStorageMock['menhausen_exercise_completions'] = 'data2';
      localStorageMock['other_app_data'] = 'should_remain';
      
      dataManager.clearAllData();
      
      expect(localStorageMock['menhausen_survey_results']).toBeUndefined();
      expect(localStorageMock['menhausen_exercise_completions']).toBeUndefined();
      expect(localStorageMock['other_app_data']).toBe('should_remain');
    });

    it('should calculate storage info correctly', () => {
      localStorageMock['menhausen_test'] = 'test data';
      
      const storageInfo = dataManager.getStorageInfo();
      
      expect(storageInfo.used).toBeGreaterThan(0);
      expect(storageInfo.available).toBe(5 * 1024 * 1024); // 5MB
      expect(storageInfo.efficiency).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage.setItem to throw error
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const testData = TestDataFactory.surveyResults();
      const result = await dataManager.saveSurveyResults(testData);
      
      expect(result).toBe(false);
    });

    it('should handle localStorage.getItem errors gracefully', async () => {
      // Mock localStorage.getItem to throw error
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      
      const result = await dataManager.loadSurveyResults();
      
      expect(result).toBeNull();
    });

    it('should handle JSON parsing errors gracefully', async () => {
      localStorageMock['menhausen_survey_results'] = btoa('invalid-json-data');
      
      const result = await dataManager.loadSurveyResults();
      
      expect(result).toBeNull();
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
