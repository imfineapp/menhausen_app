// Главный компонент экрана профиля пользователя с поддержкой Premium статуса
import { useState } from 'react';
import { useLanguage, useTranslation } from './LanguageContext';
import { LanguageModal } from './LanguageModal';
import { Switch } from './ui/switch';

// Импортируем выделенные компоненты
import { 
  BadgeIcon, 
  LevelIcon, 
  MentalStatusIcon, 
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
import { UserInfoSection, SeparationLine, SettingsItem } from './UserProfileComponents';
import { FeedbackSection } from './ProfileFeedbackSection';
import { Light, MiniStripeLogo } from './ProfileLayoutComponents';
import { useAppShare } from './ProfileShareUtils';

// Типы для пропсов компонента
interface UserProfileScreenProps {
  onBack: () => void; // Функция для возврата к главной странице
  onShowAboutApp: () => void; // Функция для открытия страницы "О приложении"
  onShowPinSettings: () => void; // Функция для перехода к настройкам PIN кода
  onShowPrivacy: () => void; // Функция для открытия Privacy Policy
  onShowTerms: () => void; // Функция для открытия Terms of Use
  onShowDeleteAccount: () => void; // Функция для перехода к странице удаления аккаунта
  onShowPayments: () => void; // Функция для перехода к странице покупки Premium подписки
  onShowUnderConstruction: (featureName: string) => void; // Функция для перехода к странице "Under Construction"
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
  onShowUnderConstruction, 
  userHasPremium 
}: UserProfileScreenProps) {
  // Состояние для настроек
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Хуки для управления языком и шарингом
  const { language, openLanguageModal } = useLanguage();
  const { t: _t } = useTranslation();
  const { handleShare } = useAppShare();

  /**
   * Обработчики для различных действий профиля
   */
  const handleBadges = () => {
    console.log('Opening badges - redirecting to Under Construction');
    onShowUnderConstruction('Badges');
  };

  const handleYourLevel = () => {
    console.log('Opening level details - redirecting to Under Construction');  
    onShowUnderConstruction('Your level');
  };

  const handleMentalStatus = () => {
    console.log('Opening mental status - redirecting to Under Construction');
    onShowUnderConstruction('How are you status');
  };

  const handleUnlockThemes = () => {
    console.log('Opening unlock themes - redirecting to Premium purchase');
    onShowPayments();
  };

  const handleDonation = () => {
    console.log('Opening donation - redirecting to Under Construction');
    onShowUnderConstruction('Make donation');
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

  return (
    <div 
      className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto safe-top safe-bottom" 
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
      
      {/* Основной контент */}
      <div className="flex flex-col gap-8 sm:gap-10 px-4 sm:px-6 md:px-[21px] pt-[100px] w-full max-w-[351px] mx-auto pb-6 sm:pb-8">
        
        {/* Информация о пользователе */}
        <UserInfoSection userHasPremium={userHasPremium} />
        
        {/* Разделительная линия */}
        <div className="w-full mt-8 sm:mt-10">
          <SeparationLine />
        </div>
        
        {/* Секция "Your status" */}
        <div className="flex flex-col gap-4 sm:gap-5 w-full">
          <div className="font-heading text-[22px] sm:text-[24px] text-[#e1ff00] text-left">
            <p className="block leading-[0.8]">Your status</p>
          </div>
          <div className="flex flex-col w-full">
            <SettingsItem
              icon={<BadgeIcon />}
              title="Badges"
              onClick={handleBadges}
            />
            <SettingsItem
              icon={<LevelIcon />}
              title="Your level"
              onClick={handleYourLevel}
            />
            <SettingsItem
              icon={<MentalStatusIcon />}
              title="How are you status"
              onClick={handleMentalStatus}
            />
            <SettingsItem
              icon={<UnlockIcon />}
              title="Unlock all themes & cards"
              onClick={handleUnlockThemes}
            />
            <SettingsItem
              icon={<DonationIcon />}
              title="Make donation"
              onClick={handleDonation}
            />
            <SettingsItem
              icon={<ActivityIcon />}
              title="Your activity"
              onClick={handleActivity}
            />
            <SettingsItem
              icon={<ShareIcon />}
              title="Share app to friend"
              onClick={handleShare}
              isHighlighted={true}
            />
          </div>
        </div>
        
        {/* Секция обратной связи */}
        <FeedbackSection />
        
        {/* Секция "Settings" */}
        <div className="flex flex-col gap-4 sm:gap-5 w-full">
          <div className="font-heading text-[22px] sm:text-[24px] text-[#e1ff00] text-left">
            <p className="block leading-[0.8]">Settings</p>
          </div>
          <div className="flex flex-col w-full">
            <SettingsItem
              icon={<LanguageIcon />}
              title="Language"
              rightElement={
                <div className="font-sans text-[18px] sm:text-[20px] text-[#ffffff] text-right">
                  <p className="block leading-none">{language === 'en' ? 'English' : 'Русский'}</p>
                </div>
              }
              onClick={handleLanguage}
            />
            <SettingsItem
              icon={<ReminderIcon />}
              title="Daily reminder"
              rightElement={
                <Switch 
                  checked={notificationsEnabled} 
                  onCheckedChange={handleNotificationToggle}
                  className="data-[state=checked]:bg-[#e1ff00] data-[state=unchecked]:bg-[#2d2b2b] h-5 w-9 min-h-[44px] min-w-[44px]"
                  data-testid="notifications-switch"
                />
              }
            />
            <SettingsItem
              icon={<SecurityIcon />}
              title="Security PIN"
              onClick={handleSecurityPin}
            />
            <SettingsItem
              icon={<InfoIcon />}
              title="About app"
              onClick={handleAboutApp}
            />
            <SettingsItem
              icon={<PrivacyIcon />}
              title="Privacy policy"
              onClick={handlePrivacyPolicy}
            />
            <SettingsItem
              icon={<TermsIcon />}
              title="Terms of use"
              onClick={handleTermsOfUse}
            />
            <SettingsItem
              icon={<DeleteIcon />}
              title="Delete account"
              onClick={handleDeleteAccount}
              isHighlighted={true}
            />
          </div>
        </div>
      </div>
      
      {/* Модальное окно выбора языка */}
      <LanguageModal />
    </div>
  );
}