// Импортируем необходимые хуки React
import { createContext, useContext, useState, ReactNode } from 'react';

// Типы для языков приложения
export type Language = 'en' | 'ru';

// Интерфейс для контекста языка
interface LanguageContextType {
  language: Language; // Текущий выбранный язык
  setLanguage: (lang: Language) => void; // Функция для изменения языка
  isLanguageModalOpen: boolean; // Состояние открытия модального окна
  openLanguageModal: () => void; // Функция для открытия модального окна
  closeLanguageModal: () => void; // Функция для закрытия модального окна
}

// Создаем контекст языка
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Типы для провайдера контекста
interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Провайдер контекста языка приложения
 * Управляет текущим языком и состоянием модального окна выбора языка
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  // Состояние для текущего языка (по умолчанию английский)
  const [language, setLanguageState] = useState<Language>('en');
  
  // Состояние для модального окна выбора языка
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  /**
   * Функция для изменения языка приложения
   * Сохраняет выбор в localStorage для постоянства
   */
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Сохраняем выбор языка в localStorage
    try {
      localStorage.setItem('menhausen-language', lang);
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  };

  /**
   * Функция для открытия модального окна выбора языка
   */
  const openLanguageModal = () => {
    setIsLanguageModalOpen(true);
  };

  /**
   * Функция для закрытия модального окна выбора языка
   */
  const closeLanguageModal = () => {
    setIsLanguageModalOpen(false);
  };

  // Загружаем сохраненный язык при инициализации
  useState(() => {
    try {
      const savedLanguage = localStorage.getItem('menhausen-language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru')) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.warn('Failed to load language preference:', error);
    }
  });

  // Значение контекста
  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    isLanguageModalOpen,
    openLanguageModal,
    closeLanguageModal
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Хук для использования контекста языка
 * Возвращает текущий язык и функции для управления им
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
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