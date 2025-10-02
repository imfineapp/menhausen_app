import { Page } from '@playwright/test';

/**
 * Утилитная функция для пропуска опроса и перехода к главной странице
 * Новые пользователи проходят: survey01 → survey02 → survey03 → survey04 → survey05 → pin → checkin → reward → home
 */
export async function skipSurvey(page: Page): Promise<void> {
  // Ensure onboarding is completed first
  await skipOnboarding(page);

  // Проверяем, показывается ли опрос (любой экран)
  console.log('Checking for survey visibility...');
  const survey01Visible = await page.locator('text=How old are you?').isVisible();
  const survey06Visible = await page.locator('text=How did you learn about Menhausen?').isVisible();
  console.log('Survey01 visible:', survey01Visible);
  console.log('Survey06 visible:', survey06Visible);
  
  if (survey01Visible) {
    console.log('Survey found, starting completeSurvey...');
    // Проходим весь опрос (6 экранов)
    await completeSurvey(page);
    
    // После опроса может идти настройка PIN или сразу check-in
    await skipPinSetup(page);
    
    // Skip the first check-in - let the test handle it
    // await completeFirstCheckin(page);
    
    // Skip the reward screen as well
    // await skipRewardScreen(page);
  } else if (survey06Visible) {
    console.log('Found Survey06, completing it...');
    // Пользователь уже на 6-м экране, завершаем его
    await page.click('text=Friend or colleague recommended it');
    await page.waitForTimeout(500);
    await page.click('text=Complete Setup');
    await page.waitForLoadState('networkidle');
    console.log('Survey06 completed');
    
    // После опроса может идти настройка PIN или сразу check-in
    await skipPinSetup(page);
  }
  
  // Wait for check-in screen to appear (since we're not completing the check-in)
  try {
    await page.waitForSelector('text=How are you?', { timeout: 5000 });
  } catch {
    // If check-in screen doesn't appear, check for other possible screens
    // Check for PIN setup screen
    const pinScreen = page.locator('text=Set up PIN').or(page.locator('text=Skip'));
    if (await pinScreen.isVisible().catch(() => false)) {
      // Skip PIN setup if it appears
      const skipBtn = page.locator('text=Skip');
      if (await skipBtn.isVisible().catch(() => false)) {
        await skipBtn.click();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Wait for home screen as fallback
    const homeSelectors = [
      '[data-testid="home-ready"]',
      '[data-name="Theme card narrow"]',
      '[data-name="User frame info block"]'
    ];
    const startedAt = Date.now();
    const maxMs = 4000; // 4s ceiling
    while (Date.now() - startedAt < maxMs) {
      for (const sel of homeSelectors) {
        const visible = await page.locator(sel).first().isVisible().catch(() => false);
        if (visible) {
          return;
        }
      }
      await page.waitForTimeout(200);
    }
    // Adaptive final assert: try home-ready first, then fallback to any home selector
    try {
      await page.waitForSelector('[data-testid="home-ready"]', { timeout: 3000 });
    } catch {
      // Fallback: wait for any home indicator with more time
      try {
        await page.waitForSelector('[data-testid="home-ready"], [data-name="Theme card narrow"], [data-name="User frame info block"]', { timeout: 10000 });
      } catch {
        // If still no home screen found, log current state and continue
        console.log('Survey06 not found, trying to continue anyway...');
        const currentUrl = page.url();
        console.log('Current URL:', currentUrl);
        const pageContent = await page.textContent('body');
        console.log('Page content preview:', pageContent?.substring(0, 200));
      }
    }
  }
}

/**
 * Проходим весь опрос (6 экранов)
 */
async function completeSurvey(page: Page): Promise<void> {
  console.log('Starting completeSurvey function...');
  // Survey01: "How old are you?"
  console.log('Starting Survey01...');
  await page.click('text=18-25 years old');
  await page.click('text=Continue');
  await page.waitForLoadState('networkidle');
  
  // Survey02: "How often do you face emotional difficulties?"
  await page.click('text=Sometimes (1–2 times a week)');
  await page.click('text=Continue');
  await page.waitForLoadState('networkidle');
  
  // Survey03: "What experiences worry you the most?" (multiple choice)
  await page.click('text=Work stress');
  await page.click('text=Continue');
  await page.waitForLoadState('networkidle');
  
  // Survey04: "Have you ever sought psychological help from specialists?"
  await page.click('text=No, never');
  await page.click('text=Continue');
  await page.waitForLoadState('networkidle');
  
  // Survey05: "Which of these statements seems true to you?" (multiple choice)
  await page.click('text=All are wrong');
  await page.click('text=Continue');
  await page.waitForLoadState('networkidle');
  
  // Survey06: "How did you learn about Menhausen?"
  console.log('Starting Survey06...');
  await page.click('text=Friend or colleague recommended it');
  console.log('Selected option for Survey06');
  await page.waitForTimeout(500); // Small delay to ensure selection is processed
  await page.click('text=Complete Setup');
  console.log('Clicked Complete Setup button');
  await page.waitForLoadState('networkidle');
  console.log('Survey06 completed, waiting for next screen...');
}

/**
 * Пропускаем настройку PIN
 */
async function skipPinSetup(page: Page): Promise<void> {
  // Ищем кнопку "Skip" на экране настройки PIN
  const skipBtn = page.locator('text=Skip');
  if (await skipBtn.isVisible()) {
    await skipBtn.click();
    await page.waitForLoadState('networkidle');
  }
}


/**
 * Утилитная функция для пропуска онбординга если он показывается
 */
export async function skipOnboarding(page: Page): Promise<void> {
  // Проходим все экраны онбординга последовательно
  
  // Первый экран онбординга - кнопка "Get Started"
  const getStartedBtn = page.locator('text=Get Started');
  if (await getStartedBtn.isVisible() && await getStartedBtn.isEnabled()) {
    await getStartedBtn.click();
    await page.waitForLoadState('networkidle');
  }
  
  // Второй экран онбординга - кнопка "Continue"
  const continueBtn = page.locator('text=Continue');
  if (await continueBtn.isVisible()) {
    // Ждем активации кнопки
    await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
    await continueBtn.waitFor({ state: 'attached', timeout: 5000 });
    
    // Пробуем кликнуть с повторными попытками
    for (let i = 0; i < 10; i++) {
      if (await continueBtn.isEnabled()) {
        await continueBtn.click();
        await page.waitForLoadState('networkidle');
        break;
      }
      await page.waitForTimeout(500);
    }
  }
  
  // Дополнительные экраны если есть
  let attempts = 0;
  while (attempts < 3) {
    const anyContinueBtn = page.locator('text=Continue').or(page.locator('text=Get Started')).or(page.locator('text=Start'));
    if (await anyContinueBtn.isVisible() && await anyContinueBtn.isEnabled()) {
      await anyContinueBtn.click();
      await page.waitForLoadState('networkidle');
      attempts++;
    } else {
      break;
    }
  }
}
