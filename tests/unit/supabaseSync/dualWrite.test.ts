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

describe('points.store dual-write', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses server grant when event metadata is provided', async () => {
    mocks.grantReward.mockResolvedValue({
      success: true,
      granted: true,
      points: 20,
      balance: 200,
      transactionId: 'srv-tx-1',
    });

    await earnPoints(20, {
      eventType: 'daily_checkin',
      referenceId: '2026-03-27',
      note: 'Daily check-in reward',
    });

    expect(mocks.grantReward).toHaveBeenCalledTimes(1);
    expect(mocks.appendServerEarn).toHaveBeenCalledTimes(1);
    expect(mocks.earn).not.toHaveBeenCalled();
  });

  it('queues for offline and does not write locally when grant throws (network)', async () => {
    mocks.grantReward.mockRejectedValue(new Error('network'));

    await earnPoints(10, {
      eventType: 'daily_checkin',
      referenceId: '2026-03-28',
      note: 'Daily check-in reward',
    });

    expect(mocks.queueOfflineReward).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'daily_checkin',
        referenceId: '2026-03-28',
      }),
    );
    expect(mocks.earn).not.toHaveBeenCalled();
    expect(mocks.appendServerEarn).not.toHaveBeenCalled();
  });

  it('queues for offline and does not write locally when server returns failure', async () => {
    mocks.grantReward.mockResolvedValue({ success: false, granted: false, reason: 'http_500' });

    await earnPoints(10, {
      eventType: 'daily_checkin',
      referenceId: '2026-03-29',
      note: 'Daily check-in reward',
    });

    expect(mocks.queueOfflineReward).toHaveBeenCalledTimes(1);
    expect(mocks.earn).not.toHaveBeenCalled();
    expect(mocks.appendServerEarn).not.toHaveBeenCalled();
  });
});
