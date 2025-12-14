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
    case 'achievements':
      return transformAchievements(data);
    case 'points':
      return transformPoints(data);
    case 'preferences':
      return transformPreferences(data);
    case 'flowProgress':
      return transformFlowProgress(data);
    case 'psychologicalTest':
      return transformPsychologicalTest(data);
    case 'cardProgress':
      return transformCardProgress(data);
    case 'referralData':
      return transformReferralData(data);
    case 'language':
      return transformLanguage(data);
    case 'hasShownFirstAchievement':
      return transformHasShownFirstAchievement(data);
    default:
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
      return transformDailyCheckinsFromAPI(data);
    case 'userStats':
      return data; // Same format
    case 'achievements':
      return data; // Same format
    case 'points':
      return transformPointsFromAPI(data);
    case 'preferences':
      return data; // Same format
    case 'flowProgress':
      return data; // Same format
    case 'psychologicalTest':
      return data; // Same format
    case 'cardProgress':
      return transformCardProgressFromAPI(data);
    case 'referralData':
      return transformReferralDataFromAPI(data);
    case 'language':
      return data; // String value
    case 'hasShownFirstAchievement':
      return data; // Boolean value
    default:
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
 * Transform achievements from localStorage to API format
 */
function transformAchievements(data: any): any {
  // Achievements format matches API format
  return data;
}

/**
 * Transform points from localStorage to API format
 * localStorage stores: balance (number) and transactions (array)
 * API expects: { balance: number, transactions: array }
 */
function transformPoints(data: any): any {
  if (!data) {
    return { balance: 0, transactions: [] };
  }

  // If data is already in API format
  if (typeof data === 'object' && 'balance' in data && 'transactions' in data) {
    return data;
  }

  // If data is just balance number
  if (typeof data === 'number') {
    return { balance: data, transactions: [] };
  }

  // Default: return as-is
  return data;
}

/**
 * Transform points from API format to localStorage format
 */
function transformPointsFromAPI(data: any): any {
  // localStorage stores balance and transactions separately
  // But we'll keep the API format for consistency
  return data;
}

/**
 * Transform preferences from localStorage to API format
 */
function transformPreferences(data: any): any {
  // Preferences format matches API format
  return data;
}

/**
 * Transform flow progress from localStorage to API format
 */
function transformFlowProgress(data: any): any {
  // Flow progress format matches API format
  return data;
}

/**
 * Transform psychological test results from localStorage to API format
 */
function transformPsychologicalTest(data: any): any {
  // Psychological test format matches API format
  return data;
}

/**
 * Transform card progress from localStorage to API format
 * Removes question1/question2 from completedAttempts
 */
function transformCardProgress(data: any): Record<string, any> {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const result: Record<string, any> = {};

  // Handle object with cardId keys (from getAllCardProgress)
  if (data.cardId) {
    // Single card progress
    return {
      [data.cardId]: removeCardAnswers(data),
    };
  }

  // Handle object with multiple cards (from getAllCardProgress)
  Object.keys(data).forEach(cardId => {
    const cardData = data[cardId];
    if (cardData && typeof cardData === 'object') {
      result[cardId] = removeCardAnswers(cardData);
    }
  });

  return result;
}

/**
 * Transform card progress from API format to localStorage format
 */
function transformCardProgressFromAPI(data: any): Record<string, any> {
  if (!data || typeof data !== 'object') {
    return {};
  }

  // API format: { cardId: { ...cardProgress } }
  // localStorage format: { theme_card_progress_*: { ...cardProgress } }
  const result: Record<string, any> = {};
  
  Object.keys(data).forEach(cardId => {
    const key = `theme_card_progress_${cardId}`;
    result[key] = data[cardId];
  });

  return result;
}

/**
 * Transform referral data from localStorage to API format
 */
function transformReferralData(data: any): any {
  if (!data || typeof data !== 'object') {
    return {
      referredBy: null,
      referralCode: null,
      referralRegistered: false,
      referralList: [],
    };
  }

  // localStorage stores: referred_by, referral_code, referral_registered, referral_list_*
  // API expects: { referredBy, referralCode, referralRegistered, referralList }
  
  // Extract referral list (can be multiple keys with prefix)
  const referralList: string[] = [];
  if (typeof data === 'object') {
    Object.keys(data).forEach(key => {
      if (key.startsWith('referral_list_')) {
        try {
          const listData = data[key];
          if (listData && listData.referrals) {
            listData.referrals.forEach((ref: any) => {
              if (ref.userId) {
                referralList.push(ref.userId);
              }
            });
          }
        } catch (e) {
          console.warn('Error parsing referral list:', e);
        }
      }
    });
  }

  return {
    referredBy: data.referred_by || data.menhausen_referred_by || null,
    referralCode: data.referral_code || data.menhausen_referral_code || null,
    referralRegistered: data.referral_registered === 'true' || data.referral_registered === true || false,
    referralList,
  };
}

/**
 * Transform referral data from API format to localStorage format
 */
function transformReferralDataFromAPI(data: any): Record<string, any> {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const result: Record<string, any> = {};

  if (data.referredBy) {
    result.menhausen_referred_by = data.referredBy;
  }

  if (data.referralCode) {
    result.menhausen_referral_code = data.referralCode;
  }

  if (data.referralRegistered !== undefined) {
    result.menhausen_referral_registered = data.referralRegistered ? 'true' : 'false';
  }

  // Note: referralList handling is complex (multiple keys), handled separately

  return result;
}

/**
 * Transform language from localStorage to API format
 */
function transformLanguage(data: any): string {
  if (typeof data === 'string') {
    return data;
  }
  return 'en'; // Default
}

/**
 * Transform hasShownFirstAchievement from localStorage to API format
 */
function transformHasShownFirstAchievement(data: any): boolean {
  if (typeof data === 'boolean') {
    return data;
  }
  if (typeof data === 'string') {
    return data === 'true';
  }
  return false;
}

/**
 * Transform daily checkins from API format to localStorage format
 */
function transformDailyCheckinsFromAPI(data: any): Record<string, any> {
  if (!data || typeof data !== 'object') {
    return {};
  }

  // API format: { "YYYY-MM-DD": { ...checkinData } }
  // localStorage format: { "daily_checkin_YYYY-MM-DD": { ...checkinData } }
  const result: Record<string, any> = {};

  Object.keys(data).forEach(dateKey => {
    const localStorageKey = `daily_checkin_${dateKey}`;
    result[localStorageKey] = data[dateKey];
  });

  return result;
}

/**
 * Remove card answers (question1, question2) from card progress
 * Handles nested completedAttempts arrays properly
 */
export function removeCardAnswers(cardProgress: any): any {
  if (!cardProgress || typeof cardProgress !== 'object') {
    return cardProgress;
  }

  // Handle card progress with completedAttempts array
  if (cardProgress.completedAttempts && Array.isArray(cardProgress.completedAttempts)) {
    return {
      ...cardProgress,
      completedAttempts: cardProgress.completedAttempts.map((attempt: any) => {
        if (!attempt || typeof attempt !== 'object') {
          return attempt;
        }

        // Remove question1 and question2 from answers object
        const { question1, question2, answers, ...rest } = attempt;
        
        // If answers is an object, remove question1/question2 from it
        let cleanedAnswers = answers;
        if (answers && typeof answers === 'object') {
          const { question1: q1, question2: q2, ...otherAnswers } = answers;
          cleanedAnswers = Object.keys(otherAnswers).length > 0 ? otherAnswers : undefined;
        }

        // Return attempt without question1/question2
        const cleanedAttempt = { ...rest };
        if (cleanedAnswers && Object.keys(cleanedAnswers).length > 0) {
          cleanedAttempt.answers = cleanedAnswers;
        }

        return cleanedAttempt;
      }),
    };
  }

  // If no completedAttempts, return as-is
  return cardProgress;
}

