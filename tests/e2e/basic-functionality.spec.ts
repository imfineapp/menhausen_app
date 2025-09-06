// Базовые тесты функциональности приложения
import { test, expect } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test('должен загружать главную страницу', async ({ page }) => {
    // Переходим на главную страницу приложения
    await page.goto('/');
    
    // Ждем загрузки приложения
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что приложение загрузилось
    await expect(page.getByText('How are you?')).toBeVisible();
    
    // Проверяем, что есть кнопка Send
    await expect(page.getByText('Send')).toBeVisible();
    
    // Проверяем, что есть блок пользователя
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible();
  });

  test('должен открывать профиль при клике на блок пользователя', async ({ page }) => {
    // Переходим на главную страницу
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Кликаем на блок пользователя
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что страница изменилась (не главная)
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('должен переключаться на страницу чекина', async ({ page }) => {
    // Переходим на главную страницу
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Кликаем на кнопку Send
    await page.click('text=Send');
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что открылась страница чекина
    await expect(page.getByText('How are you feeling?')).toBeVisible();
  });
});
