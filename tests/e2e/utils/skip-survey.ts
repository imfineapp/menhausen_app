import { Page } from '@playwright/test';

/**
 * Утилитная функция для пропуска опроса и перехода к главной странице
 * Новые пользователи проходят: survey01 → survey02 → survey03 → survey04 → survey05 → pin → checkin → reward → home
 */
export async function skipSurvey(page: Page): Promise<void> {
  // Ensure onboarding is completed first
  try {
    await skipOnboarding(page);
  } catch (error) {
    if (page.isClosed()) return;
    throw error;
  }

  // Проверяем, показывается ли опрос (любой экран)
  if (page.isClosed()) return;
  
  const survey01Visible = await page.locator('text=How old are you?').isVisible().catch(() => false);
  const survey06Visible = await page.locator('text=How did you learn about Menhausen?').isVisible().catch(() => false);
  
  if (survey01Visible) {
    if (page.isClosed()) return;
    // Проходим весь опрос (6 экранов)
    try {
      await completeSurvey(page);
    } catch (error) {
      if (page.isClosed()) return;
      throw error;
    }
    
    if (page.isClosed()) return;
    // После опроса может идти настройка PIN или сразу check-in
    await skipPinSetup(page);
    
    // Skip the first check-in - let the test handle it
    // await completeFirstCheckin(page);
    
    // Skip the reward screen as well
    // await skipRewardScreen(page);
  } else if (survey06Visible) {
    if (page.isClosed()) return;
    // Пользователь уже на 6-м экране, завершаем его
    try {
      await page.getByRole('button', { name: /Friend or colleague recommended it/i }).click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Complete Setup/i }).click();
      await page.waitForLoadState('networkidle');
    } catch (error) {
      if (page.isClosed()) return;
      throw error;
    }
    
    if (page.isClosed()) return;
    // После опроса может идти настройка PIN или сразу check-in
    await skipPinSetup(page);
  }
  
  // Wait for check-in screen to appear (since we're not completing the check-in)
  try {
    await page.waitForSelector('text=How are you?', { timeout: 5000 });
  } catch {
    // If check-in screen doesn't appear, check for other possible screens
    // Check for PIN setup screen
    const skipBtn = page.getByRole('button', { name: /^Skip$/i });
    if (await skipBtn.isVisible().catch(() => false)) {
      await skipBtn.click();
      await page.waitForLoadState('networkidle');
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
        // If still no home screen found, continue anyway
      }
    }
  }
}

/**
 * Проходим весь опрос (6 экранов)
 */
async function completeSurvey(page: Page): Promise<void> {
  if (page.isClosed()) return;
  // Survey01: "How old are you?"
  await page.getByRole('button', { name: /18-25 years old/i }).click().catch(() => {});
  if (page.isClosed()) return;
  await page.getByRole('button', { name: /^Continue$/i }).click().catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
  
  if (page.isClosed()) return;
  // Survey02: "How often do you face emotional difficulties?"
  await page.getByRole('button', { name: /Sometimes \(1–2 times a week\)/i }).click().catch(() => {});
  if (page.isClosed()) return;
  await page.getByRole('button', { name: /^Continue$/i }).click().catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
  
  if (page.isClosed()) return;
  // Survey03: "What experiences worry you the most?" (multiple choice)
  await page.getByRole('button', { name: /Work stress/i }).click().catch(() => {});
  if (page.isClosed()) return;
  await page.getByRole('button', { name: /^Continue$/i }).click().catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
  
  if (page.isClosed()) return;
  // Survey04: "Have you ever sought psychological help from specialists?"
  await page.getByRole('button', { name: /No, never/i }).click().catch(() => {});
  if (page.isClosed()) return;
  await page.getByRole('button', { name: /^Continue$/i }).click().catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
  
  if (page.isClosed()) return;
  // Survey05: "Which of these statements seems true to you?" (multiple choice)
  await page.getByRole('button', { name: /All are wrong/i }).click().catch(() => {});
  if (page.isClosed()) return;
  await page.getByRole('button', { name: /^Continue$/i }).click().catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
  
  if (page.isClosed()) return;
  // Survey06: "How did you learn about Menhausen?"
  await page.getByRole('button', { name: /Friend or colleague recommended it/i }).click().catch(() => {});
  await page.waitForTimeout(500); // Small delay to ensure selection is processed
  if (page.isClosed()) return;
  await page.getByRole('button', { name: /Complete Setup/i }).click().catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
}

/**
 * Пропускаем настройку PIN
 */
async function skipPinSetup(page: Page): Promise<void> {
  if (page.isClosed()) return;
  // Ищем кнопку "Skip" на экране настройки PIN
  const skipBtn = page.getByRole('button', { name: /^Skip$/i });
  if (await skipBtn.isVisible().catch(() => false)) {
    if (page.isClosed()) return;
    await skipBtn.click().catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
  }
}


/**
 * Утилитная функция для пропуска онбординга если он показывается
 */
export async function skipOnboarding(page: Page): Promise<void> {
  if (page.isClosed()) return;
  // Проходим все экраны онбординга последовательно
  
  // Первый экран онбординга - кнопка "Get Started"
  const getStartedBtnRole = page.getByRole('button', { name: /Get Started/i });
  const getStartedBtnText = page.locator('text=Get Started');
  if (await getStartedBtnRole.isVisible().catch(() => false) && await getStartedBtnRole.isEnabled().catch(() => false)) {
    if (page.isClosed()) return;
    await getStartedBtnRole.click().catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
  } else if (await getStartedBtnText.isVisible().catch(() => false)) {
    if (page.isClosed()) return;
    await getStartedBtnText.click().catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
  }
  
  if (page.isClosed()) return;
  // Второй экран онбординга - кнопка "Continue"
  const continueBtnRole = page.getByRole('button', { name: /^Continue$/i });
  const continueBtnText = page.locator('text=Continue');
  if (await continueBtnRole.isVisible().catch(() => false)) {
    if (page.isClosed()) return;
    // Ждем активации кнопки
    await continueBtnRole.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await continueBtnRole.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
    
    // Пробуем кликнуть с повторными попытками
    for (let i = 0; i < 10; i++) {
      if (page.isClosed()) return;
      if (await continueBtnRole.isEnabled().catch(() => false)) {
        await continueBtnRole.click().catch(() => {});
        await page.waitForLoadState('networkidle').catch(() => {});
        break;
      }
      await page.waitForTimeout(500).catch(() => {});
    }
  } else if (await continueBtnText.isVisible().catch(() => false)) {
    for (let i = 0; i < 10; i++) {
      if (page.isClosed()) return;
      try {
        await continueBtnText.click({ trial: true }).catch(() => {});
        await continueBtnText.click().catch(() => {});
        await page.waitForLoadState('networkidle').catch(() => {});
        break;
      } catch {
        await page.waitForTimeout(500).catch(() => {});
      }
    }
  }
  
  if (page.isClosed()) return;
  // Дополнительные экраны если есть
  let attempts = 0;
  while (attempts < 3) {
    if (page.isClosed()) return;
    const anyContinueBtnRole = page.getByRole('button', { name: /^(Continue|Get Started|Start)$/i });
    const anyContinueBtnText = page.locator('text=Continue').or(page.locator('text=Get Started')).or(page.locator('text=Start'));
    if (await anyContinueBtnRole.isVisible().catch(() => false) && await anyContinueBtnRole.isEnabled().catch(() => false)) {
      await anyContinueBtnRole.click().catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      attempts++;
    } else if (await anyContinueBtnText.isVisible().catch(() => false)) {
      try {
        await anyContinueBtnText.click().catch(() => {});
        await page.waitForLoadState('networkidle').catch(() => {});
        attempts++;
      } catch {
        break;
      }
    } else {
      break;
    }
  }
}

