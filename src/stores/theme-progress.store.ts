import { atom, computed, onMount } from 'nanostores'

import { ThemeCardManager } from '@/utils/ThemeCardManager'
import { initializeLocalStorageInterceptor } from '@/utils/supabaseSync/localStorageInterceptor'

const CARD_PROGRESS_KEY_PREFIX = 'theme_card_progress_'

// Incremented whenever any card progress localStorage key changes.
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
  // Ensure initial computation.
  refreshThemeProgress()

  const interceptor = initializeLocalStorageInterceptor()
  const unsubscribe = interceptor.onKeyChange((key: string) => {
    if (key && key.startsWith(CARD_PROGRESS_KEY_PREFIX)) {
      bumpThemeProgressVersion()
    }
  })

  return () => unsubscribe()
})

