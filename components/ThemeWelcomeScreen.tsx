// Импортируем необходимые хуки и SVG пути
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';
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
function Light() {
  return (
    <div
      className="absolute h-[100px] sm:h-[120px] md:h-[130px] top-[-50px] sm:top-[-60px] md:top-[-65px] translate-x-[-50%] w-[140px] sm:w-[165px] md:w-[185px] overflow-hidden"
      data-name="Light"
      style={{ left: "calc(50% + 1px)" }}
    >
      <div className="absolute inset-[-196.15%_-137.84%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 695 640">
          <g id="Light">
            <g filter="url(#filter0_f_13_381)" id="Ellipse 2">
              <ellipse cx="347.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_13_381"
              width="695"
              x="0"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_13_381" stdDeviation="127.5" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

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
  const { content } = useContent();
  
  return (
    <BottomFixedButton 
      onClick={onClick}
      className={isLocked ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
    >
      {isLocked ? content.ui.themes.welcome.unlock : content.ui.themes.welcome.start}
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
  const { content, getTheme, getLocalizedText } = useContent();
  
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
  const shouldShowWelcome = ThemeCardManager.shouldShowWelcomeScreen(themeTitle || "Stress", allCardIds);
  
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
  const welcomeMessage = themeData?.welcomeMessage || getLocalizedText(content.ui.themes.welcome.subtitle);
  
  // Отладочная информация
  console.log('ThemeWelcomeScreen Debug:', {
    themeTitle,
    themeData,
    welcomeMessage,
    isThemeLocked,
    shouldShowWelcome
  });
  
  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden overflow-x-hidden bg-[#111111] flex flex-col">
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
              <h1 className="typography-h1 text-[#e1ff00] mb-6">
                {themeData ? themeData.title : themeTitle}
              </h1>
              <p className="typography-body text-white">
                {isThemeLocked ? 'Unlock this theme to get started' : welcomeMessage}
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