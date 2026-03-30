import { atom } from 'nanostores'
import { browser, createI18n, formatter, localeFrom } from '@nanostores/i18n'
import { persistentAtom } from '@nanostores/persistent'

import { detectTelegramLanguage } from '@/utils/languageDetector'
import ruTranslations from '../../data/translations/ru.json'

export const LOCALES = ['en', 'ru'] as const
export type AppLocale = (typeof LOCALES)[number]

const isAppLocale = (value: string | undefined): value is AppLocale => {
  return value === 'en' || value === 'ru'
}

// Keep compatibility with existing localStorage key.
export const localeSetting = persistentAtom<AppLocale | undefined>(
  'menhausen-language',
  undefined
)

// Telegram returns simple language codes; normalize to app locales.
const telegramLocale = atom<AppLocale>(detectTelegramLanguage())

const settingsLocale = atom<AppLocale | undefined>(localeSetting.get())

localeSetting.listen((value) => {
  settingsLocale.set(isAppLocale(value) ? value : undefined)
})

export const locale = localeFrom(
  settingsLocale,
  telegramLocale,
  browser({ available: LOCALES, fallback: 'en' })
)

locale.listen((value) => {
  if (isAppLocale(value) && localeSetting.get() !== value) {
    localeSetting.set(value)
  }
})

export const format = formatter(locale)

export const i18n = createI18n(locale, {
  cache: {
    en: {},
    ru: ruTranslations,
  },
  async get(code) {
    if (code === 'en') return {}
    if (code === 'ru') return ruTranslations
    return {}
  },
})
