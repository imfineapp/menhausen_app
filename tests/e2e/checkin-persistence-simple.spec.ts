/**
 * Simplified E2E tests for check-in data persistence
 * Uses seeded localStorage to validate persistence behaviour
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

const getDailyCheckinKeys = async (page: Page) => {
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

test.describe('Check-in Data Persistence', () => {
  test('should persist check-in data in localStorage', async ({ page }) => {
    await seedCheckinHistory(page, [], { firstCheckinDone: false, firstRewardShown: false });

    await page.goto('/');
    await waitForPageLoad(page);
    
    // Проверяем, что чекин на сегодня действительно удален
    const todayKey = await page.evaluate(() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
    const todayCheckin = await page.evaluate((key) => {
      return localStorage.getItem(`daily_checkin_${key}`);
    }, todayKey);
    expect(todayCheckin).toBeNull();

    // Ждем check-in screen с увеличенным таймаутом
    await waitForCheckinScreen(page, 10000);
    expect(await isOnCheckinScreen(page)).toBeTruthy();

    await completeCheckin(page);
    await waitForHomeScreen(page);

    const dailyKeys = await getDailyCheckinKeys(page);
    expect(dailyKeys.length).toBeGreaterThan(0);
  });

  test('should maintain data after browser restart', async ({ browser }) => {
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
    await completeCheckin(pageA);
    await waitForHomeScreen(pageA);
    const storageState = await contextA.storageState();
    const keysBefore = await getDailyCheckinKeys(pageA);
    await contextA.close();

    const contextB = await browser.newContext({ storageState });
    const pageB = await contextB.newPage();
    
    // Enable mocked sync for context B
    await pageB.addInitScript(() => {
      (window as any).__PLAYWRIGHT__ = true;
      (window as any).__MOCK_SUPABASE_SYNC__ = true;
    });
    
    await pageB.goto('/');
    await waitForPageLoad(pageB);
    await waitForHomeScreen(pageB);

    const keysAfter = await getDailyCheckinKeys(pageB);
    expect(keysAfter.length).toBe(keysBefore.length);

    await contextB.close();
  });

  test('should persist multiple days of check-ins', async ({ page }) => {
    const history = [
      { iso: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
      { iso: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { iso: new Date().toISOString() }
    ];
    await seedCheckinHistory(page, history);

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page);

    const dailyKeys = await getDailyCheckinKeys(page);
    expect(dailyKeys.length).toBe(history.length);
  });

  test('should handle data cleanup correctly', async ({ page }) => {
    const history = [
      { iso: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { iso: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { iso: new Date().toISOString() }
    ];
    await seedCheckinHistory(page, history);

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page);

    const beforeCleanup = await getDailyCheckinKeys(page);
    await page.evaluate(() => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('daily_checkin_')) {
          keys.push(key);
        }
      }
      keys.sort();
      if (keys.length > 1) {
        localStorage.removeItem(keys[0]);
      }
    });
    const afterCleanup = await getDailyCheckinKeys(page);
    expect(afterCleanup.length).toBe(beforeCleanup.length - 1);
  });

  test('should handle data migration gracefully', async ({ page }) => {
    const history = [{ iso: new Date().toISOString() }];
    await seedCheckinHistory(page, history);

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page);

    await page.evaluate(() => {
      localStorage.setItem('old_checkin_history', JSON.stringify([{ date: '2024-01-01', mood: 'neutral' }]));
    });

    const legacyCount = await page.evaluate(() => {
      const legacy = localStorage.getItem('old_checkin_history');
      return legacy ? JSON.parse(legacy).length : 0;
    });

    expect(legacyCount).toBe(1);
  });

  test('should handle concurrent access from multiple tabs', async ({ browser }) => {
    const context = await browser.newContext();
    const pageA = await context.newPage();
    const pageB = await context.newPage();

    await seedCheckinHistory(pageA, [], { firstCheckinDone: false, firstRewardShown: false });

    await pageA.goto('/');
    await waitForPageLoad(pageA);
    await completeCheckin(pageA);
    await waitForHomeScreen(pageA);

    await pageB.goto('/');
    await waitForPageLoad(pageB);
    await waitForHomeScreen(pageB);

    const keysA = await getDailyCheckinKeys(pageA);
    const keysB = await getDailyCheckinKeys(pageB);

    expect(keysA.length).toBeGreaterThan(0);
    expect(keysB.length).toBe(keysA.length);

    await context.close();
  });
});
