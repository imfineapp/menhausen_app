import { test, expect } from '@playwright/test';
import { skipSurvey } from './utils/skip-survey';

test.describe('Content Loading Tests', () => {
  test('should load content and display theme cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Пропускаем опрос если он показывается
    await skipSurvey(page);
    
    // Проверяем, что контент загружен - ищем элементы интерфейса
    await expect(page.locator('text=Hero #1275')).toBeVisible({ timeout: 10000 });
    
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
    
    // Ждем смены языка
    await page.waitForLoadState('networkidle');
    
    // Дополнительное ожидание для обновления контента
    await page.waitForTimeout(3000);
    
    // Проверяем, что язык переключился - ищем русский текст в интерфейсе профиля
    // Проверяем заголовок страницы профиля
    const profileTitle = page.locator('h1, h2').first();
    await expect(profileTitle).toBeVisible({ timeout: 10000 });
    
    const titleText = await profileTitle.textContent();
    console.log('Profile title after language switch:', titleText);
    
    // Проверяем, что заголовок содержит русский текст
    // Может быть "Герой #1275", "Профиль", "Как дела?" или другие русские тексты
    expect(titleText).toMatch(/Герой #1275|Профиль|Как дела?/);
    
    // Дополнительно проверяем, что мы видим русский текст
    expect(titleText).toMatch(/Герой|Профиль|Как|дела/);
  });
});
