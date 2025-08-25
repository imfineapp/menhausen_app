// Импортируем SVG пути для первого экрана
import svgPaths from "../imports/svg-nt7wuddmjy";
import { BottomFixedButton } from './BottomFixedButton';

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
 * Блок соглашения расположенный выше кнопки с запасом для двух строк (top-[680px])
 * Содержит текст о принятии условий с кликабельными ссылками
 */
function AgreementTextBlock({ onShowPrivacy, onShowTerms }: { onShowPrivacy: () => void; onShowTerms: () => void }) {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-center justify-start left-[21px] p-0 top-[680px] w-[351px]"
      data-name="agreement text block"
    >
      <div className="font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] font-bold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[0px] text-center w-full">
        <p className="leading-none text-[14px]" style={{ lineHeight: '0.9' }}>
          <span>{`By clicking the button you agree to the `}</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onShowTerms();
            }}
            className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] not-italic cursor-pointer hover:text-[#e1ff00] text-[#ffffff] touch-friendly inline transition-colors duration-200"
          >
            Terms of use
          </a>
          <span className="font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] not-italic">{` and`}</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onShowPrivacy();
            }}
            className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] not-italic cursor-pointer hover:text-[#e1ff00] text-[#ffffff] touch-friendly inline transition-colors duration-200"
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
      className="absolute box-border content-stretch flex flex-col gap-10 items-center justify-start leading-[0] left-[21px] p-0 text-center top-[277px] w-[351px]"
      data-name="main_content"
    >
      <div className="font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] font-normal relative shrink-0 text-[#cfcfcf] text-[0px] w-full">
        <p className="block leading-[0.8] mb-0 text-[36px]">{`You don't have `}</p>
        <p className="block leading-[0.8] text-[36px]">
          <span className="font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] font-normal text-[#e1ff00]">to cope</span>
          <span>{` alone`}</span>
        </p>
      </div>
      <div className="font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] not-italic relative shrink-0 text-[#ffffff] text-[20px] w-full">
        <p className="block leading-none">{`Anonymous digital self-help tool for men. Сards based on scientific methods. `}</p>
      </div>
    </div>
  );
}

/**
 * Компонент символа логотипа (большой)
 * SVG иконка для логотипа
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
 * Компонент названия приложения "Menhausen"
 * Отрисовывает текст логотипа с помощью SVG путей
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
 * Компонент мини-логотипа с символом и названием
 * Объединяет символ и текст логотипа
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
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[120px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Основной контент */}
            <div className="text-center mb-12">
              <MainContent />
            </div>
            
            {/* Соглашение */}
            <div className="text-center">
              <AgreementTextBlock onShowPrivacy={onShowPrivacy} onShowTerms={onShowTerms} />
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <NextButton onClick={onNext} />

    </div>
  );
}