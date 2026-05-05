import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DailyCheckinManager } from '../../utils/DailyCheckinManager';
import * as pointsStore from '../../src/stores/points.store';

describe('DailyCheckinManager points awarding', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('awards 10 points on each check-in session', () => {
    vi.setSystemTime(new Date('2026-03-28T12:00:00'));
    const spy = vi.spyOn(pointsStore, 'earnPoints').mockResolvedValue(undefined as any);

    const r1 = DailyCheckinManager.saveCheckin({ mood: 'ok', value: 3, color: '#fff' });
    expect(r1.success).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBe(10);

    // Advance by 4 hours to allow next check-in
    vi.setSystemTime(new Date('2026-03-28T16:00:00'));
    const r2 = DailyCheckinManager.saveCheckin({ mood: 'ok', value: 4, color: '#aaa' });
    expect(r2.success).toBe(true);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][1]).toEqual(expect.objectContaining({ referenceId: expect.any(String) }));
  });

  it('blocks points when cooldown has not elapsed', () => {
    vi.setSystemTime(new Date('2026-03-28T12:00:00'));
    const spy = vi.spyOn(pointsStore, 'earnPoints').mockResolvedValue(undefined as any);

    DailyCheckinManager.saveCheckin({ mood: 'ok', value: 3, color: '#fff' });
    expect(spy).toHaveBeenCalledTimes(1);

    // Try again 1 hour later — should be blocked by cooldown
    vi.setSystemTime(new Date('2026-03-28T13:00:00'));
    const r2 = DailyCheckinManager.saveCheckin({ mood: 'ok', value: 4, color: '#aaa' });
    expect(r2.success).toBe(false);
    expect(spy).toHaveBeenCalledTimes(1); // no new points awarded
  });

  it('awards again on a different day', () => {
    vi.setSystemTime(new Date('2026-03-28T12:00:00'));
    const spy = vi.spyOn(pointsStore, 'earnPoints').mockResolvedValue(undefined as any);

    DailyCheckinManager.saveCheckin({ mood: 'ok', value: 3, color: '#fff' });
    expect(spy).toHaveBeenCalledTimes(1);

    // Next day
    vi.setSystemTime(new Date('2026-03-29T12:00:00'));
    DailyCheckinManager.saveCheckin({ mood: 'ok', value: 5, color: '#bbb' });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
