// Простые тесты для проверки работы i18n системы
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LanguageProvider, useTranslation, useLanguage } from '../../components/LanguageContext';

// Тестовый компонент для проверки переводов
function TestComponent() {
  const { t, language } = useTranslation();
  
  return (
    <div>
      <span data-testid="current-language">{language}</span>
      <span data-testid="language-text">{t('language')}</span>
      <span data-testid="english-text">{t('english')}</span>
      <span data-testid="russian-text">{t('russian')}</span>
      <span data-testid="missing-key">{t('nonexistent_key')}</span>
    </div>
  );
}

describe('Simple i18n Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('должен инициализироваться с английским языком', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    expect(screen.getByTestId('language-text')).toHaveTextContent('Language');
    expect(screen.getByTestId('english-text')).toHaveTextContent('English');
    expect(screen.getByTestId('russian-text')).toHaveTextContent('Russian');
  });

  test('должен переключаться на русский язык', async () => {
    const TestComponentWithSwitch = () => {
      const { t, language } = useTranslation();
      const { setLanguage } = useLanguage();
      
      return (
        <div>
          <span data-testid="current-language">{language}</span>
          <span data-testid="language-text">{t('language')}</span>
          <button onClick={() => setLanguage('ru')}>Switch to Russian</button>
        </div>
      );
    };

    render(
      <LanguageProvider>
        <TestComponentWithSwitch />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    expect(screen.getByTestId('language-text')).toHaveTextContent('Language');
    
    // Переключаем на русский
    screen.getByText('Switch to Russian').click();
    
    // Ждем обновления состояния
    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('ru');
    });
    expect(screen.getByTestId('language-text')).toHaveTextContent('Язык');
  });

  test('должен возвращать ключ для отсутствующего перевода', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('missing-key')).toHaveTextContent('nonexistent_key');
  });

  test('должен сохранять язык в localStorage', async () => {
    const TestComponentWithSwitch = () => {
      const { setLanguage } = useLanguage();
      
      return (
        <button onClick={() => setLanguage('ru')}>Switch to Russian</button>
      );
    };

    render(
      <LanguageProvider>
        <TestComponentWithSwitch />
      </LanguageProvider>
    );

    screen.getByText('Switch to Russian').click();
    
    // Ждем сохранения в localStorage
    await waitFor(() => {
      expect(localStorage.getItem('menhausen-language')).toBe('ru');
    });
  });

  test('должен восстанавливать язык из localStorage', async () => {
    localStorage.setItem('menhausen-language', 'ru');

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Ждем загрузки языка из localStorage
    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('ru');
    });
    expect(screen.getByTestId('language-text')).toHaveTextContent('Язык');
  });
});
