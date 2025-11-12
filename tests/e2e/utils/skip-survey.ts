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
  // Увеличено до 2000ms для учета задержек при переходе на theme-home и других экранов
  const rewardIndicators = [
    'text=Congratulations',
    '[data-name="Reward Manager"]',
    'text=You earned',
    'text=New achievement',
    'text=Achievement unlocked',
    '[data-name="Reward Page"]'
  ];
  
  // Проверяем наличие reward screen с задержкой (до 2000ms)
  const startTime = Date.now();
  const maxWait = 2000;
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
    
    // Обрабатываем все достижения - может быть несколько, нужно кликать Next несколько раз
    const maxIterations = 10; // Максимум 10 достижений (защита от бесконечного цикла)
    let iteration = 0;
    
    while (iteration < maxIterations) {
      if (page.isClosed()) return;
      
      // Проверяем, все еще ли мы на reward screen
      let stillOnRewardScreen = false;
      for (const indicator of rewardIndicators) {
        if (await page.locator(indicator).isVisible().catch(() => false)) {
          stillOnRewardScreen = true;
          break;
        }
      }
      
      if (!stillOnRewardScreen) {
        // Уже не на reward screen, выходим
        break;
      }
      
      // Ищем кнопку на reward screen
      const buttonSelectors = [
        // Поиск по data-name (самый надежный)
        page.locator('button[data-name*="Bottom Fixed CTA Button"]'),
        // Поиск по тексту кнопки
        page.locator('button').filter({ hasText: /Continue|Next|Продолжить|Следующее/i }),
        // Поиск по роли
        page.getByRole('button', { name: /Continue|Next|Продолжить|Следующее/i }),
        // Fallback - любая видимая кнопка внизу
        page.locator('button:visible').last()
      ];
      
      let buttonFound = false;
      let buttonToClick = null;
      
      // Ждем появления кнопки (до 3000ms)
      const buttonStartTime = Date.now();
      const buttonMaxWait = 3000;
      
      while (Date.now() - buttonStartTime < buttonMaxWait && !buttonFound) {
        if (page.isClosed()) return;
        
        for (const selector of buttonSelectors) {
          try {
            const count = await selector.count();
            if (count > 0) {
              const firstButton = selector.first();
              const isVisible = await firstButton.isVisible().catch(() => false);
              if (isVisible) {
                buttonFound = true;
                buttonToClick = firstButton;
                break;
              }
            }
          } catch {
            // Игнорируем ошибки поиска
          }
        }
        
        if (!buttonFound) {
          await page.waitForTimeout(100).catch(() => {});
        }
      }
      
      if (buttonFound && buttonToClick) {
        if (page.isClosed()) return;
        
        // Кликаем на кнопку
        await buttonToClick.click({ timeout: 5000 }).catch(() => {});
        
        // Небольшая задержка после клика для обработки навигации
        await page.waitForTimeout(300).catch(() => {});
        
        // Проверяем, произошла ли навигация (проверяем наличие home screen)
        const isHome = await page.locator('[data-name="User frame info block"]').isVisible().catch(() => false);
        if (isHome) {
          // Успешно перешли на home screen
          break;
        }
        
        // Если не перешли на home, возможно показывается следующее достижение
        // Продолжаем цикл
        iteration++;
        await page.waitForTimeout(200).catch(() => {});
      } else {
        // Кнопка не найдена, выходим
        break;
      }
    }
    
    // Финальная проверка - ждем навигации на home screen (если еще не там)
    const isHome = await page.locator('[data-name="User frame info block"]').isVisible().catch(() => false);
    if (!isHome) {
      // Ждем навигации на home screen (до 10000ms)
      await page.waitForSelector('[data-name="User frame info block"]', { timeout: 10000 }).catch(() => {});
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

