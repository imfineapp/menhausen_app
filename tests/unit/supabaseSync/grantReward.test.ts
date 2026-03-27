import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/supabaseSync/authService', () => ({
  getValidJWTToken: vi.fn(),
}));

import { getValidJWTToken } from '@/utils/supabaseSync/authService';
import { grantReward, RewardEventType } from '@/utils/supabaseSync/rewardService';

describe('rewardService.grantReward', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon');
    (globalThis as any).fetch = vi.fn();
  });

  it('sends request with JWT and returns granted payload', async () => {
    vi.mocked(getValidJWTToken).mockResolvedValue('jwt_token');
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        granted: true,
        reason: 'granted',
        points: 10,
        balance: 100,
        transactionId: 'tx_1',
      }),
    });

    const result = await grantReward({
      eventType: RewardEventType.DAILY_CHECKIN,
      referenceId: '2026-01-01',
      payload: { points: 10 },
    });

    expect(result).toEqual({
      success: true,
      granted: true,
      reason: 'granted',
      points: 10,
      balance: 100,
      transactionId: 'tx_1',
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('returns failure on non-200 response', async () => {
    vi.mocked(getValidJWTToken).mockResolvedValue('jwt_token');
    (globalThis.fetch as any).mockResolvedValue({ ok: false, status: 500 });

    const result = await grantReward({
      eventType: RewardEventType.ACHIEVEMENT_XP,
      referenceId: 'a1',
    });

    expect(result.success).toBe(false);
    expect(result.granted).toBe(false);
  });
});
