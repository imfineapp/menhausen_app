import { i18n } from '../setup'

export const themesMessages = i18n('themes', {
  welcome: {
    title: "Welcome to Theme",
    subtitle: "Ready to start working on yourself?",
    start: "Start",
    unlock: "Unlock",
    lockedSubtitle: "Unlock this theme to get started",
    freeWarning: {
      title: "Important Warning",
      text: "Cards in the free version have not yet been validated by a psychologist and are placed only as an example (prototype). All responsibility for consequences arising after completing this technique lies with the user. By clicking the button, you confirm that you understand all risks and take them upon yourself."
    }
  },
  home: {
    progress: "Progress",
    attempts: "Attempts",
    attemptsCounter: "attempts",
    level: "Level",
    nextLevel: "Next Level",
    allCardsAttempted: "All cards attempted!",
    startCard: "Start Card #{number}"
  }
} as any)
