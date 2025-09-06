// Импортируем необходимые хуки и SVG пути
import { useState, useRef, useEffect } from 'react';
import { BottomFixedButton } from "./BottomFixedButton";
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';

// Типы для пропсов компонента
interface RateCardScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
  onNext: (rating: number, textMessage?: string) => void; // Функция для перехода к следующему экрану с рейтингом и опциональным текстовым сообщением
  cardId: string; // ID карточки
  cardTitle?: string; // Название карточки (опционально)
}

/**
 * Адаптивный компонент световых эффектов для фона
 */
function Light() {
  return (
    <div
      className="absolute h-[320px] sm:h-[400px] md:h-[460px] lg:h-[520px] xl:h-[580px] left-1/2 top-[-50px] sm:top-[-60px] md:top-[-65px] translate-x-[-50%] w-[140px] sm:w-[165px] md:w-[185px] lg:w-[200px] xl:w-[211px]"
      data-name="Light"
    >
      <div className="absolute inset-[-27.81%_-120.85%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 721 1427">
          <g id="Light">
            <g filter="url(#filter0_f_17_905)" id="Ellipse 2">
              <ellipse cx="361.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
            <g filter="url(#filter1_f_17_905)" id="Ellipse 1">
              <ellipse cx="360.5" cy="1113.5" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="105.5" ry="58.5" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_17_905"
              width="695"
              x="14"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_17_905" stdDeviation="127.5" />
            </filter>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="627"
              id="filter1_f_17_905"
              width="721"
              x="0"
              y="800"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_17_905" stdDeviation="127.5" />
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

/**
 * Адаптивный компонент названия приложения с версией beta
 */

/**
 * Адаптивный мини-логотип с символом и названием
 */

/**
 * Адаптивный компонент заголовка рейтинга
 */
function RatingTextContainer() {
  const { content } = useContent();
  
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 text-center w-full"
      data-name="Rating text container"
    >
      <div className="[grid-area:1_/_1] typography-h2 text-[#e1ff00] w-full">
        <p className="block">{content.ui.cards.rating.title}</p>
      </div>
      <div className="[grid-area:1_/_1] typography-body mt-[35px] sm:mt-[37px] md:mt-[39px] text-[#ffffff] w-full">
        <p className="block">{content.ui.cards.rating.subtitle}</p>
      </div>
    </div>
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
          <path 
            d="M21 11H19V9C19 5.686 16.314 3 13 3C9.686 3 7 5.686 7 9V11H5C3.895 11 3 11.895 3 13V21C3 22.105 3.895 23 5 23H21C22.105 23 23 22.105 23 21V13C23 11.895 22.105 11 21 11ZM9 9C9 6.794 10.794 5 13 5C15.206 5 17 6.794 17 9V11H9V9Z" 
            fill="#696969" 
            id="Shape" 
            transform="scale(1.077) translate(-1, -1)"
          />
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
      <div className="typography-caption text-[#696969] text-left flex-1">
        <p className="block">Your feedback is fully protected with AES-256 encryption</p>
      </div>
    </div>
  );
}

/**
 * Адаптивный блок текстового поля для ввода сообщения к отзыву
 */
function InputTextMessageBlock({ value, onChange, placeholder }: { 
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
      className="bg-[rgba(217,217,217,0.04)] box-border content-stretch flex flex-col gap-2.5 min-h-[120px] sm:min-h-[130px] md:min-h-[140px] items-start justify-start p-[20px] relative rounded-xl shrink-0 w-full max-w-[351px]"
      data-name="Input text message block"
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
        className="typography-body bg-transparent border-none outline-none resize-none text-[#cfcfcf] text-left w-full h-full placeholder:text-[#696969] min-h-[60px] sm:min-h-[70px] md:min-h-[80px]"
        style={{ overflow: 'hidden' }}
        onInput={adjustTextareaHeight}
      />
    </div>
  );
}

/**
 * Адаптивный блок сообщения с полем ввода и информацией о шифровании
 */
function TextMessageBlock({ textMessage, onTextMessageChange }: { textMessage: string; onTextMessageChange: (value: string) => void }) {
  const { content } = useContent();
  
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative shrink-0 w-full max-w-[351px]"
      data-name="Text message block"
    >
      <InputTextMessageBlock 
        value={textMessage}
        onChange={onTextMessageChange}
        placeholder={content.ui.cards.rating.placeholder}
      />
      <EncryptInfoBlock />
    </div>
  );
}

/**
 * Адаптивная кнопка рейтинга
 */
function RatingMark({ 
  number, 
  isSelected, 
  onClick 
}: { 
  number: number; 
  isSelected: boolean; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className={`relative shrink-0 size-[46px] cursor-pointer min-h-[44px] min-w-[44px] transition-all duration-200 hover:scale-105 active:scale-95 ${
        isSelected ? 'bg-[#e1ff00]' : 'bg-[rgba(217,217,217,0.04)]'
      } rounded-xl`}
      data-name="Mark"
    >
      {!isSelected && (
        <div
          aria-hidden="true"
          className="absolute border border-[#505050] border-solid inset-0 pointer-events-none rounded-xl"
        />
      )}
      <div className={`absolute inset-[32.61%_36.96%] text-center text-nowrap tracking-[-0.43px] ${
        isSelected ? 'text-[#2d2b2b]' : 'text-[#ffffff]'
      }`}>
        <p className="typography-body adjustLetterSpacing block whitespace-pre">{number}</p>
      </div>
    </button>
  );
}

/**
 * Адаптивный блок опций рейтинга
 */
function RatingOptions({ selectedRating, onRatingChange }: { 
  selectedRating: number; 
  onRatingChange: (rating: number) => void; 
}) {
  return (
    <div className="h-[46px] relative shrink-0 w-full" data-name="Rating options">
      <div className="absolute box-border content-stretch flex flex-row gap-[20px] sm:gap-[25px] md:gap-[30px] inset-0 items-center justify-center p-0">
        {[1, 2, 3, 4, 5].map((rating) => (
          <RatingMark
            key={rating}
            number={rating}
            isSelected={selectedRating === rating}
            onClick={() => onRatingChange(rating)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Адаптивный контейнер карточки рейтинга
 */
function RatingCardContainer({ 
  selectedRating, 
  onRatingChange, 
  showThankYou,
  textMessage,
  onTextMessageChange
}: { 
  selectedRating: number; 
  onRatingChange: (rating: number) => void; 
  showThankYou: boolean;
  textMessage: string;
  onTextMessageChange: (value: string) => void;
}) {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-5 items-start justify-start left-1/2 transform -translate-x-1/2 p-0 top-[210px] sm:top-[230px] md:top-[264px] w-full max-w-[351px] px-4 sm:px-6 md:px-0"
      data-name="Rating card container"
    >
      <RatingTextContainer />
      <RatingOptions selectedRating={selectedRating} onRatingChange={onRatingChange} />
      {showThankYou && (
        <div
          className="typography-body min-w-full text-[#ffffff] text-center"
          style={{ width: "min-content" }}
        >
          <p className="block">Thank you!</p>
        </div>
      )}
      <div className="mt-5">
        <TextMessageBlock textMessage={textMessage} onTextMessageChange={onTextMessageChange} />
      </div>
    </div>
  );
}



/**
 * Главный компонент экрана оценки карточки
 * Адаптивный дизайн с поддержкой mobile-first подхода
 */
export function RateCardScreen({ onBack, onNext, cardId, cardTitle: _cardTitle }: RateCardScreenProps) {
  const { content } = useContent();
  // Состояние для хранения выбранного рейтинга (по умолчанию 5, как в дизайне)
  const [selectedRating, setSelectedRating] = useState(5);
  
  // Состояние для показа сообщения "Thank you!"
  const [showThankYou, setShowThankYou] = useState(true);
  
  // Состояние для хранения текстового сообщения к отзыву
  const [textMessage, setTextMessage] = useState('');
  
  /**
   * Функция для обработки изменения рейтинга
   * Показывает "Thank you!" при выборе любого рейтинга
   */
  const handleRatingChange = (rating: number) => {
    console.log(`Rating changed to: ${rating} for card: ${cardId}`);
    setSelectedRating(rating);
    setShowThankYou(true);
  };

  /**
   * Функция для обработки кнопки "Next"
   * Переходит к следующему экрану с выбранным рейтингом и опциональным текстовым сообщением
   */
  const handleNext = () => {
    console.log(`Card rated: ${selectedRating} stars for card: ${cardId}`, textMessage ? `with message: ${textMessage}` : 'without message');
    onNext(selectedRating, textMessage.trim() || undefined);
  };

  /**
   * Функция для обработки изменения текстового сообщения
   */
  const handleTextMessageChange = (value: string) => {
    setTextMessage(value);
  };

  /**
   * Функция для обработки кнопки "Back" 
   * Возвращается к предыдущему экрану (итоговое сообщение)
   */
  const _handleBack = () => {
    console.log(`Going back from rating screen for card: ${cardId}`);
    onBack();
  };

  return (
    <div 
      className="bg-[#111111] relative size-full min-h-screen" 
      data-name="Rate card page"
    >
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Мини-логотип */}
      <MiniStripeLogo />
      
      {/* Контейнер карточки рейтинга */}
      <RatingCardContainer 
        selectedRating={selectedRating}
        onRatingChange={handleRatingChange}
        showThankYou={showThankYou}
        textMessage={textMessage}
        onTextMessageChange={handleTextMessageChange}
      />
      
      {/* Bottom Fixed CTA Button согласно Guidelines.md */}
      <BottomFixedButton 
        onClick={handleNext}
        disabled={false} // Кнопка всегда активна, так как по умолчанию выбран рейтинг 5
      >
        {content.ui.cards.rating.submit}
      </BottomFixedButton>
    </div>
  );
}