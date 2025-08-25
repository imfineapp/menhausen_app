// Импортируем необходимые хуки и SVG пути
import { useState, useRef, useEffect } from 'react';
import svgPaths from "../imports/svg-umu7uxnce6";
import { BottomFixedButton } from "./BottomFixedButton";

// Типы для пропсов компонента
interface QuestionScreen02Props {
  onBack: () => void; // Функция для возврата к предыдущему экрану
  onNext: (answer: string) => void; // Функция для перехода к следующему экрану с ответом
  cardId: string; // ID карточки
  cardTitle?: string; // Название карточки (опционально)
  questionText?: string; // Текст вопроса (опционально)
  previousAnswer?: string; // Ответ с предыдущего вопроса (опционально)
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
 * Адаптивная иконка замка для блока шифрования
 */
function LockShieldFilled() {
  return (
    <div className="relative shrink-0 size-7" data-name="Lock Shield Filled">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Lock Shield Filled">
          <path d={svgPaths.p70b1000} fill="var(--fill-0, #696969)" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Адаптивный блок информации о шифровании
 */
function EncryptInfoBlock() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full max-w-[351px]"
      data-name="Encrypt_info_block"
    >
      <LockShieldFilled />
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#696969] text-[14px] text-left flex-1">
        <p className="block leading-none">Your answers are fully protected with AES-256 encryption</p>
      </div>
    </div>
  );
}

/**
 * Адаптивный блок текстового поля для ввода ответа
 */
function InputAnswerBlock({ value, onChange, placeholder }: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Автоматически изменяем высоту textarea при вводе текста
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  return (
    <div
      className="bg-[rgba(217,217,217,0.04)] box-border content-stretch flex flex-col gap-2.5 min-h-[340px] sm:min-h-[360px] md:min-h-[383px] items-start justify-start p-[20px] relative rounded-xl shrink-0 w-full max-w-[351px]"
      data-name="Input answer block"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#505050] border-solid inset-0 pointer-events-none rounded-xl"
      />
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="font-sans leading-[22px] not-italic bg-transparent border-none outline-none resize-none text-[#cfcfcf] text-[18px] sm:text-[19px] md:text-[20px] text-left w-full h-full placeholder:text-[#696969] min-h-[280px] sm:min-h-[300px] md:min-h-[320px]"
        style={{ overflow: 'hidden' }}
        onInput={adjustTextareaHeight}
      />
    </div>
  );
}

/**
 * Адаптивный блок ответа с полем ввода и информацией о шифровании
 */
function AnswerBlock({ answer, onAnswerChange }: { answer: string; onAnswerChange: (value: string) => void }) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative shrink-0 w-full max-w-[351px]"
      data-name="Answer block"
    >
      <InputAnswerBlock 
        value={answer}
        onChange={onAnswerChange}
        placeholder="Share your thoughts here..."
      />
      <EncryptInfoBlock />
    </div>
  );
}

/**
 * Адаптивный контентный блок с вопросом и полем ответа
 */
function ContentBlock({ questionText, answer, onAnswerChange }: { 
  questionText: string; 
  answer: string; 
  onAnswerChange: (value: string) => void; 
}) {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-5 items-start justify-start left-1/2 transform -translate-x-1/2 p-0 top-[120px] sm:top-[130px] md:top-[141px] w-full max-w-[351px] px-4 sm:px-6 md:px-0"
      data-name="Content block"
    >
      <div className="font-sans min-h-[40px] sm:min-h-[44px] leading-[22px] not-italic relative shrink-0 text-[#e1ff00] text-[18px] sm:text-[19px] md:text-[20px] text-center w-full">
        <p className="block leading-[22px]">{questionText}</p>
      </div>
      <AnswerBlock answer={answer} onAnswerChange={onAnswerChange} />
    </div>
  );
}



/**
 * Главный компонент экрана второго вопроса карточки
 * Адаптивный дизайн с поддержкой mobile-first подхода
 */
export function QuestionScreen02({ onBack, onNext, cardId, cardTitle: _cardTitle, questionText, previousAnswer: _previousAnswer }: QuestionScreen02Props) {
  // Состояние для хранения ответа пользователя
  const [answer, setAnswer] = useState('');
  
  // Вопрос по умолчанию, если не передан
  const defaultQuestionText = "What are your expectations behind this reaction?";
  
  /**
   * Функция для обработки кнопки "Next"
   * Переходит к следующему экрану с ответом пользователя
   */
  const handleNext = () => {
    if (answer.trim()) {
      console.log(`Question 2 answer for card: ${cardId}`, answer);
      onNext(answer.trim());
    }
  };

  /**
   * Функция для обработки кнопки "Back" 
   * Возвращается к предыдущему экрану
   */
  const handleBack = () => {
    console.log(`Going back from question 2 for card: ${cardId}`);
    onBack();
  };

  /**
   * Функция для обработки изменения ответа
   */
  const handleAnswerChange = (value: string) => {
    setAnswer(value);
  };

  return (
    <div 
      className="bg-[#111111] relative size-full min-h-screen" 
      data-name="Question Answer 02"
    >
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Мини-логотип */}
      <MiniStripeLogo />
      
      {/* Кнопка возврата */}
      <BackButton onClick={handleBack} />
      
      {/* Контентный блок с вопросом и полем ввода */}
      <ContentBlock 
        questionText={questionText || defaultQuestionText}
        answer={answer}
        onAnswerChange={handleAnswerChange}
      />
      
      {/* Bottom Fixed CTA Button согласно Guidelines.md */}
      <BottomFixedButton 
        onClick={handleNext} 
        disabled={!answer.trim()}
      >
        Next
      </BottomFixedButton>
    </div>
  );
}