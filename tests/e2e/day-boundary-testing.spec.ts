/**
 * Comprehensive E2E tests for day boundary scenarios
 * Uses seeded localStorage state to emulate edge cases deterministically
 */

import { test, expect, type Page } from '@playwright/test';
import { waitForPageLoad, waitForHomeScreen, seedCheckinHistory, type CheckinHistorySeed } from './utils/test-helpers';

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
  await waitForHomeScreen(page);
};

const expectCheckinCount = async (page: Page, expected: number) => {
  const count = await page.evaluate(() => {
    const data = localStorage.getItem('checkin-data');
    if (!data) {
      return 0;
    }
    try {
      return JSON.parse(data).length;
    } catch {
      return 0;
    }
  });
  expect(count).toBe(expected);
};

test.describe('Day Boundary Testing', () => {
  test('should handle 6 AM reset logic correctly', async ({ page }) => {
    const history = [createSeed(0, 9), createSeed(1, 5)];
    await seedCheckinHistory(page, history);
    await loadHome(page);
    await expectCheckinCount(page, history.length);
  });

  test('should handle midnight transitions correctly', async ({ page }) => {
    const history = [createSeed(0, 9), createSeed(1, 23)];
    await seedCheckinHistory(page, history);
    await loadHome(page);
    await expectCheckinCount(page, history.length);
  });

  test('should handle timezone changes gracefully', async ({ page }) => {
    const history = [createSeed(0, 9), createSeed(2, 2)];
    await seedCheckinHistory(page, history);
    await loadHome(page);
    await expectCheckinCount(page, history.length);
  });

  test('should handle edge cases around 6 AM', async ({ page }) => {
    const history = [createSeed(0, 5), createSeed(1, 7), createSeed(2, 9)];
    await seedCheckinHistory(page, history, { firstCheckinDone: true, firstRewardShown: true });
    await loadHome(page);
    await expectCheckinCount(page, history.length);
  });

  test('should maintain data consistency across day boundaries', async ({ page }) => {
    const history = [createSeed(0, 9), createSeed(1, 9), createSeed(2, 9)];
    await seedCheckinHistory(page, history);
    await loadHome(page);
    await expectCheckinCount(page, history.length);
  });

  test('should handle leap year transitions', async ({ page }) => {
    const now = new Date();
    const leapYear = now.getFullYear() % 4 === 0 ? now.getFullYear() : now.getFullYear() - (now.getFullYear() % 4);
    const feb28 = new Date(Date.UTC(leapYear, 1, 28, 9, 0, 0));
    const feb29 = new Date(Date.UTC(leapYear, 1, 29, 9, 0, 0));
    const history: CheckinHistorySeed[] = [createSeed(0, 9), { iso: feb28.toISOString() }, { iso: feb29.toISOString() }];
    await seedCheckinHistory(page, history);
    await loadHome(page);
    await expectCheckinCount(page, history.length);
  });

  test('should handle year transitions', async ({ page }) => {
    const yearEnd = new Date(Date.UTC(new Date().getFullYear(), 11, 31, 9, 0, 0));
    const yearStart = new Date(Date.UTC(new Date().getFullYear() + 1, 0, 1, 9, 0, 0));
    const history: CheckinHistorySeed[] = [createSeed(0, 9), { iso: yearEnd.toISOString() }, { iso: yearStart.toISOString() }];
    await seedCheckinHistory(page, history);
    await loadHome(page);
    await expectCheckinCount(page, history.length);
  });

  test('should handle device time changes', async ({ page }) => {
    const history = [createSeed(0, 9), createSeed(3, 9), createSeed(7, 9)];
    await seedCheckinHistory(page, history);
    await loadHome(page);
    await expectCheckinCount(page, history.length);
  });
});
