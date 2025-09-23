// Базовые тесты функциональности приложения
import { test, expect } from '@playwright/test';
import { skipSurvey, skipOnboarding } from './utils/skip-survey';

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

    // Пройдем онбординг
    await skipOnboarding(page);

    // Пропустим опрос и последующие шаги до домашней страницы при первом запуске
    await skipSurvey(page);

    // Проверяем, что есть блок пользователя (Герой #1)
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible();

    // Проверяем, что контейнер списка тем виден (язык-независимый селектор)
    await expect(page.locator('[data-name="Worries container"]')).toBeVisible();

    // Проверяем, что есть хотя бы одна карточка темы
    await expect(page.locator('[data-name="Theme card narrow"]').first()).toBeVisible();
  });

  test('должен открывать профиль при клике на блок пользователя', async ({ page }) => {
    // Переходим на главную страницу
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Пройдем онбординг и пропустим первый запуск
    await skipOnboarding(page);
    await skipSurvey(page);

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
    
    // Пропускаем опрос если он показывается
    await skipSurvey(page);

    // Ждем загрузки контента и появления карточек тем
    await expect(page.locator('[data-name="Theme card narrow"]').first()).toBeVisible({ timeout: 10000 });
    
    // Кликаем по первой карточке темы (язык-независимо)
    await page.locator('[data-name="Theme card narrow"]').first().click();
    await page.waitForLoadState('networkidle');

    // Проверяем, что мы перешли на страницу темы
    // Главная страница больше не видна, что означает успешную навигацию
    await expect(page.locator('[data-testid="home-ready"]')).not.toBeVisible();
  });
});
