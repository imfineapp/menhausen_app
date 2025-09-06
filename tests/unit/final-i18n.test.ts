// ========================================================================================
// ФИНАЛЬНЫЕ ЮНИТ ТЕСТЫ ДЛЯ МУЛЬТИЯЗЫЧНОСТИ (I18N)
// ========================================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { detectTelegramLanguage, getInitialLanguage, getSavedLanguage } from '../../utils/languageDetector';

// Мокаем window.Telegram
let mockTelegramWebApp: any = {
  initDataUnsafe: {
    user: {
      language_code: 'ru'
    }
  }
};

// Мокаем localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

// Мокаем window объект
Object.defineProperty(window, 'Telegram', {
  value: { WebApp: mockTelegramWebApp },
  writable: true
});

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('Final I18N Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should detect Russian language from Telegram', () => {
    mockTelegramWebApp = {
      initDataUnsafe: {
        user: {
          language_code: 'ru'
        }
      }
    };
    (window as any).Telegram = { WebApp: mockTelegramWebApp };
    
    expect(detectTelegramLanguage()).toBe('ru');
  });

  it('should detect English language from Telegram', () => {
    mockTelegramWebApp = {
      initDataUnsafe: {
        user: {
          language_code: 'en'
        }
      }
    };
    (window as any).Telegram = { WebApp: mockTelegramWebApp };
    
    expect(detectTelegramLanguage()).toBe('en');
  });

  it('should return English when Telegram is not available', () => {
    (window as any).Telegram = undefined;
    expect(detectTelegramLanguage()).toBe('en');
  });

  it('should return null for invalid saved language', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid');
    expect(getSavedLanguage()).toBe(null);
  });

  it('should return English as fallback when no saved language', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockTelegramWebApp = {
      initDataUnsafe: {
        user: {
          language_code: 'en'
        }
      }
    };
    (window as any).Telegram = { WebApp: mockTelegramWebApp };
    expect(getInitialLanguage()).toBe('en');
  });
});
