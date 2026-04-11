import { test, expect } from '@playwright/test'

test.describe('Breathing 4-6 Flow', () => {
  test('should complete breathing exercise', async ({ page }) => {
    await page.goto('/')
    
    const breatheButton = page.getByRole('button', { name: /breathing/i })
    await expect(breatheButton).toBeVisible()
    await breatheButton.click()
    
    await expect(page).toHaveURL(/\/techniques\/breathe-4-6/)
    
    const startButton = page.getByRole('button', { name: /start/i })
    await expect(startButton).toBeVisible()
    await startButton.click()
    
    await expect(page.getByText(/inhale/i)).toBeVisible()
    
    const doneButton = page.getByRole('button', { name: /done/i })
    await expect(doneButton).toBeVisible()
    await doneButton.click()
    
    await expect(page).toHaveURL(/\/home/)
  })

  test('should resume breathing from completed state', async ({ page }) => {
    await page.goto('/')
    
    const breatheButton = page.getByRole('button', { name: /breathing/i })
    await breatheButton.click()
    
    const repeatButton = page.getByRole('button', { name: /repeat/i })
    await expect(repeatButton).toBeVisible()
  })
})