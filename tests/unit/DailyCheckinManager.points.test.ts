import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DailyCheckinManager } from '../../utils/DailyCheckinManager';
import { PointsManager } from '../../utils/PointsManager';

describe('DailyCheckinManager points awarding', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('awards 10 points on first check-in of the day (idempotent)', () => {
    const spy = vi.spyOn(PointsManager, 'earn');

    const ok1 = DailyCheckinManager.saveCheckin({ mood: 'ok', value: 3, color: '#fff' });
    expect(ok1).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBe(10);

    const ok2 = DailyCheckinManager.saveCheckin({ mood: 'ok', value: 4, color: '#aaa' });
    expect(ok2).toBe(true);
    // still once due to correlationId idempotency
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('awards again on a different day', () => {
    const spy = vi.spyOn(PointsManager, 'earn');

    // Today
    DailyCheckinManager.saveCheckin({ mood: 'ok', value: 3, color: '#fff' });
    expect(spy).toHaveBeenCalledTimes(1);

    // Simulate next day by mocking getCurrentDayKey
    const original = DailyCheckinManager.getCurrentDayKey;
    vi.spyOn(DailyCheckinManager, 'getCurrentDayKey').mockImplementation(() => {
      const now = new Date();
      now.setDate(now.getDate() + 1);
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    });

    DailyCheckinManager.saveCheckin({ mood: 'ok', value: 5, color: '#bbb' });
    expect(spy).toHaveBeenCalledTimes(2);

    // restore
    vi.spyOn(DailyCheckinManager, 'getCurrentDayKey').mockImplementation(original);
  });
});


