// Простой тест для проверки загрузки приложения
import { test, expect } from '@playwright/test';

test.describe('Simple App Loading', () => {
  test('должен загружать приложение', async ({ page }) => {
    // Переходим на главную страницу приложения
    await page.goto('/');
    
    // Ждем загрузки приложения
    await page.waitForLoadState('networkidle');
    
    // Ждем, пока приложение полностью инициализируется
    await page.waitForSelector('body', { state: 'visible' });
    
    // Проверяем, что приложение загрузилось - ищем любой текст на странице
    await expect(page.locator('body')).toBeVisible();
    
    // Проверяем, что есть какой-то контент
    const bodyText = await page.textContent('body');
    console.log('Body text:', bodyText);
    
    // Проверяем, что страница не пустая
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(0);
  });
});
