// Импортируем необходимые хуки и SVG пути
import { BottomFixedButton } from "./BottomFixedButton";
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';

// Типы для пропсов компонента
interface CardWelcomeScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
  onNext: () => void; // Функция для перехода к следующему экрану (упражнению)
  cardId: string; // ID карточки
  cardTitle?: string; // Название карточки (опционально)
  cardDescription?: string; // Описание карточки (опционально)
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
 * Адаптивный компонент символа логотипа
 */

/**
 * Адаптивный компонент названия приложения с версией beta
 */

/**
 * Адаптивный мини-логотип с символом и названием
 */




/**
 * Адаптивный текстовый блок с описанием карточки
 */
function CardDescription({ description: _description }: { description: string }) {
  const { content } = useContent();
  
  return (
    <div 
      className="absolute left-1/2 top-[310px] sm:top-[330px] md:top-[347px] translate-x-[-50%] w-full max-w-[351px] px-4 sm:px-6 md:px-0"
      data-name="Card Description"
    >
      <div className="typography-body h-auto min-h-[60px] sm:min-h-[70px] md:min-h-[89px] text-[#ffffff] text-center">
        <p className="block">{content.ui.cards.welcome.subtitle}</p>
      </div>
    </div>
  );
}

/**
 * Главный компонент стартовой страницы карточки
 * Адаптивный дизайн с поддержкой mobile-first подхода
 */
export function CardWelcomeScreen({ onBack, onNext, cardId, cardTitle: _cardTitle, cardDescription }: CardWelcomeScreenProps) {
  // Описание по умолчанию, если не передано
  const defaultDescription = "Difficulties with others often start with uncertainty in oneself. Let's figure out what exactly is bothering us.";
  
  /**
   * Функция для обработки кнопки "Next"
   * Переходит к упражнению карточки
   */
  const handleNext = () => {
    console.log(`Starting exercise for card: ${cardId}`);
    onNext();
  };

  /**
   * Функция для обработки кнопки "Back" 
   * Возвращается к предыдущему экрану
   */
  const _handleBack = () => {
    console.log(`Going back from card welcome: ${cardId}`);
    onBack();
  };

  return (
    <div 
      className="bg-[#111111] relative size-full min-h-screen" 
      data-name="Card Welcome Page"
    >
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Мини-логотип */}
      <MiniStripeLogo />
      
      {/* Текстовое описание карточки */}
      <CardDescription 
        description={cardDescription || defaultDescription}
      />
      
      {/* Bottom Fixed CTA Button согласно Guidelines.md */}
      <BottomFixedButton onClick={handleNext}>
        Next
      </BottomFixedButton>
    </div>
  );
}