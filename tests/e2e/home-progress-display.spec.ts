/**
 * Simplified E2E tests for home progress display
 * Tests basic app functionality without complex localStorage manipulation
 */

import { test, expect, type Page } from '@playwright/test';
import { primeAppForHome, waitForPageLoad, waitForHomeScreen } from './utils/test-helpers';

const DAY_SELECTOR = 'text=/^1 (day|день)/i';
const TWO_DAYS_SELECTOR = 'text=/^2 (days|дня)/i';

const ensurePrimedHome = async (page: Page): Promise<void> => {
  await primeAppForHome(page);
  await page.goto('/');
  await waitForPageLoad(page);
  await waitForHomeScreen(page);
};

const seedTwoDaysHistory = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    (window as any).__PLAYWRIGHT__ = true;
    (window as any).__MOCK_SUPABASE_SYNC__ = true; // Enable mocked sync for tests
    const pad = (value: number) => String(value).padStart(2, '0');
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

    const composeEntry = (key: string, timestamp: number) => ({
      id: `checkin_${key}_${timestamp}`,
      date: key,
      timestamp,
      mood: 'neutral',
      value: 3,
      color: '#9CA3AF',
      completed: true
    });

    try {
      const baseTs = Date.now();
      localStorage.setItem(`daily_checkin_${todayKey}`, JSON.stringify(composeEntry(todayKey, baseTs)));
      localStorage.setItem(`daily_checkin_${yesterdayKey}`, JSON.stringify(composeEntry(yesterdayKey, baseTs - 24 * 60 * 60 * 1000)));
    } catch (error) {
      console.warn('Failed to seed additional check-ins:', error);
    }
  });

  await page.reload();
  await waitForPageLoad(page);
  await waitForHomeScreen(page);
  // Даем больше времени для завершения синхронизации и обновления UI после reload
  await page.waitForTimeout(3000).catch(() => {});
};

test.describe('Home Progress Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__PLAYWRIGHT__ = true;
      (window as any).__MOCK_SUPABASE_SYNC__ = true; // Enable mocked sync for tests
      localStorage.clear();
    });

    await ensurePrimedHome(page);
  });

  test('should display actual check-in count instead of placeholder', async ({ page }) => {
    await expect(page.locator('text=142 days')).not.toBeVisible();
    await expect(page.locator(DAY_SELECTOR)).toBeVisible();
  });

  test('should display progress alongside theme cards', async ({ page }) => {
    await expect(page.locator(DAY_SELECTOR)).toBeVisible();
    await expect(page.locator('[data-name="Worries container"]')).toBeVisible();
    await expect(page.locator('[data-name="Theme card narrow"]').first()).toBeVisible();
  });

  test('should update progress display dynamically', async ({ page }) => {
    await seedTwoDaysHistory(page);
    // Увеличен timeout для учета времени синхронизации с Supabase и обновления UI
    await expect(page.locator(TWO_DAYS_SELECTOR)).toBeVisible({ timeout: 30000 });
  });

  test('should handle accessibility features', async ({ page }) => {
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible();
    await expect(page.locator('[data-name="Theme card narrow"]').first()).toBeVisible();
  });
});
