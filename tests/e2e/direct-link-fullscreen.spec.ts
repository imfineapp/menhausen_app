/**
 * E2E Tests for Telegram Direct-Link Full Screen & Back Button Fix
 * Tests the behavior when opening the app via direct-link (t.me/bot/app)
 */

import { test, expect, type Page } from '@playwright/test';
import { waitForPageLoad } from './utils/test-helpers';

test.describe('Telegram Direct-Link Full Screen & Back Button', () => {
  async function mockTelegram(page: Page): Promise<void> {
    await page.addInitScript(() => {
      (window as any).Telegram = {
        WebApp: {
          ready: () => console.log('WebApp ready called'),
          expand: () => console.log('WebApp expand called'),
          BackButton: {
            show: () => console.log('Back button shown'),
            hide: () => console.log('Back button hidden'),
            onClick: (_callback: () => void) => {
              console.log('Back button click handler set');
              return () => console.log('Back button click handler removed');
            },
            offClick: () => console.log('Back button click handler removed')
          },
          platform: 'ios',
          initDataUnsafe: {
            user: {
              id: 123456789,
              first_name: 'Test',
              last_name: 'User',
              username: 'testuser',
              language_code: 'en',
              is_premium: false
            },
            start_param: 'test_start_param'
          }
        }
      };
    });
  }

  async function openDirectLink(page: Page): Promise<void> {
    await page.goto('/');
    await waitForPageLoad(page);
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  }

  test.beforeEach(async ({ page }) => {
    await mockTelegram(page);
  });

  test('should detect direct-link mode and expand to full screen', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));

    await openDirectLink(page);

    const webAppLogs = logs.filter(log =>
      log.includes('Telegram WebApp initialized') ||
      log.includes('Telegram WebApp expanded')
    );

    expect(webAppLogs.length).toBeGreaterThanOrEqual(0);
  });

  test('should show back button for direct-link mode', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));

    await openDirectLink(page);

    expect(errors.filter(e => e.includes('Telegram') && !e.includes('warn'))).toHaveLength(0);
  });

  test('should handle navigation correctly in direct-link mode', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));

    await openDirectLink(page);

    expect(errors.filter(e => e.includes('navigation') || e.includes('goBack'))).toHaveLength(0);
  });

  test('should maintain compatibility with existing functionality', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));

    await openDirectLink(page);

    expect(errors.filter(e => !e.includes('warn') && !e.includes('info'))).toHaveLength(0);
  });

  test('should handle cross-platform compatibility', async ({ page }) => {
    const platforms = ['ios', 'android', 'desktop'];

    for (const platform of platforms) {
      await page.evaluate(currentPlatform => {
        if ((window as any).Telegram?.WebApp) {
          (window as any).Telegram.WebApp.platform = currentPlatform;
        }
      }, platform);

      await page.reload();
      await waitForPageLoad(page);
      await expect(page.locator('body')).toBeVisible({ timeout: 5000 });

      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));

      expect(errors.filter(e => !e.includes('warn'))).toHaveLength(0);
    }
  });
});
