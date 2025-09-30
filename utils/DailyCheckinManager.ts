/**
 * DailyCheckinManager - Utility class for managing daily check-in logic
 * 
 * Features:
 * - Day-based key generation (YYYY-MM-DD format)
 * - 6 AM reset logic using local device time
 * - Check-in data storage with unique daily keys
 * - Timezone handling and edge case management
 */

export interface CheckinData {
  id: string;
  date: string; // YYYY-MM-DD format
  timestamp: number; // Unix timestamp
  mood: string;
  value: number;
  color: string;
  completed: boolean;
}

export enum DailyCheckinStatus {
  NOT_COMPLETED = 'not_completed',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export class DailyCheckinManager {
  private static readonly STORAGE_KEY_PREFIX = 'daily_checkin_';
  private static readonly RESET_HOUR = 6; // 6 AM reset time

  /**
   * Generate day-based key for current day (YYYY-MM-DD format)
   * @returns string in format YYYY-MM-DD
   */
  static getCurrentDayKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Check if it's a new day based on 6 AM reset logic
   * @param lastCheckinDate - Last check-in date string (YYYY-MM-DD)
   * @returns boolean indicating if it's a new day
   */
  static isNewDay(lastCheckinDate: string): boolean {
    const currentDayKey = this.getCurrentDayKey();
    return lastCheckinDate !== currentDayKey;
  }

  /**
   * Check if current time is after 6 AM reset
   * @returns boolean indicating if it's after 6 AM
   */
  static isAfterResetTime(): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= this.RESET_HOUR;
  }

  /**
   * Get the storage key for a specific date
   * @param dateKey - Date string in YYYY-MM-DD format
   * @returns storage key string
   */
  static getStorageKey(dateKey: string): string {
    return `${this.STORAGE_KEY_PREFIX}${dateKey}`;
  }

  /**
   * Save check-in data for current day
   * @param checkinData - Check-in data to save
   * @returns boolean indicating success
   */
  static saveCheckin(checkinData: Omit<CheckinData, 'id' | 'date' | 'timestamp' | 'completed'>): boolean {
    try {
      const currentDayKey = this.getCurrentDayKey();
      const storageKey = this.getStorageKey(currentDayKey);
      
      const fullCheckinData: CheckinData = {
        ...checkinData,
        id: `checkin_${currentDayKey}_${Date.now()}`,
        date: currentDayKey,
        timestamp: Date.now(),
        completed: true
      };

      localStorage.setItem(storageKey, JSON.stringify(fullCheckinData));
      return true;
    } catch (error) {
      console.error('Error saving check-in data:', error);
      return false;
    }
  }

  /**
   * Get check-in data for a specific date
   * @param dateKey - Date string in YYYY-MM-DD format
   * @returns CheckinData or null if not found
   */
  static getCheckin(dateKey: string): CheckinData | null {
    try {
      const storageKey = this.getStorageKey(dateKey);
      const data = localStorage.getItem(storageKey);
      
      if (!data) {
        return null;
      }

      return JSON.parse(data) as CheckinData;
    } catch (error) {
      console.error('Error retrieving check-in data:', error);
      return null;
    }
  }

  /**
   * Check if check-in is completed for current day
   * @returns DailyCheckinStatus
   */
  static getCurrentDayStatus(): DailyCheckinStatus {
    try {
      const currentDayKey = this.getCurrentDayKey();
      const checkinData = this.getCheckin(currentDayKey);
      
      if (!checkinData) {
        return DailyCheckinStatus.NOT_COMPLETED;
      }

      return checkinData.completed ? DailyCheckinStatus.COMPLETED : DailyCheckinStatus.NOT_COMPLETED;
    } catch (error) {
      console.error('Error checking current day status:', error);
      return DailyCheckinStatus.ERROR;
    }
  }

  /**
   * Get total number of completed check-ins
   * @returns number of completed check-ins
   */
  static getTotalCheckins(): number {
    try {
      let totalCount = 0;
      
      // Iterate through localStorage to count check-ins
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const checkinData = JSON.parse(data) as CheckinData;
              if (checkinData.completed) {
                totalCount++;
              }
            } catch (parseError) {
              console.warn('Error parsing check-in data:', parseError);
            }
          }
        }
      }
      
      return totalCount;
    } catch (error) {
      console.error('Error counting total check-ins:', error);
      return 0;
    }
  }

  /**
   * Get check-in streak (consecutive days)
   * @returns number of consecutive days with check-ins
   */
  static getCheckinStreak(): number {
    try {
      let streak = 0;
      const today = new Date();
      
      // Check backwards from today
      for (let i = 0; i < 365; i++) { // Check up to 1 year back
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        
        const year = checkDate.getFullYear();
        const month = String(checkDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        
        const checkinData = this.getCheckin(dateKey);
        
        if (checkinData && checkinData.completed) {
          streak++;
        } else {
          break; // Streak broken
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating check-in streak:', error);
      return 0;
    }
  }

  /**
   * Clear all check-in data (for testing purposes)
   * @returns boolean indicating success
   */
  static clearAllCheckins(): boolean {
    try {
      const keysToRemove: string[] = [];
      
      // Find all check-in keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all check-in keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      return true;
    } catch (error) {
      console.error('Error clearing check-in data:', error);
      return false;
    }
  }

  /**
   * Get all check-in data (for debugging/analytics)
   * @returns array of CheckinData
   */
  static getAllCheckins(): CheckinData[] {
    try {
      const checkins: CheckinData[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const checkinData = JSON.parse(data) as CheckinData;
              checkins.push(checkinData);
            } catch (parseError) {
              console.warn('Error parsing check-in data:', parseError);
            }
          }
        }
      }
      
      // Sort by date (newest first)
      return checkins.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error retrieving all check-ins:', error);
      return [];
    }
  }
}
