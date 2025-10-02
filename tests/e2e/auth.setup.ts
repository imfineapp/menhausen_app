// E2E Setup для аутентификации и инициализации тестовых данных
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  // Переходим на главную страницу
  await page.goto('/');
  
  // Ждем полной загрузки приложения
  await page.waitForLoadState('networkidle');
  
  // Ждем, пока приложение полностью инициализируется
  await page.waitForSelector('body', { state: 'visible' });
  
  // Ждем загрузки контента - проверяем наличие основных элементов
  await Promise.race([
    page.waitForSelector('text=Good morning', { timeout: 15000 }),
    page.waitForSelector('text=Доброе утро', { timeout: 15000 }),
    page.waitForSelector('text=Welcome to Menhausen', { timeout: 15000 }),
    page.waitForSelector('text=Next', { timeout: 15000 }),
    page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout: 15000 })
  ]);
  
  // Дополнительная проверка - ждем исчезновения loading экрана
  try {
    await page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout: 5000 });
  } catch {
    // Игнорируем, если loading экран не найден
  }
  
  // Сохраняем состояние аутентификации, затем очищаем PostHog артефакты
  const state = await page.context().storageState();
  const sanitized = {
    cookies: (state.cookies || []).filter(c => !c.name.startsWith('ph_')),
    origins: (state.origins || []).map(o => ({
      origin: o.origin,
      localStorage: (o.localStorage || []).filter(item => !item.name.startsWith('ph_')),
    })),
  } as typeof state;

  // Записываем очищенное состояние
  const fs = await import('node:fs');
  fs.writeFileSync('tests/e2e/auth.json', JSON.stringify(sanitized, null, 2), 'utf-8');
});
