import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/supabaseSync', () => ({
  getSyncService: vi.fn()
}))

vi.mock('@/utils/premiumSignature', () => ({
  getVerifiedPremiumStatus: vi.fn(),
  verifyPremiumSignature: vi.fn(),
  savePremiumSignatureToStorage: vi.fn(),
  loadPremiumSignatureFromStorage: vi.fn()
}))

import { getSyncService } from '@/utils/supabaseSync'
import {
  getVerifiedPremiumStatus,
  verifyPremiumSignature,
  savePremiumSignatureToStorage,
  loadPremiumSignatureFromStorage
} from '@/utils/premiumSignature'

import { $isPremium, $premiumStatus, initPremiumFromLocalStorage, loadPremiumFromSupabase, setPremium } from '../../src/stores/premium.store'

describe('premium.store', () => {
  const localStorageMock = {
    storage: {} as Record<string, string>,
    getItem: vi.fn((key: string) => localStorageMock.storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      localStorageMock.storage[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete localStorageMock.storage[key]
    }),
    clear: vi.fn(() => {
      localStorageMock.storage = {}
    })
  }

  beforeEach(() => {
    localStorageMock.storage = {}
    vi.clearAllMocks()

    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true
    })

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true
    })

    $isPremium.set(false)
    $premiumStatus.set({ source: 'unknown' })
  })

  it('setPremium persists legacy localStorage keys', () => {
    setPremium(true, {
      source: 'telegramEvent',
      plan: 'monthly',
      purchasedAt: '2026-01-01T00:00:00.000Z'
    })

    expect($isPremium.get()).toBe(true)

    expect(localStorageMock.setItem).toHaveBeenCalledWith('user-premium-status', 'true')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user-premium-plan', 'monthly')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user-premium-purchased-at', '2026-01-01T00:00:00.000Z')
  })

  it('initPremiumFromLocalStorage uses verified signature when available', async () => {
    localStorageMock.setItem('user-premium-status', 'false')
    getVerifiedPremiumStatus.mockResolvedValue({
      premium: true,
      plan: 'annually',
      expiresAt: '2030-01-01T00:00:00.000Z',
      purchasedAt: '2026-01-01T00:00:00.000Z'
    })

    initPremiumFromLocalStorage()
    await new Promise((r) => setTimeout(r, 0))

    expect($isPremium.get()).toBe(true)
    expect($premiumStatus.get().source).toBe('verifiedLocalStorage')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user-premium-status', 'true')
  })

  it('loadPremiumFromSupabase verifies signature and updates state', async () => {
    const premiumSignatureData = {
      data: {
        premium: true,
        plan: 'lifetime',
        expiresAt: undefined,
        purchasedAt: '2026-01-01T00:00:00.000Z',
        timestamp: 123
      },
      signature: 'sig',
      publicKey: 'pk',
      version: 1
    }

    const fetchUserData = vi.fn().mockResolvedValue({
      premiumSignature: premiumSignatureData
    })

    getSyncService.mockReturnValue({
      fetchUserData
    })

    verifyPremiumSignature.mockResolvedValue(true)
    savePremiumSignatureToStorage.mockImplementation(() => {})
    loadPremiumSignatureFromStorage.mockReturnValue(null)
    getVerifiedPremiumStatus.mockResolvedValue(null)

    await loadPremiumFromSupabase()

    expect(verifyPremiumSignature).toHaveBeenCalled()
    expect(savePremiumSignatureToStorage).toHaveBeenCalledWith(premiumSignatureData)
    expect($isPremium.get()).toBe(true)
    expect($premiumStatus.get().source).toBe('supabaseSignature')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user-premium-status', 'true')
  })
})

