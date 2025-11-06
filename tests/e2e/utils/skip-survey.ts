import { Page } from '@playwright/test';

/**
 * Утилитная функция для пропуска опроса и перехода к главной странице
 * Новые пользователи проходят: survey01 → survey02 → survey03 → survey04 → survey05 → pin → checkin → reward → home
 */
export async function skipSurvey(page: Page): Promise<void> {
  try {
    await skipOnboarding(page);
  } catch (error) {
    if (page.isClosed()) return;
    throw error;
  }

  if (page.isClosed()) return;

  await page.evaluate(() => {
    (window as any).__PLAYWRIGHT__ = true;

    const progress = {
      onboardingCompleted: true,
      surveyCompleted: true,
      pinEnabled: false,
      pinCompleted: true,
      firstCheckinDone: false,
      firstRewardShown: false
    };

    try {
      localStorage.setItem('app-flow-progress', JSON.stringify(progress));
      localStorage.setItem('survey-results', JSON.stringify({ completedAt: new Date().toISOString() }));
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
      console.warn('Failed to seed survey progress:', error);
    }
  });

  if (page.isClosed()) return;

  await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  if (page.isClosed()) return;

  await skipRewardScreen(page);

  const checkinVisible = await page.locator('text=How are you?').isVisible().catch(() => false);
  if (checkinVisible) {
    return;
  }

  await page.waitForSelector('[data-name="User frame info block"], [data-testid="home-ready"], [data-name="Theme card narrow"]', { timeout: 5000 }).catch(() => {});
}

/**
 * Пропускаем screen награды (reward screen) если он показывается
 * Reward screen может появиться после первого чекина или других действий
 * Может появиться с задержкой из-за асинхронной проверки достижений (до 500ms)
 */
export async function skipRewardScreen(page: Page): Promise<void> {
  if (page.isClosed()) return;
  
  // Reward screen может появиться с задержкой из-за async achievement checking
  // Ждем до 1000ms для появления reward screen
  const rewardIndicators = [
    'text=Congratulations',
    '[data-name="Reward Manager"]',
    'text=You earned',
    'text=New achievement',
    'text=Achievement unlocked'
  ];
  
  // Проверяем наличие reward screen с задержкой (до 1000ms)
  const startTime = Date.now();
  const maxWait = 1000;
  let isRewardScreen = false;
  
  while (Date.now() - startTime < maxWait && !isRewardScreen) {
    if (page.isClosed()) return;
    
    for (const indicator of rewardIndicators) {
      if (await page.locator(indicator).isVisible().catch(() => false)) {
        isRewardScreen = true;
        break;
      }
    }
    
    if (!isRewardScreen) {
      await page.waitForTimeout(100).catch(() => {});
    }
  }
  
  if (isRewardScreen) {
    if (page.isClosed()) return;
    // Ищем кнопку Continue или Close на reward screen
    const continueBtn = page.getByRole('button', { name: /^Continue$/i })
      .or(page.getByRole('button', { name: /^Close$/i }))
      .or(page.locator('text=Continue'))
      .or(page.locator('text=Close'));
    
    // Ждем появления кнопки (до 2000ms)
    const buttonStartTime = Date.now();
    const buttonMaxWait = 2000;
    let buttonVisible = false;
    
    while (Date.now() - buttonStartTime < buttonMaxWait && !buttonVisible) {
      if (page.isClosed()) return;
      buttonVisible = await continueBtn.first().isVisible().catch(() => false);
      if (!buttonVisible) {
        await page.waitForTimeout(100).catch(() => {});
      }
    }
    
    if (buttonVisible) {
      if (page.isClosed()) return;
      await continueBtn.first().click().catch(() => {});
      // Ждем навигации на home screen
      await page.waitForSelector('[data-name="User frame info block"]', { timeout: 5000 }).catch(() => {});
    }
  }
}


/**
 * Утилитная функция для пропуска онбординга если он показывается
 */
export async function skipOnboarding(page: Page): Promise<void> {
  if (page.isClosed()) return;

  await page.evaluate(() => {
    (window as any).__PLAYWRIGHT__ = true;
    const progress = {
      onboardingCompleted: true,
      surveyCompleted: false,
      pinEnabled: false,
      pinCompleted: false,
      firstCheckinDone: false,
      firstRewardShown: false
    };

    try {
      const existing = localStorage.getItem('app-flow-progress');
      if (existing) {
        const parsed = JSON.parse(existing);
        localStorage.setItem('app-flow-progress', JSON.stringify({ ...parsed, ...progress }));
      } else {
        localStorage.setItem('app-flow-progress', JSON.stringify(progress));
      }
    } catch (error) {
      console.warn('Failed to seed onboarding progress:', error);
    }
  });

  if (page.isClosed()) return;

  await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
}

