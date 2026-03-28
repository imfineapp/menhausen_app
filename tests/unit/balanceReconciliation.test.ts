import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PointsManager } from '@/utils/PointsManager';
import { reconcileRewardBalance } from '@/utils/supabaseSync/rewardService';

vi.mock('@/utils/supabaseSync/authService', () => ({
  getValidJWTToken: vi.fn(),
}));

import { getValidJWTToken } from '@/utils/supabaseSync/authService';

describe('balance reconciliation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon');
    localStorage.clear();
  });

  it('reconciles balance from transaction ledger', () => {
    PointsManager.earn(100, { correlationId: 'a' });
    PointsManager.earn(50, { correlationId: 'b' });
    PointsManager.spend(20, { correlationId: 'c' });
    localStorage.setItem('menhausen_points_balance', '9999');

    const balance = PointsManager.recalculateBalanceFromTransactions();
    expect(balance).toBe(130);
    expect(PointsManager.getBalance()).toBe(130);
  });

  it('uses reconcile endpoint contract for server authoritative balance', async () => {
    vi.mocked(getValidJWTToken).mockResolvedValue('jwt_token');
    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        reconciled: true,
        balance: 130,
        expected_balance: 130,
        previous_balance: 9999,
      }),
    });

    const result = await reconcileRewardBalance();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://example.supabase.co/functions/v1/grant-reward?action=reconcile',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    expect(result.granted).toBe(true);
    expect(result.balance).toBe(130);
  });
});
