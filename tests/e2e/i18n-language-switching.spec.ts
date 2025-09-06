// E2E тесты для проверки переключения языка в приложении
import { test, expect } from '@playwright/test';

test.describe('i18n Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на главную страницу приложения
    await page.goto('/');
    
    // Ждем загрузки приложения
    await page.waitForLoadState('networkidle');
  });

  test('должен переключаться с английского на русский язык', async ({ page }) => {
    // Проверяем, что приложение загрузилось на английском языке
    await expect(page.getByText('Good morning')).toBeVisible();
    
    // Переходим в профиль
    await page.click('[data-name="Profile button"]');
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что профиль открылся на английском
    await expect(page.getByText('Your status')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
    
    // Открываем модальное окно выбора языка
    await page.click('text=Language');
    await expect(page.getByText('Language')).toBeVisible();
    
    // Выбираем русский язык
    await page.click('text=Русский');
    
    // Проверяем, что язык переключился на русский
    await expect(page.getByText('Ваш статус')).toBeVisible();
    await expect(page.getByText('Настройки')).toBeVisible();
    
    // Возвращаемся на главную страницу
    await page.click('[data-name="Back button"]');
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что главная страница тоже на русском
    await expect(page.getByText('Доброе утро')).toBeVisible();
  });

  test('должен сохранять выбранный язык после перезагрузки', async ({ page }) => {
    // Переходим в профиль
    await page.click('[data-name="Profile button"]');
    await page.waitForLoadState('networkidle');
    
    // Переключаемся на русский язык
    await page.click('text=Language');
    await page.click('text=Русский');
    
    // Перезагружаем страницу
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что язык сохранился
    await expect(page.getByText('Ваш статус')).toBeVisible();
  });

  test('должен переводить все экраны приложения', async ({ page }) => {
    // Переключаемся на русский язык
    await page.click('[data-name="Profile button"]');
    await page.waitForLoadState('networkidle');
    await page.click('text=Language');
    await page.click('text=Русский');
    
    // Проверяем экран "О приложении"
    await page.click('text=О приложении');
    await expect(page.getByText('О Menhausen')).toBeVisible();
    await page.click('[data-name="Back button"]');
    
    // Проверяем экран настроек
    await page.click('text=Настройки');
    await expect(page.getByText('Язык')).toBeVisible();
    await page.click('[data-name="Back button"]');
  });

  test('должен переводить ментальные техники', async ({ page }) => {
    // Переключаемся на русский язык
    await page.click('[data-name="Profile button"]');
    await page.waitForLoadState('networkidle');
    await page.click('text=Language');
    await page.click('text=Русский');
    
    // Переходим к ментальным техникам
    await page.click('[data-name="Back button"]');
    await page.click('text=Ментальные техники');
    
    // Проверяем, что техники переведены
    await expect(page.getByText('Дыхательные техники')).toBeVisible();
  });

  test('должен переводить опросы', async ({ page }) => {
    // Переключаемся на русский язык
    await page.click('[data-name="Profile button"]');
    await page.waitForLoadState('networkidle');
    await page.click('text=Language');
    await page.click('text=Русский');
    
    // Переходим к опросам
    await page.click('[data-name="Back button"]');
    await page.click('text=Опрос');
    
    // Проверяем, что опрос переведен
    await expect(page.getByText('Шаг 1 из 3')).toBeVisible();
  });
});
