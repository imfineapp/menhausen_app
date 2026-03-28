import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  grantReward: vi.fn(),
  queueOfflineReward: vi.fn(),
  replayOfflineRewardQueue: vi.fn(),
  earn: vi.fn(),
  appendServerEarn: vi.fn(),
  getBalance: vi.fn(() => 0),
  getTransactions: vi.fn(() => []),
}));

vi.mock('@/utils/supabaseSync/rewardService', () => ({
  RewardEventType: {
    DAILY_CHECKIN: 'daily_checkin',
  },
  grantReward: mocks.grantReward,
  queueOfflineReward: mocks.queueOfflineReward,
  replayOfflineRewardQueue: mocks.replayOfflineRewardQueue,
}));

vi.mock('@/utils/PointsManager', () => ({
  PointsManager: {
    earn: mocks.earn,
    appendServerEarn: mocks.appendServerEarn,
    getBalance: mocks.getBalance,
    getTransactions: mocks.getTransactions,
  },
}));

import { earnPoints } from '@/src/stores/points.store';

describe('reward offline queue behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('queues reward request when grant fails without writing locally', async () => {
    mocks.grantReward.mockResolvedValue({
      success: false,
      granted: false,
      reason: 'network_error',
    });

    await earnPoints(10, {
      eventType: 'daily_checkin',
      referenceId: '2026-03-27',
      note: 'Daily check-in reward',
    });

    expect(mocks.queueOfflineReward).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'daily_checkin',
        referenceId: '2026-03-27',
      }),
    );
    expect(mocks.earn).not.toHaveBeenCalled();
  });
});
