import { atom, onMount } from 'nanostores'
import type { PremiumSignatureData } from '@/utils/premiumSignature'
import {
  getVerifiedPremiumStatus,
  loadPremiumSignatureFromStorage,
  savePremiumSignatureToStorage,
  verifyPremiumSignature
} from '@/utils/premiumSignature'
import { storageGetItem, storageSetItem } from '@/src/effects/storage.effects'
import { onPremiumActivated } from '@/src/effects/premium.effects'
import { fetchUserData } from '@/src/effects/supabase.effects'
import { getSyncService } from '@/utils/supabaseSync'
import {
  isPremiumExpired,
  PREMIUM_RECONCILE_BACKOFF_MS,
  PREMIUM_RECONCILE_MAX_ATTEMPTS,
  resolveEffectivePremium,
  shouldDemotePremiumFromFetch,
} from '@/src/domain/premium.domain'
import {
  endPremiumReconciliation,
  isPremiumReconciliationActive,
  startPremiumReconciliation,
} from '@/src/stores/premium-reconciliation.store'

export type PremiumStatusSource =
  | 'legacyLocalStorage'
  | 'verifiedLocalStorage'
  | 'supabaseSignature'
  | 'supabaseUnsigned'
  | 'telegramEvent'
  | 'expired'
  | 'unknown'

export type PremiumStatus = {
  source: PremiumStatusSource
  plan?: string
  expiresAt?: string
  purchasedAt?: string
}

let expirationTimer: ReturnType<typeof setTimeout> | null = null

function clearExpirationTimer(): void {
  if (expirationTimer !== null) {
    clearTimeout(expirationTimer)
    expirationTimer = null
  }
}

function schedulePremiumExpiration(expiresAt?: string): void {
  clearExpirationTimer()
  if (!expiresAt) return

  const expiresMs = Date.parse(expiresAt)
  if (Number.isNaN(expiresMs)) return

  const delay = expiresMs - Date.now()
  if (delay <= 0) {
    applyExpiredPremiumState()
    return
  }

  expirationTimer = setTimeout(() => {
    applyExpiredPremiumState()
  }, delay)
}

function applyExpiredPremiumState(): void {
  clearExpirationTimer()
  storageSetItem('user-premium-status', 'false')
  localStorage.removeItem('premium-signature')
  localStorage.removeItem('user-premium-expires-at')
  $isPremium.set(false)
  $premiumStatus.set({ source: 'expired' })
}

function loadLegacyPremiumFromStorage(): boolean {
  return storageGetItem('user-premium-status') === 'true'
}

function getLocalPurchasedAt(): string | null {
  return storageGetItem('user-premium-purchased-at')
}

function applyPremiumState(
  premium: boolean,
  status: Partial<PremiumStatus>,
): void {
  if (!premium) {
    setPremium(false, status)
    clearExpirationTimer()
    return
  }

  setPremium(true, status)
  schedulePremiumExpiration(status.expiresAt)
}

export const $isPremium = atom<boolean>(false)
export const $premiumStatus = atom<PremiumStatus>({
  source: 'unknown'
})

export function setPremium(nextPremium: boolean, nextStatus?: Partial<PremiumStatus>) {
  $isPremium.set(nextPremium)

  storageSetItem('user-premium-status', nextPremium ? 'true' : 'false')

  if (nextStatus?.plan) {
    storageSetItem('user-premium-plan', nextStatus.plan)
  }
  if (nextStatus?.purchasedAt) {
    storageSetItem('user-premium-purchased-at', nextStatus.purchasedAt)
  }
  if (nextStatus?.expiresAt) {
    storageSetItem('user-premium-expires-at', nextStatus.expiresAt)
  }

  $premiumStatus.set({
    ...$premiumStatus.get(),
    ...nextStatus,
    source: nextStatus?.source ?? $premiumStatus.get().source
  })
}

export function checkAndApplyPremiumExpiration(): void {
  const expiresAt = storageGetItem('user-premium-expires-at') ?? $premiumStatus.get().expiresAt
  if (!$isPremium.get()) return
  if (!isPremiumExpired(expiresAt)) return
  applyExpiredPremiumState()
}

export function initPremiumFromLocalStorage() {
  try {
    const fallback = loadLegacyPremiumFromStorage()
    $isPremium.set(fallback)
    $premiumStatus.set({ source: fallback ? 'legacyLocalStorage' : 'legacyLocalStorage' })
  } catch {
    $isPremium.set(false)
    $premiumStatus.set({ source: 'unknown' })
  }

  void (async () => {
    try {
      const verified = await getVerifiedPremiumStatus()
      if (verified) {
        const effectivePremium = resolveEffectivePremium({
          premium: verified.premium,
          expiresAt: verified.expiresAt,
        })
        if (!effectivePremium) {
          applyExpiredPremiumState()
          return
        }
        applyPremiumState(true, {
          source: 'verifiedLocalStorage',
          plan: verified.plan,
          expiresAt: verified.expiresAt,
          purchasedAt: verified.purchasedAt
        })
      } else {
        const legacyPremium = loadLegacyPremiumFromStorage()
        const expiresAt = storageGetItem('user-premium-expires-at') ?? undefined
        if (legacyPremium && isPremiumExpired(expiresAt)) {
          applyExpiredPremiumState()
          return
        }
        setPremium(legacyPremium, { source: 'legacyLocalStorage', expiresAt })
        if (legacyPremium) schedulePremiumExpiration(expiresAt)
      }
    } catch {
      setPremium(loadLegacyPremiumFromStorage(), { source: 'legacyLocalStorage' })
    }
  })()
}

type LoadPremiumOptions = {
  fromReconciliation?: boolean
}

export async function loadPremiumFromSupabase(options: LoadPremiumOptions = {}) {
  const fromReconciliation = options.fromReconciliation === true
  const reconciliationActive = isPremiumReconciliationActive()
  const localPurchasedAt = getLocalPurchasedAt()

  try {
    getSyncService().clearFetchCache()
    const result = await fetchUserData()
    if (!result) return

    if (result.premiumSignature) {
      const sig = result.premiumSignature as PremiumSignatureData
      const isValid = await verifyPremiumSignature(sig)
      if (isValid) {
        const effectivePremium = resolveEffectivePremium({
          premium: sig.data.premium,
          expiresAt: sig.data.expiresAt,
        })

        if (effectivePremium) {
          savePremiumSignatureToStorage(sig)
          applyPremiumState(true, {
            source: 'supabaseSignature',
            plan: sig.data.plan,
            expiresAt: sig.data.expiresAt,
            purchasedAt: sig.data.purchasedAt
          })
          endPremiumReconciliation()
          return
        }

        if (
          shouldDemotePremiumFromFetch({
            hasPremium: false,
            premiumSignature: sig,
            isReconciliationActive: reconciliationActive || fromReconciliation,
            localPurchasedAt,
          })
        ) {
          savePremiumSignatureToStorage(sig)
          applyExpiredPremiumState()
          endPremiumReconciliation()
          return
        }

        return
      }

      if (typeof (result as { hasPremium?: boolean }).hasPremium === 'boolean') {
        if (
          shouldDemotePremiumFromFetch({
            hasPremium: (result as { hasPremium: boolean }).hasPremium,
            premiumSignature: sig,
            isReconciliationActive: reconciliationActive || fromReconciliation,
            localPurchasedAt,
          })
        ) {
          setPremium((result as { hasPremium: boolean }).hasPremium, { source: 'supabaseUnsigned' })
        }
      }
      return
    }

    if (typeof result.hasPremium === 'boolean') {
      if (result.hasPremium) {
        applyPremiumState(true, { source: 'supabaseUnsigned' })
        endPremiumReconciliation()
        return
      }

      if (
        shouldDemotePremiumFromFetch({
          hasPremium: result.hasPremium,
          isReconciliationActive: reconciliationActive || fromReconciliation,
          localPurchasedAt,
        })
      ) {
        setPremium(false, { source: 'supabaseUnsigned' })
        clearExpirationTimer()
      }
      return
    }

    const verified = await getVerifiedPremiumStatus()
    if (verified) {
      const effectivePremium = resolveEffectivePremium({
        premium: verified.premium,
        expiresAt: verified.expiresAt,
      })
      if (!effectivePremium) {
        applyExpiredPremiumState()
        return
      }
      applyPremiumState(true, {
        source: 'verifiedLocalStorage',
        plan: verified.plan,
        expiresAt: verified.expiresAt,
        purchasedAt: verified.purchasedAt
      })
    }
  } catch {
    initPremiumFromLocalStorage()
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function reconcilePremiumWithServer(): Promise<void> {
  for (let attempt = 0; attempt < PREMIUM_RECONCILE_MAX_ATTEMPTS; attempt++) {
    if (!isPremiumReconciliationActive()) return

    await loadPremiumFromSupabase({ fromReconciliation: true })

    const status = $premiumStatus.get()
    if ($isPremium.get() && status.source === 'supabaseSignature') {
      endPremiumReconciliation()
      return
    }

    const backoff = PREMIUM_RECONCILE_BACKOFF_MS[attempt] ?? 16_000
    await sleep(backoff)
  }

  endPremiumReconciliation()
}

function handlePremiumActivatedEvent(event: Event) {
  const customEvent = event as CustomEvent<{ planType?: string; timestamp?: number }>
  const detail = customEvent.detail ?? {}

  const planType = typeof detail.planType === 'string' ? detail.planType : undefined
  const purchasedAt =
    typeof detail.timestamp === 'number' ? new Date(detail.timestamp).toISOString() : undefined

  startPremiumReconciliation()
  applyPremiumState(true, {
    source: 'telegramEvent',
    plan: planType,
    purchasedAt
  })

  if (typeof window !== 'undefined') {
    void (async () => {
      try {
        const existingSig = loadPremiumSignatureFromStorage()
        if (existingSig) {
          const verified = await getVerifiedPremiumStatus()
          if (verified) {
            const effectivePremium = resolveEffectivePremium({
              premium: verified.premium,
              expiresAt: verified.expiresAt,
            })
            if (effectivePremium) {
              applyPremiumState(true, {
                source: 'verifiedLocalStorage',
                plan: verified.plan,
                expiresAt: verified.expiresAt,
                purchasedAt: verified.purchasedAt
              })
              endPremiumReconciliation()
              return
            }
          }
        }

        await reconcilePremiumWithServer()
      } catch {
        // Keep optimistic premium during grace window.
      }
    })()
  }
}

onMount($isPremium, () => {
  initPremiumFromLocalStorage()

  if (typeof window !== 'undefined') {
    return onPremiumActivated(handlePremiumActivatedEvent)
  }

  return () => {}
})
