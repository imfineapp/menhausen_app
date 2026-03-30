// Импортируем необходимые хуки и SVG пути
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { Light } from './Light';
import { useStore } from '@nanostores/react';
import { useContent } from './ContentContext';
import { homeMessages } from '@/src/i18n/messages/home';
import { themesMessages } from '@/src/i18n/messages/themes';
import { ThemeCardManager } from '../utils/ThemeCardManager';

// Типы для пропсов компонента
interface ThemeWelcomeScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
  onStart: () => void; // Функция для начала работы с темой
  onUnlock: () => void; // Функция для перехода к покупке Premium подписки
  themeTitle?: string; // Название темы (опционально, но больше не используется в новом Container)
  isPremiumTheme?: boolean; // Является ли тема Premium контентом
  userHasPremium?: boolean; // Есть ли у пользователя Premium подписка
}

/**
 * Адаптивный компонент световых эффектов для фона
 */
// Light переиспользуется из общего компонента

/**
 * Кнопка действия (Start/Unlock) согласно Bottom Fixed CTA Button стандарту
 * Теперь использует стандартный компонент BottomFixedButton
 */
function ActionButton({ 
  onClick, 
  isLocked, 
  buttonText: _buttonText 
}: { 
  onClick: () => void; 
  isLocked: boolean; 
  buttonText: string; 
}) {
  const themes = useStore(themesMessages);
  
  return (
    <BottomFixedButton 
      onClick={onClick}
      className={isLocked ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
    >
      {isLocked ? themes.welcome.unlock : themes.welcome.start}
    </BottomFixedButton>
  );
}



/**
 * Главный компонент стартовой страницы темы
 * Адаптивный дизайн с поддержкой mobile-first подхода и идеальным центрированием
 * Поддерживает Premium темы с ограничением доступа для пользователей без подписки
 */
export function ThemeWelcomeScreen({ 
  onBack: _onBack, 
  onStart, 
  onUnlock, 
  themeTitle, 
  isPremiumTheme = false, 
  userHasPremium = false 
}: ThemeWelcomeScreenProps) {
  const { getTheme, getLocalizedText } = useContent();
  const home = useStore(homeMessages);
  const themes = useStore(themesMessages);
  
  // Получаем данные темы
  const themeData = themeTitle ? getTheme(themeTitle) : null;
  
  // Определяем ID всех карточек в теме (упорядоченный список)
  const allCardIds: string[] = themeData
    ? (Array.isArray((themeData as any).cards)
        ? (themeData as any).cards.map((c: any) => c.id)
        : Array.isArray((themeData as any).cardIds)
          ? (themeData as any).cardIds
          : [])
    : [];

  // Проверяем, должна ли показываться приветственная страница
  const shouldShowWelcome = ThemeCardManager.shouldShowWelcomeScreen(themeTitle || home.themesTitle, allCardIds);
  
  // Определяем, заблокирована ли тема для пользователя
  const isThemeLocked = isPremiumTheme && !userHasPremium;
  
  // Если первая карточка уже завершена, не показываем приветственную страницу
  if (!shouldShowWelcome) {
    // Перенаправляем на главную страницу темы
    onStart();
    return null;
  }
  
  // Определяем текст кнопки и обработчик клика
  const buttonText = isThemeLocked ? 'Unlock' : 'Start';
  const handleButtonClick = isThemeLocked ? onUnlock : onStart;
  
  // Получаем приветственное сообщение темы или используем общий текст
  const welcomeMessage = themeData?.welcomeMessage || themes.welcome.subtitle;
  
  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden overflow-x-hidden bg-bg-primary flex flex-col">
      {/* Световые эффекты */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] pb-[200px] h-full flex items-center justify-center">
          <div className="max-w-[351px] mx-auto">
            
            {/* Заголовок */}
            <div className="text-center">
              <h1 className="typography-h1 text-brand-primary mb-6">
                {themeData ? themeData.title : themeTitle}
              </h1>
              <p className="typography-body text-white">
                {isThemeLocked 
                  ? (themes.welcome.lockedSubtitle ?? themes.welcome.subtitle) 
                  : welcomeMessage}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <ActionButton 
        onClick={handleButtonClick} 
        isLocked={isThemeLocked} 
        buttonText={buttonText} 
      />

    </div>
  );
}