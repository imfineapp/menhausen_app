import { atom, onMount } from 'nanostores'

import { locale, localeSetting } from '@/src/i18n/setup'
import { getSavedLanguage } from '@/utils/languageDetector'
import type { SupportedLanguage } from '@/types/content'

export type Language = SupportedLanguage

export const $language = atom<Language>(locale.get().startsWith('ru') ? 'ru' : 'en')
export const $isLanguageModalOpen = atom<boolean>(false)

locale.listen((value) => {
  const normalized: Language = value.startsWith('ru') ? 'ru' : 'en'
  if ($language.get() !== normalized) {
    $language.set(normalized)
  }
})

onMount($language, () => {
  const timeoutId = setTimeout(() => {
    const saved = getSavedLanguage()
    if (saved && saved !== $language.get()) {
      localeSetting.set(saved)
    }
  }, 100)

  return () => clearTimeout(timeoutId)
})

export function initLanguage() {
  const savedLanguage = getSavedLanguage()
  localeSetting.set(savedLanguage ?? $language.get())
}

export function setLanguage(lang: Language) {
  if (lang === $language.get()) return
  localeSetting.set(lang)
}

export function openLanguageModal() {
  $isLanguageModalOpen.set(true)
}

export function closeLanguageModal() {
  $isLanguageModalOpen.set(false)
}

