// Компонент секции реферальной программы - приглашение друзей
import { ShareIcon } from './UserProfileIcons';
import { useTranslation, useLanguage } from './LanguageContext';
import { generateReferralLink } from '../utils/referralUtils';
import { getTelegramUserId } from '../utils/telegramUserUtils';

/**
 * Кнопка "Поделиться" для реферальной программы
 */
function ReferralButton({ onClick }: { onClick?: () => void }) {
  const { language } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return language === 'ru' ? ruText : enText;
  };
  
  return (
    <button
      onClick={onClick}
      className="bg-[#e1ff00] h-[44px] sm:h-[46px] rounded-xl w-full cursor-pointer min-h-[44px] min-w-[44px] hover:bg-[#d1ef00]"
      data-name="Referral share button"
    >
      <div className="flex items-center justify-center w-full h-full px-4">
        <div className="typography-caption text-[#2d2b2b] text-center">
          <p className="adjustLetterSpacing block leading-[14px] sm:leading-[16px]">{getText('Поделиться ссылкой', 'Share Link')}</p>
        </div>
      </div>
    </button>
  );
}

/**
 * Компонент секции реферальной программы
 */
export function ReferralSection() {
  const { t: _t } = useTranslation();
  const { language } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return language === 'ru' ? ruText : enText;
  };
  
  const handleReferralShare = () => {
    console.log('Opening referral share');
    
    const referralLink = generateReferralLink();
    const userId = getTelegramUserId();
    
    // Логирование для отладки
    console.log('Referral share handler called:');
    console.log('  - User ID:', userId);
    console.log('  - Generated referral link:', referralLink);
    
    // Используем реферальную ссылку, если она была сгенерирована
    const shareUrl = referralLink.includes('startapp=') ? referralLink : 'https://t.me/menhausen_bot/app';
    
    // Создаем текст для шаринга
    const shareText = getText(
      'Присоединяйся ко мне в Menhausen - приложении для заботы о ментальном здоровье!',
      'Join me in Menhausen - a mental health care app!'
    );
    
    // Формируем URL для шаринга через Telegram
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    
    // Проверяем, доступен ли Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      try {
        // Используем Telegram WebApp API для открытия ссылки
        window.Telegram.WebApp.openTelegramLink(telegramShareUrl);
        
        console.log('Referral link opened via WebApp API');
        
        // Вибрация для тактильного отклика при открытии ссылки
        if (window.Telegram.WebApp.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
        
      } catch (error) {
        console.error('Error opening referral link via WebApp API:', error);
        // Fallback на обычное открытие ссылки
        fallbackOpenLink(telegramShareUrl);
      }
    } else {
      // Fallback если не в Telegram WebApp
      fallbackOpenLink(telegramShareUrl);
    }
  };

  /**
   * Fallback метод для открытия ссылки вне Telegram WebApp
   */
  const fallbackOpenLink = (url: string) => {
    try {
      // Пробуем открыть ссылку в новой вкладке/окне
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      
      if (newWindow) {
        console.log('Referral link opened in new window');
      } else {
        // Если popup заблокирован, используем window.location
        window.location.href = url;
        console.log('Redirecting to referral share');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      // Последний fallback - запрашиваем подтверждение и перенаправляем
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
    <div className="relative w-full" data-name="Referral section">
      <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 sm:p-5 relative" data-name="Referral container">
        <div
          aria-hidden="true"
          className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
        />
        <div className="flex items-start gap-4 mb-4">
          <ShareIcon />
          <div className="typography-body text-[#cfcfcf] text-left flex-1">
            <p className="block leading-none">{getText('Пригласи друзей через реферальную ссылку и получи новые достижения, когда они присоединятся к приложению!', 'Invite friends via referral link and earn new achievements when they join the app!')}</p>
          </div>
        </div>
        <ReferralButton onClick={handleReferralShare} />
      </div>
    </div>
  );
}


