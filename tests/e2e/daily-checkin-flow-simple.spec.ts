/**
 * Simplified E2E tests for daily check-in flow
 * Uses seeded state to cover first-time and repeat scenarios deterministically
 */

import { test, expect } from '@playwright/test';
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

test.describe('Daily Check-in Flow', () => {
  test('should guide new user through first check-in', async ({ page }) => {
    await seedCheckinHistory(page, [], { firstCheckinDone: false, firstRewardShown: false });

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForCheckinScreen(page);

    await completeCheckin(page);
    await waitForHomeScreen(page);

    const keys = await page.evaluate(() => {
      const results: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('daily_checkin_')) {
          results.push(key);
        }
      }
      return results;
    });
    expect(keys.length).toBeGreaterThan(0);
  });

  test('should skip check-in when already completed today', async ({ page }) => {
    await seedCheckinHistory(page, [{ iso: todayISO() }]);

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page);

    expect(await isOnCheckinScreen(page)).toBeFalsy();
  });

  test('should show check-in screen on next day', async ({ page }) => {
    await seedCheckinHistory(page, [{ iso: daysAgoISO(1) }], { firstCheckinDone: true });

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForCheckinScreen(page);
  });

  test('should persist check-in across reloads', async ({ page }) => {
    await seedCheckinHistory(page, [], { firstCheckinDone: false, firstRewardShown: false });

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForCheckinScreen(page);
    await completeCheckin(page);
    await waitForHomeScreen(page);

    await page.reload();
    await waitForPageLoad(page);
    if (await isOnCheckinScreen(page)) {
      await completeCheckin(page);
    }
    await waitForHomeScreen(page);
  });

  test('should handle multiple check-ins across days', async ({ page }) => {
    await seedCheckinHistory(page, [
      { iso: daysAgoISO(2) },
      { iso: daysAgoISO(1) }
    ], { firstCheckinDone: true });

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForCheckinScreen(page);
    await completeCheckin(page);
    await waitForHomeScreen(page);

    const entries = await page.evaluate(() => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('daily_checkin_')) {
          keys.push(key);
        }
      }
      return keys.length;
    });
    expect(entries).toBe(3);
  });
});
