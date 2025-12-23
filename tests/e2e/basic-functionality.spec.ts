// Базовые тесты функциональности приложения
// Optimized: replaced networkidle with domcontentloaded and element-based waiting
import { test, expect } from '@playwright/test';
import { primeAppForHome, waitForPageLoad, waitForHomeScreen } from './utils/test-helpers';

test.describe('Basic App Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__PLAYWRIGHT__ = true;
    });

    await primeAppForHome(page);

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page);
  });

  test('должен загружать главную страницу', async ({ page }) => {
    await expect(page.locator('[data-name="Worries container"]')).toBeVisible();
    await expect(page.locator('[data-name="Theme card narrow"]').first()).toBeVisible();
  });

  test('должен открывать профиль при клике на блок пользователя', async ({ page }) => {
    await page.click('[data-name="User frame info block"]');
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible({ timeout: 5000 });
  });

  test('должен переключаться на страницу темы', async ({ page }) => {
    await expect(page.locator('[data-name="Theme card narrow"]').first()).toBeVisible({ timeout: 5000 });
    // Проверяем, что мы на home screen перед кликом
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout: 5000 });
    
    await page.locator('[data-name="Theme card narrow"]').first().click();
    
    // После клика на карточку темы User frame info block должен исчезнуть
    // (так как он есть только на home screen)
    await expect(page.locator('[data-name="User frame info block"]')).not.toBeVisible({ timeout: 5000 });
  });
});
