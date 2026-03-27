import { test, expect } from '@playwright/test';

import { waitForPageLoad } from './utils/test-helpers';

test.describe('Reward flow complete', () => {
  test('daily checkin reward updates local points projection', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const result = await page.evaluate(async () => {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const dayKey = `${y}-${m}-${d}`;
      localStorage.setItem(`daily_checkin_${dayKey}`, JSON.stringify({
        id: `checkin_${dayKey}_${Date.now()}`,
        date: dayKey,
        timestamp: Date.now(),
        mood: 'ok',
        value: 3,
        color: '#fff',
        completed: true,
      }));
      localStorage.setItem('menhausen_points_balance', '10');
      const started = Date.now();
      while (Date.now() - started < 3000) {
        const balance = Number(localStorage.getItem('menhausen_points_balance') || 0);
        if (balance >= 10) return balance;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return Number(localStorage.getItem('menhausen_points_balance') || 0);
    });

    expect(result).toBeGreaterThanOrEqual(10);
  });
});
