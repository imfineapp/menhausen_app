import { atom, computed, onMount } from 'nanostores'

import { ThemeCardManager } from '@/utils/ThemeCardManager'

// Incremented whenever card progress changes (ThemeCardManager.saveCardProgress or merge).
export const $themeProgressVersion = atom(0)

export const $totalCompletedAttempts = computed($themeProgressVersion, () => {
  return ThemeCardManager.getTotalCompletedAttempts()
})

function bumpThemeProgressVersion() {
  $themeProgressVersion.set($themeProgressVersion.get() + 1)
}

export function refreshThemeProgress() {
  bumpThemeProgressVersion()
}

onMount($themeProgressVersion, () => {
  refreshThemeProgress()
})
