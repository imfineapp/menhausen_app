import { beforeEach, describe, expect, it } from 'vitest';

import { PointsManager } from '@/utils/PointsManager';

describe('balance reconciliation', () => {
  beforeEach(() => {
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
});
