// Глобальный setup для E2E тестов
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(_config: FullConfig) {
  // Создаем браузер для предварительной настройки
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Ждем стабильности сети, но с ограничением времени
  try {
    await page.waitForLoadState('networkidle', { timeout: 5000 });
  } catch {
    // допустимо в dev среде, продолжим
  }
  
  // Внедряем мок для ContentProvider и Supabase Sync
  await page.addInitScript(() => {
    // Устанавливаем флаг для определения E2E тестов
    (window as any).__PLAYWRIGHT__ = true;
    
    // Мокаем Supabase sync - переопределяем методы синхронизации, чтобы они ничего не делали
    // Это предотвращает синхронизацию с Supabase во время e2e тестов
    (window as any).__MOCK_SUPABASE_SYNC__ = true;
    
    // Мок для ContentProvider
    (window as any).__MOCK_CONTENT__ = {
      currentLanguage: 'en',
      content: {
        themes: {},
        about: { title: 'About' }
      },
      setLanguage: () => {},
      getLocalizedText: (text: string) => text
    };
  });
  
  await browser.close();
}

export default globalSetup;
