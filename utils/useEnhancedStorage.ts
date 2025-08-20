import { useState, useEffect, useCallback } from 'react';
import { criticalDataManager } from './dataManager';
import { apiService } from './apiService';

// Enhanced storage hook for React components
export function useEnhancedStorage() {
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(apiService.getSyncStatus());

  // Update sync status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(apiService.getSyncStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Enhanced survey results management
  const saveSurveyResults = useCallback(async (results: any) => {
    setIsLoading(true);
    
    try {
      // Save locally with enhanced persistence
      const localSuccess = await criticalDataManager.saveSurveyResults(results);
      
      if (localSuccess) {
        // Queue for API sync
        await apiService.submitSurveyResults(results);
        console.log('Survey results saved and queued for sync');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to save survey results:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSurveyResults = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const results = await criticalDataManager.loadSurveyResults();
      return results;
    } catch (error) {
      console.error('Failed to load survey results:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enhanced exercise completion management
  const saveExerciseCompletion = useCallback(async (completion: any) => {
    setIsLoading(true);
    
    try {
      // Save locally with enhanced persistence
      const localSuccess = await criticalDataManager.saveExerciseCompletion(completion);
      
      if (localSuccess) {
        // Queue for API sync
        await apiService.submitExerciseCompletion(completion);
        console.log('Exercise completion saved and queued for sync');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to save exercise completion:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadExerciseCompletions = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const completions = await criticalDataManager.loadExerciseCompletions();
      return completions || [];
    } catch (error) {
      console.error('Failed to load exercise completions:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // User preferences management
  const saveUserPreferences = useCallback(async (preferences: any) => {
    setIsLoading(true);
    
    try {
      // Save locally with enhanced persistence
      const localSuccess = await criticalDataManager.saveUserPreferences(preferences);
      
      if (localSuccess) {
        // Queue for API sync
        await apiService.updatePreferences(preferences);
        console.log('User preferences saved and queued for sync');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserPreferences = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const preferences = await criticalDataManager.loadUserPreferences();
      return preferences || {
        language: 'en',
        theme: 'light',
        notifications: true,
        analytics: false
      };
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return {
        language: 'en',
        theme: 'light',
        notifications: true,
        analytics: false
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Progress data management
  const saveProgressData = useCallback(async (progress: any) => {
    setIsLoading(true);
    
    try {
      // Save locally with enhanced persistence
      const localSuccess = await criticalDataManager.saveProgressData(progress);
      
      if (localSuccess) {
        // Queue for API sync
        await apiService.updateProgress(progress);
        console.log('Progress data saved and queued for sync');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to save progress data:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadProgressData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const progress = await criticalDataManager.loadProgressData();
      return progress || {
        completedSurveys: 0,
        completedExercises: 0,
        lastActivity: new Date().toISOString(),
        achievements: []
      };
    } catch (error) {
      console.error('Failed to load progress data:', error);
      return {
        completedSurveys: 0,
        completedExercises: 0,
        lastActivity: new Date().toISOString(),
        achievements: []
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Utility functions
  const forceSync = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const success = await apiService.forcSync();
      setSyncStatus(apiService.getSyncStatus());
      return success;
    } catch (error) {
      console.error('Failed to force sync:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStorageInfo = useCallback(() => {
    return criticalDataManager.getStorageInfo();
  }, []);

  const clearAllData = useCallback(() => {
    criticalDataManager.clearAllData();
    apiService.clearQueue();
    setSyncStatus(apiService.getSyncStatus());
    console.log('All data cleared');
  }, []);

  // Backward compatibility with existing localStorage usage
  const legacyGetItem = useCallback((key: string) => {
    return localStorage.getItem(key);
  }, []);

  const legacySetItem = useCallback((key: string, value: string) => {
    localStorage.setItem(key, value);
  }, []);

  return {
    // State
    isLoading,
    syncStatus,
    
    // Survey management
    saveSurveyResults,
    loadSurveyResults,
    
    // Exercise management
    saveExerciseCompletion,
    loadExerciseCompletions,
    
    // Preferences management
    saveUserPreferences,
    loadUserPreferences,
    
    // Progress management
    saveProgressData,
    loadProgressData,
    
    // Utility functions
    forceSync,
    getStorageInfo,
    clearAllData,
    
    // Backward compatibility
    legacyGetItem,
    legacySetItem
  };
}
