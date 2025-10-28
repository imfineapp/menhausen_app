import { PointsChangeResult, PointsTransaction } from '../types/points';

const BALANCE_KEY = 'menhausen_points_balance';
const TX_KEY = 'menhausen_points_transactions';

function safeParseTransactions(raw: string | null): PointsTransaction[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as PointsTransaction[] : [];
  } catch {
    return [];
  }
}

function readBalance(): number {
  const raw = localStorage.getItem(BALANCE_KEY);
  if (raw == null) return 0;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : 0;
}

function writeBalance(value: number): void {
  localStorage.setItem(BALANCE_KEY, String(value));
}

function readTransactions(): PointsTransaction[] {
  const raw = localStorage.getItem(TX_KEY);
  return safeParseTransactions(raw);
}

function writeTransactions(txs: PointsTransaction[]): void {
  localStorage.setItem(TX_KEY, JSON.stringify(txs));
}

function generateId(): string {
  return `pts_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function assertPositiveInt(amount: number): void {
  if (!Number.isInteger(amount) || amount < 1) {
    throw new Error('Amount must be a positive integer');
  }
}

export class PointsManager {
  static getBalance(): number {
    return readBalance();
  }

  static getTransactions(limit?: number, offset?: number): PointsTransaction[] {
    const all = readTransactions();
    if (offset == null && limit == null) return all;
    const start = Math.max(0, offset || 0);
    const end = limit != null ? start + Math.max(0, limit) : undefined;
    return all.slice(start, end);
  }

  static getTotalEarned(): number {
    const all = readTransactions();
    let total = 0;
    for (const tx of all) {
      if (tx.type === 'earn') total += tx.amount;
    }
    return total;
  }

  static getNextLevelTarget(step: number = 1000): number {
    const totalEarned = this.getTotalEarned();
    if (step <= 0) step = 1000;
    if (totalEarned <= 0) return step;
    return totalEarned % step === 0
      ? totalEarned + step
      : Math.ceil(totalEarned / step) * step;
  }

  static earn(amount: number, meta?: { note?: string; correlationId?: string }): PointsChangeResult {
    assertPositiveInt(amount);
    const txs = readTransactions();

    if (meta?.correlationId) {
      const existing = txs.find(t => t.correlationId === meta.correlationId && t.type === 'earn' && t.amount === amount);
      if (existing) {
        return { balance: existing.balanceAfter, transaction: existing };
      }
    }

    const current = readBalance();
    const newBalance = current + amount;
    const tx: PointsTransaction = {
      id: generateId(),
      type: 'earn',
      amount,
      timestamp: nowIso(),
      note: meta?.note,
      correlationId: meta?.correlationId,
      balanceAfter: newBalance
    };

    const next = [...txs, tx];
    writeTransactions(next);
    writeBalance(newBalance);
    // notify listeners (UI) about points update (browser-only)
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('points:updated'));
    }
    return { balance: newBalance, transaction: tx };
  }

  static spend(amount: number, meta?: { note?: string; correlationId?: string }): PointsChangeResult {
    assertPositiveInt(amount);
    const txs = readTransactions();

    if (meta?.correlationId) {
      const existing = txs.find(t => t.correlationId === meta.correlationId && t.type === 'spend' && t.amount === amount);
      if (existing) {
        return { balance: existing.balanceAfter, transaction: existing };
      }
    }

    const current = readBalance();
    if (current - amount < 0) {
      throw new Error('Insufficient balance');
    }
    const newBalance = current - amount;
    const tx: PointsTransaction = {
      id: generateId(),
      type: 'spend',
      amount,
      timestamp: nowIso(),
      note: meta?.note,
      correlationId: meta?.correlationId,
      balanceAfter: newBalance
    };

    const next = [...txs, tx];
    writeTransactions(next);
    writeBalance(newBalance);
    // notify listeners (UI) about points update (browser-only)
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('points:updated'));
    }
    return { balance: newBalance, transaction: tx };
  }

  static recalculateBalanceFromTransactions(): number {
    const txs = readTransactions();
    let balance = 0;
    for (const tx of txs) {
      if (tx.type === 'earn') balance += tx.amount;
      else if (tx.type === 'spend') balance -= tx.amount;
    }
    if (balance < 0) balance = 0; // safety
    writeBalance(balance);
    return balance;
  }
}

