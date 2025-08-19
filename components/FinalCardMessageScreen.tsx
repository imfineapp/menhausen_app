// Импортируем необходимые хуки и SVG пути
// import { useState } from 'react';
import svgPaths from "../imports/svg-qmw9c7g6l8";
import { BottomFixedButton } from "./BottomFixedButton";

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
 * Адаптивный символ логотипа
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
 * Адаптивный мини-логотип с символом и названием
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
      className="absolute left-4 sm:left-6 md:left-[21px] size-12 top-[53px] cursor-pointer hover:opacity-80 touch-friendly"
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
 * Адаптивный контентный блок с итоговым сообщением
 */
function Container({ finalMessage, practiceTask, whyExplanation }: { 
  finalMessage: string; 
  practiceTask: string; 
  whyExplanation: string; 
}) {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-5 items-center justify-center leading-[0] left-1/2 transform -translate-x-1/2 p-0 top-[200px] sm:top-[220px] md:top-[231px] w-full max-w-[351px] px-4 sm:px-6 md:px-0"
      data-name="Container"
    >
      {/* Заголовок с итоговым сообщением */}
      <div className="font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] font-normal relative shrink-0 text-[#e1ff00] text-[22px] sm:text-[23px] md:text-[24px] w-full text-center">
        <p className="block leading-[0.8]">
          {finalMessage}
        </p>
      </div>
      
      {/* Блок с задачами и объяснением */}
      <div className="font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] not-italic relative shrink-0 text-[#ffffff] w-full text-center">
        {/* Практическое задание */}
        <p className="block leading-none mb-0 text-[18px] sm:text-[19px] md:text-[20px]">
          {practiceTask}
        </p>
        <p className="block leading-none mb-0 text-[18px] sm:text-[19px] md:text-[20px]">&nbsp;</p>
        
        {/* Объяснение "Почему" */}
        <p className="leading-none text-[18px] sm:text-[19px] md:text-[20px]">
          <span className="text-[#e1ff00]">Why:</span>
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
  const handleBack = () => {
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
      
      {/* Кнопка возврата */}
      <BackButton onClick={handleBack} />
      
      {/* Контентный блок с итоговым сообщением */}
      <Container 
        finalMessage={finalMessage || defaultFinalMessage}
        practiceTask={practiceTask || defaultPracticeTask}
        whyExplanation={whyExplanation || defaultWhyExplanation}
      />
      
      {/* Bottom Fixed CTA Button согласно Guidelines.md */}
      <BottomFixedButton onClick={handleNext}>
        Next
      </BottomFixedButton>
    </div>
  );
}