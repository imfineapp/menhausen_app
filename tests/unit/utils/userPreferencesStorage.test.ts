import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadUserPreferences,
  saveUserPreferences,
  clearMenhausenPrefixedLocalStorage,
} from '@/utils/userPreferencesStorage';

describe('userPreferencesStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when empty', async () => {
    const prefs = await loadUserPreferences();
    expect(prefs.language).toBe('en');
    expect(prefs.articleFontSizeStep).toBe(0);
  });

  it('saves and loads plain JSON preferences', async () => {
    await saveUserPreferences({ language: 'ru', articleFontSizeStep: 1 });
    const prefs = await loadUserPreferences();
    expect(prefs.language).toBe('ru');
    expect(prefs.articleFontSizeStep).toBe(1);
  });

  it('clearMenhausenPrefixedLocalStorage removes menhausen_ keys only', () => {
    localStorage.setItem('menhausen_user_preferences', '{}');
    localStorage.setItem('menhausen-language', 'en');
    localStorage.setItem('other_key', 'keep');
    clearMenhausenPrefixedLocalStorage();
    expect(localStorage.getItem('menhausen_user_preferences')).toBeNull();
    expect(localStorage.getItem('menhausen-language')).toBeNull();
    expect(localStorage.getItem('other_key')).toBe('keep');
  });
});
