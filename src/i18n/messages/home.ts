import { i18n } from '../setup'

export const homeMessages = i18n('home', {
  greeting: "Good morning",
  checkInPrompt: "How are you feeling today?",
  quickHelpTitle: "Quick mental help",
  themesTitle: "Choose what bothers you",
  howAreYou: "How are you?",
  checkInDescription: "Check in with yourself — it's the first step to self-care! Do it everyday.",
  checkInButton: "Send",
  checkInInfo: {
    title: "Why daily check-in matters?",
    content: "Daily check-in is a simple yet powerful tool for improving your mental health. Here's why it's important:\n\n• Self-awareness: Regular emotional check-ins help you better understand your feelings and reactions\n\n• Early detection: Allows you to notice mood changes before they become serious problems\n\n• Care habit: Forms a beneficial habit of paying attention to your psychological state\n\n• Progress tracking: Helps track changes in your emotional state over time\n\n• Motivation: Understanding your emotions is the first step to managing them and improving your quality of life\n\nJust a few minutes a day can significantly impact your overall well-being."
  },
  whatWorriesYou: "What worries you?",
  heroTitle: "Hero #1275",
  level: "Level",
  progress: "Progress",
  use80PercentUsers: "Use 80% users",
  themeMatchPercentage: "Matches you {percentage}%",
  activity: {
    title: "Activity",
    streak: "4 days",
    description: "Only by doing exercises regularly will you achieve results.",
    streakLabel: {
      singular: "day",
      plural: "days",
      few: "days",
      many: "days"
    },
    progressLabel: "Progress",
    weeklyCheckins: "Check-ins",
    points: "points",
    target: "target"
  },
  emergencyHelp: {
    breathing: {
      title: "Emergency breathing patterns",
      description: "Calm your mind with guided breathing exercises for immediate relief."
    },
    meditation: {
      title: "Quick meditation techniques",
      description: "Calm your mind with guided meditation exercises for immediate relief."
    },
    grounding: {
      title: "Grounding techniques",
      description: "Ground yourself in the present moment with proven techniques."
    }
  }
} as any)
