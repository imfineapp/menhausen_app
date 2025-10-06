// Главный компонент экрана профиля пользователя с поддержкой Premium статуса
import { useState } from 'react';
import { useLanguage, useTranslation } from './LanguageContext';
import { useContent } from './ContentContext';
import { LanguageModal } from './LanguageModal';
import { Switch } from './ui/switch';

// Импортируем выделенные компоненты
import { 
  UnlockIcon, 
  DonationIcon, 
  ActivityIcon, 
  ShareIcon, 
  LanguageIcon, 
  ReminderIcon, 
  SecurityIcon, 
  InfoIcon, 
  PrivacyIcon, 
  TermsIcon, 
  DeleteIcon
} from './UserProfileIcons';
import { UserInfoSection, SettingsItem } from './UserProfileComponents';
import { FeedbackSection } from './ProfileFeedbackSection';
import { Light, MiniStripeLogo } from './ProfileLayoutComponents';
import { useAppShare } from './ProfileShareUtils';
import { StatusBlocksRow } from './StatusBlocksRow';
import { ProgressBlock } from './ProgressBlock';

// Типы для пропсов компонента
interface UserProfileScreenProps {
  onBack: () => void; // Функция для возврата к главной странице
  onShowAboutApp: () => void; // Функция для открытия страницы "О приложении"
  onShowPinSettings: () => void; // Функция для перехода к настройкам PIN кода
  onShowPrivacy: () => void; // Функция для открытия Privacy Policy
  onShowTerms: () => void; // Функция для открытия Terms of Use
  onShowDeleteAccount: () => void; // Функция для перехода к странице удаления аккаунта
  onShowPayments: () => void; // Функция для перехода к странице покупки Premium подписки
  onShowDonations: () => void; // Функция для перехода к странице донатов
  onShowUnderConstruction: (featureName: string) => void; // Функция для перехода к странице "Under Construction"
  onGoToBadges: () => void; // Функция для перехода к странице достижений
  onGoToLevels: () => void; // Функция для перехода к странице уровней
  userHasPremium: boolean; // Статус Premium подписки пользователя
}

/**
 * Главный компонент страницы профиля пользователя
 * Полностью адаптивный с поддержкой всех устройств и min-h-[44px] min-w-[44px] элементами
 */
export function UserProfileScreen({ 
  onBack: _onBack, 
  onShowAboutApp, 
  onShowPinSettings, 
  onShowPrivacy, 
  onShowTerms, 
  onShowDeleteAccount, 
  onShowPayments, 
  onShowDonations,
  onShowUnderConstruction, 
  onGoToBadges,
  onGoToLevels,
  userHasPremium 
}: UserProfileScreenProps) {
  // Состояние для настроек
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Хуки для управления языком и шарингом
  const { language, openLanguageModal } = useLanguage();
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

  const handleLanguage = () => {
    console.log('Opening language selection');
    openLanguageModal();
  };

  const handleSecurityPin = () => {
    console.log('Opening security PIN settings');
    onShowPinSettings();
  };

  const handleAboutApp = () => {
    console.log('Opening about app');
    onShowAboutApp();
  };

  const handlePrivacyPolicy = () => {
    console.log('Opening privacy policy from profile');
    onShowPrivacy();
  };

  const handleTermsOfUse = () => {
    console.log('Opening terms of use from profile');
    onShowTerms();
  };

  const handleDeleteAccount = () => {
    console.log('Navigating to delete account page');
    onShowDeleteAccount();
  };

  const handleNotificationToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    console.log('Notifications', enabled ? 'enabled' : 'disabled');
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
            
            {/* Информация о пользователе */}
            <UserInfoSection userHasPremium={userHasPremium} />
            
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
            
            {/* Секция "Settings" */}
            <div className="flex flex-col gap-4 sm:gap-5 w-full">
              <h2 className="typography-h2 text-[#e1ff00] text-left">{t('settings')}</h2>
              <div className="flex flex-col w-full">
                <SettingsItem
                  icon={<LanguageIcon />}
                  title={t('language')}
                  rightElement={
                    <div className="typography-body text-[#ffffff] text-right">
                      <p className="block">{language === 'en' ? t('english') : t('russian')}</p>
                    </div>
                  }
                  onClick={handleLanguage}
                />
                <SettingsItem
                  icon={<ReminderIcon />}
                  title={t('daily_reminder')}
                  rightElement={
                    <Switch 
                      checked={notificationsEnabled} 
                      onCheckedChange={handleNotificationToggle}
                      data-testid="notifications-switch"
                    />
                  }
                />
                <SettingsItem
                  icon={<SecurityIcon />}
                  title={t('security_pin')}
                  onClick={handleSecurityPin}
                />
                <SettingsItem
                  icon={<InfoIcon />}
                  title={t('about_app')}
                  onClick={handleAboutApp}
                />
                <SettingsItem
                  icon={<PrivacyIcon />}
                  title={t('privacy_policy')}
                  onClick={handlePrivacyPolicy}
                />
                <SettingsItem
                  icon={<TermsIcon />}
                  title={t('terms_of_use')}
                  onClick={handleTermsOfUse}
                />
                <SettingsItem
                  icon={<DeleteIcon />}
                  title={t('delete_account')}
                  onClick={handleDeleteAccount}
                  isHighlighted={true}
                />
              </div>
            </div>
          </div>
        </div>
      
        {/* Модальное окно выбора языка */}
        <LanguageModal />
      </div>
    </div>
  );
}