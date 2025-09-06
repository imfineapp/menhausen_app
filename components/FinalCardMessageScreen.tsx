// Импортируем необходимые хуки и SVG пути
// import { useState } from 'react';
import { useTranslation } from './LanguageContext';
import { BottomFixedButton } from "./BottomFixedButton";
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';

// Типы для пропсов компонента
interface FinalCardMessageScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
  onNext: () => void; // Функция для перехода к следующему экрану
  cardId: string; // ID карточки
  cardTitle?: string; // Название карточки (опционально)
  finalMessage?: string; // Итоговое сообщение (опционально)
  practiceTask?: string; // Задание для практики (опционально)
  whyExplanation?: string; // Объяснение "Почему" (опционально)
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
 * Адаптивный контентный блок с итоговым сообщением
 */
function Container({ finalMessage, practiceTask, whyExplanation }: { 
  finalMessage: string; 
  practiceTask: string; 
  whyExplanation: string; 
}) {
  const { content } = useContent();
  
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-5 items-center justify-center leading-[0] left-1/2 transform -translate-x-1/2 p-0 top-[210px] sm:top-[230px] md:top-[241px] w-full max-w-[351px] px-4 sm:px-6 md:px-0"
      data-name="Container"
    >
      {/* Заголовок с итоговым сообщением */}
      <div className="font-heading font-normal relative shrink-0 text-[#e1ff00] text-[22px] sm:text-[23px] md:text-[24px] w-full text-center">
        <p className="block leading-[0.8]">
          {finalMessage}
        </p>
      </div>
      
      {/* Блок с задачами и объяснением */}
      <div className="font-sans not-italic relative shrink-0 text-[#ffffff] w-full text-center">
        {/* Практическое задание */}
        <p className="block leading-none mb-0 text-[18px] sm:text-[19px] md:text-[20px]">
          {practiceTask}
        </p>
        <p className="block leading-none mb-0 text-[18px] sm:text-[19px] md:text-[20px]">&nbsp;</p>
        
        {/* Объяснение "Почему" */}
        <p className="leading-none text-[18px] sm:text-[19px] md:text-[20px]">
          <span className="text-[#e1ff00]">{content.ui.cards.final.why}</span>
          <span> {whyExplanation}</span>
        </p>
      </div>
    </div>
  );
}



/**
 * Главный компонент экрана итогового сообщения карточки
 * Адаптивный дизайн с поддержкой mobile-first подхода
 */
export function FinalCardMessageScreen({ 
  onBack, 
  onNext, 
  cardId, 
  cardTitle: _cardTitle, 
  finalMessage, 
  practiceTask, 
  whyExplanation 
}: FinalCardMessageScreenProps) {
  const { t } = useTranslation();
  
  // Сообщения по умолчанию, если не переданы
  const defaultFinalMessage = "Awareness of expectations reduces the automaticity of emotional reactions.";
  const defaultPracticeTask = "Track 3 irritating reactions over the course of a week and write down what you expected to happen at those moments.";
  const defaultWhyExplanation = "You learn to distinguish people's behavior from your own projections.";
  
  /**
   * Функция для обработки кнопки "Next"
   * Переходит к следующему экрану (обычно возврат к деталям карточки)
   */
  const handleNext = () => {
    console.log(`Completing final message for card: ${cardId}`);
    onNext();
  };

  /**
   * Функция для обработки кнопки "Back" 
   * Возвращается к предыдущему экрану (второй вопрос)
   */
  const _handleBack = () => {
    console.log(`Going back from final message for card: ${cardId}`);
    onBack();
  };

  return (
    <div 
      className="bg-[#111111] relative size-full min-h-screen" 
      data-name="Final card message"
    >
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Мини-логотип */}
      <MiniStripeLogo />
      
      {/* Контентный блок с итоговым сообщением */}
      <Container 
        finalMessage={finalMessage || defaultFinalMessage}
        practiceTask={practiceTask || defaultPracticeTask}
        whyExplanation={whyExplanation || defaultWhyExplanation}
      />
      
      {/* Bottom Fixed CTA Button согласно Guidelines.md */}
      <BottomFixedButton onClick={handleNext}>
        {t('next')}
      </BottomFixedButton>
    </div>
  );
}