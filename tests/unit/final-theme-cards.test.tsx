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
            welcomeMessage: language === 'ru' ? 'Добро пожаловать' : 'Welcome',
            isPremium: false,
            cardIds: ['card-1', 'card-2']
          }
        },
        cards: {},
        emergencyCards: {},
        onboarding: {
          screen01: {
            title: 'Welcome',
            subtitle: 'Get started',
            buttonText: 'Next',
            privacyText: 'Privacy',
            termsText: 'Terms',
            agreementText: 'By clicking'
          },
          screen02: {
            title: 'Benefits',
            benefits: ['Benefit 1'],
            buttonText: 'Start'
          }
        },
        survey: {
          screen01: {
            id: 'screen01',
            step: 1,
            totalSteps: 5,
            title: 'Question 1',
            questionType: 'single-choice',
            buttonText: 'Next'
          },
          screen02: {
            id: 'screen02',
            step: 2,
            totalSteps: 5,
            title: 'Question 2',
            questionType: 'single-choice',
            buttonText: 'Next'
          },
          screen03: {
            id: 'screen03',
            step: 3,
            totalSteps: 5,
            title: 'Question 3',
            questionType: 'single-choice',
            buttonText: 'Next'
          },
          screen04: {
            id: 'screen04',
            step: 4,
            totalSteps: 5,
            title: 'Question 4',
            questionType: 'single-choice',
            buttonText: 'Next'
          },
          screen05: {
            id: 'screen05',
            step: 5,
            totalSteps: 5,
            title: 'Question 5',
            questionType: 'single-choice',
            buttonText: 'Complete'
          }
        },
        ui: {
          navigation: {
            back: 'Back',
            next: 'Next',
            skip: 'Skip',
            complete: 'Complete',
            continue: 'Continue',
            send: 'Send',
            start: 'Start',
            unlock: 'Unlock'
          },
          common: {
            loading: 'Loading...',
            error: 'Error',
            tryAgain: 'Try again',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit'
          },
          home: {
            greeting: 'Hello',
            checkInPrompt: 'How are you?',
            quickHelpTitle: 'Quick help',
            themesTitle: 'Themes',
            howAreYou: 'How are you?',
            checkInDescription: 'Check in with yourself',
            whatWorriesYou: language === 'ru' ? 'Что вас беспокоит?' : 'What worries you?'
          },
          profile: {
            title: 'Profile',
            aboutApp: 'About',
            privacy: 'Privacy',
            terms: 'Terms',
            deleteAccount: 'Delete account',
            payments: 'Payments'
          },
          survey: {
            progress: 'Step {current} of {total}',
            selectAtLeastOne: 'Select at least one',
            optional: 'Optional',
            required: 'Required'
          },
          onboarding: {
            screen01: {
              title: 'Welcome',
              subtitle: 'Get started',
              buttonText: 'Next',
              privacyText: 'Privacy',
              termsText: 'Terms',
              agreementText: 'By clicking'
            },
            screen02: {
              title: 'Benefits',
              benefits: ['Benefit 1'],
              buttonText: 'Start'
            }
          },
          pinSetup: {
            title: 'PIN Setup',
            subtitle: 'Create PIN',
            createPin: 'Create PIN',
            confirmPin: 'Confirm PIN',
            pinMismatch: 'PIN mismatch',
            pinTooShort: 'PIN too short',
            skip: 'Skip',
            back: 'Back'
          },
          checkin: {
            title: 'Check-in',
            subtitle: 'How are you?',
            moodOptions: {
              down: 'Down',
              anxious: 'Anxious',
              neutral: 'Neutral',
              energized: 'Energized',
              happy: 'Happy'
            },
            send: 'Send',
            back: 'Back'
          },
          themes: {
            welcome: {
              title: 'Theme Welcome',
              subtitle: 'Welcome to theme',
              start: 'Start',
              unlock: 'Unlock'
            },
            home: {
              progress: 'Progress',
              checkins: 'Check-ins',
              level: 'Level',
              nextLevel: 'Next Level'
            }
          },
          cards: {
            checkins: 'Check-ins',
            welcome: {
              subtitle: 'Welcome to card'
            },
            question: {
              placeholder: 'Enter your answer',
              encryption: 'Your answer is encrypted'
            },
            final: {
              why: 'Why:'
            },
            rating: {
              title: 'Rate Card',
              subtitle: 'How was it?',
              placeholder: 'Share your thoughts',
              submit: 'Submit'
            },
            themeHome: {
              card1: 'Social Anxiety',
              card2: 'Work Stress',
              card3: 'Relationships',
              card4: 'Family Issues',
              card5: 'Health Concerns',
              card6: 'Financial Stress',
              card7: 'Academic Pressure',
              card8: 'Career Development',
              card9: 'Personal Growth',
              card10: 'Life Transitions',
              level1: 'Beginner',
              level2: 'Intermediate',
              level3: 'Advanced',
              level4: 'Expert',
              level5: 'Master',
              description: 'Choose a theme to start your journey'
            }
          }
        },
        mentalTechniques: {},
        mentalTechniquesMenu: {
          title: 'Mental Techniques',
          subtitle: 'Choose a technique',
          categories: {
            emergency: {
              title: 'Emergency',
              description: 'Quick help',
              techniqueIds: []
            },
            breathing: {
              title: 'Breathing',
              description: 'Breathing exercises',
              techniqueIds: []
            },
            stabilization: {
              title: 'Stabilization',
              description: 'Grounding techniques',
              techniqueIds: []
            },
            recovery: {
              title: 'Recovery',
              description: 'Recovery techniques',
              techniqueIds: []
            }
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
