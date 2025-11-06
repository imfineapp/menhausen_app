import { test, expect } from '@playwright/test';
import { seedCheckinHistory, waitForPageLoad, waitForHomeScreen } from './utils/test-helpers';

const todaySeed = () => ({ iso: new Date().toISOString() });

test.describe('Points & Achievements UI', () => {
  test.beforeEach(async ({ page }) => {
    await seedCheckinHistory(page, [todaySeed()]);
    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page);
  });

  test('should update profile ProgressBlock when points balance changes', async ({ page }) => {
    await page.click('[data-name="User frame info block"]');
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible({ timeout: 5000 });

    await page.evaluate(() => {
      localStorage.setItem('menhausen_points_transactions', JSON.stringify([]));
      localStorage.setItem('menhausen_points_balance', String(1234));
      window.dispatchEvent(new CustomEvent('points:updated'));
    });

    await expect(page.getByText('1,234/2,000')).toBeVisible({ timeout: 5000 });
  });

  test('should surface achievements metadata on profile', async ({ page }) => {
    await page.click('[data-name="User frame info block"]');
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible({ timeout: 5000 });

    const dataNames = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-name]')).map(el => el.getAttribute('data-name') || '');
    });

    expect(dataNames.some(name => name.toLowerCase().includes('badge') || name.toLowerCase().includes('achievement'))).toBeTruthy();
  });
});
