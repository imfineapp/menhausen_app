import { i18n } from '../setup'

export const cardsMessages = i18n('cards', {
  fallbackTitle: "Card",
  fallbackDescription: "Card description will be available soon.",
  techniqueNotFound: "Technique not found",
  practiceTaskNotFound: "Practice task not found",
  explanationNotFound: "Explanation not found",
  questionNotFound: "Question not found",
  attempts: "Attempts",
  noAttempts: "No attempts yet. Start your first attempt by opening the card!",
  startExercise: "Ready to start the exercise?",
  welcome: {
    title: "Card",
    subtitle: "Ready to start the exercise?"
  },
  question: {
    placeholder: "Enter your answer here...",
    encryption: "Your answers are fully protected with AES-256 encryption"
  },
  final: {
    why: "Mechanism:"
  },
  rating: {
    title: "Please rate the card",
    subtitle: "Your rating will help us to be more useful",
    placeholder: "Leave feedback (optional)...",
    submit: "Submit",
    back: "Back",
    thankYou: "Thank you!",
    skipRating: "I don't want to answer"
  },
  themeHome: {
    card1: "Card #1",
    card2: "Card #2",
    card3: "Card #3",
    card4: "Card #4",
    card5: "Card #5",
    card6: "Card #6",
    card7: "Card #7",
    card8: "Card #8",
    card9: "Card #9",
    card10: "Card #10",
    level1: "Level 1",
    level2: "Level 2",
    level3: "Level 3",
    level4: "Level 4",
    level5: "Level 5",
    description: "Some text about card and more.",
    attemptsLabel: "Attempts"
  }
} as any)
