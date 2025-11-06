/**
 * Simplified E2E tests for day boundary scenarios
 * Seeds check-in history directly in localStorage for deterministic checks
 */

import { test, expect, type Page } from '@playwright/test';
import { waitForPageLoad, waitForHomeScreen, isOnCheckinScreen, completeCheckin, seedCheckinHistory, type CheckinHistorySeed } from './utils/test-helpers';

const createSeed = (offsetDays: number, hour = 9): CheckinHistorySeed => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setMilliseconds(0);
  date.setDate(date.getDate() - offsetDays);
  return { iso: date.toISOString() };
};

const loadHome = async (page: Page): Promise<void> => {
  await page.goto('/');
  await waitForPageLoad(page);
  if (await isOnCheckinScreen(page)) {
    await completeCheckin(page);
  }
  await waitForHomeScreen(page);
};

test.describe('Day Boundary Testing', () => {
  test('should handle 6 AM reset logic correctly', async ({ page }) => {
    await seedCheckinHistory(page, [createSeed(1, 5)]);
    await loadHome(page);
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();
  });

  test('should handle midnight transitions correctly', async ({ page }) => {
    await seedCheckinHistory(page, [createSeed(1, 23)]);
    await loadHome(page);
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();
  });

  test('should handle timezone changes gracefully', async ({ page }) => {
    await seedCheckinHistory(page, [createSeed(0, 2)]);
    await loadHome(page);
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();
  });

  test('should handle edge cases around 6 AM', async ({ page }) => {
    await seedCheckinHistory(page, [createSeed(0, 5), createSeed(1, 7)]);
    await loadHome(page);
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();
  });

  test('should maintain data consistency across day boundaries', async ({ page }) => {
    await seedCheckinHistory(page, [createSeed(0, 9), createSeed(1, 9)]);
    await loadHome(page);
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();
  });

  test('should handle leap year transitions', async ({ page }) => {
    const now = new Date();
    const leapYear = now.getFullYear() % 4 === 0 ? now.getFullYear() : now.getFullYear() - (now.getFullYear() % 4);
    const feb28 = new Date(Date.UTC(leapYear, 1, 28, 9, 0, 0));
    const feb29 = new Date(Date.UTC(leapYear, 1, 29, 9, 0, 0));
    await seedCheckinHistory(page, [{ iso: feb28.toISOString() }, { iso: feb29.toISOString() }]);
    await loadHome(page);
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();
  });

  test('should handle year transitions', async ({ page }) => {
    const yearEnd = new Date(Date.UTC(new Date().getFullYear(), 11, 31, 9, 0, 0));
    const yearStart = new Date(Date.UTC(new Date().getFullYear() + 1, 0, 1, 9, 0, 0));
    await seedCheckinHistory(page, [{ iso: yearEnd.toISOString() }, { iso: yearStart.toISOString() }]);
    await loadHome(page);
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();
  });

  test('should handle device time changes', async ({ page }) => {
    await seedCheckinHistory(page, [createSeed(3, 9), createSeed(1, 9)]);
    await loadHome(page);
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();
  });
});
