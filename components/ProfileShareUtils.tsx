// Утилиты для функциональности шаринга в профиле пользователя
import { useTranslation } from './LanguageContext';

/**
 * Хук для функциональности шаринга приложения
 */
export function useAppShare() {
  const { t } = useTranslation();

  /**
   * Главная функция шаринга
   */
  const handleShare = () => {
    console.log('Sharing app through Telegram');
    
    // Проверяем, запущено ли приложение в Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      try {
        // Данные для отправки через Telegram
        const appUrl = window.location.origin; // Базовый URL приложения
        const shareText = `${t('share_text_telegram')} ${appUrl}`;
        
        // Используем метод Telegram для отправки текста
        // Этот метод откроет диалог выбора чата для отправки сообщения
        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`;
        
        // Открываем Telegram share dialog
        window.Telegram.WebApp.openTelegramLink(telegramShareUrl);
        
        console.log('Telegram share dialog opened');
        
        // Добавляем тактильную обратную связь если доступна
        if (window.Telegram.WebApp.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
        
      } catch (error) {
        console.error('Error sharing through Telegram:', error);
        // Fallback на стандартный share
        fallbackShare();
      }
    } else {
      // Fallback если не в Telegram
      fallbackShare();
    }
  };

  /**
   * Fallback функция для шаринга вне Telegram
   */
  const fallbackShare = () => {
    const appUrl = window.location.href;
    const shareText = t('share_text_general');
    
    if (navigator.share) {
      navigator.share({
        title: t('share_title'),
        text: shareText,
        url: appUrl,
      }).then(() => {
        console.log('Successfully shared');
      }).catch((error) => {
        console.error('Error sharing:', error);
        copyToClipboard(shareText + '\n\n' + appUrl);
      });
    } else {
      // Копируем в буфер обмена
      copyToClipboard(shareText + '\n\n' + appUrl);
    }
  };

  /**
   * Функция для копирования текста в буфер обмена
   */
  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showShareSuccessMessage();
      }).catch(() => {
        fallbackCopyToClipboard(text);
      });
    } else {
      fallbackCopyToClipboard(text);
    }
  };

  /**
   * Fallback для копирования в старых браузерах
   */
  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      showShareSuccessMessage();
    } catch (error) {
      console.error('Fallback copy failed:', error);
      alert(t('share_error') + window.location.href);
    }
    
    document.body.removeChild(textArea);
  };

  /**
   * Показывает сообщение об успешном шаринге
   */
  const showShareSuccessMessage = () => {
    // Создаем простое toast уведомление
    const toast = document.createElement('div');
    toast.textContent = t('share_copied');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #e1ff00;
      color: #2d2b2b;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: 'PT Sans', sans-serif;
      font-weight: 500;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideDown 0.3s ease-out;
    `;

    // Добавляем CSS анимацию
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
          to {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Удаляем через 3 секунды
    setTimeout(() => {
      toast.style.animation = 'slideUp 0.3s ease-in forwards';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  return { handleShare };
}