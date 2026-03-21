import type { ThemeData } from '@/types/content'

/**
 * Map card id prefix to theme id (content bundle routing).
 */
export function getThemeIdFromCardId(cardId: string): string {
  if (cardId.startsWith('STRESS')) return 'stress'
  if (cardId.startsWith('REL')) return 'relationships'
  if (cardId.startsWith('IDNT')) return 'self-identity'
  if (cardId.startsWith('ANGR')) return 'anger'
  if (cardId.startsWith('DEPR')) return 'depression-coping'
  if (cardId.startsWith('LOSS')) return 'grief-loss'
  if (cardId.startsWith('BURN')) return 'burnout-recovery'
  if (cardId.startsWith('ANX')) return 'anxiety'
  return 'stress'
}

/**
 * Ordered card ids for a theme (supports `cards[]` or legacy `cardIds`).
 */
export function getAllCardIdsFromTheme(theme: ThemeData): string[] {
  if (Array.isArray(theme.cards)) {
    return theme.cards.map((c) => c.id)
  }
  if (Array.isArray(theme.cardIds)) {
    return theme.cardIds
  }
  return []
}

export interface ThemeCompletionFlags {
  allCardsCompleted: boolean
  allCardsRepeated: boolean
}

/**
 * Pure theme completion check given per-card attempt counts from storage layer.
 */
export function computeThemeCompletionFlags(
  allCardIds: string[],
  getAttemptCount: (cardId: string) => number
): ThemeCompletionFlags {
  if (allCardIds.length === 0) {
    return { allCardsCompleted: true, allCardsRepeated: true }
  }
  const allCardsCompleted = allCardIds.every((cardId) => getAttemptCount(cardId) > 0)
  const allCardsRepeated = allCardIds.every((cardId) => getAttemptCount(cardId) > 1)
  return { allCardsCompleted, allCardsRepeated }
}
