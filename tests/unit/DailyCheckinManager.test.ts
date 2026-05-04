/**
 * Unit tests for DailyCheckinManager utility class
 * Tests core logic, multi-check-in storage, 4h cooldown, and backward compat
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DailyCheckinManager, DailyCheckinStatus } from '../../utils/DailyCheckinManager';

function createMemoryLocalStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; },
  } as Storage;
}

describe('DailyCheckinManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('localStorage', createMemoryLocalStorage());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getCurrentDayKey', () => {
    it('should generate correct day key format (YYYY-MM-DD)', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00Z'));
      const dayKey = DailyCheckinManager.getCurrentDayKey();
      expect(dayKey).toBe('2024-01-15');
    });

    it('should handle different dates correctly', () => {
      vi.setSystemTime(new Date('2024-12-31T23:30:00'));
      const dayKey = DailyCheckinManager.getCurrentDayKey();
      expect(dayKey).toBe('2024-12-31');
    });
  });

  describe('isNewDay', () => {
    it('should return true when dates are different', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00Z'));
      const result = DailyCheckinManager.isNewDay('2024-01-14');
      expect(result).toBe(true);
    });

    it('should return false when dates are the same', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00Z'));
      const result = DailyCheckinManager.isNewDay('2024-01-15');
      expect(result).toBe(false);
    });
  });

  describe('saveCheckin', () => {
    it('should save check-in data successfully', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      const result = DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });
      expect(result.success).toBe(true);
    });

    it('should return cooldown when saving within 4 hours', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      const r1 = DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });
      expect(r1.success).toBe(true);

      vi.setSystemTime(new Date('2024-01-15T11:30:00'));
      const r2 = DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });
      expect(r2.success).toBe(false);
      if (!r2.success) expect(r2.reason).toBe('cooldown');
    });

    it('should allow save after 4 hours', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });

      vi.setSystemTime(new Date('2024-01-15T14:30:00'));
      const r = DailyCheckinManager.saveCheckin({ mood: 'ok', value: 3, color: '#fff' });
      expect(r.success).toBe(true);
    });

    it('should include all required fields in saved data', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });

      const retrieved = DailyCheckinManager.getCheckin('2024-01-15');
      expect(retrieved).toBeTruthy();
      expect(retrieved?.mood).toBe('happy');
      expect(retrieved?.value).toBe(4);
      expect(retrieved?.color).toBe('#4ecdc4');
      expect(retrieved?.completed).toBe(true);
      expect(retrieved?.date).toBe('2024-01-15');
      expect(retrieved?.id).toBeTruthy();
      expect(retrieved?.timestamp).toBeTruthy();
    });
  });

  describe('shouldPromptCheckin', () => {
    it('should return true when no check-ins exist', () => {
      expect(DailyCheckinManager.shouldPromptCheckin()).toBe(true);
    });

    it('should return false within 4 hours of last check-in', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });

      vi.setSystemTime(new Date('2024-01-15T13:00:00'));
      expect(DailyCheckinManager.shouldPromptCheckin()).toBe(false);
    });

    it('should return true after 4 hours', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });

      vi.setSystemTime(new Date('2024-01-15T14:30:01'));
      expect(DailyCheckinManager.shouldPromptCheckin()).toBe(true);
    });
  });

  describe('getCheckinsForDay', () => {
    it('should return empty array when no check-ins exist for a day', () => {
      const result = DailyCheckinManager.getCheckinsForDay('2024-01-15');
      expect(result).toEqual([]);
    });

    it('should return check-ins for a specific day', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });

      const entries = DailyCheckinManager.getCheckinsForDay('2024-01-15');
      expect(entries).toHaveLength(1);
      expect(entries[0].mood).toBe('happy');
    });

    it('should return multiple sessions for the same day', () => {
      vi.setSystemTime(new Date('2024-01-15T08:00:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });

      vi.setSystemTime(new Date('2024-01-15T12:00:00'));
      DailyCheckinManager.saveCheckin({ mood: 'ok', value: 2, color: '#fff' });

      const entries = DailyCheckinManager.getCheckinsForDay('2024-01-15');
      expect(entries).toHaveLength(2);
    });
  });

  describe('getAverageMoodForDay', () => {
    it('should return null for empty days', () => {
      expect(DailyCheckinManager.getAverageMoodForDay('2024-01-15')).toBeNull();
    });

    it('should return normalized value for single check-in', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });
      // value 4 + 1 = 5
      expect(DailyCheckinManager.getAverageMoodForDay('2024-01-15')).toBe(5);
    });

    it('should compute average of multiple sessions on same day', () => {
      vi.setSystemTime(new Date('2024-01-15T08:00:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' }); // normalized: 5

      vi.setSystemTime(new Date('2024-01-15T12:00:00'));
      DailyCheckinManager.saveCheckin({ mood: 'ok', value: 2, color: '#fff' }); // normalized: 3

      // average of 5 and 3 = 4
      expect(DailyCheckinManager.getAverageMoodForDay('2024-01-15')).toBe(4);
    });
  });

  describe('getLastCheckin', () => {
    it('should return null when no check-ins exist', () => {
      expect(DailyCheckinManager.getLastCheckin()).toBeNull();
    });

    it('should return the most recent check-in', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });

      vi.setSystemTime(new Date('2024-01-15T14:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'ok', value: 3, color: '#fff' });

      const last = DailyCheckinManager.getLastCheckin();
      expect(last?.mood).toBe('ok');
    });
  });

  describe('getCurrentDayStatus', () => {
    it('should return NOT_COMPLETED when no check-in exists', () => {
      const result = DailyCheckinManager.getCurrentDayStatus();
      expect(result).toBe(DailyCheckinStatus.NOT_COMPLETED);
    });

    it('should return COMPLETED when check-in exists', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });
      expect(DailyCheckinManager.getCurrentDayStatus()).toBe(DailyCheckinStatus.COMPLETED);
    });
  });

  describe('getTotalCheckins', () => {
    it('should return 0 when no check-ins exist', () => {
      expect(DailyCheckinManager.getTotalCheckins()).toBe(0);
    });

    it('should count multiple sessions', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });

      vi.setSystemTime(new Date('2024-01-15T14:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'ok', value: 3, color: '#fff' });

      expect(DailyCheckinManager.getTotalCheckins()).toBe(2);
    });
  });

  describe('getCheckinStreak', () => {
    it('should return 0 when no check-ins exist', () => {
      expect(DailyCheckinManager.getCheckinStreak()).toBe(0);
    });

    it('should count consecutive days', () => {
      vi.setSystemTime(new Date('2024-01-14T10:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'ok', value: 3, color: '#fff' });

      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });

      expect(DailyCheckinManager.getCheckinStreak()).toBe(2);
    });

    it('should count days not sessions (multiple sessions same day = 1 streak day)', () => {
      // Day 1: 3 sessions
      vi.setSystemTime(new Date('2024-01-14T08:00:00'));
      DailyCheckinManager.saveCheckin({ mood: 'ok', value: 3, color: '#fff' });
      vi.setSystemTime(new Date('2024-01-14T12:00:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });
      vi.setSystemTime(new Date('2024-01-14T16:00:00'));
      DailyCheckinManager.saveCheckin({ mood: 'anxious', value: 1, color: '#ff0' });

      // Day 2: 2 sessions
      vi.setSystemTime(new Date('2024-01-15T08:00:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });
      vi.setSystemTime(new Date('2024-01-15T12:00:00'));
      DailyCheckinManager.saveCheckin({ mood: 'ok', value: 3, color: '#fff' });

      // Streak should be 2 days, not 5
      expect(DailyCheckinManager.getCheckinStreak()).toBe(2);
      // But total checkins should be 5
      expect(DailyCheckinManager.getTotalCheckins()).toBe(5);
    });
  });

  describe('clearAllCheckins', () => {
    it('should clear all check-in data successfully', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });
      expect(DailyCheckinManager.getTotalCheckins()).toBe(1);

      DailyCheckinManager.clearAllCheckins();
      expect(DailyCheckinManager.getTotalCheckins()).toBe(0);
    });
  });

  describe('getAllCheckins', () => {
    it('should return empty array when no check-ins exist', () => {
      expect(DailyCheckinManager.getAllCheckins()).toHaveLength(0);
    });

    it('should return all check-ins sorted by timestamp desc', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });

      vi.setSystemTime(new Date('2024-01-15T14:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'ok', value: 3, color: '#fff' });

      const all = DailyCheckinManager.getAllCheckins();
      expect(all).toHaveLength(2);
      // Newest first
      expect(all[0].mood).toBe('ok');
      expect(all[1].mood).toBe('happy');
    });
  });

  describe('Time boundary testing', () => {
    it('should handle midnight transitions correctly', () => {
      vi.setSystemTime(new Date('2024-01-14T23:59:00'));
      expect(DailyCheckinManager.getCurrentDayKey()).toBe('2024-01-14');

      vi.setSystemTime(new Date('2024-01-15T00:00:00'));
      expect(DailyCheckinManager.getCurrentDayKey()).toBe('2024-01-15');
    });
  });

  describe('Data persistence testing', () => {
    it('should persist data across multiple calls', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });

      const retrieved = DailyCheckinManager.getCheckin('2024-01-15');
      expect(retrieved).toBeTruthy();
      expect(retrieved?.mood).toBe('happy');
    });
  });

  describe('Backward-compat migration', () => {
    it('should migrate legacy key to session key on read', () => {
      // Simulate legacy key format (no timestamp suffix)
      const legacyData = JSON.stringify({
        id: 'checkin_legacy_2024-01-15',
        date: '2024-01-15',
        timestamp: new Date('2024-01-15T10:00:00').getTime(),
        mood: 'happy',
        value: 4,
        color: '#4ecdc4',
        completed: true,
      });
      localStorage.setItem('daily_checkin_2024-01-15', legacyData);

      // Call getCheckinsForDay — should migrate the legacy key
      const entries = DailyCheckinManager.getCheckinsForDay('2024-01-15');
      expect(entries).toHaveLength(1);
      expect(entries[0].mood).toBe('happy');
      expect(entries[0].value).toBe(4);

      // Legacy key should be removed
      expect(localStorage.getItem('daily_checkin_2024-01-15')).toBeNull();

      // New session key should exist
      const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
        .filter((key): key is string => key !== null)
        .filter((k) => k.startsWith('daily_checkin_2024-01-15_'));
      expect(keys).toHaveLength(1);
    });

    it('should read both legacy and new session keys for same day', () => {
      // Create legacy key
      const legacyData = JSON.stringify({
        id: 'checkin_legacy_2024-01-15',
        date: '2024-01-15',
        timestamp: new Date('2024-01-15T10:00:00').getTime(),
        mood: 'happy',
        value: 4,
        color: '#4ecdc4',
        completed: true,
      });
      localStorage.setItem('daily_checkin_2024-01-15', legacyData);

      // Create new session key
      vi.setSystemTime(new Date('2024-01-15T14:00:00'));
      DailyCheckinManager.saveCheckin({ mood: 'ok', value: 2, color: '#fff' });

      const entries = DailyCheckinManager.getCheckinsForDay('2024-01-15');
      expect(entries).toHaveLength(2);
    });
  });
});

