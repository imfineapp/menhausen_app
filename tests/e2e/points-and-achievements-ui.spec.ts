import { test, expect } from '@playwright/test';

test.describe('Points & Achievements UI', () => {
  test.beforeEach(async ({ page }) => {
    // Стартуем как e2e среда и пропускаем онбординг/опрос через прогресс
    await page.addInitScript(() => {
      (window as any).__PLAYWRIGHT__ = true;
      const progress = {
        onboardingCompleted: true,
        surveyCompleted: true,
        pinEnabled: false,
        pinCompleted: false,
        firstCheckinDone: false,
        firstRewardShown: false
      };
      localStorage.setItem('app-flow-progress', JSON.stringify(progress));
    });
  });

  test('should update profile ProgressBlock when points balance changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Переходим на профиль
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout: 10000 });
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible({ timeout: 10000 });

    // Устанавливаем баланс и уведомляем UI
    await page.evaluate(() => {
      localStorage.setItem('menhausen_points_transactions', JSON.stringify([]));
      localStorage.setItem('menhausen_points_balance', String(1234));
      window.dispatchEvent(new CustomEvent('points:updated'));
    });

    // Проверяем строку прогресса к следующему уровню: 1,234/2,000
    await expect(page.getByText('1,234/2,000')).toBeVisible({ timeout: 10000 });

    // Уровень должен быть 2 (1000 на уровень)
    await expect(page.getByText(/^2$/)).toBeVisible();
  });

  test('should open achievements screen from profile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout: 10000 });
    await page.click('[data-name="User frame info block"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible({ timeout: 10000 });

    // Ищем кнопку перехода к достижениям (рус/англ) или по data-атрибуту
    const badgesButton = page.locator('text=Badges, text=Достижения').or(page.locator('[data-name*="badge"]'));
    await expect(badgesButton.first()).toBeVisible({ timeout: 10000 });
    await badgesButton.first().click();

    // Проверим, что экран достижений открылся — по наличию любого бейджа
    const anyBadge = page.locator('[data-achievement-id], [data-name*="badge"], text=Ambassador, text=Амбассадор');
    await expect(anyBadge.first()).toBeVisible({ timeout: 10000 });
  });
});


