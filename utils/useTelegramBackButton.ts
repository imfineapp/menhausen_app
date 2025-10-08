import { useEffect } from 'react';
import { isDirectLinkMode } from './telegramUserUtils';

/**
 * Хук для управления кнопкой Back в Telegram WebApp
 * Enhanced for direct-link mode support
 *
 * @param isVisible - флаг видимости кнопки
 * @param onBack - функция обратного вызова при нажатии на кнопку
 */
export function useTelegramBackButton(isVisible: boolean, onBack: () => void) {
  useEffect(() => {
    // Проверяем доступность Telegram WebApp API
    const telegramWebApp = window.Telegram?.WebApp;
    if (!telegramWebApp) return;

    // Enhanced visibility logic for direct-link mode
    // Show back button if explicitly requested OR if in direct-link mode
    const shouldShowBackButton = isVisible || isDirectLinkMode();

    if (shouldShowBackButton) {
      // Показываем кнопку Back
      telegramWebApp.BackButton.show();

      // Устанавливаем обработчик нажатия
      telegramWebApp.BackButton.onClick(onBack);
    } else {
      // Скрываем кнопку Back
      telegramWebApp.BackButton.hide();
    }

    // Очистка при размонтировании компонента
    return () => {
      telegramWebApp.BackButton.offClick(onBack);
      telegramWebApp.BackButton.hide();
    };
  }, [isVisible, onBack]);
}
