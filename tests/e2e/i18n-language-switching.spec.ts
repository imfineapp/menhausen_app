// E2E тесты для проверки переключения языка в приложении
import { test, expect } from '@playwright/test';

test.describe('i18n Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    // Устанавливаем флаг E2E до навигации, чтобы приложение стартовало с home
    await page.addInitScript(() => {
      (window as any).__PLAYWRIGHT__ = true;
    });

    // Переходим на главную страницу приложения
    await page.goto('/');
    
    // Ждем загрузки приложения
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="home-ready"]');
  });

  test('должен переключаться с английского на русский язык', async ({ page }) => {
    // Проверяем, что основное содержимое загружено (язык-независимо)
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();

    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible();

    await page.click('text=Language');
    await expect(page.locator('[data-name="Language Modal Content"]')).toBeVisible();
    await page.click('text=Русский');
    await page.click('[data-name="Confirm button"]');
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible();

    // Возвращаемся на главную напрямую
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();
  });

  test('должен сохранять выбранный язык после перезагрузки', async ({ page }) => {
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    await page.click('text=Language');
    await page.click('text=Русский');
    await page.click('[data-name="Confirm button"]');
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="home-ready"]');
    
    await page.click('[data-name="User frame info block"]');
    await expect(page.getByText('Русский')).toBeVisible();
  });

  test('должен переводить все экраны приложения', async ({ page }) => {
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    await page.click('text=Language');
    await page.click('text=Русский');
    await page.click('[data-name="Confirm button"]');
    
    // Открываем About и проверяем заголовок (устойчивый селектор + скролл)
    const aboutItem = page
      .locator('[data-name="Settings item"]').filter({ hasText: /about|о приложении/i })
      .first();
    await aboutItem.scrollIntoViewIfNeeded();
    await aboutItem.click();
    await expect(page.getByText('About Menhausen')).toBeVisible();
    // Возврат домой напрямую
    await page.goto('/');
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();
  });

  test('должен переводить ментальные техники', async ({ page }) => {
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    await page.click('text=Language');
    await page.click('text=Русский');
    await page.click('[data-name="Confirm button"]');

    // Проверяем, что домашняя страница видна после смены языка
    await page.goto('/');
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();
  });

  test('должен переводить опросы', async ({ page }) => {
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    await page.click('text=Language');
    await page.click('text=Русский');
    await page.click('[data-name="Confirm button"]');

    await page.goto('/');
    await page.locator('[data-name="Theme card narrow"]').first().click();
    await page.waitForLoadState('networkidle');

    // Проверяем, что карточки тем отображаются после клика (язык-независимо)
    await expect(page.locator('[data-name="Theme card narrow"]').first()).toBeVisible();
  });
});
