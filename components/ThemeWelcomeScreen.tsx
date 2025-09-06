// Импортируем необходимые хуки и SVG пути
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';

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
      className="absolute h-[100px] sm:h-[120px] md:h-[130px] top-[-50px] sm:top-[-60px] md:top-[-65px] translate-x-[-50%] w-[140px] sm:w-[165px] md:w-[185px]"
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
  themeTitle: _themeTitle, 
  isPremiumTheme = false, 
  userHasPremium = false 
}: ThemeWelcomeScreenProps) {
  const { content } = useContent();
  
  // Определяем, заблокирована ли тема для пользователя
  const isThemeLocked = isPremiumTheme && !userHasPremium;
  
  // Определяем текст кнопки и обработчик клика
  const buttonText = isThemeLocked ? 'Unlock' : 'Start';
  const handleButtonClick = isThemeLocked ? onUnlock : onStart;
  
  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden bg-[#111111] flex flex-col">
      {/* Световые эффекты */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Заголовок */}
            <div className="text-center mb-12">
              <h1 className="font-heading font-normal text-white text-[36px] mb-6 leading-[0.8]">
                {_themeTitle}
              </h1>
              <p className="font-sans text-white text-[20px]">
                {isThemeLocked ? 'Unlock this theme to get started' : content.ui.themes.welcome.subtitle}
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