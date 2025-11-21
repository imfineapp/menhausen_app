/**
 * ActivityDataManager - Utility class for managing user activity data
 * 
 * Features:
 * - Get activity data for a specific date range
 * - Combine check-ins and exercise completions
 * - Determine activity type per day (none, checkin only, checkin + exercise)
 */

import { DailyCheckinManager, CheckinData } from './DailyCheckinManager';
import { CompletedAttempt } from './ThemeCardManager';

export enum ActivityType {
  NONE = 0,           // Нет активности
  CHECKIN_ONLY = 1,   // Только чекин
  CHECKIN_AND_EXERCISE = 2  // Чекин + упражнение
}

export interface ActivityData {
  date: string; // YYYY-MM-DD format
  activityType: ActivityType;
  checkinDate?: string; // Дата чекина, если был
  exerciseCount?: number; // Количество упражнений в этот день
}

/**
 * Get all completed exercise attempts grouped by date
 * @returns Map with date (YYYY-MM-DD) as key and array of attempts as value
 */
function getAllCompletedAttemptsByDate(): Map<string, CompletedAttempt[]> {
  const attemptsByDate = new Map<string, CompletedAttempt[]>();
  
  try {
    // Iterate through localStorage to find all card progress
    const STORAGE_KEY_PREFIX = 'theme_card_progress_';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const progress = JSON.parse(data);
            if (progress && Array.isArray(progress.completedAttempts)) {
              // Process each completed attempt
              progress.completedAttempts.forEach((attempt: CompletedAttempt) => {
                if (attempt.date) {
                  const existing = attemptsByDate.get(attempt.date) || [];
                  existing.push(attempt);
                  attemptsByDate.set(attempt.date, existing);
                }
              });
            }
          } catch (parseError) {
            console.warn('Error parsing card progress data:', parseError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error getting completed attempts by date:', error);
  }
  
  return attemptsByDate;
}

/**
 * Get activity data for a specific date range
 * @param startDate - Start date (inclusive)
 * @param endDate - End date (inclusive)
 * @returns Array of ActivityData objects for each day in the range
 */
export function getActivityDataForPeriod(startDate: Date, endDate: Date): ActivityData[] {
  const activityData: ActivityData[] = [];
  
  // Get all check-ins
  const allCheckins = DailyCheckinManager.getAllCheckins();
  const checkinsByDate = new Map<string, CheckinData>();
  allCheckins.forEach(checkin => {
    checkinsByDate.set(checkin.date, checkin);
  });
  
  // Get all completed exercise attempts grouped by date
  const exercisesByDate = getAllCompletedAttemptsByDate();
  
  // Create a date iterator
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  // Iterate through each day in the range
  while (currentDate <= end) {
    const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    
    const hasCheckin = checkinsByDate.has(dateKey);
    const exercises = exercisesByDate.get(dateKey) || [];
    const hasExercise = exercises.length > 0;
    
    let activityType: ActivityType;
    if (hasCheckin && hasExercise) {
      activityType = ActivityType.CHECKIN_AND_EXERCISE;
    } else if (hasCheckin) {
      activityType = ActivityType.CHECKIN_ONLY;
    } else {
      activityType = ActivityType.NONE;
    }
    
    activityData.push({
      date: dateKey,
      activityType,
      checkinDate: hasCheckin ? dateKey : undefined,
      exerciseCount: exercises.length
    });
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return activityData;
}

/**
 * Get activity data for the last N months including current month
 * @param monthsBack - Number of months to go back (default: 3)
 * @returns Array of ActivityData objects
 */
export function getActivityDataForLastMonths(monthsBack: number = 3): ActivityData[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  // Calculate start date: first day of the month N months ago
  const startDate = new Date(today);
  startDate.setMonth(today.getMonth() - monthsBack);
  startDate.setDate(1); // First day of the month
  startDate.setHours(0, 0, 0, 0);
  
  return getActivityDataForPeriod(startDate, today);
}

