// Мок для ContentProvider в E2E тестах
export const mockContent = {
  currentLanguage: 'en',
  content: {
    ui: {
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
        }
      }
    }
  },
  setLanguage: () => {},
  getLocalizedText: (text: string) => text,
  getUI: () => mockContent.content.ui
};

// Русская версия
export const mockContentRu = {
  ...mockContent,
  currentLanguage: 'ru',
  content: {
    ...mockContent.content,
    ui: {
      ...mockContent.content.ui,
      home: {
        ...mockContent.content.ui.home,
        greeting: 'Доброе утро',
        checkInPrompt: 'Как дела?',
        quickHelpTitle: 'Быстрая помощь',
        themesTitle: 'Темы',
        howAreYou: 'Как дела?',
        checkInDescription: 'Проверьте себя — это первый шаг к заботе о себе! Делайте это каждый день.',
        whatWorriesYou: 'Что вас беспокоит?'
      },
      profile: {
        ...mockContent.content.ui.profile,
        title: 'Профиль',
        aboutApp: 'О приложении',
        privacy: 'Конфиденциальность',
        terms: 'Условия использования',
        deleteAccount: 'Удалить аккаунт',
        payments: 'Платежи'
      },
      onboarding: {
        ...mockContent.content.ui.onboarding,
        screen01: {
          ...mockContent.content.ui.onboarding.screen01,
          title: 'Добро пожаловать в Menhausen',
          subtitle: 'Ваш персональный помощник по ментальному здоровью',
          buttonText: 'Далее',
          privacyText: 'Политика конфиденциальности',
          termsText: 'Условия использования',
          agreementText: 'Нажимая кнопку, вы соглашаетесь с'
        },
        screen02: {
          ...mockContent.content.ui.onboarding.screen02,
          title: 'Почему Menhausen?',
          benefits: [
            'Персонализированная поддержка ментального здоровья',
            'Методы, основанные на доказательствах',
            'Подход, ориентированный на конфиденциальность',
            'Доступность 24/7'
          ],
          buttonText: 'Начать'
        }
      }
    }
  }
};
