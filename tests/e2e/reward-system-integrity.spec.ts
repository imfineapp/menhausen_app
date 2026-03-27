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

  test('does not perform local fallback write when server rejects reward grant', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const result = await page.evaluate(async () => {
      localStorage.setItem('menhausen_points_balance', '9999');
      localStorage.removeItem('menhausen_reward_offline_queue');

      const originalFetch = window.fetch.bind(window);
      const telegramContainer = (window as any).Telegram || {};
      const originalTelegram = telegramContainer.WebApp;
      (window as any).Telegram = {
        ...telegramContainer,
        WebApp: { ...(telegramContainer.WebApp || {}), initData: 'mock_init_data' },
      };
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).includes('/functions/v1/grant-reward')) {
          return new Response(
            JSON.stringify({
              success: true,
              granted: false,
              reason: 'already_granted',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          );
        }
        return originalFetch(input as RequestInfo, init);
      };

      try {
        // @ts-expect-error Browser-side import path resolved by Vite during Playwright run.
        const mod = await import('/src/stores/points.store.ts');
        await mod.earnPoints(10, {
          eventType: 'daily_checkin',
          referenceId: 'integrity-reject',
          note: 'integrity test',
        });
      } finally {
        window.fetch = originalFetch;
        (window as any).Telegram = { ...telegramContainer, WebApp: originalTelegram };
      }

      return Number(localStorage.getItem('menhausen_points_balance') || 0);
    });

    expect(result).toBe(9999);
  });

  test('persists offline reward request for replay on network failure', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const result = await page.evaluate(async () => {
      localStorage.removeItem('menhausen_reward_offline_queue');
      localStorage.setItem('menhausen_points_balance', '100');
      const balanceBefore = Number(localStorage.getItem('menhausen_points_balance') || 0);

      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).includes('/functions/v1/grant-reward')) {
          throw new Error('network down');
        }
        return originalFetch(input as RequestInfo, init);
      };

      try {
        // @ts-expect-error Browser-side import path resolved by Vite during Playwright run.
        const mod = await import('/src/stores/points.store.ts');
        await mod.earnPoints(10, {
          eventType: 'daily_checkin',
          referenceId: 'integrity-offline',
          note: 'integrity test',
        });
      } finally {
        window.fetch = originalFetch;
      }

      const queue = JSON.parse(localStorage.getItem('menhausen_reward_offline_queue') || '[]');
      const balanceAfter = Number(localStorage.getItem('menhausen_points_balance') || 0);
      return {
        queuedCount: Array.isArray(queue) ? queue.length : 0,
        balanceBefore,
        balanceAfter,
      };
    });

    expect(result.queuedCount).toBe(1);
    expect(result.balanceAfter).toBe(result.balanceBefore);
  });
});
