import { atom, onMount } from 'nanostores'

import { getInitialLanguage, saveLanguage, getSavedLanguage } from '@/utils/languageDetector'
import type { SupportedLanguage } from '@/types/content'

export type Language = SupportedLanguage

export const $language = atom<Language>(getInitialLanguage())
export const $isLanguageModalOpen = atom<boolean>(false)

export function initLanguage() {
  $language.set(getInitialLanguage())
}

onMount($language, () => {
  // After fastSyncCriticalData potentially writes language to localStorage,
  // sync the store once so content loading uses the updated language.
  const timeoutId = setTimeout(() => {
    const saved = getSavedLanguage()
    if (saved && saved !== $language.get()) {
      $language.set(saved)
    }
  }, 100)

  return () => clearTimeout(timeoutId)
})

export function setLanguage(lang: Language) {
  if (lang === $language.get()) return
  $language.set(lang)
  saveLanguage(lang)
}

export function openLanguageModal() {
  $isLanguageModalOpen.set(true)
}

export function closeLanguageModal() {
  $isLanguageModalOpen.set(false)
}

