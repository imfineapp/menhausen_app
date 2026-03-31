import { i18n } from '../setup'

export const checkinMessages = i18n('checkin', {
  title: "How are you?",
  subtitle: "Check in with yourself — it's the first step to self-care! Do it everyday.",
  moodOptions: {
    down: "It feels really hard",
    anxious: "It feels rather hard",
    neutral: "Neutral / in between",
    energized: "Pretty good",
    happy: "Feeling great"
  },
  send: "Send",
  back: "Back"
} as any)
