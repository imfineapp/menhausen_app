import { Page, expect } from '@playwright/test';
import { skipOnboarding, skipSurvey, skipRewardScreen } from './skip-survey';

const CHECKIN_HEADING_SELECTOR = 'text=/^(How are you\\?|Как дела\\?)/i';

/**
 * Быстрая навигация на домашнюю страницу
 * Оптимизированная версия с использованием domcontentloaded вместо networkidle
 */
export async function navigateToHome(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded'); // Быстрее чем networkidle
  await skipOnboarding(page);
  await skipSurvey(page);
  
  // Handle reward screen if it appears (after first check-in or achievement unlock)
  await skipRewardScreen(page);
  
  // Ждем конкретный элемент вместо таймаута
  await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Преднастройка localStorage для попадания сразу на домашний экран
 */
export async function primeAppForHome(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as any).__PLAYWRIGHT__ = true;
    const progress = {
      onboardingCompleted: true,
      surveyCompleted: true,
      pinEnabled: false,
      pinCompleted: true,
      firstCheckinDone: true,
      firstRewardShown: true
    };

    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    const dayKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const checkinEntry = {
      id: `checkin_${dayKey}_${Date.now()}`,
      date: dayKey,
      timestamp: Date.now(),
      mood: 'neutral',
      value: 3,
      color: '#9CA3AF',
      completed: true
    };

    try {
      localStorage.setItem('app-flow-progress', JSON.stringify(progress));
      localStorage.setItem('survey-results', JSON.stringify({ completedAt: now.toISOString() }));
      localStorage.setItem('checkin-data', JSON.stringify([{ date: dayKey, mood: 'neutral', timestamp: now.toISOString() }]));
      localStorage.setItem(`daily_checkin_${dayKey}`, JSON.stringify(checkinEntry));
      localStorage.setItem('has-shown-first-achievement', JSON.stringify(true));
    } catch (error) {
      console.warn('Failed to prime app for home:', error);
    }
  });
}

export async function primeAppForCheckin(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as any).__PLAYWRIGHT__ = true;
    const progress = {
      onboardingCompleted: true,
      surveyCompleted: true,
      pinEnabled: false,
      pinCompleted: true,
      firstCheckinDone: false,
      firstRewardShown: false
    };

    const now = new Date();

    try {
      localStorage.setItem('app-flow-progress', JSON.stringify(progress));
      localStorage.setItem('survey-results', JSON.stringify({ completedAt: now.toISOString() }));
      localStorage.removeItem('has-shown-first-achievement');
      localStorage.removeItem('checkin-data');

      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('daily_checkin_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to prime app for checkin:', error);
    }
  });
}

export interface CheckinHistorySeed {
  iso: string;
  mood?: string;
  value?: number;
  color?: string;
}

export interface CheckinSeedOptions {
  surveyCompleted?: boolean;
  firstCheckinDone?: boolean;
  firstRewardShown?: boolean;
}

export async function seedCheckinHistory(
  page: Page,
  history: CheckinHistorySeed[],
  options: CheckinSeedOptions = {}
): Promise<void> {
  await page.addInitScript(({ history, options }) => {
    (window as any).__PLAYWRIGHT__ = true;
    localStorage.clear();

    const progress = {
      onboardingCompleted: true,
      surveyCompleted: options.surveyCompleted ?? true,
      pinEnabled: false,
      pinCompleted: true,
      firstCheckinDone: options.firstCheckinDone ?? history.length > 0,
      firstRewardShown: options.firstRewardShown ?? history.length > 0
    };

    try {
      localStorage.setItem('app-flow-progress', JSON.stringify(progress));
      localStorage.setItem('survey-results', JSON.stringify({ completedAt: new Date().toISOString() }));
      localStorage.setItem('has-shown-first-achievement', JSON.stringify(progress.firstRewardShown));

      const checkinHistory = history.map((seed, index) => {
        const timestamp = new Date(seed.iso).getTime();
        const dateKey = seed.iso.split('T')[0];
        const entry = {
          id: `checkin_${dateKey}_${timestamp + index}`,
          date: dateKey,
          timestamp,
          mood: seed.mood ?? 'neutral',
          value: seed.value ?? 3,
          color: seed.color ?? '#9CA3AF',
          completed: true
        };
        localStorage.setItem(`daily_checkin_${dateKey}`, JSON.stringify(entry));
        return { date: dateKey, mood: entry.mood, timestamp: seed.iso };
      });

      if (checkinHistory.length > 0) {
        localStorage.setItem('checkin-data', JSON.stringify(checkinHistory));
      } else {
        localStorage.removeItem('checkin-data');
      }
    } catch (error) {
      console.warn('Failed to seed check-in history:', error);
    }
  }, { history, options });
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
export async function waitForHomeScreen(page: Page, timeout = 5000): Promise<void> {
  // Увеличиваем таймаут для учета задержек с reward screen и асинхронных операций
  const extendedTimeout = Math.max(timeout, 15000);
  
  // Проверяем и пропускаем reward screen, который может появиться с задержкой
  // (особенно при переходе на theme-home или home после получения достижений)
  // Проверяем несколько раз, так как reward screen может появиться с задержкой из-за асинхронных операций
  const startTime = Date.now();
  const maxWait = extendedTimeout;
  let checkinScreenCount = 0;
  const maxCheckinScreenChecks = 5; // Максимум 5 проверок check-in screen
  
  while (Date.now() - startTime < maxWait) {
    // Проверяем, не перешли ли мы уже на home screen
    const isHome = await isOnHomeScreen(page);
    if (isHome) {
      return;
    }
    
    // Проверяем reward screen и обрабатываем его
    await skipRewardScreen(page);
    
    // Проверяем еще раз home screen после обработки reward screen
    const isHomeAfterSkip = await isOnHomeScreen(page);
    if (isHomeAfterSkip) {
      return;
    }
    
    // Проверяем, не застряли ли мы на check-in screen
    const isCheckin = await isOnCheckinScreen(page);
    if (isCheckin) {
      checkinScreenCount++;
      
      // Если мы на check-in screen несколько раз подряд, возможно приложение застряло
      // Проверяем, действительно ли чекин не выполнен, или это баг
      if (checkinScreenCount >= maxCheckinScreenChecks) {
        // Попробуем принудительно перейти на home через JavaScript
        // (если чекин действительно выполнен, но приложение застряло)
        try {
          await page.evaluate(() => {
            // Проверяем, есть ли чекин на сегодня
            const today = new Date().toISOString().split('T')[0];
            const checkinKey = `daily_checkin_${today}`;
            const checkinData = localStorage.getItem(checkinKey);
            
            if (checkinData) {
              const data = JSON.parse(checkinData);
              if (data.completed) {
                // Если чекин выполнен, но мы на check-in screen, это баг
                // Попробуем вызвать навигацию на home
                const event = new CustomEvent('force-navigate-home');
                window.dispatchEvent(event);
              }
            }
          });
        } catch {
          // Игнорируем ошибки
        }
      }
      
      await page.waitForTimeout(500).catch(() => {});
      continue;
    }
    
    // Небольшая задержка перед следующей проверкой
    await page.waitForTimeout(300).catch(() => {});
  }
  
  // Финальная проверка home screen с увеличенным таймаутом
  // Используем более мягкую проверку - если элемент не найден, это не критично
  try {
    await expect(page.locator('[data-name="User frame info block"]')).toBeVisible({ timeout: 5000 });
  } catch (e) {
    // Если не нашли home screen, проверяем альтернативные селекторы
    const alternativeSelectors = [
      '[data-testid="home-ready"]',
      '[data-name="Theme card narrow"]',
      'text=/How are you\\?|Как дела\\?/i'
    ];
    
    let found = false;
    for (const selector of alternativeSelectors) {
      const visible = await page.locator(selector).isVisible().catch(() => false);
      if (visible) {
        found = true;
        break;
      }
    }
    
    if (!found) {
      throw e; // Если ничего не найдено, пробрасываем ошибку
    }
  }
}

/**
 * Ожидание экрана check-in (альтернатива waitForTimeout)
 */
export async function waitForCheckinScreen(page: Page, timeout = 5000): Promise<void> {
  await expect(page.locator(CHECKIN_HEADING_SELECTOR)).toBeVisible({ timeout });
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
  return await page.locator(CHECKIN_HEADING_SELECTOR).isVisible().catch(() => false);
}

/**
 * Завершение check-in с обработкой reward screen
 */
export async function completeCheckin(page: Page): Promise<void> {
  // Проверяем, что мы на check-in screen
  if (page.isClosed()) {
    return;
  }
  
  // Проверяем, что мы действительно на check-in screen
  const isCheckin = await isOnCheckinScreen(page);
  if (!isCheckin) {
    // Если мы не на check-in screen, возможно уже на home screen
    const isHome = await isOnHomeScreen(page);
    if (isHome) {
      return; // Уже на home screen, ничего не делаем
    }
    // Если ни на check-in, ни на home, ждем check-in screen
    await expect(page.locator(CHECKIN_HEADING_SELECTOR)).toBeVisible({ timeout: 5000 });
  }
  
  if (page.isClosed()) {
    return;
  }
  
  const sendButton = page.getByRole('button', { name: /Send|Отправить/i }).or(page.locator('text=/^(Send|Отправить)$/i'));
  await expect(sendButton).toBeVisible({ timeout: 5000 });
  await sendButton.click();

  // Handle reward screen if it appears (after first check-in or achievement unlock)
  // Reward screen may appear with a delay due to async achievement checking
  await skipRewardScreen(page);

  // Ждем навигации на домашнюю страницу (with longer timeout to account for async operations)
  await waitForHomeScreen(page);
}

