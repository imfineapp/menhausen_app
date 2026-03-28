import { atom } from 'nanostores'

export const ExperimentVariant = {
  A_CONTROL: 'A',
  B_NO_TEST: 'B',
  C_EMBEDDED_TEST: 'C',
} as const

export type ExperimentVariantType = 'A' | 'B' | 'C'

/** Set during app init after assignVariant(); null before init or without user id. */
export const $experimentVariant = atom<ExperimentVariantType | null>(null)
