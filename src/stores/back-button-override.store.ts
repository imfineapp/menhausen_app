import { atom } from 'nanostores'

export type BackButtonOverride = {
  isVisible?: boolean
  onBack: () => void
}

export const $backButtonOverride = atom<BackButtonOverride | null>(null)

export function setBackButtonOverride(override: BackButtonOverride) {
  $backButtonOverride.set(override)
}

export function clearBackButtonOverride() {
  $backButtonOverride.set(null)
}

