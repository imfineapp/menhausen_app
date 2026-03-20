import { atom, onMount, onSet } from 'nanostores'

import { $language } from './language.store'
import type { AppContent, SupportedLanguage } from '@/types/content'
import { loadContentWithCache } from '@/utils/contentLoader'

export const $content = atom<AppContent | null>(null)
export const $isContentLoading = atom<boolean>(true)
export const $contentError = atom<string | null>(null)

let latestLoadId = 0
let loadedLanguage: SupportedLanguage | null = null

function resetContentState() {
  $content.set(null)
  $contentError.set(null)
  $isContentLoading.set(true)
  loadedLanguage = null
}

export async function loadContentForLanguage(language: SupportedLanguage): Promise<void> {
  // If we already have the correct content loaded and cached, avoid reloading.
  // Note: `$content.get()` can be null transiently during provider mounting/unmounting.
  const alreadyLoaded = loadedLanguage === language && $content.get() !== null
  if (alreadyLoaded) return

  const loadId = ++latestLoadId
  $isContentLoading.set(true)
  $contentError.set(null)

  try {
    const loadedContent = await loadContentWithCache(language)

    // Ignore stale responses when language changes quickly.
    if (latestLoadId !== loadId) return

    $content.set(loadedContent)
    loadedLanguage = language
  } catch (err) {
    if (latestLoadId !== loadId) return

    $contentError.set(`Failed to load content for language: ${language}`)
  } finally {
    if (latestLoadId !== loadId) return
    $isContentLoading.set(false)
  }
}

// When a component starts listening to `$content`, load for the current language,
// and keep content in sync with future language changes.
onMount($content, () => {
  resetContentState()
  // Initial load for the current language.
  void loadContentForLanguage($language.get())

  // Keep content in sync whenever language changes.
  const unsubscribe = onSet($language, ({ newValue }) => {
    void loadContentForLanguage(newValue as SupportedLanguage)
  })

  return () => unsubscribe()
})

