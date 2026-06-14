import { PREMIUM_PURCHASE_GRACE_MS } from '@/src/domain/premium.domain'

let reconciliationUntilMs = 0

export function startPremiumReconciliation(graceMs: number = PREMIUM_PURCHASE_GRACE_MS): void {
  reconciliationUntilMs = Date.now() + graceMs
}

export function endPremiumReconciliation(): void {
  reconciliationUntilMs = 0
}

export function isPremiumReconciliationActive(nowMs: number = Date.now()): boolean {
  return nowMs < reconciliationUntilMs
}
