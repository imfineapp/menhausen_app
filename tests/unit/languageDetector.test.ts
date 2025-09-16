import { describe, it, expect, beforeEach } from 'vitest';
import { detectTelegramLanguage, getSavedLanguage, saveLanguage, getInitialLanguage } from '../../utils/languageDetector';

declare global {
  interface Window { Telegram?: any }
}

describe('utils/languageDetector', () => {
  beforeEach(() => {
    // @ts-expect-error test reset
    window.Telegram = undefined;
    localStorage.clear();
  });

  it('detectTelegramLanguage falls back to en when no Telegram', () => {
    // @ts-expect-error intentional undefined
    window.Telegram = undefined;
    expect(detectTelegramLanguage()).toBe('en');
  });

  it('detectTelegramLanguage returns ru for ru language_code', () => {
    // @ts-expect-error mock
    window.Telegram = { WebApp: { initDataUnsafe: { user: { language_code: 'ru-RU' } } } };
    expect(detectTelegramLanguage()).toBe('ru');
  });

  it('detectTelegramLanguage returns en for non-ru language_code', () => {
    // @ts-expect-error mock
    window.Telegram = { WebApp: { initDataUnsafe: { user: { language_code: 'en-US' } } } };
    expect(detectTelegramLanguage()).toBe('en');
  });

  it('saveLanguage and getSavedLanguage roundtrip', () => {
    saveLanguage('ru');
    expect(getSavedLanguage()).toBe('ru');
  });

  it('getInitialLanguage prefers saved over Telegram', () => {
    saveLanguage('ru');
    // @ts-expect-error mock
    window.Telegram = { WebApp: { initDataUnsafe: { user: { language_code: 'en-US' } } } };
    expect(getInitialLanguage()).toBe('ru');
  });
});


