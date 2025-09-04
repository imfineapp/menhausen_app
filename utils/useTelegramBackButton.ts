import { useEffect } from 'react';

/**
 * Хук для управления кнопкой Back в Telegram WebApp
 * 
 * @param isVisible - флаг видимости кнопки
 * @param onBack - функция обратного вызова при нажатии на кнопку
 */
export function useTelegramBackButton(isVisible: boolean, onBack: () => void) {
  useEffect(() => {
    // Проверяем доступность Telegram WebApp API
    const telegramWebApp = window.Telegram?.WebApp;
    if (!telegramWebApp) return;

    if (isVisible) {
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
