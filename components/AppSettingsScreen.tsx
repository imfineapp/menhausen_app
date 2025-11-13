// Главный компонент страницы настроек приложения
import { useState } from 'react';
import { useLanguage, useTranslation } from './LanguageContext';
import { LanguageModal } from './LanguageModal';
import { Switch } from './ui/switch';

// Импортируем иконки
import { 
  LanguageIcon, 
  ReminderIcon, 
  SecurityIcon, 
  InfoIcon, 
  PrivacyIcon, 
  TermsIcon, 
  DeleteIcon
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
  onShowDeleteAccount
}: AppSettingsScreenProps) {
  // Состояние для настроек
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Хуки для управления языком
  const { language, openLanguageModal } = useLanguage();
  const { t } = useTranslation();

  /**
   * Обработчики для различных действий настроек
   */
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

  const handleNotificationToggle = (enabled: boolean) => {
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

