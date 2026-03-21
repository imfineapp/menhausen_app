import { useStore } from '@nanostores/react'

import {
  $language,
  $isLanguageModalOpen,
  setLanguage as setLanguageAction,
  openLanguageModal as openLanguageModalAction,
  closeLanguageModal as closeLanguageModalAction,
  type Language,
} from '@/src/stores/language.store'

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
  
  /**
   * Функция для получения переведенного текста
   */
  const t = (key: string): string => {
    const translations: Record<string, Record<Language, string>> = {
      // Общие
      'language': {
        'en': 'Language',
        'ru': 'Язык'
      },
      'english': {
        'en': 'English',
        'ru': 'Английский'
      },
      'russian': {
        'en': 'Russian',
        'ru': 'Русский'
      },
      'select_language': {
        'en': 'Select Language',
        'ru': 'Выберите язык'
      },
      'cancel': {
        'en': 'Cancel',
        'ru': 'Отмена'
      },
      'confirm': {
        'en': 'Confirm',
        'ru': 'Подтвердить'
      },
      'change_language_title': {
        'en': 'Change Language',
        'ru': 'Смена языка'
      },
      'change_language_description': {
        'en': 'Choose your preferred language for the app interface',
        'ru': 'Выберите предпочитаемый язык интерфейса приложения'
      },
      'language_changed': {
        'en': 'Language has been changed',
        'ru': 'Язык интерфейса изменен'
      },
      // Тексты для шаринга
      'share_title': {
        'en': 'Menhausen - Mental Health App',
        'ru': 'Menhausen - Приложение для ментального здоровья'
      },
      'share_text_telegram': {
        'en': '🧠✨ Hey! Try Menhausen — an amazing mental health app!\n\n🎯 What\'s inside:\n• Daily mood check-ins\n• Useful exercises and techniques\n• Progress tracking\n• Personalized approach\n\n💚 Start taking care of yourself today!\n\n👉',
        'ru': '🧠✨ Привет! Попробуй Menhausen — это крутое приложение для заботы о ментальном здоровье!\n\n🎯 Что внутри:\n• Ежедневные чек-ины настроения\n• Полезные упражнения и техники\n• Трекинг прогресса\n• Индивидуальный подход\n\n💚 Начни заботиться о себе уже сегодня!\n\n👉'
      },
      'share_text_general': {
        'en': '🧠✨ Check out Menhausen - an amazing mental health app! Take care of your mental wellbeing with daily check-ins, useful exercises and personalized approach. Start taking care of yourself today!',
        'ru': '🧠✨ Посмотри на Menhausen - крутое приложение для ментального здоровья! Заботься о своем психическом состоянии с ежедневными чек-инами, полезными упражнениями и персонализированным подходом. Начни заботиться о себе уже сегодня!'
      },
      'share_copied': {
        'en': '✅ Link copied to clipboard!',
        'ru': '✅ Ссылка скопирована в буфер!'
      },
      'share_error': {
        'en': 'Unable to copy link. Please share manually: ',
        'ru': 'Не удалось скопировать ссылку. Поделитесь вручную: '
      },
      // Дополнительные переводы для профиля
      'your_status': {
        'en': 'Your status',
        'ru': 'Ваш статус'
      },
      'settings': {
        'en': 'Settings',
        'ru': 'Настройки'
      },
      'badges': {
        'en': 'Badges',
        'ru': 'Значки'
      },
      'your_level': {
        'en': 'Your level',
        'ru': 'Ваш уровень'
      },
      'how_are_you_status': {
        'en': 'How are you status',
        'ru': 'Статус "Как дела"'
      },
      'unlock_all_themes': {
        'en': 'Unlock all themes & cards',
        'ru': 'Разблокировать все темы и карточки'
      },
      'regularExerciseNotification': {
        'en': 'Only by doing exercises regularly will you achieve results.',
        'ru': 'Только регулярно выполняя упражнения, ты добьешься результатов'
      },
      'make_donation': {
        'en': 'Make donation',
        'ru': 'Сделать пожертвование'
      },
      'your_activity': {
        'en': 'Your activity',
        'ru': 'Ваша активность'
      },
      'share_app_to_friend': {
        'en': 'Share app to friend',
        'ru': 'Поделиться приложением с другом'
      },
      'daily_reminder': {
        'en': 'Daily reminder',
        'ru': 'Ежедневное напоминание'
      },
      'security_pin': {
        'en': 'Security PIN',
        'ru': 'PIN-код безопасности'
      },
      'about_app': {
        'en': 'About app',
        'ru': 'О приложении'
      },
      'privacy_policy': {
        'en': 'Privacy policy',
        'ru': 'Политика конфиденциальности'
      },
      'terms_of_use': {
        'en': 'Terms of use',
        'ru': 'Условия использования'
      },
      'delete_account': {
        'en': 'Delete account',
        'ru': 'Удалить аккаунт'
      },
      // Страница донатов
      'donations_title': {
        'en': 'Make a donation',
        'ru': 'Сделать пожертвование'
      },
      'donations_description': {
        'en': 'You can support the project by sending TON or USDT (TON). All donations will be used solely to maintain the technical infrastructure (servers, hosting, monitoring, analytics) so that the app remains fast and stable.',
        'ru': 'Вы можете поддержать проект переводом на TON или USDT (TON). Все пожертвования будут направлены исключительно на поддержание технической инфраструктуры (серверы, хостинг, мониторинг, аналитика), чтобы приложение оставалось быстрым и стабильным.'
      },
      'donations_currency_ton': {
        'en': 'TON',
        'ru': 'TON'
      },
      'donations_currency_usdt_ton': {
        'en': 'USDT (TON)',
        'ru': 'USDT (TON)'
      },
      'copy': {
        'en': 'Copy',
        'ru': 'Скопировать'
      },
      'copied': {
        'en': 'Copied',
        'ru': 'Скопировано'
      },
      // Переводы для страницы "О приложении"
      'about_menhausen': {
        'en': 'About Menhausen',
        'ru': 'О Menhausen'
      },
      'key_features': {
        'en': 'Key Features',
        'ru': 'Ключевые функции'
      },
      'development_team': {
        'en': 'Development Team',
        'ru': 'Команда разработчиков'
      },
      'technical_information': {
        'en': 'Technical Information',
        'ru': 'Техническая информация'
      },
      'important_note': {
        'en': 'Important Note',
        'ru': 'Важное примечание'
      },
      // Навигация
      'next': {
        'en': 'Next',
        'ru': 'Далее'
      },
      // Квадратное дыхание
      'square_breathing_description': {
        'en': 'Square breathing technique to help you relax and focus. Follow the visual guide to breathe in a square pattern.',
        'ru': 'Техника квадратного дыхания для расслабления и концентрации. Следуйте визуальному руководству для дыхания по квадратному паттерну.'
      },
      // Mental Score
      'mental_score': {
        'en': 'Mental score',
        'ru': 'Ментальный счетчик'
      },
      // Status blocks
      'exercises_completed': {
        'en': 'Exercises completed',
        'ru': 'Упражнений пройдено'
      },
      'status': {
        'en': 'Status',
        'ru': 'Статус'
      },
      'page': {
        'en': 'Page',
        'ru': 'Страница'
      },
      'of': {
        'en': 'of',
        'ru': 'из'
      },
      'no_points_history': {
        'en': 'No points history yet',
        'ru': 'История баллов пока пуста'
      }
    };

    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    return translation[language] || translation['en'] || key;
  };

  return { t, language };
}