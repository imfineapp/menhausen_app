// Простой тест для проверки загрузки приложения
import { test, expect, type Page } from '@playwright/test';
import { primeAppForHome, waitForPageLoad, waitForHomeScreen } from './utils/test-helpers';

const primeAndOpenHome = async (page: Page): Promise<void> => {
  await primeAppForHome(page);
  await page.goto('/');
  await waitForPageLoad(page);
  await waitForHomeScreen(page);
};

test.describe('Simple App Loading', () => {
  test('должен загружать приложение', async ({ page }) => {
    await primeAndOpenHome(page);
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout: 5000 });
  });
});
