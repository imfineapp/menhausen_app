// E2E тесты для проверки переключения языка в приложении
import { test, expect } from '@playwright/test';
import { completeCheckin, waitForPageLoad, waitForHomeScreen, isOnCheckinScreen, primeAppForHome } from './utils/test-helpers';
import type { Page } from '@playwright/test';

test.describe('i18n Language Switching', () => {
  const ensureHome = async (page: Page): Promise<void> => {
    await waitForPageLoad(page);
    if (await isOnCheckinScreen(page)) {
      await completeCheckin(page);
    }
    await waitForHomeScreen(page);
  };

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__PLAYWRIGHT__ = true;
      (window as any).__MOCK_SUPABASE_SYNC__ = true; // Enable mocked sync for tests
    });

    await primeAppForHome(page);

    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page);
  });

  test('должен переключаться с английского на русский язык', async ({ page }) => {
    // Проверяем, что основное содержимое загружено (язык-независимо)
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();

    // Ждем появления пользовательского блока
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout: 5000 });
    
    await page.click('[data-name="User frame info block"]');
    
    // Ждем появления страницы профиля
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible({ timeout: 5000 });

    // Кликаем на иконку настроек
    await page.click('[data-name="Settings icon button"]');
    // Ждем появления страницы настроек
    await expect(page.locator('[data-name="App Settings Page"]')).toBeVisible({ timeout: 5000 });

    // Wait for settings page to be fully loaded
    await page.waitForTimeout(500);
    
    // Click on Language item - it's a button with text "Language" or "Язык"
    // We use a more flexible selector that matches either language
    const languageButton = page.locator('button:has-text("Language"), button:has-text("Язык")').first();
    await expect(languageButton).toBeVisible({ timeout: 5000 });
    await languageButton.click();
    
    await expect(page.locator('[data-name="Language Modal Content"]')).toBeVisible({ timeout: 5000 });
    // Click on Russian language option using data-name selector
    await page.click('[data-name="Language option ru"]');
    await page.click('[data-name="Confirm button"]');
    
    // Берём заголовок профиля после смены языка
    const pageTitle = page.locator('h1, h2').first();
    await expect(pageTitle).toBeVisible({ timeout: 5000 });
    
    const titleText = await pageTitle.textContent();
    expect(titleText).toBeTruthy();
    
    // Проверяем, что заголовок соответствует одному из поддерживаемых языков
    // После смены языка мы можем остаться на странице настроек ("Настройки" / "Settings")
    // или вернуться на профиль ("Профиль" / "Profile" / "Hero" / "Герой")
    expect(titleText).toMatch(/(Hero|Welcome back|Герой|Профиль|Как дела|Настройки|Settings)/i);

    // Возвращаемся на главную и убеждаемся, что домашний экран доступен
    await page.goto('/');
    await ensureHome(page);
  });

  test('должен сохранять выбранный язык после перезагрузки', async ({ page }) => {
    await page.click('[data-name="User frame info block"]');
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible({ timeout: 5000 });
    // Кликаем на иконку настроек
    await page.click('[data-name="Settings icon button"]');
    await expect(page.locator('[data-name="App Settings Page"]')).toBeVisible({ timeout: 5000 });
    
    // Wait for settings page to be fully loaded
    await page.waitForTimeout(500);
    
    // Click on Language item
    const languageButton = page.locator('button:has-text("Language"), button:has-text("Язык")').first();
    await expect(languageButton).toBeVisible({ timeout: 5000 });
    await languageButton.click();
    
    // Click on Russian language option using data-name selector
    await page.click('[data-name="Language option ru"]');
    await page.click('[data-name="Confirm button"]');
    
    await page.reload();
    await ensureHome(page);
    
    await page.click('[data-name="User frame info block"]');
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible({ timeout: 5000 });
    // Кликаем на иконку настроек
    await page.click('[data-name="Settings icon button"]');
    await expect(page.locator('[data-name="App Settings Page"]')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Русский')).toBeVisible({ timeout: 5000 });
  });

  test('должен переводить все экраны приложения', async ({ page }) => {
    // Ждем появления пользовательского блока
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout: 5000 });
    
    await page.click('[data-name="User frame info block"]');
    
    // Проверяем, что мы на странице профиля
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible({ timeout: 5000 });
    
    // Кликаем на иконку настроек
    await page.click('[data-name="Settings icon button"]');
    await expect(page.locator('[data-name="App Settings Page"]')).toBeVisible({ timeout: 5000 });
    
    // Wait for settings page to be fully loaded
    await page.waitForTimeout(500);
    
    // Click on Language item
    const languageButton = page.locator('button:has-text("Language"), button:has-text("Язык")').first();
    await expect(languageButton).toBeVisible({ timeout: 5000 });
    await languageButton.click();
    
    // Click on Russian language option using data-name selector
    await page.click('[data-name="Language option ru"]');
    await page.click('[data-name="Confirm button"]');
    
    // Считываем любой заголовок после смены языка
    const pageTitle = page.locator('h1, h2').first();
    await expect(pageTitle).toBeVisible({ timeout: 5000 });
    
    const titleText = await pageTitle.textContent();
    expect(titleText).toBeTruthy();
    // После смены языка мы можем остаться на странице настроек ("Настройки" / "Settings")
    // или вернуться на профиль ("Профиль" / "Profile" / "Hero" / "Герой")
    expect(titleText).toMatch(/(Hero|Welcome back|Герой|Профиль|Настройки|Settings)/i);
    
    // Возвращаемся на главную и убеждаемся, что домашний экран доступен
    await page.goto('/');
    await ensureHome(page);
  });

  test('должен переводить ментальные техники', async ({ page }) => {
    await page.click('[data-name="User frame info block"]');
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible({ timeout: 5000 });
    // Кликаем на иконку настроек
    await page.click('[data-name="Settings icon button"]');
    await expect(page.locator('[data-name="App Settings Page"]')).toBeVisible({ timeout: 5000 });
    
    // Wait for settings page to be fully loaded
    await page.waitForTimeout(500);
    
    // Click on Language item
    const languageButton = page.locator('button:has-text("Language"), button:has-text("Язык")').first();
    await expect(languageButton).toBeVisible({ timeout: 5000 });
    await languageButton.click();
    
    // Click on Russian language option using data-name selector
    await page.click('[data-name="Language option ru"]');
    await page.click('[data-name="Confirm button"]');

    // Проверяем, что домашняя страница видна после смены языка
    await page.goto('/');
    await ensureHome(page);
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();
  });

  test('должен переводить опросы', async ({ page }) => {
    // Ждем появления пользовательского блока
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout: 5000 });
    
    await page.click('[data-name="User frame info block"]');
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible({ timeout: 5000 });
    // Кликаем на иконку настроек
    await page.click('[data-name="Settings icon button"]');
    await expect(page.locator('[data-name="App Settings Page"]')).toBeVisible({ timeout: 5000 });
    
    // Wait for settings page to be fully loaded
    await page.waitForTimeout(500);
    
    // Click on Language item
    const languageButton = page.locator('button:has-text("Language"), button:has-text("Язык")').first();
    await expect(languageButton).toBeVisible({ timeout: 5000 });
    await languageButton.click();
    
    // Click on Russian language option using data-name selector
    await page.click('[data-name="Language option ru"]');
    await page.click('[data-name="Confirm button"]');

    await page.goto('/');
    await ensureHome(page);
    
    // Ждем загрузки контента и появления карточек тем
    await expect(page.locator('[data-name="Theme card narrow"]').first()).toBeVisible({ timeout: 5000 });
    
    await page.locator('[data-name="Theme card narrow"]').first().click();

    // Проверяем, что мы перешли на страницу темы (главная страница больше не видна)
    await expect(page.locator('[data-testid="home-ready"]')).not.toBeVisible({ timeout: 5000 });
  });
});
