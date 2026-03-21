export type ThemeWorry = {
  title: string
  description: string
  progress: number
  isPremium: boolean
  isAvailable: boolean
  themeId: string
  order: number
  matchPercentage: number
}

/**
 * Sorts "worries" themes with the same rules as the legacy HomeScreen:
 * - stress always comes first when it's free
 * - then themes with known matchPercentage come first (desc)
 * - then available themes before unavailable
 */
export function sortWorries(themes: ThemeWorry[]): ThemeWorry[] {
  return themes
    .slice()
    .sort((a, b) => {
      // 1. Stress always first, if it's not premium.
      const aIsStress = a.themeId === 'stress'
      const bIsStress = b.themeId === 'stress'

      if (aIsStress && !a.isPremium && !bIsStress) return -1
      if (bIsStress && !b.isPremium && !aIsStress) return 1

      // If both are stress, preserve relative order.
      if (aIsStress && bIsStress) return 0

      // 2. Other themes: sort by matchPercentage presence.
      const aHasMatch = a.matchPercentage >= 0
      const bHasMatch = b.matchPercentage >= 0
      if (aHasMatch !== bHasMatch) {
        return aHasMatch ? -1 : 1
      }

      // 3. If both have match: sort by matchPercentage descending.
      if (aHasMatch && bHasMatch) {
        const matchDiff = b.matchPercentage - a.matchPercentage
        if (matchDiff !== 0) return matchDiff
      }

      // 4. Fallback: available first.
      return Number(b.isAvailable) - Number(a.isAvailable)
    })
}

