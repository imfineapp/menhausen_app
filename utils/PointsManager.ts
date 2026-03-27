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
    const total = readBalance();
    if (step <= 0) step = 1000;
    if (total <= 0) return step;
    return total % step === 0
      ? total + step
      : Math.ceil(total / step) * step;
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

  static overwriteFromServer(balance: number, txs?: PointsTransaction[]): void {
    const safeBalance = Number.isInteger(balance) && balance >= 0 ? balance : 0;
    writeBalance(safeBalance);
    if (Array.isArray(txs)) {
      writeTransactions(txs);
    }
  }

  static appendServerEarn(tx: {
    id: string;
    amount: number;
    timestamp: string;
    note?: string;
    correlationId?: string;
    balanceAfter: number;
  }): PointsChangeResult {
    assertPositiveInt(tx.amount);
    const txs = readTransactions();
    const existing = txs.find((t) => t.id === tx.id || (tx.correlationId && t.correlationId === tx.correlationId));
    if (existing) {
      writeBalance(existing.balanceAfter);
      return { balance: existing.balanceAfter, transaction: existing };
    }

    const nextTx: PointsTransaction = {
      id: tx.id,
      type: 'earn',
      amount: tx.amount,
      timestamp: tx.timestamp,
      note: tx.note,
      correlationId: tx.correlationId,
      balanceAfter: tx.balanceAfter,
    };
    writeTransactions([...txs, nextTx]);
    writeBalance(tx.balanceAfter);
    return { balance: tx.balanceAfter, transaction: nextTx };
  }
}

