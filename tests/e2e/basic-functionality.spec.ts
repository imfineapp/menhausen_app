// Базовые тесты функциональности приложения
// Optimized: replaced networkidle with domcontentloaded and element-based waiting
import { test, expect } from '@playwright/test';
import { skipSurvey, skipOnboarding } from './utils/skip-survey';
import { waitForPageLoad, waitForHomeScreen } from './utils/test-helpers';

test.describe('Basic App Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__PLAYWRIGHT__ = true;
    });
  });

  test('должен загружать главную страницу', async ({ page }) => {
    // Переходим на главную страницу приложения
    await page.goto('/');

    // Ждем загрузки приложения (быстрее чем networkidle)
    await waitForPageLoad(page);

    // Пройдем онбординг
    await skipOnboarding(page);

    // Пропустим опрос и последующие шаги до домашней страницы при первом запуске
    await skipSurvey(page);

    // Проверяем, что есть блок пользователя (Герой #1)
    await waitForHomeScreen(page);

    // Проверяем, что контейнер списка тем виден (язык-независимый селектор)
    await expect(page.locator('[data-name="Worries container"]')).toBeVisible();

    // Проверяем, что есть хотя бы одна карточка темы
    await expect(page.locator('[data-name="Theme card narrow"]').first()).toBeVisible();
  });

  test('должен открывать профиль при клике на блок пользователя', async ({ page }) => {
    // Переходим на главную страницу
    await page.goto('/');
    await waitForPageLoad(page);

    // Пройдем онбординг и пропустим первый запуск
    await skipOnboarding(page);
    await skipSurvey(page);

    // Ждем появления блока пользователя
    await waitForHomeScreen(page);

    // Кликаем на блок пользователя
    await page.click('[data-name="User frame info block"]');
    
    // Ждем навигации к профилю (элемент профиля вместо networkidle)
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible({ timeout: 10000 });
  });

  test('должен переключаться на страницу темы', async ({ page }) => {
    // Переходим на главную страницу
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Пропускаем опрос если он показывается
    await skipSurvey(page);

    // Ждем загрузки контента и появления карточек тем
    await expect(page.locator('[data-name="Theme card narrow"]').first()).toBeVisible({ timeout: 10000 });
    
    // Кликаем по первой карточке темы (язык-независимо)
    await page.locator('[data-name="Theme card narrow"]').first().click();
    
    // Ждем навигации (проверяем, что home-ready больше не виден)
    await expect(page.locator('[data-testid="home-ready"]')).not.toBeVisible({ timeout: 10000 });
  });
});
