/**
 * Comprehensive E2E daily check-in flow tests
 * Focuses on seeded scenarios to validate navigation and data updates
 */

import { test, expect, type Page } from '@playwright/test';
import {
  seedCheckinHistory,
  waitForPageLoad,
  waitForHomeScreen,
  waitForCheckinScreen,
  isOnCheckinScreen,
  completeCheckin
} from './utils/test-helpers';

const todayISO = () => new Date().toISOString();
const daysAgoISO = (days: number, hour = 9) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setMilliseconds(0);
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const collectDailyEntries = async (page: Page) => {
  return page.evaluate(() => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('daily_checkin_')) {
        keys.push(key);
      }
    }
    return keys.sort();
  });
};

test.describe('Daily Check-in Flow', () => {
  test('should complete first-time check-in flow', async ({ page }) => {
    await seedCheckinHistory(page, [], { firstCheckinDone: false, firstRewardShown: false });

    await page.goto('/');
    await waitForPageLoad(page);
    // waitForCheckinScreen уже включает ожидание синхронизации
    await waitForCheckinScreen(page);

    await completeCheckin(page);
    await waitForHomeScreen(page);

    const entries = await collectDailyEntries(page);
    expect(entries.length).toBeGreaterThan(0);
  });

  test('should skip check-in on repeat visit same day', async ({ page }) => {
    await seedCheckinHistory(page, [{ iso: todayISO() }]);

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page, 30000);
    // Даем дополнительное время для завершения навигации
    await page.waitForTimeout(1000).catch(() => {});
    expect(await isOnCheckinScreen(page)).toBeFalsy();

    await page.reload();
    await waitForPageLoad(page);
    await waitForHomeScreen(page, 30000);
    // Даем дополнительное время для завершения навигации
    await page.waitForTimeout(1000).catch(() => {});
    expect(await isOnCheckinScreen(page)).toBeFalsy();
  });

  test('should show check-in screen on next day', async ({ page }) => {
    await seedCheckinHistory(page, [{ iso: daysAgoISO(1) }], { firstCheckinDone: true });

    await page.goto('/');
    await waitForPageLoad(page);
    // waitForCheckinScreen уже включает ожидание синхронизации
    await waitForCheckinScreen(page);
  });

  test('should persist check-in data across browser sessions', async ({ browser }) => {
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();

    // Enable mocked sync for context A
    await pageA.addInitScript(() => {
      (window as any).__PLAYWRIGHT__ = true;
      (window as any).__MOCK_SUPABASE_SYNC__ = true;
    });

    await seedCheckinHistory(pageA, [], { firstCheckinDone: false, firstRewardShown: false });
    await pageA.goto('/');
    await waitForPageLoad(pageA);
    // Даем время для завершения начальной синхронизации перед проверкой экрана
    await pageA.waitForTimeout(1500).catch(() => {});
    await waitForCheckinScreen(pageA);
    await completeCheckin(pageA);
    await waitForHomeScreen(pageA);

    const state = await contextA.storageState();
    const keysBefore = await collectDailyEntries(pageA);
    await contextA.close();

    const contextB = await browser.newContext({ storageState: state });
    const pageB = await contextB.newPage();
    
    // Enable mocked sync for context B
    await pageB.addInitScript(() => {
      (window as any).__PLAYWRIGHT__ = true;
      (window as any).__MOCK_SUPABASE_SYNC__ = true;
    });
    
    await pageB.goto('/');
    await waitForPageLoad(pageB);
    await waitForHomeScreen(pageB);

    const keysAfter = await collectDailyEntries(pageB);
    expect(keysAfter.length).toBe(keysBefore.length);

    await contextB.close();
  });

  test('should handle multiple check-ins across days', async ({ page }) => {
    await seedCheckinHistory(page, [
      { iso: daysAgoISO(3) },
      { iso: daysAgoISO(2) },
      { iso: daysAgoISO(1) }
    ], { firstCheckinDone: true });

    await page.goto('/');
    await waitForPageLoad(page);
    // waitForCheckinScreen уже включает ожидание синхронизации
    await waitForCheckinScreen(page);
    await completeCheckin(page);
    await waitForHomeScreen(page);

    const entries = await collectDailyEntries(page);
    expect(entries.length).toBe(4);
  });

  test('should maintain check-in count accuracy', async ({ page }) => {
    await seedCheckinHistory(page, [
      { iso: daysAgoISO(4) },
      { iso: daysAgoISO(3) },
      { iso: daysAgoISO(2) },
      { iso: daysAgoISO(1) }
    ], { firstCheckinDone: true });

    await page.goto('/');
    await waitForPageLoad(page);
    // waitForCheckinScreen уже включает ожидание синхронизации
    await waitForCheckinScreen(page);
    await completeCheckin(page);
    await waitForHomeScreen(page);

    const entries = await collectDailyEntries(page);
    expect(entries.length).toBe(5);
  });
});
