import { earnPoints } from '@/src/stores/points.store';
import { RewardEventType } from '@/utils/supabaseSync/rewardService';
import { AnalyticsEvent, capture } from './analytics/posthog';

/**
 * DailyCheckinManager - Utility class for managing daily check-in logic
 *
 * Features:
 * - Multi-check-in support per day (one every 4 hours minimum)
 * - Day-based key generation with session timestamps (YYYY-MM-DD_<ts>)
 * - Backward-compatible migration of old single-entry keys
 * - Daily score as average mood across sessions
 * - Check-in streak counts consecutive days (not sessions)
 */

export interface CheckinData {
  id: string;
  date: string; // YYYY-MM-DD format
  timestamp: number; // Unix timestamp (ms)
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
  private static readonly CHECKIN_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours
  private static readonly CHECKIN_REWARD = 10; // points per check-in session

  /**
   * Generate day-based key for current day (YYYY-MM-DD format)
   */
  static getCurrentDayKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Generate a session-scoped storage key for a specific day + timestamp
   * New format: daily_checkin_YYYY-MM-DD_<timestamp_ms>
   */
  static getSessionKey(dateKey: string, timestampMs: number): string {
    return `${this.STORAGE_KEY_PREFIX}${dateKey}_${timestampMs}`;
  }

  /**
   * Legacy storage key (single entry per day) — for backward compat reads
   */
  static getLegacyKey(dateKey: string): string {
    return `${this.STORAGE_KEY_PREFIX}${dateKey}`;
  }

  /**
   * Returns true if a storage key belongs to a given dateKey.
   * Matches both new format (daily_checkin_YYYY-MM-DD_<ts>) and legacy (daily_checkin_YYYY-MM-DD).
   */
  private static keyMatchesDate(storageKey: string, dateKey: string): boolean {
    // New format: daily_checkin_YYYY-MM-DD_<digits>
    if (storageKey.startsWith(`${this.STORAGE_KEY_PREFIX}${dateKey}_`)) {
      const suffix = storageKey.slice(`${this.STORAGE_KEY_PREFIX}${dateKey}_`.length);
      return /^\d+$/.test(suffix);
    }
    // Legacy exact match
    return storageKey === `${this.STORAGE_KEY_PREFIX}${dateKey}`;
  }

  /**
   * Save check-in data for current day.
   * Each call creates a new session entry at daily_checkin_YYYY-MM-DD_<timestamp>.
   * Returns false if cooldown has not elapsed since last check-in.
   */
  static saveCheckin(
    checkinData: Omit<CheckinData, 'id' | 'date' | 'timestamp' | 'completed'>,
  ): { success: false; reason: 'cooldown' } | { success: true; data: CheckinData } {
    const now = Date.now();
    const currentDayKey = this.getCurrentDayKey();

    // Enforce 4-hour cooldown
    const lastCheckin = this.getLastCheckin();
    if (lastCheckin && now - lastCheckin.timestamp < this.CHECKIN_COOLDOWN_MS) {
      return { success: false, reason: 'cooldown' };
    }

    const fullCheckinData: CheckinData = {
      ...checkinData,
      id: `checkin_${currentDayKey}_${now}`,
      date: currentDayKey,
      timestamp: now,
      completed: true,
    };

    const storageKey = this.getSessionKey(currentDayKey, now);

    try {
      localStorage.setItem(storageKey, JSON.stringify(fullCheckinData));

      void capture(AnalyticsEvent.DAILY_CHECKIN_COMPLETED, {
        date_key: currentDayKey,
        mood: checkinData.mood,
        mood_value: checkinData.value,
        checkin_streak: this.getCheckinStreak(),
      });

      // Award points per check-in session (idempotent via unique correlationId)
      try {
        const correlationId = `checkin_${currentDayKey}_${now}`;
        void earnPoints(this.CHECKIN_REWARD, {
          correlationId,
          note: 'Check-in reward',
          eventType: RewardEventType.DAILY_CHECKIN,
          referenceId: currentDayKey,
          payload: {
            dateKey: currentDayKey,
          },
        });
      } catch (awardError) {
        console.warn('DailyCheckinManager: failed to award check-in points', awardError);
      }

      return { success: true, data: fullCheckinData };
    } catch (error) {
      console.error('Error saving check-in data:', error);
      return { success: false, reason: 'cooldown' };
    }
  }

  /**
   * Get all check-in entries for a specific date (may be multiple sessions).
   * Also performs lazy migration of legacy single-entry keys.
   */
  static getCheckinsForDay(dateKey: string): CheckinData[] {
    try {
      const results: CheckinData[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !this.keyMatchesDate(key, dateKey)) continue;

        const data = localStorage.getItem(key);
        if (!data) continue;

        try {
          const parsed = JSON.parse(data) as Partial<CheckinData>;

          // Lazy migration of legacy key: daily_checkin_YYYY-MM-DD (no timestamp suffix)
          if (key === this.getLegacyKey(dateKey)) {
            const migrated = this.migrateLegacyEntry(key, parsed);
            if (migrated) {
              results.push(migrated);
              continue;
            }
          }

          if (parsed.completed !== false) {
            results.push({
              id: parsed.id || `checkin_${dateKey}_${parsed.timestamp || Date.now()}`,
              date: parsed.date || dateKey,
              timestamp: parsed.timestamp || Date.now(),
              mood: parsed.mood || '',
              value: parsed.value ?? 0,
              color: parsed.color || '',
              completed: parsed.completed !== undefined ? parsed.completed : true,
            });
          }
        } catch {
          // skip unparseable entries
        }
      }

      return results.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Error getting check-ins for day:', error);
      return [];
    }
  }

  /**
   * Migrate a legacy single-entry key to the new session-key format.
   * Returns the migrated CheckinData or null on failure.
   */
  private static migrateLegacyEntry(
    legacyKey: string,
    parsed: Partial<CheckinData>,
  ): CheckinData | null {
    try {
      const ts = parsed.timestamp || Date.now();
      const dateKey = parsed.date || legacyKey.replace(this.STORAGE_KEY_PREFIX, '');

      const migrated: CheckinData = {
        id: parsed.id || `checkin_${dateKey}_${ts}`,
        date: dateKey,
        timestamp: ts,
        mood: parsed.mood || '',
        value: parsed.value ?? 0,
        color: parsed.color || '',
        completed: parsed.completed !== undefined ? parsed.completed : true,
      };

      // Write to new key and remove legacy key
      const newKey = this.getSessionKey(dateKey, ts);
      localStorage.setItem(newKey, JSON.stringify(migrated));
      localStorage.removeItem(legacyKey);

      return migrated;
    } catch {
      return null;
    }
  }

  /**
   * Get the most recent check-in entry for a specific date (newest session of that day).
   */
  static getCheckin(dateKey: string): CheckinData | null {
    const entries = this.getCheckinsForDay(dateKey);
    if (entries.length === 0) return null;
    // Return the most recent session for that day
    return entries[entries.length - 1];
  }

  /**
   * Get the most recent check-in across all days.
   */
  static getLastCheckin(): CheckinData | null {
    try {
      let latest: CheckinData | null = null;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(this.STORAGE_KEY_PREFIX)) continue;

        const data = localStorage.getItem(key);
        if (!data) continue;

        try {
          const parsed = JSON.parse(data) as Partial<CheckinData>;
          if (parsed.completed && parsed.timestamp) {
            if (!latest || parsed.timestamp > latest.timestamp) {
              latest = {
                id: parsed.id || `checkin_${parsed.date}_${parsed.timestamp}`,
                date: parsed.date || '',
                timestamp: parsed.timestamp,
                mood: parsed.mood || '',
                value: parsed.value ?? 0,
                color: parsed.color || '',
                completed: true,
              };
            }
          }
        } catch {
          // skip
        }
      }

      return latest;
    } catch (error) {
      console.error('Error getting last check-in:', error);
      return null;
    }
  }

  /**
   * Check if a given date key represents a different day than today.
   * Returns true if the provided dateKey is not the current day.
   */
  static isNewDay(dateKey: string): boolean {
    return dateKey !== this.getCurrentDayKey();
  }

  /**
   * Returns true if the user should be prompted for a check-in.
   * True when: no check-ins ever, or last check-in was > 4 hours ago.
   */
  static shouldPromptCheckin(): boolean {
    const last = this.getLastCheckin();
    if (!last) return true;
    return Date.now() - last.timestamp >= this.CHECKIN_COOLDOWN_MS;
  }

  /**
   * Get average mood value for a specific day (0–5 scale after normalization).
   * Returns null if no check-ins exist for that day.
   */
  static getAverageMoodForDay(dateKey: string): number | null {
    const entries = this.getCheckinsForDay(dateKey);
    if (entries.length === 0) return null;
    const sum = entries.reduce((acc, e) => acc + (e.value + 1), 0); // normalize value→1..5
    return Math.round(sum / entries.length);
  }

  /**
   * @deprecated Use shouldPromptCheckin() for check-in prompting logic.
   * Checks if at least one session exists for today (not whether user should be prompted).
   */
  static getCurrentDayStatus(): DailyCheckinStatus {
    try {
      const currentDayKey = this.getCurrentDayKey();
      const entries = this.getCheckinsForDay(currentDayKey);
      if (entries.length === 0) return DailyCheckinStatus.NOT_COMPLETED;
      return DailyCheckinStatus.COMPLETED;
    } catch (error) {
      console.error('Error checking current day status:', error);
      return DailyCheckinStatus.ERROR;
    }
  }

  /**
   * Total number of completed check-in sessions (not days).
   */
  static getTotalCheckins(): number {
    try {
      let totalCount = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(this.STORAGE_KEY_PREFIX)) continue;
        const data = localStorage.getItem(key);
        if (!data) continue;
        try {
          const parsed = JSON.parse(data) as CheckinData;
          if (parsed.completed) totalCount++;
        } catch {
          // skip
        }
      }
      return totalCount;
    } catch (error) {
      console.error('Error counting total check-ins:', error);
      return 0;
    }
  }

  /**
   * Check-in streak: number of consecutive days (from today backwards)
   * that have at least one completed check-in session.
   */
  static getCheckinStreak(): number {
    try {
      // Build a Set of dates that have at least one check-in (single pass)
      const allCheckins = this.getAllCheckins();
      const datesWithCheckins = new Set<string>();
      for (const checkin of allCheckins) {
        if (checkin.completed && checkin.date) {
          datesWithCheckins.add(checkin.date);
        }
      }

      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const year = checkDate.getFullYear();
        const month = String(checkDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        if (datesWithCheckins.has(dateKey)) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating check-in streak:', error);
      return 0;
    }
  }

  /**
   * Clear all check-in data (for testing / reset).
   */
  static clearAllCheckins(): boolean {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing check-in data:', error);
      return false;
    }
  }

  /**
   * Get all check-in entries across all days (flat list, newest first).
   */
  static getAllCheckins(): CheckinData[] {
    try {
      const checkins: CheckinData[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(this.STORAGE_KEY_PREFIX)) continue;
        const data = localStorage.getItem(key);
        if (!data) continue;

        try {
          const parsed = JSON.parse(data) as Partial<CheckinData>;

          // Extract date from key if missing
          let dateKey = parsed.date;
          if (!dateKey) {
            const stripped = key.replace(this.STORAGE_KEY_PREFIX, '');
            // new format: YYYY-MM-DD_<digits> → take first 10 chars
            // legacy: YYYY-MM-DD → full string
            const candidate = stripped.split('_')[0];
            if (/^\d{4}-\d{2}-\d{2}$/.test(stripped)) {
              dateKey = stripped;
            } else if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
              dateKey = candidate;
            }
          }

          if (dateKey) {
            checkins.push({
              id: parsed.id || `checkin_${dateKey}_${parsed.timestamp || Date.now()}`,
              date: dateKey,
              timestamp: parsed.timestamp || Date.now(),
              mood: parsed.mood || '',
              value: parsed.value ?? 0,
              color: parsed.color || '',
              completed: parsed.completed !== undefined ? parsed.completed : true,
            });
          }
        } catch {
          // skip
        }
      }

      return checkins.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error retrieving all check-ins:', error);
      return [];
    }
  }

  /**
   * Weekly check-ins status (Monday–Sunday).
   * A day is marked true if it has at least one completed check-in session.
   */
  static getWeeklyCheckinsStatus(): Record<
    'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
    boolean
  > {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday ...

      const monday = new Date(today);
      monday.setHours(0, 0, 0, 0);
      monday.setDate(today.getDate() - ((dayOfWeek === 0 ? 7 : dayOfWeek) - 1));

      const weeklyStatus: Record<
        'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
        boolean
      > = { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false };

      const dayNames: Array<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'> = [
        'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat',
      ];

      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(monday);
        checkDate.setDate(monday.getDate() + i);

        const year = checkDate.getFullYear();
        const month = String(checkDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        const entries = this.getCheckinsForDay(dateKey);
        const name = dayNames[checkDate.getDay()];
        if (entries.length > 0) {
          (weeklyStatus as Record<string, boolean>)[name] = true;
        }
      }

      return weeklyStatus;
    } catch (error) {
      console.error('Error getting weekly check-ins status:', error);
      return { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false };
    }
  }
}
