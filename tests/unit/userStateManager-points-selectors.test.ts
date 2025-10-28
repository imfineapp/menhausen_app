import { describe, it, expect, beforeEach } from 'vitest';
import { UserStateManager } from '../../utils/userStateManager';

const BALANCE_KEY = 'menhausen_points_balance';
const TX_KEY = 'menhausen_points_transactions';

describe('UserStateManager points selectors', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getUserPointsBalance returns 0 by default and parses integer', () => {
    expect(UserStateManager.getUserPointsBalance()).toBe(0);
    localStorage.setItem(BALANCE_KEY, '15');
    expect(UserStateManager.getUserPointsBalance()).toBe(15);
  });

  it('getUserPointsRecentTransactions returns last N transactions', () => {
    const txs = Array.from({ length: 5 }).map((_, i) => ({
      id: `t${i}`,
      type: i % 2 === 0 ? 'earn' : 'spend',
      amount: i + 1,
      timestamp: new Date().toISOString(),
      balanceAfter: i + 1
    }));
    localStorage.setItem(TX_KEY, JSON.stringify(txs));

    const last2 = UserStateManager.getUserPointsRecentTransactions(2);
    expect(last2).toHaveLength(2);
    expect(last2[0].id).toBe('t3');
    expect(last2[1].id).toBe('t4');
  });

  it('handles malformed storage gracefully', () => {
    localStorage.setItem(BALANCE_KEY, 'not-a-number');
    localStorage.setItem(TX_KEY, '{bad json');
    expect(UserStateManager.getUserPointsBalance()).toBe(0);
    expect(UserStateManager.getUserPointsRecentTransactions(3)).toEqual([]);
  });
});


