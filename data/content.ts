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
      termsText: 'Terms',
      agreementText: 'By clicking the button you agree to the'
    },
    screen02: {
      title: 'Features',
      benefits: [
        'Loading...'
      ],
      buttonText: 'Continue',
      descriptions: [
        'Loading...'
      ]
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
      checkInDescription: 'Check in with yourself — it\'s the first step to self-care! Do it everyday.',
      whatWorriesYou: 'What worries you?'
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
        submit: 'Submit'
      },
      themeHome: {
        card1: 'Card #1',
        card2: 'Card #2',
        card3: 'Card #3',
        card4: 'Card #4',
        card5: 'Card #5',
        card6: 'Card #6',
        card7: 'Card #7',
        card8: 'Card #8',
        card9: 'Card #9',
        card10: 'Card #10',
        level1: 'Level 1',
        level2: 'Level 2',
        level3: 'Level 3',
        level4: 'Level 4',
        level5: 'Level 5',
        description: 'Some text about card and more.'
      }
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