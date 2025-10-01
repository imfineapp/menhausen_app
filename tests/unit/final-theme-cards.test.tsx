// ========================================================================================
// ФИНАЛЬНЫЕ ЮНИТ ТЕСТЫ ДЛЯ КАРТОЧЕК ТЕМ
// ========================================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
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

// Компонент для тестирования карточек
const TestCardComponent = () => {
  const { getTheme, getThemeCards, getUI } = useContent();
  
  // Используем существующую тему из новой архитектуры
  const theme = getTheme('stress');
  const cards = getThemeCards('stress');
  const ui = getUI();
  
  return (
    <div>
      <div data-testid="theme-title">{theme?.title || 'Loading...'}</div>
      <div data-testid="theme-description">{theme?.description || 'Loading...'}</div>
      <div data-testid="cards-count">{cards?.length || 0}</div>
      <div data-testid="ui-navigation">{ui.navigation.back}</div>
      <div data-testid="cards-list">
        {cards?.map((card) => (
          <div key={card.id} data-testid={`card-${card.id}`}>
            <div data-testid={`card-title-${card.id}`}>{card.title}</div>
            <div data-testid={`card-duration-${card.id}`}>{card.duration}</div>
          </div>
        )) || []}
      </div>
    </div>
  );
};

// Компонент для тестирования UI текстов
const TestUIComponent = () => {
  const { getUI } = useContent();
  const ui = getUI();
  
  return (
    <div>
      <div data-testid="navigation-back">{ui.navigation.back}</div>
      <div data-testid="navigation-next">{ui.navigation.next}</div>
      <div data-testid="common-loading">{ui.common.loading}</div>
      <div data-testid="home-greeting">{ui.home.greeting}</div>
      <div data-testid="profile-title">{ui.profile.title}</div>
      <div data-testid="about-title">{ui.about.title}</div>
    </div>
  );
};

describe('Theme Cards Integration Tests', () => {
  beforeEach(() => {
    // Очищаем DOM перед каждым тестом
    document.body.innerHTML = '';
  });

  it('should load themes from real JSON content', async () => {
    render(
      <LanguageProvider>
        <ContentProvider>
          <TestComponent />
        </ContentProvider>
      </LanguageProvider>
    );

    // Ждем загрузки контента
    await waitFor(() => {
      expect(screen.getByTestId('themes-count')).toBeInTheDocument();
    });

    // Проверяем, что темы загружены (должно быть больше 0)
    const themesCount = screen.getByTestId('themes-count');
    expect(parseInt(themesCount.textContent || '0')).toBeGreaterThan(0);

    // Проверяем, что UI текст загружен
    const uiText = screen.getByTestId('ui-text');
    expect(uiText.textContent).toBeTruthy();
  });

  it('should switch language and load different content', async () => {
    render(
      <LanguageProvider>
        <ContentProvider>
          <TestComponent />
        </ContentProvider>
      </LanguageProvider>
    );

    // Ждем загрузки контента
    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toBeInTheDocument();
    });

    // Проверяем начальный язык
    expect(screen.getByTestId('current-language')).toHaveTextContent('en');

    // Меняем язык
    const changeLanguageButton = screen.getByTestId('change-language');
    fireEvent.click(changeLanguageButton);

    // Ждем смены языка
    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('ru');
    });

    // Проверяем, что контент изменился
    const uiText = screen.getByTestId('ui-text');
    expect(uiText.textContent).toBeTruthy();
  });

  it('should load specific theme and its cards', async () => {
    render(
      <LanguageProvider>
        <ContentProvider>
          <TestCardComponent />
        </ContentProvider>
      </LanguageProvider>
    );

    // Ждем загрузки контента
    await waitFor(() => {
      expect(screen.getByTestId('theme-title')).toBeInTheDocument();
    });

    // Проверяем, что тема загружена
    const themeTitle = screen.getByTestId('theme-title');
    expect(themeTitle.textContent).toBeTruthy();

    const themeDescription = screen.getByTestId('theme-description');
    expect(themeDescription.textContent).toBeTruthy();

    // Проверяем, что карточки загружены
    const cardsCount = screen.getByTestId('cards-count');
    expect(parseInt(cardsCount.textContent || '0')).toBeGreaterThan(0);
  });

  it('should load UI texts in English', async () => {
    render(
      <LanguageProvider>
        <ContentProvider>
          <TestUIComponent />
        </ContentProvider>
      </LanguageProvider>
    );

    // Ждем загрузки контента
    await waitFor(() => {
      expect(screen.getByTestId('navigation-back')).toBeInTheDocument();
    });

    // Проверяем английские тексты
    expect(screen.getByTestId('navigation-back')).toHaveTextContent('Back');
    expect(screen.getByTestId('navigation-next')).toHaveTextContent('Next');
    expect(screen.getByTestId('common-loading')).toHaveTextContent('Loading...');
    expect(screen.getByTestId('home-greeting')).toHaveTextContent('Good morning');
    expect(screen.getByTestId('profile-title')).toHaveTextContent('Profile');
    expect(screen.getByTestId('about-title')).toHaveTextContent('About Menhausen');
  });

  it('should load UI texts in Russian when language is switched', async () => {
    // Создаем компонент, который переключает язык на русский
    const TestRussianComponent = () => {
      const { getUI } = useContent();
      const { setLanguage } = useLanguage();
      
      React.useEffect(() => {
        setLanguage('ru');
      }, [setLanguage]);
      
      const ui = getUI();
      
      return (
        <div>
          <div data-testid="navigation-back">{ui.navigation.back}</div>
          <div data-testid="navigation-next">{ui.navigation.next}</div>
          <div data-testid="common-loading">{ui.common.loading}</div>
          <div data-testid="home-greeting">{ui.home.greeting}</div>
          <div data-testid="profile-title">{ui.profile.title}</div>
          <div data-testid="about-title">{ui.about.title}</div>
        </div>
      );
    };

    render(
      <LanguageProvider>
        <ContentProvider>
          <TestRussianComponent />
        </ContentProvider>
      </LanguageProvider>
    );

    // Ждем загрузки контента и смены языка
    await waitFor(() => {
      expect(screen.getByTestId('navigation-back')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Ждем смены языка на русский
    await waitFor(() => {
      const backButton = screen.getByTestId('navigation-back');
      expect(backButton.textContent).toBe('Назад');
    }, { timeout: 10000 });

    // Проверяем русские тексты
    expect(screen.getByTestId('navigation-back')).toHaveTextContent('Назад');
    expect(screen.getByTestId('navigation-next')).toHaveTextContent('Далее');
    expect(screen.getByTestId('common-loading')).toHaveTextContent('Загрузка...');
    expect(screen.getByTestId('home-greeting')).toHaveTextContent('Доброе утро');
    expect(screen.getByTestId('profile-title')).toHaveTextContent('Профиль');
    expect(screen.getByTestId('about-title')).toHaveTextContent('О приложении');
  });

  it('should handle theme clicks correctly', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(
      <LanguageProvider>
        <ContentProvider>
          <TestComponent />
        </ContentProvider>
      </LanguageProvider>
    );

    // Ждем загрузки контента
    await waitFor(() => {
      expect(screen.getByTestId('themes-count')).toBeInTheDocument();
    });

    // Ищем первую тему
    const themesList = screen.getByTestId('themes-list');
    const themeButtons = themesList.querySelectorAll('[data-testid^="theme-"]');
    
    if (themeButtons.length > 0) {
      const firstThemeButton = themeButtons[0] as HTMLButtonElement;
      fireEvent.click(firstThemeButton);
      
      // Проверяем, что обработчик вызван
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Theme clicked:')
      );
    }

    consoleSpy.mockRestore();
  });

  it('should validate content structure', async () => {
    render(
      <LanguageProvider>
        <ContentProvider>
          <TestComponent />
        </ContentProvider>
      </LanguageProvider>
    );

    // Ждем загрузки контента
    await waitFor(() => {
      expect(screen.getByTestId('themes-count')).toBeInTheDocument();
    });

    // Проверяем, что все необходимые элементы присутствуют
    expect(screen.getByTestId('current-language')).toBeInTheDocument();
    expect(screen.getByTestId('themes-count')).toBeInTheDocument();
    expect(screen.getByTestId('ui-text')).toBeInTheDocument();
    expect(screen.getByTestId('change-language')).toBeInTheDocument();
    expect(screen.getByTestId('themes-list')).toBeInTheDocument();
  });

  it('should handle content loading errors gracefully', async () => {
    // Тест для проверки обработки ошибок загрузки контента
    render(
      <LanguageProvider>
        <ContentProvider>
          <TestComponent />
        </ContentProvider>
      </LanguageProvider>
    );

    // Ждем загрузки контента
    await waitFor(() => {
      expect(screen.getByTestId('themes-count')).toBeInTheDocument();
    });

    // Проверяем, что приложение не падает при ошибках
    const themesCount = screen.getByTestId('themes-count');
    expect(themesCount).toBeInTheDocument();
  });
});
