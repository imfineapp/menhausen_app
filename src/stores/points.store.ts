import { atom, computed, onMount } from 'nanostores'

import type { PointsTransaction } from '@/types/points'
import { PointsManager } from '@/utils/PointsManager'
import {
  grantReward,
  queueOfflineReward,
  replayOfflineRewardQueue,
  RewardEventType,
} from '@/utils/supabaseSync/rewardService'

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

export async function earnPoints(
  amount: number,
  meta?: {
    note?: string
    correlationId?: string
    eventType?: RewardEventType | string
    referenceId?: string
    payload?: Record<string, unknown>
  },
) {
  const eventType = meta?.eventType
  const referenceId = meta?.referenceId || meta?.correlationId

  if (eventType && referenceId) {
    try {
      const granted = await grantReward({
        eventType,
        referenceId,
        payload: {
          points: amount,
          note: meta?.note,
          ...(meta?.payload || {}),
        },
      })

      if (granted.success && granted.granted && granted.points && granted.balance !== undefined) {
        const correlationId = `${eventType}:${referenceId}`
        const txId = granted.transactionId || `srv_${Date.now()}_${Math.random().toString(36).slice(2)}`
        PointsManager.appendServerEarn({
          id: txId,
          amount: granted.points,
          timestamp: new Date().toISOString(),
          note: meta?.note || `Reward granted: ${eventType}`,
          correlationId,
          balanceAfter: granted.balance,
        })
        refreshPoints()
        return
      }

      // Server reached but reward was not granted: do not perform local fallback writes.
      if (granted.success) {
        return
      }

      queueOfflineReward({
        eventType,
        referenceId,
        payload: {
          points: amount,
          note: meta?.note,
          ...(meta?.payload || {}),
        },
      })
      return
    } catch (error) {
      console.warn('Server reward grant failed, queued for retry', error)
      queueOfflineReward({
        eventType,
        referenceId,
        payload: {
          points: amount,
          note: meta?.note,
          ...(meta?.payload || {}),
        },
      })
      return
    }
  }

  // Fallback for legacy flow and offline mode.
  PointsManager.earn(amount, meta)
  refreshPoints()
}

export function spendPoints(amount: number, meta?: { note?: string; correlationId?: string }) {
  PointsManager.spend(amount, meta)
  refreshPoints()
}

onMount($pointsBalance, () => {
  refreshPoints()
  replayOfflineRewardQueue().catch((error) => {
    console.warn('Failed to replay offline reward queue on mount', error)
  })

  // Vitest / non-browser environments
  if (typeof window === 'undefined') {
    return () => {}
  }

  const onOnline = () => {
    replayOfflineRewardQueue().catch((error) => {
      console.warn('Failed to replay offline reward queue on reconnect', error)
    })
  }
  window.addEventListener('online', onOnline)
  return () => {
    window.removeEventListener('online', onOnline)
  }
})

