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
      about: {
        title: 'About Menhausen',
        description: 'Menhausen is your personal mental health companion, created specifically for Telegram.\n\nOur app helps you track your emotional state, develop healthy habits, and support your psychological well-being through daily check-ins and mindful exercises.\n\nKey features:\n• Daily mood tracking and emotional state monitoring\n• Personalized mental health exercises\n• Progress tracking with levels and achievements\n• Complete privacy — your data stays yours\n• Telegram Mini Apps integration\n\nMenhausen uses scientifically proven methods from cognitive behavioral therapy (CBT), acceptance and commitment therapy (ACT), and positive psychology to help you cope with anxiety, stress, and other emotional challenges.\n\nThe app is developed by a team of mental health and technology specialists who believe that psychological well-being care should be accessible, convenient, and effective for everyone.\n\nMade with ❤️ for the Telegram community.',
        keyFeatures: 'Key Features',
        features: {
          moodTracking: 'Mood Tracking',
          exercises: 'Mental Exercises',
          progress: 'Progress Tracking',
          privacy: 'Privacy First',
          telegram: 'Telegram Integration'
        },
        developmentTeam: 'Development Team',
        teamDescription: 'Loading...',
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
      checkInButton: 'Send',
      checkInInfo: {
        title: 'Why daily check-in matters?',
        content: 'Daily check-in is a simple yet powerful tool for improving your mental health. Here\'s why it\'s important:\n\n• Self-awareness: Regular emotional check-ins help you better understand your feelings and reactions\n\n• Early detection: Allows you to notice mood changes before they become serious problems\n\n• Care habit: Forms a beneficial habit of paying attention to your psychological state\n\n• Progress tracking: Helps track changes in your emotional state over time\n\n• Motivation: Understanding your emotions is the first step to managing them and improving your quality of life\n\nJust a few minutes a day can significantly impact your overall well-being.'
      },
      whatWorriesYou: 'What worries you?',
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
    },
    about: {
      title: 'About Menhausen',
      description: 'Menhausen is your personal mental health companion designed to help you track your mood, build healthy habits, and support your emotional well-being through daily check-ins and mindful exercises.',
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