/**
 * Vitest Setup File
 * 
 * This file runs before each test and sets up:
 * - Testing Library utilities
 * - Custom matchers
 * - Global mocks
 * - Test environment configuration
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import React from 'react';
import { useStore } from '@nanostores/react';
import { $language } from '../../src/stores/language.store';

const mockStressTheme = {
  id: 'stress',
  title: 'Stress theme',
  description: 'Stress description',
  cards: [
    { id: 'stress-c1', title: 'Card 1', duration: '5 min' },
    { id: 'stress-c2', title: 'Card 2', duration: '10 min' },
  ],
};

function buildUiForLanguage(lang: string) {
  const isRu = lang === 'ru';
  return {
    language: 'Language',
    english: 'English',
    russian: 'Russian',
    navigation: {
      back: isRu ? 'Назад' : 'Back',
      next: isRu ? 'Далее' : 'Next',
    },
    common: {
      loading: isRu ? 'Загрузка...' : 'Loading...',
    },
    home: {
      greeting: isRu ? 'Доброе утро' : 'Good morning',
      whatWorriesYou: isRu ? 'Что вас беспокоит?' : 'What worries you?',
      activity: {
        streakLabel: 'days',
        weeklyCheckins: 'Check-ins',
        points: 'points',
        target: 'target',
      },
    },
    profile: {
      yourStatus: 'Your status',
      settings: 'Settings',
      premium: 'Premium',
      free: 'Free',
      title: isRu ? 'Профиль' : 'Profile',
    },
    about: {
      title: isRu ? 'О приложении' : 'About Menhausen',
      description: 'Menhausen is your personal mental health companion',
      keyFeatures: 'Key Features',
      features: {
        moodTracking: 'Daily mood tracking',
        exercises: 'Personalized exercises',
        progress: 'Progress tracking',
        privacy: 'Secure and private',
        telegram: 'Built for Telegram',
      },
      developmentTeam: 'Development Team',
      teamDescription: 'Created with care',
      madeWithLove: 'Made with ❤️',
      copyright: '© 2024 Menhausen Team',
      technicalInformation: 'Technical Information',
      importantNote: 'Important Note',
      disclaimer: 'Disclaimer text',
      emergency: 'Emergency text',
      version: 'Version:',
      platform: 'Platform:',
      builtWith: 'Built with:',
      lastUpdated: 'Last updated:',
      betaVersion: 'Beta Version 1.0.0',
    },
    levels: {
      title: 'Levels',
      yourLevel: 'Your Level',
      toNextLevel: 'To Next Level',
      pointsHistory: 'Points History',
      actions: {
        dailyCheckin: 'Daily Check-in',
        exerciseComplete: 'Exercise Complete',
        achievementEarned: 'Achievement Earned',
      },
    },
  };
}

/** Global ContentContext mock: must stay in sync with `useContent()` surface used in tests. */
vi.mock('../../components/ContentContext', () => ({
  ContentLoadingGate: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  useContent: () => {
    const lang = useStore($language) as string;

    const getUI = () => buildUiForLanguage(lang);

    return {
      currentLanguage: lang === 'ru' ? 'ru' : 'en',
      content: {
        ui: buildUiForLanguage(lang),
        payments: {
          freePlanDetails: '',
          currentPlan: 'Current',
          freePlan: 'Free',
          premiumTitle: 'Premium',
          premiumIntro: '',
          premiumThemes: [],
          benefitsTitle: '',
          benefits: {
            angry: 'a',
            sadness: 's',
            anxiety: 'x',
            confidence: 'c',
            relationships: 'r',
          },
          premiumProgress: '',
          plans: {
            monthly: 'Monthly',
            annually: 'Annual',
            lifetime: 'Lifetime',
            perMonth: '/mo',
            perYear: '/yr',
            perLifetime: 'once',
            savingsBadge: '',
            mostPopularBadge: '',
          },
          starsInfo: '',
          promo: {
            havePromoLink: '',
            placeholder: '',
            apply: 'Apply',
            applied: 'Applied',
            invalid: 'Invalid',
          },
          legal: {
            disclaimer: '',
            termsHref: '/terms',
            termsText: 'Terms',
            privacyHref: '/privacy',
            privacyText: 'Privacy',
          },
          cta: { processing: 'Processing', buy: 'Buy' },
          messages: { telegramNotAvailable: 'Open in Telegram', error: 'Error' },
        },
        about: {
          title: 'About Menhausen',
          description: 'Menhausen is your personal mental health companion',
          keyFeatures: 'Key Features',
          features: {
            moodTracking: 'Daily mood tracking',
            exercises: 'Personalized exercises',
            progress: 'Progress tracking',
            privacy: 'Secure and private',
            telegram: 'Built for Telegram',
          },
          developmentTeam: 'Development Team',
          teamDescription: 'Created with care',
          madeWithLove: 'Made with ❤️',
          copyright: '© 2024 Menhausen Team',
          technicalInformation: 'Technical Information',
          importantNote: 'Important Note',
          disclaimer: 'Disclaimer text',
          emergency: 'Emergency text',
          version: 'Version:',
          platform: 'Platform:',
          builtWith: 'Built with:',
          lastUpdated: 'Last updated:',
          betaVersion: 'Beta Version 1.0.0',
        },
      },
      setLanguage: vi.fn(),
      getLocalizedText: vi.fn((key: string) => key),
      getUI,
      getTheme: (themeId: string) => (themeId === 'stress' ? mockStressTheme : undefined),
      getCard: vi.fn(),
      getSurvey: vi.fn(),
      getMentalTechnique: vi.fn(),
      getMentalTechniquesMenu: vi.fn(),
      getAllThemes: () => [mockStressTheme, { id: 'anxiety', title: 'Anxiety', description: 'd', cards: [] }],
      getThemeCards: (themeId: string) =>
        themeId === 'stress' ? (mockStressTheme.cards as unknown[]) : [],
      getLocalizedBadges: () => ({
        title: 'Badges',
        subtitle: 'Subtitle',
        congratulations: 'Congrats',
        unlockedBadge: 'Unlocked',
        shareButton: 'Share',
        shareMessage: 'Message',
        shareDescription: 'Desc',
        appLink: 'https://example.com',
        lockedBadge: 'Locked',
        unlockCondition: 'Condition',
        progress: 'Progress',
        totalBadges: 'Total',
        unlockedCount: 'Unlocked',
        inProgress: 'In progress',
        points: 'pts',
        motivatingText: 'Motivating',
        motivatingTextNoBadges: 'No badges',
        received: 'Received',
        locked: 'Locked',
        cancel: 'Cancel',
        unlocked: 'Unlocked',
        reward: {
          title: 'Reward',
          subtitle: 'Sub',
          continueButton: 'Continue',
          nextAchievement: 'Next',
          congratulations: 'Congrats',
          earnedAchievement: 'Earned',
        },
        achievements: {},
      }),
      isLoading: false,
      error: null,
    };
  },
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Setup global mocks
beforeEach(() => {
  // Create event listeners storage for dispatchEvent
  const eventListeners: Record<string, Array<(event: Event) => void>> = {};

  // Mock window.addEventListener and removeEventListener
  const addEventListenerMock = vi.fn((event: string, handler: EventListenerOrEventListenerObject, _options?: any) => {
    if (typeof handler === 'function') {
      if (!eventListeners[event]) {
        eventListeners[event] = [];
      }
      eventListeners[event].push(handler);
    }
  });

  const removeEventListenerMock = vi.fn((event: string, handler: EventListenerOrEventListenerObject, _options?: any) => {
    if (typeof handler === 'function') {
      if (eventListeners[event]) {
        const index = eventListeners[event].indexOf(handler);
        if (index > -1) {
          eventListeners[event].splice(index, 1);
        }
      }
    }
  });

  const dispatchEventMock = vi.fn((event: Event) => {
    if (eventListeners[event.type]) {
      eventListeners[event.type].forEach(handler => {
        if (typeof handler === 'function') {
          handler(event);
        }
      });
    }
    return true;
  });

  Object.defineProperty(window, 'addEventListener', {
    value: addEventListenerMock,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, 'removeEventListener', {
    value: removeEventListenerMock,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, 'dispatchEvent', {
    value: dispatchEventMock,
    writable: true,
    configurable: true,
  });

  // Mock localStorage with event emission (length/key must match real Storage API for code that enumerates keys)
  const localStorageMock = {
    storage: {} as Record<string, string>,
    get length() {
      return Object.keys(this.storage).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(localStorageMock.storage);
      return keys[index] ?? null;
    }),
    getItem: vi.fn((key: string) => {
      return localStorageMock.storage[key] ?? null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      localStorageMock.storage[key] = value;
      // Emit storage event to simulate browser behavior
      const storageEvent = new Event('storage');
      dispatchEventMock(storageEvent);
    }),
    removeItem: vi.fn((key: string) => {
      delete localStorageMock.storage[key];
      // Emit storage event
      const storageEvent = new Event('storage');
      dispatchEventMock(storageEvent);
    }),
    clear: vi.fn(() => {
      localStorageMock.storage = {};
      // Emit storage event
      const storageEvent = new Event('storage');
      dispatchEventMock(storageEvent);
    }),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock,
    writable: true,
  });

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock fetch for API testing
  global.fetch = vi.fn();

  // Mock crypto.randomUUID for ID generation
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
    },
    writable: true,
  });

  // Mock navigator.onLine for offline/online testing
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
  });

  // Mock Telegram WebApp API
  Object.defineProperty(window, 'Telegram', {
    value: {
      WebApp: {
        ready: vi.fn(),
        expand: vi.fn(),
        close: vi.fn(),
        MainButton: {
          text: '',
          color: '#2481cc',
          textColor: '#ffffff',
          isVisible: false,
          isActive: true,
          setText: vi.fn(),
          onClick: vi.fn(),
          show: vi.fn(),
          hide: vi.fn(),
        },
        BackButton: {
          isVisible: false,
          onClick: vi.fn(),
          show: vi.fn(),
          hide: vi.fn(),
        },
        HapticFeedback: {
          impactOccurred: vi.fn(),
          notificationOccurred: vi.fn(),
          selectionChanged: vi.fn(),
        },
        initData: '',
        initDataUnsafe: {},
        version: '6.0',
        platform: 'ios',
        colorScheme: 'light',
        themeParams: {
          link_color: '#2481cc',
          button_color: '#2481cc',
          button_text_color: '#ffffff',
          secondary_bg_color: '#f1f1f1',
          hint_color: '#999999',
          bg_color: '#ffffff',
          text_color: '#000000',
        },
        isExpanded: true,
        viewportHeight: 844,
        viewportStableHeight: 800,
        headerColor: '#ffffff',
        backgroundColor: '#ffffff',
        isClosingConfirmationEnabled: false,
        sendData: vi.fn(),
        switchInlineQuery: vi.fn(),
        openLink: vi.fn(),
        openTelegramLink: vi.fn(),
        openInvoice: vi.fn(),
        showPopup: vi.fn(),
        showAlert: vi.fn(),
        showConfirm: vi.fn(),
        showScanQrPopup: vi.fn(),
        closeScanQrPopup: vi.fn(),
        readTextFromClipboard: vi.fn(),
        requestWriteAccess: vi.fn(),
        requestContact: vi.fn(),
      },
    },
    writable: true,
  });
});

// Custom test utilities
export const createMockSurveyResults = () => ({
  screen01: ['option1'],
  screen02: ['option2'],
  screen03: ['option3'],
  screen04: ['option4'],
  screen05: ['option5'],
  completedAt: new Date().toISOString(),
  userId: 'test-user-id',
});

export const createMockExerciseCompletion = () => ({
  cardId: 'test-card-id',
  answers: {
    question1: 'test answer 1',
    question2: 'test answer 2',
  },
  rating: 4,
  completedAt: new Date().toISOString(),
  completionCount: 1,
});

export const createMockUserPreferences = () => ({
  language: 'en',
  theme: 'light',
  notifications: true,
  analytics: false,
  articleFontSizeStep: 0,
});

export const createMockProgressData = () => ({
  completedSurveys: 1,
  completedExercises: 5,
  lastActivity: new Date().toISOString(),
  achievements: ['first_survey', 'first_exercise'],
});

// Test data factory
export const TestDataFactory = {
  surveyResults: createMockSurveyResults,
  exerciseCompletion: createMockExerciseCompletion,
  userPreferences: createMockUserPreferences,
  progressData: createMockProgressData,
};

// Mock API responses
export const mockApiResponses = {
  success: { success: true, data: null },
  error: { success: false, error: 'Test error message', statusCode: 500 },
  surveySubmission: { success: true, data: { id: 'survey-123' } },
  exerciseSubmission: { success: true, data: { id: 'exercise-123' } },
};

// Console spy for testing console outputs
export const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
};
