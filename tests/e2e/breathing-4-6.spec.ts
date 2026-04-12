import { test, expect } from '@playwright/test'
import { primeAppForHome, waitForPageLoad } from './utils/test-helpers'

test.describe('Breathing 4-6 Flow', () => {
  test('should navigate from home to breathing screen', async ({ page }) => {
    await primeAppForHome(page)
    await page.goto('/')
    await waitForPageLoad(page)

    await page.waitForTimeout(2000)

    const breathingButton = page.getByRole('button', { name: /breathing/i }).first()
    await expect(breathingButton).toBeVisible({ timeout: 5000 })
    await breathingButton.click()

    await expect(page).toHaveURL(/\/techniques\/breathe-4-6/)
  })

  test('should show reset yourself section on home', async ({ page }) => {
    await primeAppForHome(page)
    await page.goto('/')
    await waitForPageLoad(page)
    await page.waitForTimeout(1500)

    await expect(page.getByRole('heading', { name: /reset yourself/i })).toBeVisible()
  })
})
