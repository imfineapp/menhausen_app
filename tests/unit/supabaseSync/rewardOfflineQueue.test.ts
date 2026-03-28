import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/supabaseSync/authService', () => ({
  getValidJWTToken: vi.fn(),
}));

import { getValidJWTToken } from '@/utils/supabaseSync/authService';
import {
  getOfflineRewardQueue,
  queueOfflineReward,
  replayOfflineRewardQueue,
  RewardEventType,
} from '@/utils/supabaseSync/rewardService';

describe('rewardService offline queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon');
    localStorage.clear();
    (globalThis as any).fetch = vi.fn();
  });

  it('persists failed rewards to localStorage queue', () => {
    queueOfflineReward({
      eventType: RewardEventType.DAILY_CHECKIN,
      referenceId: '2026-03-27',
      payload: { points: 10 },
    });

    const queue = getOfflineRewardQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toEqual(
      expect.objectContaining({
        eventType: RewardEventType.DAILY_CHECKIN,
        referenceId: '2026-03-27',
      }),
    );
  });

  it('deduplicates queue entries by eventType and referenceId', () => {
    queueOfflineReward({
      eventType: RewardEventType.DAILY_CHECKIN,
      referenceId: '2026-03-27',
      payload: { points: 10 },
    });
    queueOfflineReward({
      eventType: RewardEventType.DAILY_CHECKIN,
      referenceId: '2026-03-27',
      payload: { points: 20 },
    });

    const queue = getOfflineRewardQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].payload).toEqual({ points: 20 });
  });

  it('replays queue and removes successful entries', async () => {
    vi.mocked(getValidJWTToken).mockResolvedValue('jwt_token');
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        granted: true,
        points: 10,
        balance: 100,
        transactionId: 'tx_1',
      }),
    });

    queueOfflineReward({
      eventType: RewardEventType.DAILY_CHECKIN,
      referenceId: '2026-03-27',
      payload: { points: 10 },
    });

    await replayOfflineRewardQueue();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(getOfflineRewardQueue()).toHaveLength(0);
  });

  it('keeps failed replay entries in queue', async () => {
    vi.mocked(getValidJWTToken).mockResolvedValue('jwt_token');
    (globalThis.fetch as any).mockResolvedValue({ ok: false, status: 503 });

    queueOfflineReward({
      eventType: RewardEventType.DAILY_CHECKIN,
      referenceId: '2026-03-28',
      payload: { points: 10 },
    });

    await replayOfflineRewardQueue();

    expect(getOfflineRewardQueue()).toHaveLength(1);
  });
});
