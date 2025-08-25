// Импортируем необходимые хуки и SVG пути
import svgPaths from "../imports/svg-9v3gqqhb3l";
import { BottomFixedButton } from './BottomFixedButton';

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
  buttonText 
}: { 
  onClick: () => void; 
  isLocked: boolean; 
  buttonText: string; 
}) {
  return (
    <BottomFixedButton 
      onClick={onClick}
      className={isLocked ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
    >
      {buttonText}
    </BottomFixedButton>
  );
}

/**
 * Адаптивный компонент символа логотипа
 */
function SymbolBig() {
  return (
    <div className="h-[10px] sm:h-[12px] md:h-[13px] relative w-[6px] sm:w-[7px] md:w-2" data-name="Symbol_big">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 13">
        <g id="Symbol_big">
          <path d={svgPaths.p377b7c00} fill="var(--fill-0, #E1FF00)" id="Union" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Адаптивный компонент названия приложения с версией beta
 */
function MenhausenBeta() {
  return (
    <div className="absolute inset-[2.21%_6.75%_7.2%_10.77%]" data-name="Menhausen beta">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 106 12">
        <g id="Menhausen beta">
          <path d={svgPaths.p25a36300} fill="var(--fill-0, #E1FF00)" id="Vector" />
          <path d={svgPaths.p1120ed00} fill="var(--fill-0, #E1FF00)" id="Vector_2" />
          <path d={svgPaths.p33898780} fill="var(--fill-0, #E1FF00)" id="Vector_3" />
          <path d={svgPaths.p9060800} fill="var(--fill-0, #E1FF00)" id="Vector_4" />
          <path d={svgPaths.p32d14cf0} fill="var(--fill-0, #CFCFCF)" id="Vector_5" />
          <path d={svgPaths.p1786c280} fill="var(--fill-0, #CFCFCF)" id="Vector_6" />
          <path d={svgPaths.p23ce7e00} fill="var(--fill-0, #CFCFCF)" id="Vector_7" />
          <path d={svgPaths.p35fc2600} fill="var(--fill-0, #CFCFCF)" id="Vector_8" />
          <path d={svgPaths.p30139900} fill="var(--fill-0, #CFCFCF)" id="Vector_9" />
          <path d={svgPaths.p33206e80} fill="var(--fill-0, #CFCFCF)" id="Vector_10" />
          <path d={svgPaths.p2cb2bd40} fill="var(--fill-0, #CFCFCF)" id="Vector_11" />
          <path d={svgPaths.p3436ffe0} fill="var(--fill-0, #CFCFCF)" id="Vector_12" />
          <path d={svgPaths.p296762f0} fill="var(--fill-0, #CFCFCF)" id="Vector_13" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Адаптивный мини-логотип с символом и названием - центрированный
 */
function MiniStripeLogo() {
  return (
    <div className="absolute h-[10px] sm:h-[12px] md:h-[13px] left-1/2 transform -translate-x-1/2 top-[60px] sm:top-[65px] md:top-[69px] w-[80px] sm:w-[100px] md:w-32" data-name="Mini_stripe_logo">
      <div className="absolute flex h-[10px] sm:h-[12px] md:h-[13px] items-center justify-center left-0 top-1/2 translate-y-[-50%] w-[6px] sm:w-[7px] md:w-2">
        <div className="flex-none rotate-[180deg]">
          <SymbolBig />
        </div>
      </div>
      <MenhausenBeta />
    </div>
  );
}

/**
 * Адаптивная кнопка возврата к предыдущему экрану
 */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute left-4 sm:left-6 md:left-[21px] size-12 top-[53px] cursor-pointer hover:opacity-80 min-h-[44px] min-w-[44px]"
      data-name="Back button"
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Back button">
          <path
            d="M17 36L5 24L17 12"
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </button>
  );
}

/**
 * Главный компонент стартовой страницы темы
 * Адаптивный дизайн с поддержкой mobile-first подхода и идеальным центрированием
 * Поддерживает Premium темы с ограничением доступа для пользователей без подписки
 */
export function ThemeWelcomeScreen({ 
  onBack, 
  onStart, 
  onUnlock, 
  themeTitle: _themeTitle, 
  isPremiumTheme = false, 
  userHasPremium = false 
}: ThemeWelcomeScreenProps) {
  
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
      
      {/* Кнопка назад */}
      <BackButton onClick={onBack} />
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[120px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Заголовок */}
            <div className="text-center mb-12">
              <h1 className="font-heading font-normal text-white text-[36px] mb-6 leading-[0.8]">
                {_themeTitle}
              </h1>
              <p className="font-sans text-white text-[20px]">
                {isThemeLocked ? 'Unlock this theme to get started' : 'Ready to begin your journey?'}
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