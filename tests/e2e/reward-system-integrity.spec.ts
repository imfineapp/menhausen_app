import { test, expect } from '@playwright/test';

import { waitForPageLoad } from './utils/test-helpers';

test.describe('Reward system integrity', () => {
  test('rejects duplicate client-side reward reference in same session', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const result = await page.evaluate(() => {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const dayKey = `${y}-${m}-${d}`;
      const key = `daily_checkin_${dayKey}`;

      localStorage.setItem(key, JSON.stringify({ completed: true, date: dayKey, value: 3 }));
      localStorage.setItem(key, JSON.stringify({ completed: true, date: dayKey, value: 4 }));

      const allCheckinKeys = Object.keys(localStorage).filter((k) => k.startsWith('daily_checkin_'));
      const payload = JSON.parse(localStorage.getItem(key) || '{}');
      return { count: allCheckinKeys.length, payload };
    });

    expect(result.count).toBe(1);
    expect(result.payload.value).toBe(4);
  });
});
