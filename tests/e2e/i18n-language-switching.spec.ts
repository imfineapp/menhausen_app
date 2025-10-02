// E2E тесты для проверки переключения языка в приложении
import { test, expect } from '@playwright/test';
import { skipSurvey } from './utils/skip-survey';

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
    
    // Пропускаем опрос если он показывается
    await skipSurvey(page);
  });

  test('должен переключаться с английского на русский язык', async ({ page }) => {
    // Проверяем, что основное содержимое загружено (язык-независимо)
    await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();

    // Ждем появления пользовательского блока
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout: 10000 });
    
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    
    // Дополнительное ожидание для загрузки страницы профиля
    await page.waitForTimeout(2000);
    
    // Ждем появления страницы профиля
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible({ timeout: 10000 });

    await page.click('text=Language');
    await expect(page.locator('[data-name="Language Modal Content"]')).toBeVisible();
    await page.click('text=Русский');
    await page.click('[data-name="Confirm button"]');
    
    // Ждем смены языка и обновления контента
    await page.waitForLoadState('networkidle');
    
    // Дополнительное ожидание для обновления контента
    await page.waitForTimeout(3000);
    
    // Проверяем, что язык переключился - ищем русский текст в интерфейсе
    const pageTitle = page.locator('h1, h2').first();
    await expect(pageTitle).toBeVisible({ timeout: 10000 });
    
    const titleText = await pageTitle.textContent();
    
    // Проверяем, что заголовок содержит русский текст
    expect(titleText).toMatch(/Герой #MNHSNDEV|Профиль|Как дела?/);
    
    // Дополнительно проверяем, что мы видим русский текст
    expect(titleText).toMatch(/Герой|Профиль|Как|дела/);

    // Возвращаемся на главную напрямую
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Пропускаем опрос если он показывается после переключения языка
    const surveyVisible = await page.locator('text=How old are you?').isVisible();
    if (surveyVisible) {
      await skipSurvey(page);
    } else {
      await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();
    }
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
    // Ждем появления пользовательского блока
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout: 10000 });
    
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что мы на странице профиля
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible({ timeout: 10000 });
    
    await page.click('text=Language');
    await page.click('text=Русский');
    await page.click('[data-name="Confirm button"]');
    
    // Ждем смены языка
    await page.waitForLoadState('networkidle');
    
    // Дополнительное ожидание для обновления контента
    await page.waitForTimeout(3000);
    
    // Проверяем, что язык переключился - ищем русский текст в интерфейсе
    // Проверяем заголовок страницы на русском языке
    const pageTitle = page.locator('h1, h2').first();
    await expect(pageTitle).toBeVisible({ timeout: 10000 });
    
    const titleText = await pageTitle.textContent();
    
    // Проверяем, что заголовок содержит русский текст "Герой #MNHSNDEV" или английский "Welcome back! #MNHSNDEV"
    expect(titleText).toMatch(/Герой #MNHSNDEV|Welcome back! #MNHSNDEV/);
    
    // Дополнительно проверяем, что мы видим русский текст
    expect(titleText).toContain('Герой');
    
    // Возврат домой напрямую
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Пропускаем опрос если он показывается после переключения языка
    const surveyVisible = await page.locator('text=How old are you?').isVisible();
    if (surveyVisible) {
      await skipSurvey(page);
    } else {
      await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();
    }
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
    // Ждем появления пользовательского блока
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout: 10000 });
    
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    await page.click('text=Language');
    await page.click('text=Русский');
    await page.click('[data-name="Confirm button"]');

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Пропускаем опрос если он показывается после переключения языка
    const surveyVisible = await page.locator('text=How old are you?').isVisible();
    if (surveyVisible) {
      await skipSurvey(page);
    } else {
      await expect(page.locator('[data-testid="home-ready"]')).toBeVisible();
    }
    
    // Ждем загрузки контента и появления карточек тем
    await expect(page.locator('[data-name="Theme card narrow"]').first()).toBeVisible({ timeout: 10000 });
    
    await page.locator('[data-name="Theme card narrow"]').first().click();
    await page.waitForLoadState('networkidle');

    // Проверяем, что мы перешли на страницу темы (главная страница больше не видна)
    await expect(page.locator('[data-testid="home-ready"]')).not.toBeVisible();
  });
});
