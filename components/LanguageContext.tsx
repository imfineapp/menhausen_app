import { useStore } from '@nanostores/react'
import { useMemo } from 'react'

import {
  $language,
  $isLanguageModalOpen,
  setLanguage as setLanguageAction,
  openLanguageModal as openLanguageModalAction,
  closeLanguageModal as closeLanguageModalAction,
  type Language,
} from '@/src/stores/language.store'
import { appMessages } from '@/src/i18n/messages/app'

export type { Language } from '@/src/stores/language.store'

// Интерфейс для контекста языка
interface LanguageContextType {
  language: Language; // Текущий выбранный язык
  setLanguage: (lang: Language) => void; // Функция для изменения языка
  isLanguageModalOpen: boolean; // Состояние открытия модального окна
  openLanguageModal: () => void; // Функция для открытия модального окна
  closeLanguageModal: () => void; // Функция для закрытия модального окна
}

/**
 * Хук для использования контекста языка
 * Возвращает текущий язык и функции для управления им
 */
export function useLanguage(): LanguageContextType {
  const language = useStore($language)
  const isLanguageModalOpen = useStore($isLanguageModalOpen)

  return {
    language,
    setLanguage: setLanguageAction,
    isLanguageModalOpen,
    openLanguageModal: openLanguageModalAction,
    closeLanguageModal: closeLanguageModalAction,
  }
}

/**
 * Хук для получения переводов текста
 * Возвращает функцию для получения текста на текущем языке
 */
export function useTranslation() {
  const { language } = useLanguage();
  const messages = useStore(appMessages)
  const t = useMemo(
    () => (key: string): string => {
      const value = messages[key as keyof typeof messages]
      if (typeof value === 'string') return value
      console.warn(`Translation missing for key: ${key}`)
      return key
    },
    [messages]
  )

  return { t, language };
}