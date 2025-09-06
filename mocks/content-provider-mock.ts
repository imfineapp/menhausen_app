// Мок для ContentProvider в E2E тестах
import { ContentContextType } from '../types/content';

// Мок контента для E2E тестов
const mockContent: ContentContextType = {
  currentLanguage: 'en',
  content: {
    themes: {},
    cards: {},
    emergencyCards: {},
    onboarding: {
      screen01: {
        title: 'Welcome to Menhausen',
        subtitle: 'Your personal mental health companion',
        buttonText: 'Next',
        privacyText: 'Privacy Policy',
        termsText: 'Terms of Use',
        agreementText: 'By clicking the button you agree to the'
      },
      screen02: {
        title: 'Why Menhausen?',
        benefits: [
          'Personalized mental health support',
          'Evidence-based techniques',
          'Privacy-focused approach',
          '24/7 availability'
        ],
        buttonText: 'Get Started'
      }
    },
    survey: {
      screen01: {
        id: 'screen01',
        step: 1,
        totalSteps: 5,
        title: 'What challenges do you face?',
        questionType: 'multiple-choice',
        options: [
          { id: 'anxiety', text: 'I struggle with anxiety' },
          { id: 'depression', text: 'I experience depression' },
          { id: 'stress', text: 'I have high stress levels' }
        ],
        buttonText: 'Next'
      },
      screen02: {
        id: 'screen02',
        step: 2,
        totalSteps: 5,
        title: 'How often do you feel overwhelmed?',
        questionType: 'single-choice',
        options: [
          { id: 'daily', text: 'Daily' },
          { id: 'weekly', text: 'Weekly' },
          { id: 'monthly', text: 'Monthly' }
        ],
        buttonText: 'Next'
      },
      screen03: {
        id: 'screen03',
        step: 3,
        totalSteps: 5,
        title: 'What helps you cope?',
        questionType: 'multiple-choice',
        options: [
          { id: 'exercise', text: 'Exercise' },
          { id: 'meditation', text: 'Meditation' },
          { id: 'music', text: 'Music' }
        ],
        buttonText: 'Next'
      },
      screen04: {
        id: 'screen04',
        step: 4,
        totalSteps: 5,
        title: 'How would you rate your current mood?',
        questionType: 'single-choice',
        options: [
          { id: 'excellent', text: 'Excellent' },
          { id: 'good', text: 'Good' },
          { id: 'fair', text: 'Fair' },
          { id: 'poor', text: 'Poor' }
        ],
        buttonText: 'Next'
      },
      screen05: {
        id: 'screen05',
        step: 5,
        totalSteps: 5,
        title: 'Any additional thoughts?',
        questionType: 'text-input',
        placeholder: 'Share your thoughts...',
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
        greeting: 'Good morning',
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
          title: 'Welcome to Menhausen',
          subtitle: 'Your personal mental health companion',
          buttonText: 'Next',
          privacyText: 'Privacy Policy',
          termsText: 'Terms of Use',
          agreementText: 'By clicking the button you agree to the'
        },
        screen02: {
          title: 'Why Menhausen?',
          benefits: [
            'Personalized mental health support',
            'Evidence-based techniques',
            'Privacy-focused approach',
            '24/7 availability'
          ],
          buttonText: 'Get Started'
        }
      },
      pinSetup: {
        title: 'PIN Setup',
        subtitle: 'Create a PIN for security',
        createPin: 'Create PIN',
        confirmPin: 'Confirm PIN',
        pinMismatch: 'PINs do not match',
        pinTooShort: 'PIN must be at least 4 digits',
        skip: 'Skip',
        back: 'Back'
      },
      checkin: {
        title: 'How are you feeling?',
        subtitle: 'Drag the slider to indicate your current mood',
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
          title: 'Welcome to Theme',
          subtitle: 'This theme will help you with your mental health journey',
          start: 'Start',
          unlock: 'Unlock'
        },
        home: {
          progress: 'Progress',
          checkins: 'Check-ins',
          level: 'Level',
          nextLevel: 'Open next level'
        }
      },
      cards: {
        checkins: 'Check-ins',
        welcome: {
          subtitle: 'Welcome to this exercise'
        },
        question: {
          placeholder: 'Type your answer here...',
          encryption: 'Your answer is encrypted and secure'
        },
        final: {
          why: 'Why:'
        },
        rating: {
          title: 'How was this exercise?',
          subtitle: 'Your feedback helps us improve',
          placeholder: 'Share your thoughts...',
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
  },
  setLanguage: (language: string) => {
    mockContent.currentLanguage = language as 'en' | 'ru';
    if (language === 'ru') {
      // Обновляем UI на русский язык
      mockContent.content.ui.home.howAreYou = 'Как дела?';
      mockContent.content.ui.home.greeting = 'Доброе утро';
      mockContent.content.ui.profile.title = 'Профиль';
    } else {
      // Обновляем UI на английский язык
      mockContent.content.ui.home.howAreYou = 'How are you?';
      mockContent.content.ui.home.greeting = 'Good morning';
      mockContent.content.ui.profile.title = 'Profile';
    }
  },
  getLocalizedText: (text: string) => text,
  getTheme: () => undefined,
  getCard: () => undefined,
  getEmergencyCard: () => undefined,
  getThemeCards: () => [],
  getSurveyScreen: () => undefined,
  getMentalTechnique: () => undefined,
  getMentalTechniques: () => [],
  getMentalTechniquesByCategory: () => [],
  getMentalTechniquesMenu: () => mockContent.content.mentalTechniquesMenu,
  getUI: () => mockContent.content.ui,
  getAllThemes: () => []
};

export { mockContent };
