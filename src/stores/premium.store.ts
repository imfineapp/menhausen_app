import { atom, onMount } from 'nanostores'
import type { PremiumSignatureData } from '@/utils/premiumSignature'
import {
  getVerifiedPremiumStatus,
  loadPremiumSignatureFromStorage,
  savePremiumSignatureToStorage,
  verifyPremiumSignature
} from '@/utils/premiumSignature'
import { getSyncService } from '@/utils/supabaseSync'

export type PremiumStatusSource =
  | 'legacyLocalStorage'
  | 'verifiedLocalStorage'
  | 'supabaseSignature'
  | 'supabaseUnsigned'
  | 'telegramEvent'
  | 'unknown'

export type PremiumStatus = {
  source: PremiumStatusSource
  plan?: string
  expiresAt?: string
  purchasedAt?: string
}

function loadLegacyPremiumFromStorage(): boolean {
  try {
    return localStorage.getItem('user-premium-status') === 'true'
  } catch {
    return false
  }
}

export const $isPremium = atom<boolean>(false)
export const $premiumStatus = atom<PremiumStatus>({
  source: 'unknown'
})

export function setPremium(nextPremium: boolean, nextStatus?: Partial<PremiumStatus>) {
  $isPremium.set(nextPremium)

  // Persist in the legacy format so the rest of the codebase keeps working.
  try {
    localStorage.setItem('user-premium-status', nextPremium ? 'true' : 'false')

    if (nextStatus?.plan) {
      localStorage.setItem('user-premium-plan', nextStatus.plan)
    }
    if (nextStatus?.purchasedAt) {
      localStorage.setItem('user-premium-purchased-at', nextStatus.purchasedAt)
    }
    if (nextStatus?.expiresAt) {
      localStorage.setItem('user-premium-expires-at', nextStatus.expiresAt)
    }
  } catch {
    // ignore storage issues (tests / private mode)
  }

  $premiumStatus.set({
    ...$premiumStatus.get(),
    ...nextStatus,
    source: nextStatus?.source ?? $premiumStatus.get().source
  })
}

export function initPremiumFromLocalStorage() {
  // Prefer verified signature if available.
  try {
    // This internally verifies the stored signature and can clear invalid storage.
    // It's async, but we also set a synchronous fallback so UI doesn't flicker.
    const fallback = loadLegacyPremiumFromStorage()
    $isPremium.set(fallback)
    $premiumStatus.set({ source: fallback ? 'legacyLocalStorage' : 'legacyLocalStorage' })
  } catch {
    $isPremium.set(false)
    $premiumStatus.set({ source: 'unknown' })
  }

  // Then attempt verified signature in the background.
  void (async () => {
    try {
      const verified = await getVerifiedPremiumStatus()
      if (verified) {
        setPremium(verified.premium, {
          source: 'verifiedLocalStorage',
          plan: verified.plan,
          expiresAt: verified.expiresAt,
          purchasedAt: verified.purchasedAt
        })
      } else {
        // Keep existing fallback from legacy format.
        setPremium(loadLegacyPremiumFromStorage(), { source: 'legacyLocalStorage' })
      }
    } catch {
      setPremium(loadLegacyPremiumFromStorage(), { source: 'legacyLocalStorage' })
    }
  })()
}

export async function loadPremiumFromSupabase() {
  try {
    const syncService = getSyncService()
    const result = await syncService.fetchUserData()
    if (!result) return

    if (result.premiumSignature) {
      const sig = result.premiumSignature as PremiumSignatureData
      const isValid = await verifyPremiumSignature(sig)
      if (isValid) {
        savePremiumSignatureToStorage(sig)
        setPremium(sig.data.premium, {
          source: 'supabaseSignature',
          plan: sig.data.plan,
          expiresAt: sig.data.expiresAt,
          purchasedAt: sig.data.purchasedAt
        })
        return
      }
      // Signature invalid: fall back to unsigned hasPremium if available.
      if (typeof (result as any).hasPremium === 'boolean') {
        setPremium((result as any).hasPremium, { source: 'supabaseUnsigned' })
      }
      return
    }

    if (typeof result.hasPremium === 'boolean') {
      setPremium(result.hasPremium, { source: 'supabaseUnsigned' })
      return
    }

    // If Supabase didn't return premium fields, keep whatever we have locally.
    const verified = await getVerifiedPremiumStatus()
    if (verified) {
      setPremium(verified.premium, {
        source: 'verifiedLocalStorage',
        plan: verified.plan,
        expiresAt: verified.expiresAt,
        purchasedAt: verified.purchasedAt
      })
    }
  } catch {
    // Offline mode: use local verified signature (if any).
    initPremiumFromLocalStorage()
  }
}

function handlePremiumActivatedEvent(event: Event) {
  const customEvent = event as CustomEvent<any>
  const detail = customEvent.detail ?? {}

  const planType = typeof detail.planType === 'string' ? detail.planType : undefined
  const purchasedAt = typeof detail.timestamp === 'number' ? new Date(detail.timestamp).toISOString() : undefined

  setPremium(true, {
    source: 'telegramEvent',
    plan: planType,
    purchasedAt
  })

  // Attempt to refresh the verified signature a bit later, similar to previous App behavior.
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      void (async () => {
        try {
          // If signature is already in storage, prefer it; otherwise fetch from Supabase.
          const existingSig = loadPremiumSignatureFromStorage()
          if (existingSig) {
            const verified = await getVerifiedPremiumStatus()
            if (verified) {
              setPremium(verified.premium, {
                source: 'verifiedLocalStorage',
                plan: verified.plan,
                expiresAt: verified.expiresAt,
                purchasedAt: verified.purchasedAt
              })
            }
            return
          }

          await loadPremiumFromSupabase()
        } catch {
          // ignore and keep optimistic state
        }
      })()
    }, 1000)
  }
}

onMount($isPremium, () => {
  // Ensure tests that clear localStorage between renders don't get stale premium state.
  initPremiumFromLocalStorage()

  if (typeof window !== 'undefined') {
    window.addEventListener('premium:activated', handlePremiumActivatedEvent as EventListener)
    return () => {
      window.removeEventListener('premium:activated', handlePremiumActivatedEvent as EventListener)
    }
  }

  return () => {}
})

