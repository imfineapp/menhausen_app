// Главный компонент экрана профиля пользователя с поддержкой Premium статуса
import { useTranslation } from './LanguageContext';
import { useContent } from './ContentContext';

// Импортируем выделенные компоненты
import { 
  UnlockIcon, 
  DonationIcon, 
  ActivityIcon, 
  ShareIcon,
  SettingsIcon
} from './UserProfileIcons';
import { UserInfoSection, SettingsItem } from './UserProfileComponents';
import { FeedbackSection } from './ProfileFeedbackSection';
import { ReferralSection } from './ProfileReferralSection';
import { Light, MiniStripeLogo } from './ProfileLayoutComponents';
import { useAppShare } from './ProfileShareUtils';
import { StatusBlocksRow } from './StatusBlocksRow';
import { ProgressBlock } from './ProgressBlock';

// Типы для пропсов компонента
interface UserProfileScreenProps {
  onBack: () => void; // Функция для возврата к главной странице
  onShowPayments: () => void; // Функция для перехода к странице покупки Premium подписки
  onShowDonations: () => void; // Функция для перехода к странице донатов
  onShowUnderConstruction: (featureName: string) => void; // Функция для перехода к странице "Under Construction"
  onGoToBadges: () => void; // Функция для перехода к странице достижений
  onGoToLevels: () => void; // Функция для перехода к странице уровней
  onShowSettings: () => void; // Функция для перехода к странице настроек приложения
  userHasPremium: boolean; // Статус Premium подписки пользователя
}

/**
 * Главный компонент страницы профиля пользователя
 * Полностью адаптивный с поддержкой всех устройств и min-h-[44px] min-w-[44px] элементами
 */
export function UserProfileScreen({ 
  onBack: _onBack, 
  onShowPayments, 
  onShowDonations,
  onShowUnderConstruction, 
  onGoToBadges,
  onGoToLevels,
  onShowSettings,
  userHasPremium 
}: UserProfileScreenProps) {
  // Хуки для шаринга
  const { t } = useTranslation();
  const { getUI } = useContent();
  const { handleShare } = useAppShare();
  
  // Получаем переводы UI
  const _ui = getUI();

  /**
   * Обработчики для различных действий профиля
   */

  const handleUnlockThemes = () => {
    console.log('Opening unlock themes - redirecting to Premium purchase');
    onShowPayments();
  };

  const handleDonation = () => {
    console.log('Opening donation - navigating to Donations');
    onShowDonations();
  };

  const handleActivity = () => {
    console.log('Opening activity - redirecting to Under Construction');
    onShowUnderConstruction('Your activity');
  };

  const handleStatusBlockBadges = () => {
    console.log('Status block badges clicked - navigating to badges');
    onGoToBadges();
  };

  const handleStatusBlockLevel = () => {
    console.log('Status block level clicked - navigating to levels');
    onGoToLevels();
  };

  const handleStatusBlockStatus = () => {
    console.log('Status block status clicked - redirecting to Under Construction');
    onShowUnderConstruction('How are you status');
  };

  return (
    <div 
      className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden safe-top safe-bottom" 
      data-name="User Profile Page"
      style={{
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px]">
          {/* Основной контент */}
          <div className="flex flex-col gap-8 sm:gap-10 w-full max-w-[351px] mx-auto pb-6 sm:pb-8">
            
            {/* Информация о пользователе с иконкой настроек */}
            <div className="relative w-full">
              <UserInfoSection userHasPremium={userHasPremium} />
              {/* Иконка настроек в правой части на уровне верхней границы UserAvatar */}
              <button
                onClick={onShowSettings}
                className="absolute top-0 right-0 flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer hover:opacity-80 transition-opacity"
                data-name="Settings icon button"
                aria-label="Settings"
              >
                <SettingsIcon />
              </button>
            </div>
            
            {/* Ряд статусных блоков */}
            <div className="w-full mt-6 sm:mt-8">
              <StatusBlocksRow 
                onBadgesClick={handleStatusBlockBadges}
                onLevelClick={handleStatusBlockLevel}
                onStatusClick={handleStatusBlockStatus}
              />
            </div>
            
            {/* Блок прогресса */}
            <div className="w-full mt-3 sm:mt-4">
              <ProgressBlock onBadgesClick={handleStatusBlockBadges} />
            </div>
            
            {/* Секция реферальной программы */}
            <div className="w-full mt-3 sm:mt-4">
              <ReferralSection />
            </div>
            
            {/* Меню без заголовка с отступом 40px */}
            <div className="flex flex-col gap-4 sm:gap-5 w-full mt-10">
              <div className="flex flex-col w-full">
                <SettingsItem
                  icon={<UnlockIcon />}
                  title={t('unlock_all_themes')}
                  onClick={handleUnlockThemes}
                  isHighlighted={true}
                />
                <SettingsItem
                  icon={<DonationIcon />}
                  title={t('make_donation')}
                  onClick={handleDonation}
                />
                <SettingsItem
                  icon={<ActivityIcon />}
                  title={t('your_activity')}
                  onClick={handleActivity}
                />
                <SettingsItem
                  icon={<ShareIcon />}
                  title={t('share_app_to_friend')}
                  onClick={handleShare}
                  isHighlighted={true}
                />
              </div>
            </div>
            
            {/* Секция обратной связи */}
            <FeedbackSection />
          </div>
        </div>
      </div>
    </div>
  );
}