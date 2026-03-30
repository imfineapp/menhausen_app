import { settingsMessages } from '@/src/i18n/messages/settings';
import { languageModalMessages } from '@/src/i18n/messages/languageModal';
import { useStore } from '@nanostores/react';
// Главный компонент страницы настроек приложения
import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { LanguageModal } from './LanguageModal';
// Импортируем иконки
import { 
  LanguageIcon, 
  InfoIcon, 
  PrivacyIcon, 
  TermsIcon, 
  DeleteIcon,
  DonationIcon
} from './UserProfileIcons';
import { SettingsItem } from './UserProfileComponents';
import { Light, MiniStripeLogo } from './ProfileLayoutComponents';

// Типы для пропсов компонента
interface AppSettingsScreenProps {
  onBack: () => void; // Функция для возврата к профилю пользователя
  onShowAboutApp: () => void; // Функция для открытия страницы "О приложении"
  onShowPinSettings: () => void; // Функция для перехода к настройкам PIN кода
  onShowPrivacy: () => void; // Функция для открытия Privacy Policy
  onShowTerms: () => void; // Функция для открытия Terms of Use
  onShowDeleteAccount: () => void; // Функция для перехода к странице удаления аккаунта
  onShowDonations: () => void; // Функция для перехода к странице донатов
}

/**
 * Главный компонент страницы настроек приложения
 * Полностью адаптивный с поддержкой всех устройств и min-h-[44px] min-w-[44px] элементами
 */
export function AppSettingsScreen({ 
  onBack: _onBack, 
  onShowAboutApp, 
  onShowPinSettings, 
  onShowPrivacy, 
  onShowTerms, 
  onShowDeleteAccount,
  onShowDonations
}: AppSettingsScreenProps) {
  // Состояние для настроек
  const [_notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Хуки для управления языком
  const { language, openLanguageModal } = useLanguage();
  const msgs = useStore(settingsMessages);
  const languageMsgs = useStore(languageModalMessages);

  /**
   * Обработчики для различных действий настроек
   */
  const handleLanguage = () => {
    console.log('Opening language selection');
    openLanguageModal();
  };

  const _handleSecurityPin = () => {
    console.log('Opening security PIN settings');
    onShowPinSettings();
  };

  const handleAboutApp = () => {
    console.log('Opening about app');
    onShowAboutApp();
  };

  const handlePrivacyPolicy = () => {
    console.log('Opening privacy policy from settings');
    onShowPrivacy();
  };

  const handleTermsOfUse = () => {
    console.log('Opening terms of use from settings');
    onShowTerms();
  };

  const handleDeleteAccount = () => {
    console.log('Navigating to delete account page from settings');
    onShowDeleteAccount();
  };

  const handleDonation = () => {
    console.log('Opening donation - navigating to Donations');
    onShowDonations();
  };

  const _handleNotificationToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    console.log('Notifications', enabled ? 'enabled' : 'disabled');
  };

  return (
    <div 
      className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden safe-top safe-bottom" 
      data-name="App Settings Page"
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
            
            {/* Секция "Settings" */}
            <div className="flex flex-col gap-4 sm:gap-5 w-full">
              <h2 className="typography-h2 text-[#e1ff00] text-left">{msgs.settings}</h2>
              <div className="flex flex-col w-full">
                <SettingsItem
                  icon={<LanguageIcon />}
                  title={languageMsgs.language}
                  rightElement={
                    <div className="typography-body text-[#ffffff] text-right">
                      <p className="block">{language === 'en' ? languageMsgs.english : languageMsgs.russian}</p>
                    </div>
                  }
                  onClick={handleLanguage}
                />
                {/* Скрыто: настройки уведомлений */}
                {/* <SettingsItem
                  icon={<ReminderIcon />}
                  title={msgs.dailyReminder}
                  rightElement={
                    <Switch 
                      checked={notificationsEnabled} 
                      onCheckedChange={handleNotificationToggle}
                      data-testid="notifications-switch"
                    />
                  }
                /> */}
                {/* Скрыто: настройки PIN */}
                {/* <SettingsItem
                  icon={<SecurityIcon />}
                  title={msgs.securityPin}
                  onClick={handleSecurityPin}
                /> */}
                <SettingsItem
                  icon={<InfoIcon />}
                  title={msgs.aboutApp}
                  onClick={handleAboutApp}
                />
                <SettingsItem
                  icon={<DonationIcon />}
                  title={msgs.makeDonation}
                  onClick={handleDonation}
                />
                <SettingsItem
                  icon={<PrivacyIcon />}
                  title={msgs.privacyPolicy}
                  onClick={handlePrivacyPolicy}
                />
                <SettingsItem
                  icon={<TermsIcon />}
                  title={msgs.termsOfUse}
                  onClick={handleTermsOfUse}
                />
                <SettingsItem
                  icon={<DeleteIcon />}
                  title={msgs.deleteAccount}
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

