import { atom, computed, onMount } from 'nanostores'

import type { PointsTransaction } from '@/types/points'
import { PointsManager } from '@/utils/PointsManager'

function calculateNextLevelTarget(totalEarned: number, step = 1000): number {
  if (step <= 0) step = 1000
  if (totalEarned <= 0) return step
  return totalEarned % step === 0 ? totalEarned + step : Math.ceil(totalEarned / step) * step
}

export const $pointsBalance = atom<number>(0)
export const $pointsTransactions = atom<PointsTransaction[]>([])

// Derived state used across UI (no direct localStorage reads here).
export const $nextLevelTarget = computed($pointsBalance, (balance) => calculateNextLevelTarget(balance, 1000))
export const $currentLevel = computed($pointsBalance, (balance) => {
  const computedLevel = balance === 0 ? 0 : Math.floor(balance / 1000) + 1
  return Math.max(1, computedLevel)
})

export function refreshPoints() {
  $pointsBalance.set(PointsManager.getBalance())
  $pointsTransactions.set(PointsManager.getTransactions())
}

export function earnPoints(amount: number, meta?: { note?: string; correlationId?: string }) {
  // PointsManager remains the single writer to localStorage.
  PointsManager.earn(amount, meta)
  refreshPoints()
}

export function spendPoints(amount: number, meta?: { note?: string; correlationId?: string }) {
  PointsManager.spend(amount, meta)
  refreshPoints()
}

onMount($pointsBalance, () => {
  refreshPoints()
})

