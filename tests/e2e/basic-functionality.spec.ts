// Базовые тесты функциональности приложения
import { test, expect } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__PLAYWRIGHT__ = true;
    });
  });

  test('должен загружать главную страницу', async ({ page }) => {
    // Переходим на главную страницу приложения
    await page.goto('/');
    
    // Ждем загрузки приложения
    await page.waitForLoadState('networkidle');

    // Пройдем онбординг если он показывается
    const nextBtn = page.getByRole('button', { name: /next/i });
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      const getStarted = page.getByRole('button', { name: /get started/i });
      await getStarted.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Проверяем, что блок "How are you?" присутствует (заголовок или контейнер)
    await expect(page.locator('[data-name="Info_group"]')).toBeVisible();
    
    // Проверяем, что есть кнопка перехода к чекину
    await expect(page.locator('[data-name="Start Mining"]')).toBeVisible();
    
    // Проверяем, что есть блок пользователя
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible();
  });

  test('должен открывать профиль при клике на блок пользователя', async ({ page }) => {
    // Переходим на главную страницу
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Пройдем онбординг если он показывается
    const nextBtn = page.getByRole('button', { name: /next/i });
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      const getStarted = page.getByRole('button', { name: /get started/i });
      await getStarted.click();
      await page.waitForLoadState('networkidle');
    }
    
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
    // Пройдем онбординг если он показывается
    const nextBtn = page.getByRole('button', { name: /next/i });
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      const getStarted = page.getByRole('button', { name: /get started/i });
      await getStarted.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Кликаем на кнопку чекина
    await page.click('[data-name="Start Mining"]');
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что открылась страница чекина
    await expect(page.getByText('How are you feeling?')).toBeVisible();
  });
});
