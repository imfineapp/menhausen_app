// Импортируем необходимые хуки и компоненты
import { useState } from 'react';
import { MiniStripeLogo } from './ProfileLayoutComponents';

// Типы для пропсов компонента
interface PinSetupScreenProps {
  onComplete: () => void; // Функция для завершения настройки пин-кода
  onSkip: () => void; // Функция для пропуска настройки пин-кода
  onBack: () => void; // Функция для возврата к предыдущему экрану
}

// Режимы работы с пин-кодом
type PinMode = 'create' | 'confirm';

/**
 * Компонент световых эффектов для фона
 * Используется тот же эффект, что и на других экранах
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
 * Кнопка Skip для пропуска настройки пин-кода
 * Текстовая кнопка без фона и рамки
 */
function TextButton({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      onClick={onSkip}
      className="absolute left-1/2 transform -translate-x-1/2 bottom-[35px] 
                font-sans font-bold text-[15px] text-[#e1ff00]
                hover:opacity-80 active:scale-[0.98] transition-all duration-200
                min-h-[44px] min-w-[44px] cursor-pointer"
      data-name="Skip Button"
    >
      Skip
    </button>
  );
}

/**
 * Компонент отдельной цифры на клавиатуре
 * Интерактивная кнопка с анимациями
 */
function NumberButton({ number, onPress }: { number: string; onPress: (num: string) => void }) {
  return (
    <button
      onClick={() => onPress(number)}
      className="relative size-[68px] cursor-pointer hover:bg-[rgba(217,217,217,0.08)] rounded-full"
      data-name={`Group${number}`}
    >
      {/* Фон кнопки */}
      <div className="absolute inset-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" role="presentation" viewBox="0 0 68 68">
          <circle cx="34" cy="34" fill="var(--fill-0, #D9D9D9)" fillOpacity="0.04" id="Ellipse 3" r="34" />
        </svg>
      </div>
      {/* Цифра */}
      <div className="absolute font-sans font-normal inset-[35.29%_39.71%_36.77%_39.71%] leading-[0] text-[#ffffff] text-[24px] text-center text-nowrap">
        <p className="block leading-[0.8] whitespace-pre">{number}</p>
      </div>
    </button>
  );
}

/**
 * Компонент цифровой клавиатуры
 * Сетка 3x4 с цифрами 0-9
 */
function PinButtons({ onNumberPress }: { onNumberPress: (num: string) => void }) {
  return (
    <div
      className="box-border gap-[38px] grid grid-cols-[fit-content(100%)_fit-content(100%)_fit-content(100%)] grid-rows-[fit-content(100%)_fit-content(100%)_fit-content(100%)_fit-content(100%)] h-[392px] w-[280px] mx-auto"
      data-name="Pin_buttons"
    >
      {/* Первый ряд: 1, 2, 3 */}
      <div className="[grid-area:1_/_1]"><NumberButton number="1" onPress={onNumberPress} /></div>
      <div className="[grid-area:1_/_2]"><NumberButton number="2" onPress={onNumberPress} /></div>
      <div className="[grid-area:1_/_3]"><NumberButton number="3" onPress={onNumberPress} /></div>
      
      {/* Второй ряд: 4, 5, 6 */}
      <div className="[grid-area:2_/_1]"><NumberButton number="4" onPress={onNumberPress} /></div>
      <div className="[grid-area:2_/_2]"><NumberButton number="5" onPress={onNumberPress} /></div>
      <div className="[grid-area:2_/_3]"><NumberButton number="6" onPress={onNumberPress} /></div>
      
      {/* Третий ряд: 7, 8, 9 */}
      <div className="[grid-area:3_/_1]"><NumberButton number="7" onPress={onNumberPress} /></div>
      <div className="[grid-area:3_/_2]"><NumberButton number="8" onPress={onNumberPress} /></div>
      <div className="[grid-area:3_/_3]"><NumberButton number="9" onPress={onNumberPress} /></div>
      
      {/* Четвертый ряд: пустое место, 0, пустое место */}
      <div className="[grid-area:4_/_2]"><NumberButton number="0" onPress={onNumberPress} /></div>
    </div>
  );
}

/**
 * Блок отображения введенного пин-кода
 * Показывает заполненные и пустые позиции с видимыми точками
 */
function PinBlock({ filled }: { filled: boolean }) {
  return (
    <div className="relative size-[62px]" data-name="Pin block">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 62 62">
        <g id="Pin block">
          {/* Фон блока - всегда прозрачно-серый */}
          <rect 
            fill="var(--fill-0, #D9D9D9)" 
            fillOpacity="0.04" 
            height="62" 
            id="Pin block_2" 
            rx="12" 
            width="62" 
          />
          {/* Точка показывается только когда filled = true */}
          {filled && (
            <circle 
              cx="31" 
              cy="31" 
              fill="var(--fill-0, #e1ff00)" 
              id="Ellipse 6" 
              r="6" 
            />
          )}
        </g>
      </svg>
    </div>
  );
}

/**
 * Группа из 4 блоков для отображения пин-кода
 * Показывает текущий прогресс ввода
 */
function PinBlock4({ pinLength }: { pinLength: number }) {
  return (
    <div className="flex flex-row gap-[21px] items-center justify-center w-full" data-name="Pin_block">
      {[0, 1, 2, 3].map((index) => (
        <PinBlock key={index} filled={index < pinLength} />
      ))}
    </div>
  );
}

/**
 * Сообщение об ошибке при несовпадении пин-кодов
 * Показывается только при ошибке валидации
 */
function PinMessage({ show }: { show: boolean }) {
  if (!show) return null;
  
  return (
    <div className="h-4 w-full mt-4" data-name="pin message">
      <div className="font-sans font-bold leading-[0] not-italic text-[#e1ff00] text-[16px] text-center">
        <p className="block leading-none">PIN code does not match, please try again</p>
      </div>
    </div>
  );
}

/**
 * Блок с инструкциями и отображением пин-кода
 * Содержит описание, блоки пин-кода и сообщение об ошибке
 */
function PinSetup({ 
  pinLength, 
  showError, 
  mode 
}: { 
  pinLength: number; 
  showError: boolean; 
  mode: PinMode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[351px] mx-auto px-4 sm:px-6 md:px-8 lg:px-0" data-name="Pin setup">
      {/* Блоки для отображения пин-кода */}
      <PinBlock4 pinLength={pinLength} />
      
      {/* Инструкция */}
      <div className="font-sans font-bold leading-[0] not-italic text-[#ffffff] text-[18px] sm:text-[20px] text-center w-full">
        <p className="block leading-none">
          {mode === 'create' 
            ? 'For more privacy you can set a pin code to log in'
            : 'Please confirm your PIN code'
          }
        </p>
      </div>
      
      {/* Сообщение об ошибке */}
      <PinMessage show={showError} />
    </div>
  );
}


/**
 * Главный компонент экрана настройки пин-кода
 * Управляет состоянием ввода, валидацией и навигацией
 */
export function PinSetupScreen({ onComplete, onSkip, onBack: _onBack }: PinSetupScreenProps) {
  // Состояние для текущего пин-кода
  const [currentPin, setCurrentPin] = useState<string>('');
  // Состояние для сохраненного пин-кода (при подтверждении)
  const [savedPin, setSavedPin] = useState<string>('');
  // Режим работы: создание или подтверждение
  const [mode, setMode] = useState<PinMode>('create');
  // Флаг показа ошибки
  const [showError, setShowError] = useState<boolean>(false);

  /**
   * Функция обработки нажатия на цифру
   * Добавляет цифру к текущему пин-коду если он неполный
   */
  const handleNumberPress = (number: string) => {
    if (currentPin.length < 4) {
      const newPin = currentPin + number;
      setCurrentPin(newPin);
      setShowError(false);

      // Автоматическая обработка при вводе 4 цифр
      if (newPin.length === 4) {
        handlePinComplete(newPin);
      }
    }
  };

  /**
   * Функция обработки завершения ввода пин-кода
   * Обрабатывает логику создания и подтверждения
   */
  const handlePinComplete = (pin: string) => {
    if (mode === 'create') {
      // Первый ввод - сохраняем пин-код и переходим к подтверждению
      setSavedPin(pin);
      setMode('confirm');
      setCurrentPin('');
      
      // Небольшая задержка для лучшего UX
      setTimeout(() => {
        setCurrentPin('');
      }, 500);
    } else {
      // Подтверждение - проверяем совпадение
      if (pin === savedPin) {
        // Пин-коды совпадают - завершаем настройку
        console.log('PIN code set successfully:', pin);
        onComplete();
      } else {
        // Пин-коды не совпадают - показываем ошибку
        setShowError(true);
        setCurrentPin('');
        
        // Автоматически скрываем ошибку через 3 секунды
        setTimeout(() => {
          setShowError(false);
        }, 3000);
      }
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
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Заголовок */}
            <div className="text-center mb-12">
              <h1 className="font-heading font-normal text-white text-[36px] mb-6 leading-[0.8]">
                Set up your PIN
              </h1>
              <p className="font-sans text-white text-[20px]">
                Create a 4-digit PIN to secure your account
              </p>
            </div>
            
            {/* Отображение PIN */}
            <div className="flex justify-center mb-12">
              <PinSetup 
                pinLength={currentPin.length} 
                showError={showError} 
                mode={mode}
              />
            </div>
            
            {/* Клавиатура */}
            <div className="flex justify-center">
              <PinButtons onNumberPress={handleNumberPress} />
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <TextButton onSkip={onSkip} />

    </div>
  );
}