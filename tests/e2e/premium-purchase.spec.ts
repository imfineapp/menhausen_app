import { test, expect } from '@playwright/test'

import { primeAppForHome, waitForPageLoad } from './utils/test-helpers'

async function mockTelegramPayment(page: import('@playwright/test').Page): Promise<void> {
  await page.addInitScript(() => {
    ;(window as any).__PLAYWRIGHT__ = true

    const container = (window as any).Telegram || {}
    ;(window as any).Telegram = {
      ...container,
      WebApp: {
        ...(container.WebApp || {}),
        initData: 'mock_init_data_for_premium_e2e',
        openInvoice: (_url: string, callback?: (status: string) => void) => {
          callback?.('paid')
        },
        showAlert: () => {},
        HapticFeedback: {
          notificationOccurred: () => {},
        },
        initDataUnsafe: {
          user: {
            id: 123456789,
            first_name: 'Test',
            username: 'testuser',
            language_code: 'en',
          },
        },
      },
    }
  })
}

test.describe('Premium purchase flow', () => {
  test('keeps premium active after payment when sync initially returns hasPremium false', async ({ page }) => {
    await mockTelegramPayment(page)
    await primeAppForHome(page)
    await page.goto('/')
    await waitForPageLoad(page)

    const result = await page.evaluate(async () => {
      const telegramContainer = (window as any).Telegram || {}
      ;(window as any).Telegram = {
        ...telegramContainer,
        WebApp: {
          ...(telegramContainer.WebApp || {}),
          initData: 'mock_init_data_for_premium_e2e',
          initDataUnsafe: {
            user: {
              id: 123456789,
              first_name: 'Test',
              username: 'testuser',
              language_code: 'en',
            },
          },
          openInvoice: (_url: string, callback?: (status: string) => void) => {
            callback?.('paid')
          },
          HapticFeedback: {
            notificationOccurred: () => {},
          },
        },
      }

      localStorage.setItem('user-premium-status', 'false')
      localStorage.removeItem('premium-signature')
      localStorage.removeItem('user-premium-purchased-at')
      localStorage.setItem('supabase_jwt_token', 'mock.jwt.token')
      localStorage.setItem('supabase_jwt_token_expiry', String(Date.now() + 3_600_000))

      let getUserDataCalls = 0
      const originalFetch = window.fetch.bind(window)

      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)

        if (url.includes('/functions/v1/create-premium-invoice')) {
          return new Response(
            JSON.stringify({
              success: true,
              invoiceUrl: 'https://t.me/invoice/mock-premium',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }

        if (url.includes('/functions/v1/get-user-data')) {
          getUserDataCalls += 1
          if (getUserDataCalls < 2) {
            return new Response(
              JSON.stringify({
                success: true,
                data: {},
                hasPremium: false,
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } },
            )
          }

          return new Response(
            JSON.stringify({
              success: true,
              data: {},
              hasPremium: true,
              premiumSignature: {
                data: {
                  premium: true,
                  plan: 'monthly',
                  expiresAt: '2026-07-14T12:00:00.000Z',
                  purchasedAt: '2026-06-14T12:00:00.000Z',
                  timestamp: Date.now(),
                },
                signature: 'mock-signature',
                publicKey: 'mock-public-key',
                version: 1,
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }

        return originalFetch(input as RequestInfo, init)
      }

      try {
        // @ts-expect-error Vite dev server resolves absolute /src paths at runtime in Playwright
        const premiumMod = await import('/src/stores/premium.store.ts')
        // @ts-expect-error Vite dev server resolves absolute /src paths at runtime in Playwright
        const reconciliationMod = await import('/src/stores/premium-reconciliation.store.ts')
        const unsub = premiumMod.$isPremium.listen(() => {})

        // @ts-expect-error Vite dev server resolves absolute /src paths at runtime in Playwright
        const paymentMod = await import('/utils/telegramStarsPaymentService.ts')
        const paymentStatus = await paymentMod.telegramStarsPaymentService.purchasePremium('monthly')
        await premiumMod.loadPremiumFromSupabase({ fromReconciliation: true })

        if (!reconciliationMod.isPremiumReconciliationActive()) {
          reconciliationMod.startPremiumReconciliation()
        }

        // @ts-expect-error Vite dev server resolves absolute /src paths at runtime in Playwright
        const syncMod = await import('/src/stores/incremental-sync.store.ts')
        syncMod.setIncrementalSyncError(null)
        syncMod.reportIncrementalSyncError('sync failed in test')

        unsub()

        return {
          paymentStatus,
          isPremium: premiumMod.$isPremium.get(),
          premiumSource: premiumMod.$premiumStatus.get().source,
          syncError: syncMod.$incrementalSyncError.get(),
          localPremiumStatus: localStorage.getItem('user-premium-status'),
        }
      } finally {
        window.fetch = originalFetch
      }
    })

    expect(result.paymentStatus).toBe('paid')
    expect(result.isPremium).toBe(true)
    expect(result.localPremiumStatus).toBe('true')
    expect(result.syncError).toBeNull()
  })

  test('returns to free state when premium signature is expired', async ({ page }) => {
    await mockTelegramPayment(page)
    await primeAppForHome(page)

    await page.addInitScript(() => {
      const expiredSignature = {
        data: {
          premium: true,
          plan: 'monthly',
          expiresAt: '2020-01-01T00:00:00.000Z',
          purchasedAt: '2019-12-01T00:00:00.000Z',
          timestamp: Date.now(),
        },
        signature: 'mock-signature',
        publicKey: 'dGVzdC1wdWJsaWMta2V5',
        version: 1,
      }

      localStorage.setItem('user-premium-status', 'true')
      localStorage.setItem('user-premium-expires-at', '2020-01-01T00:00:00.000Z')
      localStorage.setItem('premium-signature', JSON.stringify(expiredSignature))
    })

    await page.goto('/')
    await waitForPageLoad(page)

    const result = await page.evaluate(async () => {
      const cryptoApi = window.crypto
      const subtle = cryptoApi.subtle
      const originalImportKey = subtle.importKey.bind(subtle)
      const originalVerify = subtle.verify.bind(subtle)

      subtle.importKey = async () => ({}) as CryptoKey
      subtle.verify = async () => true

      try {
        // @ts-expect-error Vite dev server resolves absolute /src paths at runtime in Playwright
        const premiumMod = await import('/src/stores/premium.store.ts')
        premiumMod.initPremiumFromLocalStorage()
        await new Promise((resolve) => setTimeout(resolve, 50))
        premiumMod.checkAndApplyPremiumExpiration()
        await new Promise((resolve) => setTimeout(resolve, 50))

        return {
          isPremium: premiumMod.$isPremium.get(),
          source: premiumMod.$premiumStatus.get().source,
          localPremiumStatus: localStorage.getItem('user-premium-status'),
          hasSignature: localStorage.getItem('premium-signature'),
        }
      } finally {
        subtle.importKey = originalImportKey
        subtle.verify = originalVerify
      }
    })

    expect(result.isPremium).toBe(false)
    expect(result.localPremiumStatus).toBe('false')
    expect(result.hasSignature).toBeNull()
  })
})
