// ========================================================================================
// УТИЛИТА ДЛЯ ОПРЕДЕЛЕНИЯ ЯЗЫКА ИЗ TELEGRAM WEBAPP
// ========================================================================================

import { SupportedLanguage } from '../types/content';

/**
 * Определяет язык пользователя из настроек Telegram
 * @returns 'ru' если язык начинается с 'ru', иначе 'en'
 */
export function detectTelegramLanguage(): SupportedLanguage {
  try {
    const telegramWebApp = window.Telegram?.WebApp;
    
    if (!telegramWebApp?.initDataUnsafe?.user?.language_code) {
      console.log('detectTelegramLanguage: Telegram language not available, using English fallback');
      return 'en';
    }
    
    const langCode = telegramWebApp.initDataUnsafe.user.language_code;
    console.log('detectTelegramLanguage: Detected Telegram language code:', langCode);
    
    // Если язык начинается с 'ru', возвращаем русский
    if (langCode.startsWith('ru')) {
      console.log('detectTelegramLanguage: Returning Russian language');
      return 'ru';
    }
    
    // Для всех остальных языков возвращаем английский
    console.log('detectTelegramLanguage: Returning English language');
    return 'en';
  } catch (error) {
    console.warn('detectTelegramLanguage: Error detecting Telegram language:', error);
    return 'en';
  }
}

/**
 * Получает сохраненный язык из localStorage
 * @returns Сохраненный язык или null если не найден
 */
export function getSavedLanguage(): SupportedLanguage | null {
  try {
    const saved = localStorage.getItem('menhausen-language');
    console.log('getSavedLanguage: Saved language from localStorage:', saved);
    if (saved && (saved === 'en' || saved === 'ru')) {
      return saved as SupportedLanguage;
    }
    return null;
  } catch (error) {
    console.warn('getSavedLanguage: Error loading saved language:', error);
    return null;
  }
}

/**
 * Сохраняет выбранный язык в localStorage
 * @param language - язык для сохранения
 */
export function saveLanguage(language: SupportedLanguage): void {
  try {
    localStorage.setItem('menhausen-language', language);
    console.log('saveLanguage: Language saved to localStorage:', language);
  } catch (error) {
    console.warn('saveLanguage: Error saving language:', error);
  }
}

/**
 * Определяет начальный язык приложения
 * Приоритет: сохраненный язык > язык Telegram > английский по умолчанию
 * @returns Начальный язык для приложения
 */
export function getInitialLanguage(): SupportedLanguage {
  console.log('getInitialLanguage: Starting language detection...');
  
  // 1. Проверяем сохраненный язык
  const savedLanguage = getSavedLanguage();
  if (savedLanguage) {
    console.log('getInitialLanguage: Using saved language:', savedLanguage);
    return savedLanguage;
  }
  
  // 2. Определяем из Telegram
  const telegramLanguage = detectTelegramLanguage();
  console.log('getInitialLanguage: Using Telegram language:', telegramLanguage);
  return telegramLanguage;
}
