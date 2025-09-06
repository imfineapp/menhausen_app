// Тесты для проверки работы i18n системы
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LanguageProvider, useTranslation } from '../../components/LanguageContext';
import { ContentProvider } from '../../components/ContentContext';
import { LanguageModal } from '../../components/LanguageModal';
import { UserProfileScreen } from '../../components/UserProfileScreen';
import { AboutAppScreen } from '../../components/AboutAppScreen';

// Моки для компонентов
const mockOnBack = vi.fn();
const mockOnShowAboutApp = vi.fn();
const mockOnShowPinSettings = vi.fn();
const mockOnShowPrivacy = vi.fn();
const mockOnShowTerms = vi.fn();
const mockOnShowDeleteAccount = vi.fn();
const mockOnShowPayments = vi.fn();
const mockOnShowUnderConstruction = vi.fn();

// Обертка для тестов с провайдерами
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>
    <ContentProvider>
      {children}
    </ContentProvider>
  </LanguageProvider>
);

describe('i18n System Tests', () => {
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('LanguageContext', () => {
    test('должен инициализироваться с английским языком по умолчанию', () => {
      render(
        <TestWrapper>
          <div data-testid="language-display">
            <LanguageProvider>
              {({ language }) => <span>{language}</span>}
            </LanguageProvider>
          </div>
        </TestWrapper>
      );

      expect(screen.getByText('en')).toBeInTheDocument();
    });

    test('должен переключаться на русский язык', async () => {
      render(
        <TestWrapper>
          <LanguageProvider>
            {({ language, setLanguage }) => (
              <div>
                <span data-testid="current-language">{language}</span>
                <button onClick={() => setLanguage('ru')}>Switch to Russian</button>
              </div>
            )}
          </LanguageProvider>
        </TestWrapper>
      );

      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
      
      fireEvent.click(screen.getByText('Switch to Russian'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('ru');
      });
    });

    test('должен сохранять выбранный язык в localStorage', async () => {
      render(
        <TestWrapper>
          <LanguageProvider>
            {({ setLanguage }) => (
              <button onClick={() => setLanguage('ru')}>Switch to Russian</button>
            )}
          </LanguageProvider>
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Switch to Russian'));
      
      await waitFor(() => {
        expect(localStorage.getItem('menhausen-language')).toBe('ru');
      });
    });
  });

  describe('LanguageModal', () => {
    test('должен отображать модальное окно выбора языка', () => {
      render(
        <TestWrapper>
          <LanguageProvider>
            {({ openLanguageModal }) => (
              <div>
                <button onClick={openLanguageModal}>Open Language Modal</button>
                <LanguageModal />
              </div>
            )}
          </LanguageProvider>
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Open Language Modal'));
      
      expect(screen.getByText('Change Language')).toBeInTheDocument();
      expect(screen.getByText('Choose your preferred language for the app interface')).toBeInTheDocument();
    });

    test('должен переключать язык при подтверждении', async () => {
      render(
        <TestWrapper>
          <LanguageProvider>
            {({ language, openLanguageModal }) => (
              <div>
                <span data-testid="current-language">{language}</span>
                <button onClick={openLanguageModal}>Open Language Modal</button>
                <LanguageModal />
              </div>
            )}
          </LanguageProvider>
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Open Language Modal'));
      
      // Выбираем русский язык
      const russianOption = screen.getByText('Russian');
      fireEvent.click(russianOption);
      
      // Подтверждаем выбор
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('ru');
      });
    });

    test('должен отменять изменения при нажатии Cancel', () => {
      render(
        <TestWrapper>
          <LanguageProvider>
            {({ language, openLanguageModal }) => (
              <div>
                <span data-testid="current-language">{language}</span>
                <button onClick={openLanguageModal}>Open Language Modal</button>
                <LanguageModal />
              </div>
            )}
          </LanguageProvider>
        </TestWrapper>
      );

      const initialLanguage = screen.getByTestId('current-language').textContent;
      
      fireEvent.click(screen.getByText('Open Language Modal'));
      
      // Выбираем русский язык
      const russianOption = screen.getByText('Russian');
      fireEvent.click(russianOption);
      
      // Отменяем выбор
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      // Язык должен остаться прежним
      expect(screen.getByTestId('current-language')).toHaveTextContent(initialLanguage);
    });
  });

  describe('Content Loading', () => {
    test('должен загружать контент для выбранного языка', async () => {
      render(
        <TestWrapper>
          <ContentProvider>
            {({ content, currentLanguage }) => (
              <div>
                <span data-testid="current-language">{currentLanguage}</span>
                <span data-testid="ui-content">
                  {content?.ui?.home?.greeting || 'Loading...'}
                </span>
              </div>
            )}
          </ContentProvider>
        </TestWrapper>
      );

      // Ждем загрузки контента
      await waitFor(() => {
        expect(screen.getByTestId('ui-content')).not.toHaveTextContent('Loading...');
      });

      // Проверяем, что контент загружен
      expect(screen.getByTestId('ui-content')).toBeInTheDocument();
    });
  });

  describe('Component Text Localization', () => {
    test('UserProfileScreen должен использовать переводы', async () => {
      render(
        <TestWrapper>
          <UserProfileScreen
            onBack={mockOnBack}
            onShowAboutApp={mockOnShowAboutApp}
            onShowPinSettings={mockOnShowPinSettings}
            onShowPrivacy={mockOnShowPrivacy}
            onShowTerms={mockOnShowTerms}
            onShowDeleteAccount={mockOnShowDeleteAccount}
            onShowPayments={mockOnShowPayments}
            onShowUnderConstruction={mockOnShowUnderConstruction}
            userHasPremium={false}
          />
        </TestWrapper>
      );

      // Ждем загрузки контента
      await waitFor(() => {
        expect(screen.getByText('Your status')).toBeInTheDocument();
      });

      // Проверяем наличие переведенных элементов
      expect(screen.getByText('Your status')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Language')).toBeInTheDocument();
    });

    test('AboutAppScreen должен отображать контент на выбранном языке', async () => {
      render(
        <TestWrapper>
          <AboutAppScreen onBack={mockOnBack} />
        </TestWrapper>
      );

      // Ждем загрузки контента
      await waitFor(() => {
        expect(screen.getByText('About Menhausen')).toBeInTheDocument();
      });

      // Проверяем наличие переведенных элементов
      expect(screen.getByText('About Menhausen')).toBeInTheDocument();
      expect(screen.getByText('Key Features')).toBeInTheDocument();
      expect(screen.getByText('Development Team')).toBeInTheDocument();
    });
  });

  describe('Language Persistence', () => {
    test('должен восстанавливать язык из localStorage при инициализации', () => {
      // Устанавливаем русский язык в localStorage
      localStorage.setItem('menhausen-language', 'ru');

      render(
        <TestWrapper>
          <LanguageProvider>
            {({ language }) => (
              <span data-testid="current-language">{language}</span>
            )}
          </LanguageProvider>
        </TestWrapper>
      );

      expect(screen.getByTestId('current-language')).toHaveTextContent('ru');
    });

    test('должен использовать английский как fallback при некорректном значении в localStorage', () => {
      // Устанавливаем некорректное значение
      localStorage.setItem('menhausen-language', 'invalid');

      render(
        <TestWrapper>
          <LanguageProvider>
            {({ language }) => (
              <span data-testid="current-language">{language}</span>
            )}
          </LanguageProvider>
        </TestWrapper>
      );

      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });
  });

  describe('Translation Keys', () => {
    test('должен возвращать ключ при отсутствии перевода', () => {
      const TestComponent = () => {
        const { t } = useTranslation();
        return (
          <div>
            <span data-testid="missing-translation">{t('nonexistent_key')}</span>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('missing-translation')).toHaveTextContent('nonexistent_key');
    });

    test('должен возвращать английский перевод как fallback', () => {
      const TestComponent = () => {
        const { t } = useTranslation();
        return (
          <div>
            <span data-testid="fallback-translation">{t('language')}</span>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('fallback-translation')).toHaveTextContent('Language');
    });
  });
});
