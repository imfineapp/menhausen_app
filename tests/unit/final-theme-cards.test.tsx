// ========================================================================================
// ФИНАЛЬНЫЕ ЮНИТ ТЕСТЫ ДЛЯ КАРТОЧЕК ТЕМ
// ========================================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../../components/LanguageContext';
import { ContentProvider, useContent } from '../../components/ContentContext';

// Простой компонент для тестирования
const TestComponent = () => {
  const { getAllThemes, getUI } = useContent();
  const { language, setLanguage } = useLanguage();
  
  const themes = getAllThemes();
  const ui = getUI();
  
  const handleThemeClick = (themeId: string) => {
    console.log(`Theme clicked: ${themeId} in language: ${language}`);
  };
  
  return (
    <div>
      <div data-testid="current-language">{language}</div>
      <div data-testid="themes-count">{themes.length}</div>
      <div data-testid="ui-text">{ui.home.whatWorriesYou}</div>
      <button 
        data-testid="change-language" 
        onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
      >
        Change Language
      </button>
      <div data-testid="themes-list">
        {themes.map((theme) => (
          <button
            key={theme.id}
            data-testid={`theme-${theme.id}`}
            onClick={() => handleThemeClick(theme.id)}
          >
            {theme.title}
          </button>
        ))}
      </div>
    </div>
  );
};

// Мокаем contentLoader
vi.mock('../../utils/contentLoader', () => ({
  loadContentWithCache: vi.fn()
}));

// Мокаем localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Мокаем Telegram WebApp
Object.defineProperty(window, 'Telegram', {
  value: {
    WebApp: {
      initDataUnsafe: {
        user: {
          language_code: 'en'
        }
      }
    }
  },
  writable: true
});

describe('Final Theme Cards Tests', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Настраиваем мок contentLoader
    const { loadContentWithCache } = await import('../../utils/contentLoader');
    const mockContentLoader = vi.mocked(loadContentWithCache);
    
    mockContentLoader.mockImplementation(async (language: string) => {
      return {
        themes: {
          'social-anxiety': {
            id: 'social-anxiety',
            title: language === 'ru' ? 'Социальная тревожность' : 'Social anxiety',
            description: language === 'ru' ? 'Работа со страхами в общении' : 'Working through social fears',
            isPremium: false,
            cardIds: ['card-1', 'card-2']
          }
        },
        ui: {
          home: {
            whatWorriesYou: language === 'ru' ? 'Что вас беспокоит?' : 'What worries you?'
          }
        }
      };
    });
  });

  it('should render themes and allow language switching', async () => {
    render(
      <LanguageProvider>
        <ContentProvider>
          <TestComponent />
        </ContentProvider>
      </LanguageProvider>
    );

    // Ждем загрузки контента
    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });

    // Проверяем, что тема отображается на английском
    expect(screen.getByTestId('theme-social-anxiety')).toHaveTextContent('Social anxiety');
    expect(screen.getByTestId('ui-text')).toHaveTextContent('What worries you?');

    // Меняем язык
    fireEvent.click(screen.getByTestId('change-language'));

    // Ждем обновления
    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('ru');
    });

    // Проверяем, что тема отображается на русском
    expect(screen.getByTestId('theme-social-anxiety')).toHaveTextContent('Социальная тревожность');
    expect(screen.getByTestId('ui-text')).toHaveTextContent('Что вас беспокоит?');
  });

  it('should maintain theme clickability after language change', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(
      <LanguageProvider>
        <ContentProvider>
          <TestComponent />
        </ContentProvider>
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });

    // Кликаем на тему на английском
    fireEvent.click(screen.getByTestId('theme-social-anxiety'));
    expect(consoleSpy).toHaveBeenCalledWith('Theme clicked: social-anxiety in language: en');

    // Меняем язык
    fireEvent.click(screen.getByTestId('change-language'));

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('ru');
    });

    // Кликаем на тему на русском
    fireEvent.click(screen.getByTestId('theme-social-anxiety'));
    expect(consoleSpy).toHaveBeenCalledWith('Theme clicked: social-anxiety in language: ru');

    // Проверяем, что клики работают (количество может варьироваться из-за перерендеров)
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
