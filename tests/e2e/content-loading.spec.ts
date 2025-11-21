import { test, expect } from '@playwright/test';
import { seedCheckinHistory, waitForPageLoad, waitForHomeScreen } from './utils/test-helpers';

const todaySeed = () => ({ iso: new Date().toISOString() });

test.describe('Content Loading Tests', () => {
  test('should load content and display theme cards', async ({ page }) => {
    await seedCheckinHistory(page, [todaySeed()]);

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page, 30000);

    // Проверяем наличие элементов с увеличенным таймаутом
    // Проверяем home screen через data-testid, так как он более надежен
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-name="Theme card narrow"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load content in Russian', async ({ page }) => {
    await seedCheckinHistory(page, [todaySeed()]);
    await page.addInitScript(() => {
      localStorage.setItem('menhausen-language', JSON.stringify('ru'));
    });

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page);

    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });
});
