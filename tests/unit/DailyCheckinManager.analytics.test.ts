import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockCapture = vi.hoisted(() => vi.fn());

vi.mock('../../utils/analytics/posthog', () => ({
  AnalyticsEvent: {
    DAILY_CHECKIN_COMPLETED: 'daily_checkin_completed',
  },
  capture: (...args: unknown[]) => mockCapture(...args),
}));

vi.mock('@/src/stores/points.store', () => ({
  earnPoints: vi.fn().mockResolvedValue(undefined),
}));

import { DailyCheckinManager } from '../../utils/DailyCheckinManager';

function createMemoryLocalStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  } as Storage;
}

describe('DailyCheckinManager PostHog', () => {
  beforeEach(() => {
    mockCapture.mockClear();
    vi.stubGlobal('localStorage', createMemoryLocalStorage());
  });

  it('emits daily_checkin_completed once when saving twice the same day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-28T12:00:00'));

    DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });
    DailyCheckinManager.saveCheckin({ mood: 'neutral', value: 2, color: '#ffd93d' });

    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledWith(
      'daily_checkin_completed',
      expect.objectContaining({
        date_key: '2026-03-28',
        mood: 'happy',
        mood_value: 4,
        checkin_streak: expect.any(Number),
      }),
    );

    vi.useRealTimers();
  });

  it('emits again on a new calendar day', () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date('2026-03-28T12:00:00'));
    DailyCheckinManager.saveCheckin({ mood: 'happy', value: 4, color: '#4ecdc4' });
    expect(mockCapture).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date('2026-03-29T12:00:00'));
    DailyCheckinManager.saveCheckin({ mood: 'ok', value: 3, color: '#fff' });
    expect(mockCapture).toHaveBeenCalledTimes(2);
    expect(mockCapture.mock.calls[1][0]).toBe('daily_checkin_completed');
    expect(mockCapture.mock.calls[1][1]).toEqual(
      expect.objectContaining({
        date_key: '2026-03-29',
        mood: 'ok',
        mood_value: 3,
      }),
    );

    vi.useRealTimers();
  });
});
