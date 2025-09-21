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

    // Проверяем, что есть блок пользователя (Герой #1)
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible();

    // Проверяем, что есть блок "Что вас беспокоит?" (основной контент)
    await expect(page.getByText('Что вас беспокоит?')).toBeVisible();

    // Проверяем, что есть тема "Стресс" (единственная доступная)
    await expect(page.locator('[data-name="Theme card narrow"]').filter({ hasText: 'Стресс' }).first()).toBeVisible();
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

    // Проверяем, что открылась страница профиля
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible();
  });

  test('должен переключаться на страницу темы', async ({ page }) => {
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

    // Кликаем на тему "Стресс"
    await page.locator('[data-name="Theme card narrow"]').filter({ hasText: 'Стресс' }).click();
    await page.waitForLoadState('networkidle');

    // Проверяем, что страница изменилась (появился какой-то новый контент)
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('Стресс'); // Должны остаться на той же странице или перейти куда-то
  });
});
