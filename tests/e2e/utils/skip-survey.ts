import { Page } from '@playwright/test';

/**
 * Утилитная функция для пропуска опроса и перехода к главной странице
 * Новые пользователи проходят: survey01 → survey02 → survey03 → survey04 → survey05 → pin → checkin → reward → home
 */
export async function skipSurvey(page: Page): Promise<void> {
  // Проверяем, показывается ли опрос
  const surveyVisible = await page.locator('text=What challenges are you facing right now?').isVisible();
  
  if (surveyVisible) {
    console.log('Survey detected, starting complete flow...');
    
    // Проходим весь опрос (5 экранов)
    await completeSurvey(page);
    console.log('Survey completed');
    
    // После опроса идет настройка PIN
    await skipPinSetup(page);
    console.log('PIN setup skipped');
    
    // После PIN идет первый чекин
    await completeFirstCheckin(page);
    console.log('First checkin completed');
    
    // После чекина показывается награда
    await skipRewardScreen(page);
    console.log('Reward screen skipped');
  }
  
  // Ждем загрузки главной страницы
  console.log('Waiting for home page...');
  try {
    await page.waitForSelector('[data-testid="home-ready"]', { timeout: 15000 });
    console.log('Home page loaded successfully');
  } catch (error) {
    console.log('Home page not found, checking current page state...');
    // Проверяем, на какой странице мы находимся
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Если мы на главной странице, но data-testid не найден, попробуем другой подход
    if (currentUrl.includes('localhost') || currentUrl === 'about:blank') {
      console.log('Trying to navigate to home page...');
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('[data-testid="home-ready"]', { timeout: 10000 });
      console.log('Home page loaded after navigation');
    } else {
      throw error;
    }
  }
}

/**
 * Проходим весь опрос (5 экранов)
 */
async function completeSurvey(page: Page): Promise<void> {
  // Survey01: "What challenges are you facing right now?"
  await page.click('text=I struggle with anxiety');
  await page.click('text=Continue');
  await page.waitForLoadState('networkidle');
  
  // Survey02: "How long have you been experiencing these challenges?"
  await page.click('text=A few months');
  await page.click('text=Continue');
  await page.waitForLoadState('networkidle');
  
  // Survey03: "What time of day do you feel most motivated?"
  await page.click('text=Morning (8-11 AM)');
  await page.click('text=Continue');
  await page.waitForLoadState('networkidle');
  
  // Survey04: "How much time can you dedicate to mental health exercises?"
  await page.click('text=10 minutes daily');
  await page.click('text=Continue');
  await page.waitForLoadState('networkidle');
  
  // Survey05: "What's your main goal with mental health support?"
  await page.click('text=Better stress management');
  await page.click('text=Complete Setup');
  await page.waitForLoadState('networkidle');
}

/**
 * Пропускаем настройку PIN
 */
async function skipPinSetup(page: Page): Promise<void> {
  // Ищем кнопку "Skip" на экране настройки PIN
  const skipBtn = page.locator('text=Skip');
  if (await skipBtn.isVisible()) {
    console.log('PIN setup screen found, clicking Skip...');
    await skipBtn.click();
    await page.waitForLoadState('networkidle');
  } else {
    console.log('PIN setup screen not found, continuing...');
  }
}

/**
 * Проходим первый чекин
 */
async function completeFirstCheckin(page: Page): Promise<void> {
  // Проверяем, находимся ли мы на экране чекина
  const checkinTitle = page.locator('text=How are you?');
  if (await checkinTitle.isVisible()) {
    console.log('Checkin screen found, submitting with default mood...');
    
    // Нажимаем кнопку отправки (по умолчанию уже выбрано настроение neutral)
    const sendBtn = page.locator('text=Send');
    if (await sendBtn.isVisible()) {
      console.log('Submitting checkin...');
      await sendBtn.click();
      await page.waitForLoadState('networkidle');
    } else {
      console.log('Send button not found on checkin screen');
    }
  } else {
    console.log('Checkin screen not found, continuing...');
  }
}

/**
 * Пропускаем экран награды
 */
async function skipRewardScreen(page: Page): Promise<void> {
  // Ищем кнопку "Continue" на экране награды
  const continueBtn = page.locator('text=Continue');
  if (await continueBtn.isVisible()) {
    console.log('Reward screen found, clicking Continue...');
    await continueBtn.click();
    await page.waitForLoadState('networkidle');
  } else {
    console.log('Reward screen not found, continuing...');
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
    let clicked = false;
    for (let i = 0; i < 10; i++) {
      if (await continueBtn.isEnabled()) {
        await continueBtn.click();
        await page.waitForLoadState('networkidle');
        clicked = true;
        break;
      }
      await page.waitForTimeout(500);
    }
    
    if (!clicked) {
      console.log('Continue button found but not enabled after waiting');
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
