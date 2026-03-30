// Компонент секции обратной связи для профиля пользователя
import { FeedbackIcon } from './UserProfileIcons';
import { useTranslation } from './LanguageContext';
import { hapticImpactOccurred, isTelegramWebAppAvailable, openTelegramLink } from '@/src/effects/telegram.effects';

/**
 * Адаптивная кнопка обратной связи
 */
function FeedbackButton({ onClick }: { onClick?: () => void }) {
  const { t } = useTranslation();
  
  return (
    <button
      onClick={onClick}
      className="bg-[#e1ff00] h-[44px] sm:h-[46px] rounded-xl w-full cursor-pointer min-h-[44px] min-w-[44px] hover:bg-[#d1ef00]"
      data-name="Feedback button"
    >
      <div className="flex items-center justify-center w-full h-full px-4">
        <div className="typography-caption text-[#2d2b2b] text-center">
          <p className="adjustLetterSpacing block leading-[14px] sm:leading-[16px]">{t('feedback_join_button')}</p>
        </div>
      </div>
    </button>
  );
}

/**
 * Адаптивная секция обратной связи
 */
export function FeedbackSection() {
  const { t } = useTranslation();
  
  const handleFeedback = () => {
    console.log('Opening Telegram channel for feedback');
    
    const telegramChannelUrl = 'https://t.me/menhausen_app';
    
    // Проверяем, запущено ли приложение в Telegram WebApp
    if (isTelegramWebAppAvailable()) {
      try {
        // Используем Telegram WebApp API для открытия канала
        openTelegramLink(telegramChannelUrl);
        
        console.log('Telegram channel opened via WebApp API');
        
        // Добавляем тактильную обратную связь если доступна
        hapticImpactOccurred('light');
        
      } catch (error) {
        console.error('Error opening Telegram channel via WebApp API:', error);
        // Fallback на стандартное открытие ссылки
        fallbackOpenLink(telegramChannelUrl);
      }
    } else {
      // Fallback если не в Telegram WebApp
      fallbackOpenLink(telegramChannelUrl);
    }
  };

  /**
   * Fallback функция для открытия ссылки вне Telegram WebApp
   */
  const fallbackOpenLink = (url: string) => {
    try {
      // Пытаемся открыть в новой вкладке/окне
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      
      if (newWindow) {
        console.log('Telegram channel opened in new window');
      } else {
        // Если popup заблокирован, используем window.location
        window.location.href = url;
        console.log('Redirecting to Telegram channel');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      // Последний fallback - показываем пользователю ссылку
      const confirmed = confirm(`Cannot open link automatically. Would you like to visit: ${url}?`);
      if (confirmed) {
        try {
          window.location.href = url;
        } catch (locationError) {
          console.error('Error with location redirect:', locationError);
          alert(`Please visit: ${url}`);
        }
      }
    }
  };

  return (
    <div className="relative w-full" data-name="Feedback section">
      <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 sm:p-5 relative" data-name="Feedback container">
        <div
          aria-hidden="true"
          className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
        />
        <div className="flex items-start gap-4 mb-4">
          <FeedbackIcon />
          <div className="typography-body text-[#cfcfcf] text-left flex-1">
            <p className="block leading-none">{t('feedback_description')}</p>
          </div>
        </div>
        <FeedbackButton onClick={handleFeedback} />
      </div>
    </div>
  );
}