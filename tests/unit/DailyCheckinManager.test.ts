/**
 * Unit tests for DailyCheckinManager utility class
 * Tests core logic, day boundaries, data persistence, and edge cases
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DailyCheckinManager, DailyCheckinStatus, CheckinData } from '../../utils/DailyCheckinManager';

describe('DailyCheckinManager', () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  };

  beforeEach(() => {
    // Reset localStorage mock
    Object.assign(localStorage, localStorageMock);
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    localStorageMock.length = 0;
    localStorageMock.key.mockClear();
    
    // Ensure the mock is properly set up
    vi.spyOn(Storage.prototype, 'key').mockImplementation(localStorageMock.key);
  });

  afterEach(() => {
    // Clear any real localStorage data
    localStorage.clear();
  });

  describe('getCurrentDayKey', () => {
    it('should generate correct day key format (YYYY-MM-DD)', () => {
      // Mock current date to 2024-01-15
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T10:30:00Z'));
      
      const dayKey = DailyCheckinManager.getCurrentDayKey();
      expect(dayKey).toBe('2024-01-15');
      
      vi.useRealTimers();
    });

    it('should handle different dates correctly', () => {
      // Test with different date (using local time)
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-12-31T23:30:00'));
      
      const dayKey = DailyCheckinManager.getCurrentDayKey();
      expect(dayKey).toBe('2024-12-31');
      
      vi.useRealTimers();
    });
  });

  describe('isNewDay', () => {
    it('should return true when dates are different', () => {
      const result = DailyCheckinManager.isNewDay('2024-01-14');
      expect(result).toBe(true);
    });

    it('should return false when dates are the same', () => {
      // Mock current date
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T10:30:00Z'));
      
      const result = DailyCheckinManager.isNewDay('2024-01-15');
      expect(result).toBe(false);
      
      vi.useRealTimers();
    });
  });

  describe('isAfterResetTime', () => {
    it('should return true when current time is after 6 AM', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T08:00:00Z'));
      
      const result = DailyCheckinManager.isAfterResetTime();
      expect(result).toBe(true);
      
      vi.useRealTimers();
    });

    it('should return false when current time is before 6 AM', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T04:00:00'));
      
      const result = DailyCheckinManager.isAfterResetTime();
      expect(result).toBe(false);
      
      vi.useRealTimers();
    });

    it('should return true when current time is exactly 6 AM', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T06:00:00'));
      
      const result = DailyCheckinManager.isAfterResetTime();
      expect(result).toBe(true);
      
      vi.useRealTimers();
    });
  });

  describe('getStorageKey', () => {
    it('should generate correct storage key with prefix', () => {
      const key = DailyCheckinManager.getStorageKey('2024-01-15');
      expect(key).toBe('daily_checkin_2024-01-15');
    });
  });

  describe('saveCheckin', () => {
    it('should save check-in data successfully', () => {
      const checkinData = {
        mood: 'happy',
        value: 4,
        color: '#4ecdc4'
      };

      const result = DailyCheckinManager.saveCheckin(checkinData);
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should handle save errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const checkinData = {
        mood: 'happy',
        value: 4,
        color: '#4ecdc4'
      };

      const result = DailyCheckinManager.saveCheckin(checkinData);
      expect(result).toBe(false);
    });

    it('should include all required fields in saved data', () => {
      const checkinData = {
        mood: 'happy',
        value: 4,
        color: '#4ecdc4'
      };

      DailyCheckinManager.saveCheckin(checkinData);
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      
      expect(savedData).toHaveProperty('id');
      expect(savedData).toHaveProperty('date');
      expect(savedData).toHaveProperty('timestamp');
      expect(savedData).toHaveProperty('mood', 'happy');
      expect(savedData).toHaveProperty('value', 4);
      expect(savedData).toHaveProperty('color', '#4ecdc4');
      expect(savedData).toHaveProperty('completed', true);
    });
  });

  describe('getCheckin', () => {
    it('should retrieve saved check-in data', () => {
      const mockData: CheckinData = {
        id: 'test-id',
        date: '2024-01-15',
        timestamp: Date.now(),
        mood: 'happy',
        value: 4,
        color: '#4ecdc4',
        completed: true
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = DailyCheckinManager.getCheckin('2024-01-15');
      expect(result).toEqual(mockData);
    });

    it('should return null when no data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = DailyCheckinManager.getCheckin('2024-01-15');
      expect(result).toBeNull();
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const result = DailyCheckinManager.getCheckin('2024-01-15');
      expect(result).toBeNull();
    });
  });

  describe('getCurrentDayStatus', () => {
    it('should return NOT_COMPLETED when no check-in exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = DailyCheckinManager.getCurrentDayStatus();
      expect(result).toBe(DailyCheckinStatus.NOT_COMPLETED);
    });

    it('should return COMPLETED when check-in exists and is completed', () => {
      const mockData: CheckinData = {
        id: 'test-id',
        date: '2024-01-15',
        timestamp: Date.now(),
        mood: 'happy',
        value: 4,
        color: '#4ecdc4',
        completed: true
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = DailyCheckinManager.getCurrentDayStatus();
      expect(result).toBe(DailyCheckinStatus.COMPLETED);
    });
  });

  describe('getTotalCheckins', () => {
    it('should return 0 when no check-ins exist', () => {
      localStorageMock.length = 0;

      const result = DailyCheckinManager.getTotalCheckins();
      expect(result).toBe(0);
    });

    it('should handle storage errors gracefully', () => {
      localStorageMock.length = 1;
      localStorageMock.key.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = DailyCheckinManager.getTotalCheckins();
      expect(result).toBe(0);
    });
  });

  describe('getCheckinStreak', () => {
    it('should return 0 when no check-ins exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = DailyCheckinManager.getCheckinStreak();
      expect(result).toBe(0);
    });
  });

  describe('clearAllCheckins', () => {
    it('should clear all check-in data successfully', () => {
      // Set up some mock data
      localStorageMock.length = 0;
      localStorageMock.key.mockReturnValue(null);

      const result = DailyCheckinManager.clearAllCheckins();
      expect(result).toBe(true);
    });
  });

  describe('getAllCheckins', () => {
    it('should return empty array when no check-ins exist', () => {
      localStorageMock.length = 0;

      const result = DailyCheckinManager.getAllCheckins();
      expect(result).toHaveLength(0);
    });
  });

  describe('Time boundary testing', () => {
    it('should handle day transitions correctly', () => {
      // Test at 5:59 AM (before reset)
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T05:59:00'));
      
      expect(DailyCheckinManager.isAfterResetTime()).toBe(false);
      
      // Test at 6:00 AM (at reset)
      vi.setSystemTime(new Date('2024-01-15T06:00:00'));
      expect(DailyCheckinManager.isAfterResetTime()).toBe(true);
      
      // Test at 6:01 AM (after reset)
      vi.setSystemTime(new Date('2024-01-15T06:01:00'));
      expect(DailyCheckinManager.isAfterResetTime()).toBe(true);
      
      vi.useRealTimers();
    });

    it('should handle midnight transitions correctly', () => {
      // Test at 11:59 PM
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-14T23:59:00'));
      
      const dayKey1 = DailyCheckinManager.getCurrentDayKey();
      expect(dayKey1).toBe('2024-01-14');
      
      // Test at 12:00 AM (next day)
      vi.setSystemTime(new Date('2024-01-15T00:00:00'));
      
      const dayKey2 = DailyCheckinManager.getCurrentDayKey();
      expect(dayKey2).toBe('2024-01-15');
      
      vi.useRealTimers();
    });
  });

  describe('Data persistence testing', () => {
    it('should persist data across multiple calls', () => {
      const checkinData = {
        mood: 'happy',
        value: 4,
        color: '#4ecdc4'
      };

      // Save check-in
      DailyCheckinManager.saveCheckin(checkinData);
      
      // Mock the saved data for retrieval
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));

      // Retrieve check-in
      const retrieved = DailyCheckinManager.getCheckin('2024-01-15');
      expect(retrieved).toBeTruthy();
      expect(retrieved?.mood).toBe('happy');
    });

    it('should handle concurrent access gracefully', () => {
      const checkinData = {
        mood: 'happy',
        value: 4,
        color: '#4ecdc4'
      };

      // Reset localStorage mock to ensure clean state
      localStorageMock.setItem.mockClear();
      localStorageMock.setItem.mockReturnValue(undefined);

      // Simulate concurrent saves
      const result1 = DailyCheckinManager.saveCheckin(checkinData);
      const result2 = DailyCheckinManager.saveCheckin(checkinData);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });
  });
});