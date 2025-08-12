// ========================================================================================
// ЦЕНТРАЛИЗОВАННОЕ ХРАНИЛИЩЕ КОНТЕНТА ПРИЛОЖЕНИЯ
// ========================================================================================

import { AppContent } from '../types/content';

/**
 * Основной контент приложения с поддержкой локализации
 * Все тексты организованы по функциональным блокам
 */
export const appContent: AppContent = {
  // =====================================================================================
  // ТЕМЫ (КАТЕГОРИИ УПРАЖНЕНИЙ)
  // =====================================================================================
  themes: {
    'social-anxiety': {
      id: 'social-anxiety',
      title: { en: 'Social anxiety' },
      description: { en: 'Working through social fears and building confidence in interpersonal situations.' },
      welcomeMessage: { en: 'Ready to overcome social anxiety? This theme will help you build confidence and develop healthy social skills through practical exercises.' },
      isPremium: false,
      cardIds: ['card-1', 'card-2', 'card-3', 'card-4']
    },
    'stress-management': {
      id: 'stress-management', 
      title: { en: 'Stress' },
      description: { en: 'Learning to manage daily stress and develop healthy coping mechanisms.' },
      welcomeMessage: { en: 'Take control of your stress levels. Learn practical techniques to manage everyday pressures and build resilience.' },
      isPremium: false,
      cardIds: ['card-5', 'card-6', 'card-7']
    },
    'anger-management': {
      id: 'anger-management',
      title: { en: 'Angry' },
      description: { en: 'Understanding and managing anger in healthy, constructive ways.' },
      welcomeMessage: { en: 'Transform your relationship with anger. Learn to channel this powerful emotion constructively.' },
      isPremium: false,
      cardIds: ['card-8', 'card-9']
    },
    'sadness-apathy': {
      id: 'sadness-apathy',
      title: { en: 'Sadness and apathy' },
      description: { en: 'Working through feelings of sadness, depression, and emotional numbness.' },
      welcomeMessage: { en: 'Navigate through difficult emotions. Rediscover your motivation and emotional well-being.' },
      isPremium: true,
      cardIds: ['card-10', 'card-11']
    }
  },

  // =====================================================================================
  // КАРТОЧКИ УПРАЖНЕНИЙ С УНИКАЛЬНЫМ КОНТЕНТОМ
  // =====================================================================================
  cards: {
    // СОЦИАЛЬНАЯ ТРЕВОЖНОСТЬ
    'card-1': {
      id: 'card-1',
      title: { en: 'Understanding Social Triggers' },
      description: { en: 'Identify what specifically triggers your social anxiety and learn to observe these patterns without judgment.' },
      welcomeMessage: { en: 'This exercise will help you become more aware of your social anxiety triggers. By understanding what sets off your anxiety, you can begin to respond rather than react.' },
      duration: { en: '5-7 min' },
      difficulty: 'beginner',
      themeId: 'social-anxiety',
      isPremium: false,
      questions: [
        {
          id: 'q1',
          text: { en: 'What specific social situations make you feel most anxious or uncomfortable?' },
          placeholder: { en: 'Example: Speaking up in group conversations, meeting new people...' },
          helpText: { en: 'Think about recent situations where you felt socially anxious.' }
        },
        {
          id: 'q2', 
          text: { en: 'What thoughts go through your mind in these situations?' },
          placeholder: { en: 'Example: They will think I\'m boring, I will say something stupid...' },
          helpText: { en: 'Notice the automatic thoughts that increase your anxiety.' }
        }
      ],
      finalMessage: {
        message: { en: 'Awareness of your social anxiety patterns is the first step toward managing them effectively.' },
        practiceTask: { en: 'Over the next week, notice when you feel socially anxious and write down the specific trigger and your thoughts.' },
        whyExplanation: { en: 'Self-awareness helps you distinguish between real social threats and anxiety-driven perceptions.' }
      }
    },

    'card-2': {
      id: 'card-2',
      title: { en: 'Building Social Confidence' },
      description: { en: 'Develop practical strategies to feel more confident and authentic in social interactions.' },
      welcomeMessage: { en: 'Learn to build genuine confidence in social situations by focusing on connection rather than performance.' },
      duration: { en: '6-8 min' },
      difficulty: 'beginner',
      themeId: 'social-anxiety',
      isPremium: false,
      questions: [
        {
          id: 'q1',
          text: { en: 'When do you feel most naturally confident around others?' },
          placeholder: { en: 'Example: With close friends, when helping someone, when discussing my interests...' },
          helpText: { en: 'Identify situations where your authentic self shines through.' }
        },
        {
          id: 'q2',
          text: { en: 'What qualities do you appreciate in yourself that others might value too?' },
          placeholder: { en: 'Example: Good listener, caring, funny, knowledgeable about...' },
          helpText: { en: 'Focus on your genuine strengths and positive qualities.' }
        }
      ],
      finalMessage: {
        message: { en: 'Confidence grows when you focus on giving value to others rather than seeking approval.' },
        practiceTask: { en: 'In your next social interaction, focus on being genuinely interested in the other person rather than worrying about how you appear.' },
        whyExplanation: { en: 'Shifting focus from self-consciousness to genuine interest reduces anxiety and improves connections.' }
      }
    },

    'card-3': {
      id: 'card-3',
      title: { en: 'Managing Social Expectations' },
      description: { en: 'Learn to set realistic expectations for social interactions and reduce the pressure you put on yourself.' },
      welcomeMessage: { en: 'Discover how to create healthier expectations for social situations and reduce self-imposed pressure.' },
      duration: { en: '7-9 min' },
      difficulty: 'intermediate',
      themeId: 'social-anxiety',
      isPremium: false,
      questions: [
        {
          id: 'q1',
          text: { en: 'What do you expect from yourself in social situations that might be unrealistic?' },
          placeholder: { en: 'Example: To be fascinating, to never be awkward, to make everyone like me...' },
          helpText: { en: 'Consider expectations that create pressure rather than help you connect.' }
        },
        {
          id: 'q2',
          text: { en: 'How would you treat a good friend who felt socially anxious?' },
          placeholder: { en: 'Example: I would be understanding, remind them they are likeable...' },
          helpText: { en: 'Apply the same compassion to yourself that you would give a friend.' }
        }
      ],
      finalMessage: {
        message: { en: 'Realistic expectations and self-compassion are key to reducing social anxiety.' },
        practiceTask: { en: 'Before your next social event, set one realistic intention (like "listen actively") instead of trying to be perfect.' },
        whyExplanation: { en: 'Lower pressure allows your authentic personality to emerge, making interactions more natural.' }
      }
    },

    'card-4': {
      id: 'card-4',
      title: { en: 'Creating Meaningful Connections' },
      description: { en: 'Focus on building deeper, more authentic relationships rather than trying to please everyone.' },
      welcomeMessage: { en: 'Learn to prioritize quality connections over quantity and develop authentic relationships.' },
      duration: { en: '8-10 min' },
      difficulty: 'intermediate',
      themeId: 'social-anxiety',
      isPremium: false,
      questions: [
        {
          id: 'q1',
          text: { en: 'What kind of people do you feel most comfortable and authentic around?' },
          placeholder: { en: 'Example: People who are curious, non-judgmental, share similar values...' },
          helpText: { en: 'Identify the qualities that help you feel safe to be yourself.' }
        },
        {
          id: 'q2',
          text: { en: 'How can you be the kind of person you enjoy being around?' },
          placeholder: { en: 'Example: Ask genuine questions, share honestly, be supportive...' },
          helpText: { en: 'Focus on what you can give to create the connections you want.' }
        }
      ],
      finalMessage: {
        message: { en: 'Meaningful connections happen when you focus on mutual understanding rather than impression management.' },
        practiceTask: { en: 'Choose one person you would like to connect with more deeply and have an authentic conversation with them this week.' },
        whyExplanation: { en: 'Quality relationships provide the social support that naturally reduces anxiety over time.' }
      }
    },

    // УПРАВЛЕНИЕ СТРЕССОМ
    'card-5': {
      id: 'card-5',
      title: { en: 'Identifying Stress Patterns' },
      description: { en: 'Recognize your personal stress triggers and early warning signs before they become overwhelming.' },
      welcomeMessage: { en: 'Understanding your stress patterns is the first step to managing them effectively. Let\'s explore what triggers your stress and how it shows up in your life.' },
      duration: { en: '5-7 min' },
      difficulty: 'beginner',
      themeId: 'stress-management',
      isPremium: false,
      questions: [
        {
          id: 'q1',
          text: { en: 'What situations or thoughts most consistently cause you stress?' },
          placeholder: { en: 'Example: Work deadlines, financial concerns, family conflicts...' },
          helpText: { en: 'Think about recurring patterns rather than one-off events.' }
        },
        {
          id: 'q2',
          text: { en: 'How does stress first show up in your body or behavior?' },
          placeholder: { en: 'Example: Tension in shoulders, difficulty sleeping, becoming irritable...' },
          helpText: { en: 'Early warning signs help you address stress before it escalates.' }
        }
      ],
      finalMessage: {
        message: { en: 'Recognizing your stress patterns allows you to intervene early and prevent overwhelm.' },
        practiceTask: { en: 'For one week, notice and write down when you first feel stressed and what triggered it.' },
        whyExplanation: { en: 'Early recognition gives you more options for managing stress before it impacts your well-being.' }
      }
    },

    'card-6': {
      id: 'card-6',
      title: { en: 'Healthy Stress Responses' },
      description: { en: 'Develop a toolkit of healthy coping strategies to replace automatic stress reactions.' },
      welcomeMessage: { en: 'Learn to respond to stress in ways that actually help rather than make things worse.' },
      duration: { en: '6-8 min' },
      difficulty: 'intermediate',
      themeId: 'stress-management',
      isPremium: false,
      questions: [
        {
          id: 'q1',
          text: { en: 'How do you currently cope with stress? Which methods help and which don\'t?' },
          placeholder: { en: 'Example: Helpful: walking, talking to friends. Unhelpful: scrolling social media, avoiding...' },
          helpText: { en: 'Be honest about what actually makes you feel better versus worse.' }
        },
        {
          id: 'q2',
          text: { en: 'What healthy activity makes you feel calm and centered?' },
          placeholder: { en: 'Example: Deep breathing, listening to music, spending time in nature...' },
          helpText: { en: 'Think of activities that restore your energy rather than drain it.' }
        }
      ],
      finalMessage: {
        message: { en: 'Healthy stress responses build resilience and help you maintain balance during challenging times.' },
        practiceTask: { en: 'Choose one healthy coping strategy and practice it for 5 minutes when you notice stress building.' },
        whyExplanation: { en: 'Consistent practice of healthy responses rewires your automatic stress reactions over time.' }
      }
    },

    'card-7': {
      id: 'card-7',
      title: { en: 'Building Stress Resilience' },
      description: { en: 'Strengthen your ability to bounce back from stressful situations and maintain emotional balance.' },
      welcomeMessage: { en: 'Resilience isn\'t about avoiding stress—it\'s about developing the skills to navigate it with greater ease.' },
      duration: { en: '7-9 min' },
      difficulty: 'intermediate',
      themeId: 'stress-management',
      isPremium: false,
      questions: [
        {
          id: 'q1',
          text: { en: 'Think of a stressful situation you handled well. What helped you get through it?' },
          placeholder: { en: 'Example: Staying focused on what I could control, asking for support, breaking it into smaller steps...' },
          helpText: { en: 'Identify the strengths and resources you already have.' }
        },
        {
          id: 'q2',
          text: { en: 'What daily practices help you maintain emotional balance?' },
          placeholder: { en: 'Example: Regular sleep schedule, exercise, meditation, connecting with loved ones...' },
          helpText: { en: 'Consider both what you do now and what you would like to do more consistently.' }
        }
      ],
      finalMessage: {
        message: { en: 'Resilience is built through consistent self-care practices and learning from how you have overcome challenges before.' },
        practiceTask: { en: 'Implement one daily practice that supports your emotional balance and commit to it for one week.' },
        whyExplanation: { en: 'Regular self-care creates a foundation of strength that helps you handle stress more effectively.' }
      }
    },

    // УПРАВЛЕНИЕ ГНЕВОМ
    'card-8': {
      id: 'card-8',
      title: { en: 'Understanding Anger Triggers' },
      description: { en: 'Explore what situations and thoughts trigger your anger and learn to recognize early warning signs.' },
      welcomeMessage: { en: 'Anger is a normal emotion that signals when something important to you feels threatened. Let\'s understand your anger patterns to manage them more effectively.' },
      duration: { en: '6-8 min' },
      difficulty: 'beginner',
      themeId: 'anger-management',
      isPremium: false,
      questions: [
        {
          id: 'q1',
          text: { en: 'What situations or behaviors from others most often trigger your anger?' },
          placeholder: { en: 'Example: Being disrespected, feeling unheard, witnessing injustice...' },
          helpText: { en: 'Notice patterns in what sets off your anger response.' }
        },
        {
          id: 'q2',
          text: { en: 'What values or needs might be threatened when you feel angry?' },
          placeholder: { en: 'Example: Need for respect, fairness, autonomy, safety...' },
          helpText: { en: 'Anger often protects something important to you.' }
        }
      ],
      finalMessage: {
        message: { en: 'Understanding what your anger is protecting helps you address the underlying need in healthier ways.' },
        practiceTask: { en: 'Next time you feel angry, pause and ask: "What need or value of mine feels threatened right now?"' },
        whyExplanation: { en: 'When you understand the "why" behind anger, you can respond more effectively to the situation.' }
      }
    },

    'card-9': {
      id: 'card-9',
      title: { en: 'Healthy Anger Expression' },
      description: { en: 'Learn constructive ways to express and channel anger that preserve relationships and solve problems.' },
      welcomeMessage: { en: 'Anger doesn\'t have to be destructive. Learn to express it in ways that lead to positive change and stronger relationships.' },
      duration: { en: '7-9 min' },
      difficulty: 'intermediate',
      themeId: 'anger-management',
      isPremium: false,
      questions: [
        {
          id: 'q1',
          text: { en: 'How do you currently express anger? What works well and what causes problems?' },
          placeholder: { en: 'Example: Good: Taking space to cool down. Problematic: Saying hurtful things in the moment...' },
          helpText: { en: 'Be honest about both helpful and unhelpful anger expressions.' }
        },
        {
          id: 'q2',
          text: { en: 'What would healthy anger expression look like for you?' },
          placeholder: { en: 'Example: Speaking up calmly about my needs, setting boundaries, channeling energy into action...' },
          helpText: { en: 'Think about ways to honor your anger while staying true to your values.' }
        }
      ],
      finalMessage: {
        message: { en: 'Healthy anger expression protects your values while maintaining respect for yourself and others.' },
        practiceTask: { en: 'Practice one healthy anger response this week—like taking a pause before reacting or using "I" statements to express your needs.' },
        whyExplanation: { en: 'Constructive anger expression leads to better problem-solving and stronger relationships.' }
      }
    },

    // ГРУСТЬ И АПАТИЯ (ПРЕМИУМ)
    'card-10': {
      id: 'card-10',
      title: { en: 'Understanding Emotional Numbness' },
      description: { en: 'Explore feelings of sadness and emotional disconnection with compassion and understanding.' },
      welcomeMessage: { en: 'When emotions feel muted or heavy, it\'s your mind\'s way of protecting you. Let\'s gently explore these feelings and find pathways back to emotional connection.' },
      duration: { en: '8-10 min' },
      difficulty: 'intermediate',
      themeId: 'sadness-apathy',
      isPremium: true,
      questions: [
        {
          id: 'q1',
          text: { en: 'When did you first notice feeling emotionally disconnected or unusually sad?' },
          placeholder: { en: 'Example: After a major life change, during a stressful period, gradually over time...' },
          helpText: { en: 'Understanding when it started can provide important clues.' }
        },
        {
          id: 'q2',
          text: { en: 'What small moments or activities still bring you even a tiny spark of interest or comfort?' },
          placeholder: { en: 'Example: Morning coffee, a favorite song, time with pets, certain memories...' },
          helpText: { en: 'Even tiny sparks are important—they show your emotional capacity is still there.' }
        }
      ],
      finalMessage: {
        message: { en: 'Emotional numbness is often your mind\'s protective response. Gentle acknowledgment and self-compassion are the first steps toward healing.' },
        practiceTask: { en: 'Each day this week, notice one small thing that brings you even a moment of comfort or mild interest.' },
        whyExplanation: { en: 'Reconnecting with small positive moments gradually rebuilds your emotional range and resilience.' }
      }
    },

    'card-11': {
      id: 'card-11',
      title: { en: 'Rediscovering Motivation' },
      description: { en: 'Gently rebuild connection to your values and find sustainable ways to re-engage with life.' },
      welcomeMessage: { en: 'Motivation returns gradually through small, meaningful actions aligned with what matters to you. Let\'s find gentle ways to reconnect with your sense of purpose.' },
      duration: { en: '9-12 min' },
      difficulty: 'advanced',
      themeId: 'sadness-apathy',
      isPremium: true,
      questions: [
        {
          id: 'q1',
          text: { en: 'What mattered to you before you felt this way? What gave your life meaning?' },
          placeholder: { en: 'Example: Helping others, creative expression, relationships, learning, nature...' },
          helpText: { en: 'These core values are still part of you, even if they feel distant right now.' }
        },
        {
          id: 'q2',
          text: { en: 'What is the smallest possible step you could take toward something that once mattered to you?' },
          placeholder: { en: 'Example: Send one text to a friend, write one sentence, take a 5-minute walk...' },
          helpText: { en: 'Focus on what feels genuinely manageable, not what you think you "should" do.' }
        }
      ],
      finalMessage: {
        message: { en: 'Motivation rebuilds through tiny consistent actions, not through forcing yourself to feel differently.' },
        practiceTask: { en: 'Take one small step toward something that once mattered to you. If it feels too hard, make it smaller.' },
        whyExplanation: { en: 'Small actions create positive feedback loops that gradually restore your sense of agency and connection.' }
      }
    }
  },

  // =====================================================================================
  // КАРТОЧКИ ЭКСТРЕННОЙ ПОМОЩИ
  // =====================================================================================
  emergencyCards: {
    'emergency-breathing': {
      id: 'emergency-breathing',
      title: { en: 'Emergency breathing patterns' },
      description: { en: 'Check in with yourself — it\'s the first step to self-care! Do it everyday.' },
      isPremium: false,
      actionUrl: '/breathing-exercise'
    },
    'emergency-grounding': {
      id: 'emergency-grounding',
      title: { en: 'Grounding techniques' },
      description: { en: 'Quick techniques to help you feel more present and centered when overwhelmed.' },
      isPremium: false,
      actionUrl: '/grounding-exercise'
    },
    'emergency-support': {
      id: 'emergency-support',
      title: { en: 'Crisis support contacts' },
      description: { en: 'Access to professional support when you need immediate help.' },
      isPremium: false,
      actionUrl: '/crisis-support'
    }
  },

  // =====================================================================================
  // КОНТЕНТ ОНБОРДИНГА
  // =====================================================================================
  onboarding: {
    screen01: {
      title: { en: 'Welcome to Menhausen' },
      subtitle: { en: 'Your personal mental health companion. Let\'s start your journey to better emotional well-being.' },
      buttonText: { en: 'Get Started' },
      privacyText: { en: 'Privacy Policy' },
      termsText: { en: 'Terms of Use' }
    },
    screen02: {
      title: { en: 'What makes Menhausen special?' },
      benefits: [
        { en: 'Personalized exercises based on your needs' },
        { en: 'Evidence-based techniques from psychology' },
        { en: 'Daily check-ins to track your progress' },
        { en: 'Emergency support when you need it most' }
      ],
      buttonText: { en: 'Continue' }
    }
  },

  // =====================================================================================
  // СИСТЕМА ОПРОСА (5 ЭКРАНОВ)
  // =====================================================================================
  survey: {
    screen01: {
      id: 'screen01',
      step: 1,
      totalSteps: 5,
      title: { en: 'What challenges are you facing right now?' },
      subtitle: { en: 'Select all that apply. This helps us personalize your experience.' },
      questionType: 'multiple-choice',
      options: [
        { id: 'anxiety', text: { en: 'I struggle with anxiety' } },
        { id: 'stress', text: { en: 'I have trouble managing stress' } },
        { id: 'mood', text: { en: 'My mood feels unstable' } },
        { id: 'relationships', text: { en: 'I have relationship difficulties' } },
        { id: 'motivation', text: { en: 'I lack motivation or purpose' } },
        { id: 'sleep', text: { en: 'I have sleep problems' } }
      ],
      buttonText: { en: 'Continue' },
      skipAllowed: false
    },

    screen02: {
      id: 'screen02',
      step: 2,
      totalSteps: 5,
      title: { en: 'How long have you been experiencing these challenges?' },
      subtitle: { en: 'This helps us understand your current situation better.' },
      questionType: 'single-choice',
      options: [
        { id: 'recent', text: { en: 'Recently (within the last month)' } },
        { id: 'few-months', text: { en: 'A few months' } },
        { id: 'half-year', text: { en: 'About 6 months' } },
        { id: 'year-plus', text: { en: 'Over a year' } },
        { id: 'always', text: { en: 'As long as I can remember' } }
      ],
      buttonText: { en: 'Continue' },
      skipAllowed: false
    },

    screen03: {
      id: 'screen03',
      step: 3,
      totalSteps: 5,
      title: { en: 'What time of day do you feel most motivated?' },
      subtitle: { en: 'We\'ll suggest the best times for your practice sessions.' },
      questionType: 'single-choice',
      options: [
        { id: 'early-morning', text: { en: 'Early morning (6-8 AM)' } },
        { id: 'morning', text: { en: 'Morning (8-11 AM)' } },
        { id: 'midday', text: { en: 'Midday (11 AM-2 PM)' } },
        { id: 'afternoon', text: { en: 'Afternoon (2-6 PM)' } },
        { id: 'evening', text: { en: 'Evening (6-9 PM)' } },
        { id: 'night', text: { en: 'Late night (9 PM+)' } },
        { id: 'varies', text: { en: 'It varies day to day' } }
      ],
      buttonText: { en: 'Continue' },
      skipAllowed: false
    },

    screen04: {
      id: 'screen04',
      step: 4,
      totalSteps: 5,
      title: { en: 'How much time can you dedicate to mental health exercises?' },
      subtitle: { en: 'Be honest - consistency matters more than duration.' },
      questionType: 'single-choice',
      options: [
        { id: '5-min', text: { en: '5 minutes daily' } },
        { id: '10-min', text: { en: '10 minutes daily' } },
        { id: '15-min', text: { en: '15 minutes daily' } },
        { id: '20-min', text: { en: '20+ minutes daily' } },
        { id: 'few-times', text: { en: 'A few times per week' } },
        { id: 'when-needed', text: { en: 'Only when I really need it' } }
      ],
      buttonText: { en: 'Continue' },
      skipAllowed: false
    },

    screen05: {
      id: 'screen05',
      step: 5,
      totalSteps: 5,
      title: { en: 'What\'s your main goal with mental health support?' },
      subtitle: { en: 'This helps us prioritize what matters most to you.' },
      questionType: 'single-choice',
      options: [
        { id: 'reduce-anxiety', text: { en: 'Reduce anxiety and worry' } },
        { id: 'manage-stress', text: { en: 'Better stress management' } },
        { id: 'improve-mood', text: { en: 'Improve my overall mood' } },
        { id: 'better-relationships', text: { en: 'Build better relationships' } },
        { id: 'find-purpose', text: { en: 'Find motivation and purpose' } },
        { id: 'daily-support', text: { en: 'Just need daily emotional support' } },
        { id: 'crisis-help', text: { en: 'Help during difficult moments' } }
      ],
      buttonText: { en: 'Complete Setup' },
      skipAllowed: false
    }
  },

  // =====================================================================================
  // UI ТЕКСТЫ
  // =====================================================================================
  ui: {
    navigation: {
      back: { en: 'Back' },
      next: { en: 'Next' },
      skip: { en: 'Skip' },
      complete: { en: 'Complete' },
      continue: { en: 'Continue' }
    },
    common: {
      loading: { en: 'Loading...' },
      error: { en: 'Something went wrong' },
      tryAgain: { en: 'Try again' },
      save: { en: 'Save' },
      cancel: { en: 'Cancel' },
      delete: { en: 'Delete' },
      edit: { en: 'Edit' }
    },
    home: {
      greeting: { en: 'Good morning' }, // Будет динамически меняться
      checkInPrompt: { en: 'How are you feeling today?' },
      quickHelpTitle: { en: 'Quick mental help' },
      themesTitle: { en: 'Choose what bothers you' }
    },
    profile: {
      title: { en: 'Profile' },
      aboutApp: { en: 'About app' },
      privacy: { en: 'Privacy Policy' },
      terms: { en: 'Terms of Use' },
      deleteAccount: { en: 'Delete account' },
      payments: { en: 'Subscription' }
    },
    survey: {
      progress: { en: 'Step {current} of {total}' },
      selectAtLeastOne: { en: 'Please select at least one option' },
      optional: { en: 'Optional' },
      required: { en: 'Required' }
    }
  }
};