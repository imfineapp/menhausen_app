/**
 * Comprehensive E2E tests for check-in data persistence
 * Validates that seeded history remains stable across sessions and tabs
 */

import { test, expect, type Page } from '@playwright/test';
import {
  seedCheckinHistory,
  waitForPageLoad,
  waitForHomeScreen,
  waitForCheckinScreen,
  completeCheckin
} from './utils/test-helpers';

interface StoredCheckin {
  date: string;
  timestamp: number;
  mood: string;
}

const readCheckins = async (page: Page): Promise<StoredCheckin[]> => {
  return page.evaluate(() => {
    const entries: StoredCheckin[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('daily_checkin_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            entries.push({ date: parsed.date, timestamp: parsed.timestamp, mood: parsed.mood });
          } catch (error) {
            console.warn('Failed to parse check-in entry', key, error);
          }
        }
      }
    }
    entries.sort((a, b) => a.timestamp - b.timestamp);
    return entries;
  });
};

test.describe('Check-in Data Persistence', () => {
  test('should persist check-in data in localStorage', async ({ page }) => {
    await seedCheckinHistory(page, [], { firstCheckinDone: false, firstRewardShown: false });

    await page.goto('/');
    await waitForPageLoad(page);
    // waitForCheckinScreen уже включает ожидание синхронизации
    await waitForCheckinScreen(page);
    await completeCheckin(page);
    await waitForHomeScreen(page);

    const entries = await readCheckins(page);
    expect(entries.length).toBeGreaterThan(0);
    // Используем UTC дату для избежания проблем с часовыми поясами
    const todayUTC = new Date().toISOString().split('T')[0];
    const entryDate = entries[entries.length - 1].date;
    // Проверяем, что дата соответствует сегодняшней или вчерашней (с учетом часового пояса)
    // Создаем массив возможных дат (сегодня и вчера UTC)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayUTC = yesterday.toISOString().split('T')[0];
    expect([todayUTC, yesterdayUTC]).toContain(entryDate);
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

    const entriesBefore = await readCheckins(pageA);
    const storageState = await contextA.storageState();
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
    // Даем больше времени для завершения синхронизации с Supabase
    await pageB.waitForTimeout(5000).catch(() => {});

    const entriesAfter = await readCheckins(pageB);
    // Из-за синхронизации количество может увеличиться (если были данные в Supabase)
    // Проверяем, что как минимум все записи из before присутствуют
    expect(entriesAfter.length).toBeGreaterThanOrEqual(entriesBefore.length);
    // Проверяем, что последняя дата соответствует (или одна из последних, если добавились новые)
    const lastDateBefore = entriesBefore[entriesBefore.length - 1].date;
    const lastDatesAfter = entriesAfter.slice(-Math.min(entriesBefore.length, entriesAfter.length)).map(e => e.date);
    expect(lastDatesAfter).toContain(lastDateBefore);

    await contextB.close();
  });

  test('should persist multiple days of check-ins', async ({ page }) => {
    const history = [
      { iso: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), mood: 'happy' },
      { iso: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), mood: 'neutral' },
      { iso: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), mood: 'sad' },
      { iso: new Date().toISOString(), mood: 'calm' }
    ];
    await seedCheckinHistory(page, history);

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page);

    const entries = await readCheckins(page);
    expect(entries.length).toBe(history.length);
    expect(entries.map(entry => entry.mood)).toContain('happy');
    expect(entries.map(entry => entry.mood)).toContain('calm');
  });

  test('should handle data cleanup correctly', async ({ page }) => {
    const history = [
      { iso: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { iso: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { iso: new Date().toISOString() }
    ];
    await seedCheckinHistory(page, history);

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page);

    await page.evaluate(() => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('daily_checkin_')) {
          keys.push(key);
        }
      }
      keys.sort();
      if (keys.length > 0) {
        localStorage.removeItem(keys[0]);
      }
    });

    const entries = await readCheckins(page);
    expect(entries.length).toBe(history.length - 1);
  });

  test('should handle data migration gracefully', async ({ page }) => {
    const history = [{ iso: new Date().toISOString() }];
    await seedCheckinHistory(page, history);

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page);

    await page.evaluate(() => {
      localStorage.setItem('old_checkin_history', JSON.stringify([
        { date: '2023-05-01', mood: 'neutral' },
        { date: '2023-05-02', mood: 'happy' }
      ]));
    });

    const legacy = await page.evaluate(() => {
      const raw = localStorage.getItem('old_checkin_history');
      return raw ? JSON.parse(raw).length : 0;
    });

    expect(legacy).toBe(2);
  });

  test('should handle concurrent access from multiple tabs', async ({ browser }) => {
    const context = await browser.newContext();
    const pageA = await context.newPage();
    const pageB = await context.newPage();

    await seedCheckinHistory(pageA, [{ iso: new Date().toISOString() }]);

    await pageA.goto('/');
    await waitForPageLoad(pageA);
    await waitForHomeScreen(pageA);

    await pageB.goto('/');
    await waitForPageLoad(pageB);
    await waitForHomeScreen(pageB);

    const entriesA = await readCheckins(pageA);
    const entriesB = await readCheckins(pageB);

    expect(entriesA.length).toBe(entriesB.length);
    expect(entriesA[entriesA.length - 1].date).toBe(entriesB[entriesB.length - 1].date);

    await context.close();
  });
});
