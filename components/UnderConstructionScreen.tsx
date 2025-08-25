import { useState } from 'react';
import svgPaths from "../imports/svg-nt7wuddmjy";
import { BottomFixedButton } from './BottomFixedButton';

/**
 * Компонент страницы "Under Construction"
 * Основан на импортированном дизайне ErrorPage.tsx
 * Показывается для функций, которые еще не реализованы
 */

interface UnderConstructionScreenProps {
  onBack: () => void;
  featureName?: string; // Название функции, которая в разработке
}

/**
 * Декоративный световой эффект в верхней части экрана
 */
function Light() {
  return (
    <div
      className="absolute h-[130px] top-[-65px] translate-x-[-50%] w-[185px]"
      data-name="Light"
      style={{ left: "calc(50% + 2px)" }}
    >
      <div className="absolute inset-[-196.15%_-137.84%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 695 640">
          <g id="Light">
            <g filter="url(#filter0_f_1_395)" id="Ellipse 2">
              <ellipse cx="347.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_1_395"
              width="695"
              x="0"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_395" stdDeviation="127.5" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

/**
 * Кнопка "Got it" для возврата к профилю
 * Теперь использует стандартный компонент BottomFixedButton
 */
function Button({ onBack }: { onBack: () => void }) {
  return (
    <BottomFixedButton onClick={onBack}>
      Got it
    </BottomFixedButton>
  );
}

/**
 * Иконка с инструментами для "Under Construction"
 */
function Icon() {
  return (
    <div className="relative shrink-0 size-16" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64 64">
        <g id="Icon">
          <path
            d={svgPaths.p1d336100}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5.33333"
          />
          <path
            d={svgPaths.p1f6b3200}
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5.33333"
          />
          <path
            d={svgPaths.p159c2e00}
            id="Vector_3"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5.33333"
          />
          <path
            d={svgPaths.p23c7b580}
            id="Vector_4"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5.33333"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * Блок с заголовком и описанием "Under Construction"
 */
function HeroBlockQuestion({ featureName }: { featureName?: string }) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start leading-[0] p-0 relative shrink-0 text-center w-full"
      data-name="Hero_block_question"
    >
      <div className="font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] font-normal relative shrink-0 text-[#e1ff00] text-[36px] w-full">
        <p className="block leading-[0.8]">Under Construction</p>
      </div>
      <div className="font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] not-italic relative shrink-0 text-[#ffffff] text-[20px] w-full">
        <p className="block leading-none">
          {featureName ? `${featureName} feature` : 'This feature'} is currently being developed by our team. We're working hard to bring you the best experience possible.
        </p>
      </div>
    </div>
  );
}

/**
 * Контейнер с иконкой и текстом
 */
function IconContainer({ featureName }: { featureName?: string }) {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-5 items-center justify-start left-[21px] p-0 top-[294px] w-[351px]"
      data-name="Icon container"
    >
      <Icon />
      <HeroBlockQuestion featureName={featureName} />
    </div>
  );
}

/**
 * SVG символ логотипа
 */
function SymbolBig() {
  return (
    <div className="relative size-full" data-name="Symbol_big">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 13">
        <g id="Symbol_big">
          <path d={svgPaths.p377b7c00} fill="var(--fill-0, #E1FF00)" id="Union" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Название приложения без "beta"
 */
function Menhausen() {
  return (
    <div className="absolute inset-[2.21%_1.17%_7.2%_15.49%]" data-name="Menhausen">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 75 12">
        <g id="Menhausen">
          <path d={svgPaths.p32d14cf0} fill="var(--fill-0, #CFCFCF)" id="Vector" />
          <path d={svgPaths.p1786c280} fill="var(--fill-0, #CFCFCF)" id="Vector_2" />
          <path d={svgPaths.p23ce7e00} fill="var(--fill-0, #CFCFCF)" id="Vector_3" />
          <path d={svgPaths.p35fc2600} fill="var(--fill-0, #CFCFCF)" id="Vector_4" />
          <path d={svgPaths.p30139900} fill="var(--fill-0, #CFCFCF)" id="Vector_5" />
          <path d={svgPaths.p33206e80} fill="var(--fill-0, #CFCFCF)" id="Vector_6" />
          <path d={svgPaths.p2cb2bd40} fill="var(--fill-0, #CFCFCF)" id="Vector_7" />
          <path d={svgPaths.p3436ffe0} fill="var(--fill-0, #CFCFCF)" id="Vector_8" />
          <path d={svgPaths.p2d60800} fill="var(--fill-0, #CFCFCF)" id="Vector_9" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Мини-логотип с символом и названием
 */
function MiniStripeLogo() {
  return (
    <div className="absolute h-[13px] left-[153px] top-[69px] w-[89px]" data-name="Mini_stripe_logo">
      <div className="absolute bottom-0 flex items-center justify-center left-0 right-[91.01%] top-0">
        <div className="flex-none h-[13px] rotate-[180deg] w-2">
          <SymbolBig />
        </div>
      </div>
      <Menhausen />
    </div>
  );
}

/**
 * Кнопка "Назад" с touch-friendly размером
 */
function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="absolute left-[21px] size-12 top-[53px] touch-friendly hover:opacity-80"
      data-name="Back Button"
      aria-label="Go back to profile"
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Back Button">
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
 * Заголовочный блок с логотипом и кнопкой назад
 */
function HeaderBlock({ onBack }: { onBack: () => void }) {
  return (
    <div className="absolute contents left-[21px] top-[53px]" data-name="Header block">
      <MiniStripeLogo />
      <BackButton onBack={onBack} />
    </div>
  );
}

/**
 * Основной компонент страницы "Under Construction"
 */
export function UnderConstructionScreen({ onBack, featureName }: UnderConstructionScreenProps) {
  const [_isLoading, setIsLoading] = useState(false);

  /**
   * Обработчик кнопки "Got it" с анимацией
   */
  const handleBackClick = async () => {
    try {
      console.log(`Leaving Under Construction page for: ${featureName || 'feature'}`);
      setIsLoading(true);

      // Добавляем тактильную обратную связь если доступна
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }

      // Небольшая задержка для UX
      await new Promise(resolve => setTimeout(resolve, 200));

      onBack();
    } catch (error) {
      console.error('Error navigating back from Under Construction:', error);
      onBack(); // Fallback
    } finally {
      setIsLoading(false);
    }
  };

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
            
            {/* Иконка и заголовок */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-8">
                <Icon />
              </div>
              <HeroBlockQuestion featureName={featureName} />
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <Button onBack={onBack} />

    </div>
  );
}