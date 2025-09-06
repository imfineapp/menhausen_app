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
    await expect(page.getByText('How are you?')).toBeVisible();
    
    // Переходим в профиль - ищем кнопку профиля по data-name атрибуту
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что профиль открылся на английском
    await expect(page.getByText('Profile')).toBeVisible();
    
    // Открываем модальное окно выбора языка
    await page.click('text=Language');
    await expect(page.getByText('Language')).toBeVisible();
    
    // Выбираем русский язык
    await page.click('text=Русский');
    
    // Проверяем, что язык переключился на русский
    await expect(page.getByText('Профиль')).toBeVisible();
    
    // Возвращаемся на главную страницу
    await page.click('text=Back');
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что главная страница тоже на русском
    await expect(page.getByText('Как дела?')).toBeVisible();
  });

  test('должен сохранять выбранный язык после перезагрузки', async ({ page }) => {
    // Переходим в профиль
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    
    // Переключаемся на русский язык
    await page.click('text=Language');
    await page.click('text=Русский');
    
    // Перезагружаем страницу
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что язык сохранился
    await expect(page.getByText('Как дела?')).toBeVisible();
  });

  test('должен переводить все экраны приложения', async ({ page }) => {
    // Переключаемся на русский язык
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    await page.click('text=Language');
    await page.click('text=Русский');
    
    // Проверяем экран "О приложении"
    await page.click('text=About');
    await expect(page.getByText('About Menhausen')).toBeVisible();
    await page.click('text=Back');
    
    // Проверяем экран настроек
    await page.click('text=Settings');
    await expect(page.getByText('Language')).toBeVisible();
    await page.click('text=Back');
  });

  test('должен переводить ментальные техники', async ({ page }) => {
    // Переключаемся на русский язык
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    await page.click('text=Language');
    await page.click('text=Русский');
    
    // Переходим к ментальным техникам
    await page.click('text=Back');
    await page.click('text=Mental Techniques');
    
    // Проверяем, что техники переведены
    await expect(page.getByText('Breathing Techniques')).toBeVisible();
  });

  test('должен переводить опросы', async ({ page }) => {
    // Переключаемся на русский язык
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    await page.click('text=Language');
    await page.click('text=Русский');
    
    // Переходим к опросам
    await page.click('text=Back');
    await page.click('text=Survey');
    
    // Проверяем, что опрос переведен
    await expect(page.getByText('Step 1 of 5')).toBeVisible();
  });
});
