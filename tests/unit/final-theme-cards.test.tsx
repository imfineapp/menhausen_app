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
        about: {
          title: 'About Menhausen',
          description: 'Your personal mental health companion',
          keyFeatures: 'Key Features',
          features: {
            moodTracking: 'Mood Tracking',
            exercises: 'Mental Exercises',
            progress: 'Progress Tracking',
            privacy: 'Privacy First',
            telegram: 'Telegram Integration'
          },
          developmentTeam: 'Development Team',
          teamDescription: 'Built by mental health professionals',
          madeWithLove: 'Made with ❤️',
          copyright: '© 2024 Menhausen',
          technicalInformation: 'Technical Information',
          importantNote: 'Important Note',
          disclaimer: 'This app is designed to support your mental wellness journey, but it is not a substitute for professional medical advice.',
          emergency: 'For emergencies, please contact your local emergency services.',
          version: 'Version 1.0.0',
          platform: 'Platform',
          builtWith: 'Built with',
          lastUpdated: 'Last Updated',
          betaVersion: 'Beta Version'
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
            buttonText: 'Start',
            descriptions: ['Description 1']
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
            checkInButton: 'Send',
            checkInInfo: {
              title: 'Why daily check-in matters?',
              content: 'Daily check-in is a simple yet powerful tool for improving your mental health.'
            },
            whatWorriesYou: language === 'ru' ? 'Что вас беспокоит?' : 'What worries you?',
            heroTitle: 'Hero #1275',
            level: 'Level',
            progress: 'Progress',
            use80PercentUsers: 'Use 80% users',
            activity: {
              title: 'Activity',
              streak: '4 days',
              description: 'Only by doing exercises regularly will you achieve results.',
              streakLabel: 'days streak',
              progressLabel: 'Progress',
              weeklyCheckins: 'Weekly check-ins'
            }
          },
          profile: {
            title: 'Profile',
            aboutApp: 'About',
            privacy: 'Privacy',
            terms: 'Terms',
            deleteAccount: 'Delete account',
            payments: 'Payments',
            heroTitle: 'Hero #1275',
            level: 'Level'
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
              buttonText: 'Start',
              descriptions: ['Description 1']
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
              submit: 'Submit',
              thankYou: 'Thank you!'
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
          },
          about: {
            title: 'About Menhausen',
            description: 'Menhausen is your personal mental health companion, created specifically for Telegram.\n\nOur app helps you track your emotional state, develop healthy habits, and support your psychological well-being through daily check-ins and mindful exercises.\n\nKey features:\n• Daily mood tracking and emotional state monitoring\n• Personalized mental health exercises\n• Progress tracking with levels and achievements\n• Complete privacy — your data stays yours\n• Telegram Mini Apps integration\n\nMenhausen uses scientifically proven methods from cognitive behavioral therapy (CBT), acceptance and commitment therapy (ACT), and positive psychology to help you cope with anxiety, stress, and other emotional challenges.\n\nThe app is developed by a team of mental health and technology specialists who believe that psychological well-being care should be accessible, convenient, and effective for everyone.\n\nMade with ❤️ for the Telegram community.',
            keyFeatures: 'Key Features',
            features: {
              moodTracking: 'Daily mood tracking and emotional check-ins',
              exercises: 'Personalized mental health exercises and activities',
              progress: 'Progress tracking with levels and achievements',
              privacy: 'Secure and private - your data stays yours',
              telegram: 'Built specifically for Telegram Mini Apps'
            },
            developmentTeam: 'Development Team',
            teamDescription: 'Created with care by a dedicated team of developers and mental health advocates. Our mission is to make mental wellness accessible and engaging for everyone.',
            madeWithLove: 'Made with ❤️ for the Telegram community',
            copyright: '© 2024 Menhausen Team. All rights reserved.',
            technicalInformation: 'Technical Information',
            importantNote: 'Important Note',
            disclaimer: 'Menhausen is designed to support your mental wellness journey, but it is not a substitute for professional medical advice, diagnosis, or treatment. If you\'re experiencing serious mental health concerns, please consult with qualified healthcare professionals.',
            emergency: 'For emergencies, please contact your local emergency services or mental health crisis hotline.',
            version: 'Version:',
            platform: 'Platform:',
            builtWith: 'Built with:',
            lastUpdated: 'Last updated:',
            betaVersion: 'Beta Version 1.0.0'
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
