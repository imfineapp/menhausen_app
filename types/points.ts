export type PointsTransactionType = 'earn' | 'spend';

export interface PointsTransaction {
  id: string;
  type: PointsTransactionType;
  amount: number; // positive integer
  timestamp: string; // ISO string (UTC)
  note?: string;
  correlationId?: string; // for idempotency
  balanceAfter: number; // balance after applying this transaction
}

export interface PointsChangeResult {
  balance: number;
  transaction: PointsTransaction;
}


