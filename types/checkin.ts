/**
 * TypeScript interfaces and types for daily check-in system
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

export interface CheckinFormData {
  mood: string;
  value: number;
  color: string;
}

export interface CheckinStats {
  totalCheckins: number;
  currentStreak: number;
  lastCheckinDate: string | null;
  isCompletedToday: boolean;
}

export interface CheckinHistory {
  date: string;
  mood: string;
  value: number;
  color: string;
  completed: boolean;
}

export interface DailyCheckinManagerInterface {
  getCurrentDayKey(): string;
  isNewDay(lastCheckinDate: string): boolean;
  saveCheckin(checkinData: CheckinFormData): { success: false; reason: 'cooldown' } | { success: true; data: CheckinData };
  getCheckin(dateKey: string): CheckinData | null;
  getCheckinsForDay(dateKey: string): CheckinData[];
  getLastCheckin(): CheckinData | null;
  shouldPromptCheckin(): boolean;
  getAverageMoodForDay(dateKey: string): number | null;
  getCurrentDayStatus(): DailyCheckinStatus;
  getTotalCheckins(): number;
  getCheckinStreak(): number;
  clearAllCheckins(): boolean;
  getAllCheckins(): CheckinData[];
}
