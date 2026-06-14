/**
 * Pure premium subscription logic (no store imports).
 */

export const PREMIUM_PURCHASE_GRACE_MS = 60_000

export const PREMIUM_RECONCILE_MAX_ATTEMPTS = 6

export const PREMIUM_RECONCILE_BACKOFF_MS = [1_000, 2_000, 4_000, 8_000, 16_000, 32_000] as const

export type PremiumSignatureLike = {
  data?: {
    premium?: boolean
    expiresAt?: string
    plan?: string
    purchasedAt?: string
  }
} | null | undefined

export function isPremiumExpired(
  expiresAt: string | undefined | null,
  nowMs: number = Date.now(),
): boolean {
  if (!expiresAt) return false
  const expiresMs = Date.parse(expiresAt)
  if (Number.isNaN(expiresMs)) return false
  return nowMs >= expiresMs
}

export function isRecentPremiumPurchase(
  purchasedAt: string | null | undefined,
  nowMs: number = Date.now(),
  graceMs: number = PREMIUM_PURCHASE_GRACE_MS,
): boolean {
  if (!purchasedAt) return false
  const purchasedMs = Date.parse(purchasedAt)
  if (Number.isNaN(purchasedMs)) return false
  return nowMs - purchasedMs <= graceMs
}

/**
 * Whether mergeAndSave should write remote hasPremium to localStorage.
 * Prevents optimistic premium from being overwritten before the webhook confirms payment.
 */
export function shouldApplyRemotePremiumStatus(params: {
  remoteHasPremium: boolean
  remotePremiumSignature?: PremiumSignatureLike
  localPurchasedAt: string | null
  nowMs?: number
}): boolean {
  const { remoteHasPremium, remotePremiumSignature, localPurchasedAt, nowMs = Date.now() } = params

  if (remoteHasPremium) return true

  const signedPremium = remotePremiumSignature?.data?.premium
  if (signedPremium === true) return true
  if (signedPremium === false) {
    const expiresAt = remotePremiumSignature?.data?.expiresAt
    if (isRecentPremiumPurchase(localPurchasedAt, nowMs) && !isPremiumExpired(expiresAt, nowMs)) {
      return false
    }
    return true
  }

  if (isRecentPremiumPurchase(localPurchasedAt, nowMs)) return false

  return true
}

/**
 * Whether a Supabase fetch result should demote local premium to false.
 */
export function shouldDemotePremiumFromFetch(params: {
  hasPremium?: boolean
  premiumSignature?: PremiumSignatureLike
  isReconciliationActive: boolean
  localPurchasedAt: string | null
  nowMs?: number
}): boolean {
  const {
    hasPremium,
    premiumSignature,
    isReconciliationActive,
    localPurchasedAt,
    nowMs = Date.now(),
  } = params

  const signedPremium = premiumSignature?.data?.premium
  const expiresAt = premiumSignature?.data?.expiresAt

  if (signedPremium === true && !isPremiumExpired(expiresAt, nowMs)) return false
  if (hasPremium === true) return false

  if (signedPremium === false) {
    if (
      (isReconciliationActive || isRecentPremiumPurchase(localPurchasedAt, nowMs)) &&
      !isPremiumExpired(expiresAt, nowMs)
    ) {
      return false
    }
    return true
  }

  if (isReconciliationActive || isRecentPremiumPurchase(localPurchasedAt, nowMs)) return false

  return hasPremium === false
}

export function resolveEffectivePremium(params: {
  premium: boolean
  expiresAt?: string
  nowMs?: number
}): boolean {
  const { premium, expiresAt, nowMs = Date.now() } = params
  if (!premium) return false
  return !isPremiumExpired(expiresAt, nowMs)
}
