/**
 * Data Transformers
 * 
 * Transform data between localStorage format and API format
 */

import type { SyncDataType, UserDataFromAPI } from './types';

/**
 * Transform localStorage data to API format
 */
export function transformToAPIFormat(type: SyncDataType, data: any): any {
  switch (type) {
    case 'surveyResults':
      return transformSurveyResults(data);
    case 'dailyCheckins':
      return transformDailyCheckins(data);
    case 'userStats':
      return transformUserStats(data);
    default:
      // TODO: Implement other transformers in Phase 2
      return data;
  }
}

/**
 * Transform API format data to localStorage format
 */
export function transformFromAPIFormat(type: SyncDataType, data: any): any {
  switch (type) {
    case 'surveyResults':
      return data; // Same format
    case 'dailyCheckins':
      return data; // Same format
    case 'userStats':
      return data; // Same format
    default:
      // TODO: Implement other transformers in Phase 2
      return data;
  }
}

/**
 * Transform survey results from localStorage to API format
 */
function transformSurveyResults(data: any): any {
  // Survey results are already in the correct format
  return data;
}

/**
 * Transform daily checkins from localStorage to API format
 */
function transformDailyCheckins(data: any): Record<string, any> {
  // Checkins are stored with keys like "daily_checkin_2025-01-01"
  // Transform to object with date keys
  const result: Record<string, any> = {};
  
  if (typeof data === 'object' && data !== null) {
    Object.keys(data).forEach(key => {
      if (key.startsWith('daily_checkin_')) {
        const dateKey = key.replace('daily_checkin_', '');
        result[dateKey] = data[key];
      }
    });
  }
  
  return result;
}

/**
 * Transform user stats from localStorage to API format
 */
function transformUserStats(data: any): any {
  // User stats format matches API format
  return data;
}

/**
 * Remove card answers (question1, question2) from card progress
 */
export function removeCardAnswers(cardProgress: any): any {
  if (!cardProgress || typeof cardProgress !== 'object') {
    return cardProgress;
  }

  // Handle array of attempts
  if (Array.isArray(cardProgress.completedAttempts)) {
    return {
      ...cardProgress,
      completedAttempts: cardProgress.completedAttempts.map((attempt: any) => {
        const { question1, question2, ...rest } = attempt;
        return rest;
      }),
    };
  }

  // Handle single card progress entry
  if (cardProgress.completedAttempts && Array.isArray(cardProgress.completedAttempts)) {
    return {
      ...cardProgress,
      completedAttempts: cardProgress.completedAttempts.map((attempt: any) => {
        const { question1, question2, ...rest } = attempt;
        return rest;
      }),
    };
  }

  return cardProgress;
}

