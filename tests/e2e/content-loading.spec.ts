import { test, expect } from '@playwright/test';
import { skipSurvey } from './utils/skip-survey';

test.describe('Content Loading Tests', () => {
  test('should load content and display theme cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Пропускаем опрос если он показывается
    await skipSurvey(page);
    
    // Ждем загрузки главной страницы
    await page.waitForSelector('[data-testid="home-ready"]', { timeout: 15000 });
    
    // Ждем загрузки карточек тем
    await expect(page.locator('[data-name="Theme card narrow"]').first()).toBeVisible({ timeout: 15000 });
    
    // Проверяем, что есть карточки тем
    const themeCards = page.locator('[data-name="Theme card narrow"]');
    await expect(themeCards).toHaveCount(6);
  });

  test('should load content in Russian', async ({ page }) => {
    // Сначала загружаем приложение на английском языке
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Пропускаем опрос если он показывается
    await skipSurvey(page);
    
    // Ждем загрузки главной страницы
    await page.waitForSelector('[data-testid="home-ready"]', { timeout: 15000 });
    
    // Теперь переключаемся на русский язык через UI
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    await page.click('text=Language');
    await page.click('text=Русский');
    await page.click('[data-name="Confirm button"]');
    
    // Ждем смены языка: сначала пытаемся дождаться lang="ru" на html
    await page.waitForFunction(() => document.documentElement.lang === 'ru', null, { timeout: 15000 }).catch(() => {});
    
    // Дополнительное ожидание на обновление контента и шрифтов в CI
    await page.waitForTimeout(1000);
    
    // Проверяем наличие кириллицы в заголовке или любом видимом заголовке
    const profileTitle = page.locator('h1, h2').first();
    await expect(profileTitle).toBeVisible({ timeout: 15000 });
    const titleText = (await profileTitle.textContent()) || '';
    
    // Если заголовок недостаточен, проверим наличие кириллицы на странице
    const pageHasCyrillic = /[А-Яа-яЁё]/.test(titleText) || await page.evaluate(() => /[А-Яа-яЁё]/.test(document.body.innerText));
    expect(pageHasCyrillic).toBe(true);
  });
});
