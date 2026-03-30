import { i18n } from '../setup'

export const badgesMessages = i18n('badges', {
  title: "Achievements",
  subtitle: "Your mental health progress",
  congratulations: "Congratulations!",
  unlockedBadge: "You unlocked a new achievement!",
  shareButton: "Share",
  shareMessage: "I got a new achievement in Menhausen! 🎉",
  shareDescription: "Join me in caring for mental health",
  appLink: "https://t.me/menhausen_app_bot/app",
  lockedBadge: "Locked",
  unlockCondition: "Unlock condition:",
  progress: "Progress",
  totalBadges: "Total achievements",
  unlockedCount: "Unlocked",
  inProgress: "In Progress",
  points: "points",
  forOpening: "for opening",
  forReward: "for reward",
  motivatingText: "Your dedication helped you get a new achievement! Keep up the great work!",
  motivatingTextNoBadges: "Start your journey to mental well-being. Every day is a new opportunity for growth.",
  received: "Received",
  locked: "Locked",
  cancel: "Cancel",
  unlocked: "Unlocked",
  reward: {
    title: "Congratulations!",
    subtitle: "You earned an achievement!",
    continueButton: "Continue",
    nextAchievement: "Next Achievement",
    congratulations: "Great!",
    earnedAchievement: "Now you can earn rewards and points for your actions. You can view all your rewards in your profile."
  },
  achievements: {
    first_checkin: {
      title: "First Step",
      description: "Complete your first check-in"
    },
    week_streak: {
      title: "Week of Strength",
      description: "Check-ins for 7 days in a row"
    },
    month_streak: {
      title: "Month of Discipline",
      description: "Check-ins for 30 days in a row"
    },
    first_exercise: {
      title: "First Lesson",
      description: "Complete your first exercise"
    },
    exercise_master: {
      title: "Practice Master",
      description: "Complete 50 exercises"
    },
    mood_tracker: {
      title: "Mood Tracker",
      description: "Track your mood for 14 days"
    },
    early_bird: {
      title: "Early Bird",
      description: "Check-ins at 6 AM for 5 days in a row"
    },
    night_owl: {
      title: "Night Owl",
      description: "Check-ins at 11 PM for 5 days in a row"
    }
  }
} as any)
