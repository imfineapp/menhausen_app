/**
 * Simplified E2E tests for home progress display
 * Seeds check-in history to validate UI render
 */

import { test, expect } from '@playwright/test';
import { seedCheckinHistory, waitForPageLoad, waitForHomeScreen } from './utils/test-helpers';

const todaySeed = () => ({ iso: new Date().toISOString() });
const daysAgoSeed = (days: number) => {
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return { iso: date.toISOString() };
};

test.describe('Home Progress Display', () => {
  test('should display actual check-in count instead of placeholder', async ({ page }) => {
    await seedCheckinHistory(page, [todaySeed()]);

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page, 30000);

    // Ищем текст прогресса с учетом разных форматов (1 day, 1 день, 1 days, 1 дня)
    await expect(page.locator('text=/^1 (day|days|день|дня)/i')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=142 days')).not.toBeVisible();
  });

  test('should display progress alongside theme cards', async ({ page }) => {
    await seedCheckinHistory(page, [todaySeed()]);

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page, 30000);

    // Ищем текст прогресса с учетом разных форматов
    await expect(page.locator('text=/^1 (day|days|день|дня)/i')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-name="Worries container"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-name="Theme card narrow"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should update progress display dynamically', async ({ page }) => {
    await seedCheckinHistory(page, [todaySeed(), daysAgoSeed(1)]);

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page, 30000);

    // Ищем текст прогресса с учетом разных форматов (2 days, 2 дня)
    await expect(page.locator('text=/^2 (days|дня)/i')).toBeVisible({ timeout: 10000 });
  });

  test('should handle accessibility features', async ({ page }) => {
    await seedCheckinHistory(page, [todaySeed(), daysAgoSeed(1), daysAgoSeed(2)]);

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page, 30000);

    // Проверяем наличие элементов с увеличенным таймаутом
    // Проверяем home screen через data-testid, так как он более надежен
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-name="Theme card narrow"]').first()).toBeVisible({ timeout: 10000 });
  });
});
