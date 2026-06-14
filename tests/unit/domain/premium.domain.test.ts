import { describe, expect, it } from 'vitest'

import {
  isPremiumExpired,
  isRecentPremiumPurchase,
  PREMIUM_PURCHASE_GRACE_MS,
  resolveEffectivePremium,
  shouldApplyRemotePremiumStatus,
  shouldDemotePremiumFromFetch,
} from '@/src/domain/premium.domain'

describe('premium.domain', () => {
  const now = Date.parse('2026-06-14T12:00:00.000Z')

  it('detects expired subscriptions', () => {
    expect(isPremiumExpired('2026-06-14T11:59:59.000Z', now)).toBe(true)
    expect(isPremiumExpired('2026-06-14T12:00:00.000Z', now)).toBe(true)
    expect(isPremiumExpired('2026-06-15T00:00:00.000Z', now)).toBe(false)
    expect(isPremiumExpired(undefined, now)).toBe(false)
  })

  it('detects recent premium purchases inside grace window', () => {
    const purchasedAt = new Date(now - 30_000).toISOString()
    expect(isRecentPremiumPurchase(purchasedAt, now)).toBe(true)
    expect(
      isRecentPremiumPurchase(
        new Date(now - PREMIUM_PURCHASE_GRACE_MS - 1).toISOString(),
        now,
      ),
    ).toBe(false)
  })

  it('does not apply unsigned remote downgrade during grace window', () => {
    const purchasedAt = new Date(now - 10_000).toISOString()

    expect(
      shouldApplyRemotePremiumStatus({
        remoteHasPremium: false,
        localPurchasedAt: purchasedAt,
        nowMs: now,
      }),
    ).toBe(false)
  })

  it('applies unsigned remote downgrade after grace window', () => {
    const purchasedAt = new Date(now - PREMIUM_PURCHASE_GRACE_MS - 1).toISOString()

    expect(
      shouldApplyRemotePremiumStatus({
        remoteHasPremium: false,
        localPurchasedAt: purchasedAt,
        nowMs: now,
      }),
    ).toBe(true)
  })

  it('applies signed remote premium true immediately', () => {
    expect(
      shouldApplyRemotePremiumStatus({
        remoteHasPremium: false,
        remotePremiumSignature: { data: { premium: true } },
        localPurchasedAt: new Date(now - 5_000).toISOString(),
        nowMs: now,
      }),
    ).toBe(true)
  })

  it('does not demote during reconciliation without signed confirmation', () => {
    expect(
      shouldDemotePremiumFromFetch({
        hasPremium: false,
        isReconciliationActive: true,
        localPurchasedAt: new Date(now - 5_000).toISOString(),
        nowMs: now,
      }),
    ).toBe(false)
  })

  it('demotes when signed premium is false and grace window ended', () => {
    expect(
      shouldDemotePremiumFromFetch({
        hasPremium: false,
        premiumSignature: { data: { premium: false } },
        isReconciliationActive: false,
        localPurchasedAt: new Date(now - PREMIUM_PURCHASE_GRACE_MS - 1).toISOString(),
        nowMs: now,
      }),
    ).toBe(true)
  })

  it('resolves effective premium using expiration', () => {
    expect(
      resolveEffectivePremium({
        premium: true,
        expiresAt: '2026-06-14T11:00:00.000Z',
        nowMs: now,
      }),
    ).toBe(false)

    expect(
      resolveEffectivePremium({
        premium: true,
        expiresAt: '2026-07-14T12:00:00.000Z',
        nowMs: now,
      }),
    ).toBe(true)
  })
})
