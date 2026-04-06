import type { RouteName } from '@/src/stores/router.store'

export type MentalTechniqueId =
  | 'breathing-4-7-8'
  | 'breathing-square'
  | 'grounding-5-4-3-2-1'
  | 'grounding-anchor'

export function getTechniqueRouteName(techniqueId: string): RouteName | null {
  switch (techniqueId as MentalTechniqueId) {
    case 'breathing-4-7-8':
      return 'breathing478'
    case 'breathing-square':
      return 'breathingSquare'
    case 'grounding-5-4-3-2-1':
      return 'grounding54321'
    case 'grounding-anchor':
      return 'groundingAnchor'
    default:
      return null
  }
}

