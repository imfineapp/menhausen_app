import { Page, expect } from '@playwright/test';
import { skipOnboarding, skipSurvey } from './skip-survey';

/**
 * Быстрая навигация на домашнюю страницу
 * Оптимизированная версия с использованием domcontentloaded вместо networkidle
 */
export async function navigateToHome(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded'); // Быстрее чем networkidle
  await skipOnboarding(page);
  await skipSurvey(page);
  // Ждем конкретный элемент вместо таймаута
  await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout: 10000 });
}

/**
 * Ожидание видимости элемента с коротким таймаутом
 */
export async function waitForElement(page: Page, selector: string, timeout = 5000): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Ожидание навигации к домашней странице (альтернатива waitForTimeout)
 */
export async function waitForHomeScreen(page: Page, timeout = 10000): Promise<void> {
  await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout });
}

/**
 * Ожидание экрана check-in (альтернатива waitForTimeout)
 */
export async function waitForCheckinScreen(page: Page, timeout = 10000): Promise<void> {
  await expect(page.getByText('How are you?')).toBeVisible({ timeout });
}

/**
 * Быстрое ожидание загрузки страницы (без networkidle)
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('body')).toBeVisible();
}

/**
 * Ожидание кнопки с повторными попытками
 */
export async function waitForButtonAndClick(page: Page, buttonText: string | RegExp, timeout = 5000): Promise<void> {
  const button = page.getByRole('button', { name: buttonText });
  await expect(button).toBeVisible({ timeout });
  await button.click();
}

/**
 * Ожидание навигации после действия (альтернатива waitForTimeout)
 */
export async function waitForNavigationAfterAction(
  page: Page,
  action: () => Promise<void>,
  expectedSelector: string,
  timeout = 5000
): Promise<void> {
  await action();
  await expect(page.locator(expectedSelector)).toBeVisible({ timeout });
}

/**
 * Проверка, находится ли страница на домашнем экране
 */
export async function isOnHomeScreen(page: Page): Promise<boolean> {
  return await page.locator('[data-name="User frame info block"]').isVisible().catch(() => false);
}

/**
 * Проверка, находится ли страница на экране check-in
 */
export async function isOnCheckinScreen(page: Page): Promise<boolean> {
  return await page.getByText('How are you?').isVisible().catch(() => false);
}

/**
 * Завершение check-in с обработкой reward screen
 */
export async function completeCheckin(page: Page): Promise<void> {
  const sendButton = page.getByRole('button', { name: /Send/i }).or(page.locator('text=Send'));
  await expect(sendButton).toBeVisible({ timeout: 5000 });
  await sendButton.click();

  // Handle reward screen if it appears
  try {
    await page.waitForSelector('text=Congratulations', { timeout: 3000 });
    const continueBtn = page.getByRole('button', { name: /^Continue$/i }).or(page.locator('text=Continue'));
    await continueBtn.click();
  } catch {
    // No reward screen, continue
  }

  // Ждем навигации на домашнюю страницу
  await waitForHomeScreen(page);
}

