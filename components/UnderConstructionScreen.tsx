import { useState } from 'react';
import svgPaths from "../imports/svg-bamg6d8zx5";
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { useLanguage } from './LanguageContext';

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
  const { language } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return language === 'ru' ? ruText : enText;
  };
  
  return (
    <BottomFixedButton onClick={onBack}>
      {getText('Понятно', 'Got it')}
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
  const { language } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return language === 'ru' ? ruText : enText;
  };
  
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start leading-[0] p-0 relative shrink-0 text-center w-full"
      data-name="Hero_block_question"
    >
      <div className="typography-h1 text-[#e1ff00] w-full">
        <h1 className="block">{getText('В разработке', 'Under Construction')}</h1>
      </div>
      <div className="typography-body text-[#ffffff] w-full">
        <p className="block leading-none">
          {featureName 
            ? getText(`Функция "${featureName}"`, `"${featureName}" feature`)
            : getText('Эта функция', 'This feature')
          } {getText('в настоящее время разрабатывается нашей командой. Мы усердно работаем, чтобы предоставить вам лучший опыт.', 'is currently being developed by our team. We\'re working hard to bring you the best experience possible.')}
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
      className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-0 w-full"
      data-name="Icon container"
    >
      <Icon />
      <HeroBlockQuestion featureName={featureName} />
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
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[90px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Контейнер с иконкой и текстом */}
            <IconContainer featureName={featureName} />

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <Button onBack={handleBackClick} />

    </div>
  );
}