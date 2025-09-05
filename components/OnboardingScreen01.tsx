// Импортируем необходимые компоненты
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';

// Типы для пропсов компонента
interface OnboardingScreen01Props {
  onNext: () => void; // Функция для перехода к следующему экрану
  onShowPrivacy: () => void; // Функция для показа Privacy Policy
  onShowTerms: () => void; // Функция для показа Terms of Use
}

/**
 * Компонент световых эффектов для фона точно по импорту
 * Создает размытый эллипс для визуального эффекта
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
            <g filter="url(#filter0_f_23_176)" id="Ellipse 2">
              <ellipse cx="347.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_23_176"
              width="695"
              x="0"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_23_176" stdDeviation="127.5" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

/**
 * Кнопка "Next" согласно Bottom Fixed CTA Button стандарту
 * Теперь использует стандартный компонент BottomFixedButton
 */
function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <BottomFixedButton onClick={onClick}>
      Next
    </BottomFixedButton>
  );
}

/**
 * Блок соглашения расположенный выше кнопки с запасом для двух строк
 * Содержит текст о принятии условий с кликабельными ссылками
 */
function AgreementTextBlock({ onShowPrivacy, onShowTerms }: { onShowPrivacy: () => void; onShowTerms: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-start p-0 w-full max-w-[351px]"
      data-name="agreement text block"
    >
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[0px] text-center w-full">
        <p className="leading-none text-[14px]" style={{ lineHeight: '0.9' }}>
          <span>{`By clicking the button you agree to the `}</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onShowTerms();
            }}
            className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] font-sans not-italic cursor-pointer hover:text-[#e1ff00] text-[#ffffff] min-h-[44px] min-w-[44px] inline transition-colors duration-200"
          >
            Terms of use
          </a>
          <span className="font-sans not-italic">{` and`}</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onShowPrivacy();
            }}
            className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] font-sans not-italic cursor-pointer hover:text-[#e1ff00] text-[#ffffff] min-h-[44px] min-w-[44px] inline transition-colors duration-200"
          >
            {` Privacy policy`}
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * Главный контент первого экрана точно по структуре импорта
 * Содержит заголовок и описание приложения
 */
function MainContent() {
  return (
    <div
      className="flex flex-col gap-10 items-center justify-start leading-[0] text-center w-full max-w-[351px]"
      data-name="main_content"
    >
      <div className="font-heading font-normal relative shrink-0 text-[#cfcfcf] text-[0px] w-full">
        <p className="block leading-[0.8] mb-0 text-[36px]">{`You don't have `}</p>
        <p className="block leading-[0.8] text-[36px]">
          <span className="font-heading font-normal text-[#e1ff00]">to cope</span>
          <span>{` alone`}</span>
        </p>
      </div>
      <div className="font-sans not-italic relative shrink-0 text-[#ffffff] text-[20px] w-full">
        <p className="block leading-none">{`Anonymous digital self-help tool for men. Сards based on scientific methods. `}</p>
      </div>
    </div>
  );
}

/**
 * Главный компонент первого экрана онбординга
 * Объединяет все элементы экрана и обрабатывает навигацию точно по структуре импорта
 */
export function OnboardingScreen01({ onNext, onShowPrivacy, onShowTerms }: OnboardingScreen01Props) {
  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden bg-[#111111] flex flex-col">
      {/* Световые эффекты */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Основной контент по центру экрана */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-center items-center">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px]">
          <div className="max-w-[351px] mx-auto flex flex-col items-center justify-center gap-12">
            <MainContent />
          </div>
        </div>
      </div>
      
      {/* Блок соглашения с отступом от нижней кнопки */}
      <div className="absolute bottom-[116px] left-1/2 transform -translate-x-1/2 w-full max-w-[351px] px-[16px] sm:px-[20px] md:px-[21px]">
        <AgreementTextBlock onShowPrivacy={onShowPrivacy} onShowTerms={onShowTerms} />
      </div>

      {/* Bottom Fixed Button */}
      <NextButton onClick={onNext} />
    </div>
  );
}