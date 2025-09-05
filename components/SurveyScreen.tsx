// Импортируем необходимые хуки и SVG пути
import { useState } from 'react';
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';

// Типы для пропсов компонента
interface SurveyScreenProps {
  onComplete: () => void; // Функция для завершения опроса
  onBack: () => void; // Функция для возврата к предыдущему экрану
}

// Тип для опций опроса
interface SurveyOption {
  id: string;
  label: string;
}

// Список опций опроса
const SURVEY_OPTIONS: SurveyOption[] = [
  { id: 'stress', label: 'Stress' },
  { id: 'depression', label: 'Depression' },
  { id: 'anger', label: 'Anger' },
  { id: 'sadness', label: 'Sadness and apathy' },
  { id: 'anxiety', label: 'Anxiety' },
  { id: 'relationships', label: 'Relationships' }
];

/**
 * Компонент световых эффектов для фона
 * Используется тот же эффект, что и на втором экране онбординга
 */
function Light() {
  return (
    <div
      className="absolute h-[130px] top-[-65px] translate-x-[-50%] w-[185px]"
      data-name="Light"
      style={{ left: "calc(50% + 1px)" }}
    >
      <div className="absolute inset-[-196.15%_-137.84%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 695 640">
          <g id="Light">
            <g filter="url(#filter0_f_1_796)" id="Ellipse 2">
              <ellipse cx="347.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_1_796"
              width="695"
              x="0"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_796" stdDeviation="127.5" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

/**
 * Компонент radio button для опций опроса
 * Показывает активное/неактивное состояние
 */
function RadioButton({ selected }: { selected: boolean }) {
  return (
    <div className="relative shrink-0 size-3.5" data-name="Radio_button">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Radio_button">
          <circle 
            cx="7" 
            cy="7" 
            id="Ellipse 5" 
            r="6" 
            stroke={selected ? "var(--stroke-0, #E1FF00)" : "var(--stroke-0, #878787)"} 
            strokeWidth="2" 
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * Компонент отдельной опции опроса
 * Интерактивный элемент с возможностью клика
 */
function SurveyItem({ option, selected, onToggle }: { 
  option: SurveyOption; 
  selected: boolean; 
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="h-[60px] relative shrink-0 w-full cursor-pointer hover:bg-[rgba(217,217,217,0.08)] min-h-[44px] min-w-[44px]"
      data-name="Survey_item_box"
    >
      {/* Фон элемента */}
      <div 
        className={`absolute inset-0 rounded-xl ${
          selected 
            ? 'bg-[rgba(217,217,217,0.15)]' 
            : 'bg-[rgba(217,217,217,0.04)]'
        }`}
        data-name="Background"
      >
        <div
          aria-hidden="true"
          className={`absolute border border-solid inset-0 pointer-events-none rounded-xl ${
            selected ? 'border-[#e1ff00]' : 'border-[#505050]'
          }`}
        />
      </div>
      
      {/* Контент элемента */}
      <div className="absolute box-border content-stretch flex flex-row gap-5 items-center justify-start left-[5.7%] p-0 right-[5.7%] top-1/2 translate-y-[-50%]">
        <RadioButton selected={selected} />
        <div 
          className={`font-sans font-bold leading-[0] not-italic relative shrink-0 text-[20px] text-left ${
            selected ? 'text-[#e1ff00]' : 'text-[#ffffff]'
          }`}
        >
          <p className="block leading-none whitespace-pre">{option.label}</p>
        </div>
      </div>
    </button>
  );
}

/**
 * Блок с опциями опроса
 * Содержит все интерактивные элементы выбора
 */
function SurveyBlock({ selectedOptions, onToggleOption }: {
  selectedOptions: Set<string>;
  onToggleOption: (optionId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 items-start justify-start w-full">
      {SURVEY_OPTIONS.map((option) => (
        <SurveyItem
          key={option.id}
          option={option}
          selected={selectedOptions.has(option.id)}
          onToggle={() => onToggleOption(option.id)}
        />
      ))}
    </div>
  );
}

/**
 * Разделительная линия между заголовком и опциями
 */
function SeparationLine() {
  return (
    <div className="h-0 w-full relative" data-name="Separation Line">
      <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" role="presentation" viewBox="0 0 351 1">
          <g id="Separation Line">
            <rect fill="white" height="3.06854e-05" transform="translate(0 1)" width="351" />
            <line
              id="Sepapration line"
              stroke="var(--stroke-0, #2D2B2B)"
              x1="4.37114e-08"
              x2="351"
              y1="0.5"
              y2="0.500031"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

/**
 * Блок с заголовком и описанием опроса
 */
function HeroBlockQuestion() {
  return (
    <div className="flex flex-col gap-5 items-center justify-start leading-[0] text-center w-full">
      {/* Основной заголовок опроса */}
      <div className="font-heading font-normal leading-[0.8] relative shrink-0 text-[#e1ff00] text-[36px] w-full">
        <p className="block leading-[0.8]">How are you feeling today?</p>
      </div>
      <div className="font-sans not-italic relative shrink-0 text-[#ffffff] text-[20px] w-full">
        <p className="block leading-none">Select the option that best describes your current mood</p>
      </div>
    </div>
  );
}

/**
 * Кнопка "Next" согласно Bottom Fixed CTA Button стандарту
 * Теперь использует стандартный компонент BottomFixedButton
 */
function ButtonWithGradient({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <BottomFixedButton 
      onClick={onClick}
      disabled={disabled}
    >
      Next
    </BottomFixedButton>
  );
}

/**
 * Прогресс-бар онбординга
 * Показывает текущий прогресс (3 из 3 шагов)
 */
function ProgressBar() {
  return (
    <div className="h-0 w-full relative" data-name="Progress Bar">
      <div className="absolute bottom-[-3px] left-0 right-0 top-[-3px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 351 6">
          <g id="Progress Bar">
            {/* Полная линия прогресса (серая) */}
            <path d="M0 3H351" id="Line 1" stroke="var(--stroke-0, #2D2B2B)" strokeWidth="6" />
            {/* Активная часть прогресса (желтая) - почти полная для последнего шага */}
            <path d="M0 3H263.25" id="Line 2" stroke="var(--stroke-0, #E1FF00)" strokeWidth="6" />
          </g>
        </svg>
      </div>
    </div>
  );
}


/**
 * Кнопка возврата к предыдущему экрану
 */

/**
 * Главный компонент экрана опроса
 * Управляет состоянием выбранных опций и навигацией
 */
export function SurveyScreen({ onComplete, onBack: _onBack }: SurveyScreenProps) {
  // Состояние для отслеживания выбранных опций
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

  /**
   * Функция для переключения выбора опции
   * Добавляет или удаляет опцию из выбранных
   */
  const handleToggleOption = (optionId: string) => {
    setSelectedOptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(optionId)) {
        newSet.delete(optionId);
      } else {
        newSet.add(optionId);
      }
      return newSet;
    });
  };

  /**
   * Функция для завершения опроса
   * Передает выбранные опции и переходит к следующему экрану
   */
  const handleComplete = () => {
    if (selectedOptions.size > 0) {
      console.log('Selected options:', Array.from(selectedOptions));
      onComplete();
    }
  };

  // Проверяем, выбрана ли хотя бы одна опция для активации кнопки
  const hasSelection = selectedOptions.size > 0;

  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden bg-[#111111] flex flex-col">
      {/* Световые эффекты */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Прогресс-бар */}
      <div className="absolute top-[120px] left-0 right-0 px-[16px] sm:px-[20px] md:px-[21px]">
        <div className="max-w-[351px] mx-auto">
          <ProgressBar />
        </div>
      </div>
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[160px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Заголовок и описание */}
            <div className="text-center mb-12">
              <HeroBlockQuestion />
            </div>
            
            {/* Разделительная линия */}
            <div className="mb-8">
              <SeparationLine />
            </div>
            
            {/* Опции опроса */}
            <SurveyBlock 
              selectedOptions={selectedOptions} 
              onToggleOption={handleToggleOption} 
            />

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <ButtonWithGradient onClick={handleComplete} disabled={!hasSelection} />

    </div>
  );
}