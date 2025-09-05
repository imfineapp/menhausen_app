// ========================================================================================
// ЦЕНТРАЛИЗОВАННОЕ ХРАНИЛИЩЕ КОНТЕНТА ПРИЛОЖЕНИЯ
// ========================================================================================
// ВНИМАНИЕ: Этот файл устарел! Контент теперь загружается из JSON файлов
// в папках data/content/en/ и data/content/ru/
// Этот файл оставлен только для совместимости и будет удален в будущем

import { AppContent } from '../types/content';

/**
 * @deprecated Используйте loadContentWithCache() из utils/contentLoader.ts
 * Минимальный контент для совместимости
 * Основной контент загружается из JSON файлов
 */
export const appContent: AppContent = {
  themes: {},
  cards: {},
  emergencyCards: {},
  onboarding: {
    screen01: {
      title: 'Welcome',
      subtitle: 'Loading...',
      buttonText: 'Start',
      privacyText: 'Privacy',
      termsText: 'Terms'
    },
    screen02: {
      title: 'Features',
      benefits: [
        'Loading...'
      ],
      buttonText: 'Continue'
    }
  },
  survey: {
    screen01: {
      id: 'screen01',
      step: 1,
      totalSteps: 5,
      title: 'Loading...',
      questionType: 'single-choice',
      options: [],
      buttonText: 'Continue',
      skipAllowed: false
    },
    screen02: {
      id: 'screen02',
      step: 2,
      totalSteps: 5,
      title: 'Loading...',
      questionType: 'single-choice',
      options: [],
      buttonText: 'Continue',
      skipAllowed: false
    },
    screen03: {
      id: 'screen03',
      step: 3,
      totalSteps: 5,
      title: 'Loading...',
      questionType: 'single-choice',
      options: [],
      buttonText: 'Continue',
      skipAllowed: false
    },
    screen04: {
      id: 'screen04',
      step: 4,
      totalSteps: 5,
      title: 'Loading...',
      questionType: 'single-choice',
      options: [],
      buttonText: 'Continue',
      skipAllowed: false
    },
    screen05: {
      id: 'screen05',
      step: 5,
      totalSteps: 5,
      title: 'Loading...',
      questionType: 'single-choice',
      options: [],
      buttonText: 'Complete',
      skipAllowed: false
    }
  },
  ui: {
    navigation: {
      back: 'Back',
      next: 'Next',
      skip: 'Skip',
      complete: 'Complete',
      continue: 'Continue'
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
      themesTitle: 'Themes'
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
    }
  },
  mentalTechniques: {},
  mentalTechniquesMenu: {
    title: 'Techniques',
    subtitle: 'Loading...',
    categories: {
      emergency: {
        title: 'Emergency',
        description: '1-2 min',
        techniqueIds: []
      },
      breathing: {
        title: 'Breathing',
        description: '3-5 min',
        techniqueIds: []
      },
      stabilization: {
        title: 'Stabilization',
        description: '5-10 min',
        techniqueIds: []
      },
      recovery: {
        title: 'Recovery',
        description: '10-20 min',
        techniqueIds: []
      }
    }
  }
};