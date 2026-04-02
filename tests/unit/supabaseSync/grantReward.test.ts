import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/supabaseSync/authService', () => ({
  getValidJWTToken: vi.fn(),
}));

import { getValidJWTToken } from '@/utils/supabaseSync/authService';
import { grantReward, RewardEventType } from '@/utils/supabaseSync/rewardService';
import { withMockedFetch } from '../helpers/fetchMock';

describe('rewardService.grantReward', () => {
  let fetchMockControl: ReturnType<typeof withMockedFetch>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon');
    fetchMockControl = withMockedFetch();
  });

  afterEach(() => {
    fetchMockControl.restore();
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
      eventType: RewardEventType.ACHIEVEMENT_UNLOCK,
      referenceId: 'a1',
    });

    expect(result.success).toBe(false);
    expect(result.granted).toBe(false);
  });

  it('returns server rejection reason for inflated payload attempts', async () => {
    vi.mocked(getValidJWTToken).mockResolvedValue('jwt_token');
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        granted: false,
        reason: 'points_exceed_limit',
      }),
    });

    const result = await grantReward({
      eventType: RewardEventType.CARD_COMPLETE_LEVEL_1,
      referenceId: 'attempt-1',
      payload: { points: 999999 },
    });

    expect(result).toEqual({
      success: true,
      granted: false,
      reason: 'points_exceed_limit',
      points: undefined,
      balance: undefined,
      transactionId: undefined,
    });
  });

  it('returns payload points for achievement_unlock within server cap', async () => {
    vi.mocked(getValidJWTToken).mockResolvedValue('jwt_token');
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        granted: true,
        reason: 'granted',
        points: 5000,
        balance: 6450,
        transactionId: 'tx_achievement',
      }),
    });

    const result = await grantReward({
      eventType: RewardEventType.ACHIEVEMENT_UNLOCK,
      referenceId: 'achievement-1',
      payload: { points: 5000 },
    });

    expect(result.points).toBe(5000);
    expect(result.granted).toBe(true);
  });
});
