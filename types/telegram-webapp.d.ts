/**
 * Типизация для Telegram Web App API
 * Описывает методы и свойства объекта window.Telegram.WebApp
 */

declare global {
  interface Window {
    TwaAnalytics?: {
      trackEvent: (eventName: string, eventData: Record<string, any>) => void;
    };
    
    Telegram?: {
      WebApp: {
        /**
         * Версия API
         */
        version: string;
        
        /**
         * Платформа пользователя
         */
        platform: string;
        
        /**
         * Цветовая схема (light/dark)
         */
        colorScheme: 'light' | 'dark';
        
        /**
         * Данные инициализации от бота
         */
        initData: string;
        
        /**
         * Небезопасные данные инициализации (только для тестирования)
         */
        initDataUnsafe: {
          user?: {
            id: number;
            is_bot: boolean;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
          };
          chat?: {
            id: number;
            type: string;
            title?: string;
            username?: string;
          };
          start_param?: string;
        };

        /**
         * Показывает, готово ли приложение к использованию
         */
        isExpanded: boolean;
        
        /**
         * Высота viewport
         */
        viewportHeight: number;
        
        /**
         * Стабильная высота viewport
         */
        viewportStableHeight: number;

        /**
         * Основная кнопка
         */
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }) => void;
        };

        /**
         * Вторая кнопка
         */
        SecondaryButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }) => void;
        };

        /**
         * Кнопка назад
         */
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };

        /**
         * Кнопка настроек
         */
        SettingsButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };

        /**
         * HapticFeedback для тактильной обратной связи
         */
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };

        /**
         * CloudStorage для хранения данных
         */
        CloudStorage: {
          setItem: (key: string, value: string, callback?: (error: string | null, stored?: boolean) => void) => void;
          getItem: (key: string, callback: (error: string | null, value?: string) => void) => void;
          getItems: (keys: string[], callback: (error: string | null, values?: { [key: string]: string }) => void) => void;
          removeItem: (key: string, callback?: (error: string | null, removed?: boolean) => void) => void;
          removeItems: (keys: string[], callback?: (error: string | null, removed?: boolean) => void) => void;
          getKeys: (callback: (error: string | null, keys?: string[]) => void) => void;
        };

        /**
         * Методы приложения
         */
        
        /**
         * Готовность приложения
         */
        ready: () => void;
        
        /**
         * Развернуть приложение (compact → fullsize)
         */
        expand: () => void;
        
        /**
         * Запросить полноэкранный режим (fullsize → fullscreen)
         */
        requestFullscreen: () => void;
        
        /**
         * Выйти из полноэкранного режима (fullscreen → fullsize)
         */
        exitFullscreen: () => void;
        
        /**
         * Закрыть приложение
         */
        close: () => void;

        /**
         * Отправить данные боту
         */
        sendData: (data: string) => void;

        /**
         * Переключить настройки
         */
        switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;

        /**
         * Открыть ссылку
         */
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;

        /**
         * Открыть Telegram ссылку
         */
        openTelegramLink: (url: string) => void;

        /**
         * Открыть счет для оплаты Telegram Stars
         * @param url - URL инвойса от createInvoiceLink
         * @param callback - Callback с результатом оплаты
         */
        openInvoice: (url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void;

        /**
         * Показать popup
         */
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text?: string;
          }>;
        }, callback?: (button_id: string) => void) => void;

        /**
         * Показать alert
         */
        showAlert: (message: string, callback?: () => void) => void;

        /**
         * Показать confirm
         */
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;

        /**
         * Показать scan QR popup
         */
        showScanQrPopup: (params: {
          text?: string;
        }, callback?: (text: string) => boolean) => void;

        /**
         * Закрыть scan QR popup
         */
        closeScanQrPopup: () => void;

        /**
         * Запросить разрешения на запись
         */
        requestWriteAccess: (callback?: (granted: boolean) => void) => void;

        /**
         * Запросить контакт
         */
        requestContact: (callback?: (granted: boolean) => void) => void;

        /**
         * Включить закрытие по жесту
         */
        enableClosingConfirmation: () => void;

        /**
         * Выключить закрытие по жесту
         */
        disableClosingConfirmation: () => void;

        /**
         * Подписка на события
         */
        onEvent: (eventType: string, eventHandler: (...args: any[]) => void) => void;

        /**
         * Отписка от события
         */
        offEvent: (eventType: string, eventHandler: (...args: any[]) => void) => void;
      };
    };
  }
}

export {};