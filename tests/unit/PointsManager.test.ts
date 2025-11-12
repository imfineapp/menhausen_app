import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PointsManager } from '../../utils/PointsManager';

describe('PointsManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initial balance is 0 and next level target is 1000', () => {
    expect(PointsManager.getBalance()).toBe(0);
    expect(PointsManager.getNextLevelTarget(1000)).toBe(1000);
  });

  it('earn increases balance and writes transaction; idempotent by correlationId', () => {
    const res1 = PointsManager.earn(100, { note: 'test', correlationId: 'c1' });
    expect(res1.balance).toBe(100);
    const res2 = PointsManager.earn(100, { note: 'test', correlationId: 'c1' });
    expect(res2.balance).toBe(100); // idempotent, no duplicate
    expect(PointsManager.getBalance()).toBe(100);
    expect(PointsManager.getTotalEarned()).toBe(100);
  });

  it('spend decreases balance and throws on insufficient', () => {
    PointsManager.earn(200);
    const res = PointsManager.spend(50);
    expect(res.balance).toBe(150);
    expect(() => PointsManager.spend(1000)).toThrowError();
  });

  it('recalculate balance from transactions matches net of txs', () => {
    PointsManager.earn(100);
    PointsManager.earn(50);
    PointsManager.spend(20);
    const recalced = PointsManager.recalculateBalanceFromTransactions();
    expect(recalced).toBe(130);
    expect(PointsManager.getBalance()).toBe(130);
  });

  it('dispatches points:updated event on earn/spend (browser env)', () => {
    const spy = vi.fn();
    window.addEventListener('points:updated', spy as EventListener);
    PointsManager.earn(10);
    PointsManager.spend(5);
    expect(spy).toHaveBeenCalled();
    window.removeEventListener('points:updated', spy as EventListener);
  });
});

const BALANCE_KEY = 'menhausen_points_balance';
const TX_KEY = 'menhausen_points_transactions';

describe('PointsManager (localStorage)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns 0 balance by default and empty transactions', () => {
    expect(PointsManager.getBalance()).toBe(0);
    expect(PointsManager.getTransactions()).toEqual([]);
  });

  it('earn increases balance and appends a transaction', () => {
    const res = PointsManager.earn(10, { note: 'test' });
    expect(res.balance).toBe(10);
    expect(res.transaction.type).toBe('earn');
    expect(res.transaction.amount).toBe(10);
    expect(res.transaction.balanceAfter).toBe(10);

    // persisted
    expect(Number(localStorage.getItem(BALANCE_KEY))).toBe(10);
    const txs = JSON.parse(localStorage.getItem(TX_KEY) || '[]');
    expect(txs).toHaveLength(1);
    expect(txs[0].type).toBe('earn');
  });

  it('spend decreases balance and appends a transaction', () => {
    PointsManager.earn(15);
    const res = PointsManager.spend(5, { note: 'spent' });
    expect(res.balance).toBe(10);
    expect(res.transaction.type).toBe('spend');
    expect(res.transaction.amount).toBe(5);
    expect(res.transaction.balanceAfter).toBe(10);
  });

  it('prevents spending into negative balance', () => {
    expect(() => PointsManager.spend(1)).toThrowError('Insufficient balance');
  });

  it('idempotent earn by correlationId', () => {
    const cid = 'earn-checkin-2025-10-28';
    const r1 = PointsManager.earn(7, { correlationId: cid });
    const r2 = PointsManager.earn(7, { correlationId: cid });
    expect(r2.balance).toBe(r1.balance);
    expect(r2.transaction.id).toBe(r1.transaction.id);

    const txs = PointsManager.getTransactions();
    expect(txs.filter(t => t.correlationId === cid)).toHaveLength(1);
  });

  it('idempotent spend by correlationId', () => {
    PointsManager.earn(20);
    const cid = 'spend-card-1';
    const r1 = PointsManager.spend(8, { correlationId: cid });
    const r2 = PointsManager.spend(8, { correlationId: cid });
    expect(r2.balance).toBe(r1.balance);
    expect(r2.transaction.id).toBe(r1.transaction.id);

    const txs = PointsManager.getTransactions();
    expect(txs.filter(t => t.correlationId === cid)).toHaveLength(1);
  });

  it('recalculateBalanceFromTransactions reconstructs balance', () => {
    PointsManager.earn(5);
    PointsManager.earn(3);
    PointsManager.spend(2);

    // Break the balance intentionally
    localStorage.setItem(BALANCE_KEY, '999');
    const recalced = PointsManager.recalculateBalanceFromTransactions();
    expect(recalced).toBe(6);
    expect(PointsManager.getBalance()).toBe(6);
  });

  it('validates positive integer amounts', () => {
    expect(() => PointsManager.earn(0)).toThrow();
    expect(() => PointsManager.earn(1.5 as any)).toThrow();
    expect(() => PointsManager.spend(0)).toThrow();
  });
});


