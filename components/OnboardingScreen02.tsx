// Импортируем SVG пути для второго экрана
import svgPaths from "../imports/svg-vn1j3wuqix";
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';

// Типы для пропсов компонента
interface OnboardingScreen02Props {
  onComplete: () => void; // Функция для завершения онбординга
}

/**
 * Компонент световых эффектов для фона второго экрана
 * Более простой чем на первом экране - только один эллипс
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
            {/* Один размытый эллипс для световой подсветки */}
            <g filter="url(#filter0_f_1_395)" id="Ellipse 2">
              <ellipse cx="347.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
          </g>
          <defs>
            {/* Фильтр для размытия */}
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
 * Кнопка "Get Started" согласно Bottom Fixed CTA Button стандарту
 * Теперь использует стандартный компонент BottomFixedButton
 */
function GetStartedButton({ onClick }: { onClick: () => void }) {
  const { content } = useContent();
  
  return (
    <BottomFixedButton onClick={onClick} dataName="Next button" ariaLabel="Get Started">
      {content.ui.onboarding.screen02.buttonText}
    </BottomFixedButton>
  );
}

/**
 * Иконка замка (для "No Sign-Up")
 * SVG компонент для отображения безопасности
 */
function LockIcon() {
  return (
    <div className="relative shrink-0 size-12" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Icon">
          {/* Основа замка */}
          <path
            d={svgPaths.p9795980}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          {/* Дужка замка */}
          <path
            d={svgPaths.p3c832300}
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * Блок текста для преимущества "No Sign-Up"
 * Описывает анонимность приложения
 */
function NoLoginTextBlock() {
  const { content } = useContent();
  
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-col gap-2.5 items-end justify-start ml-0 mt-0 p-0 relative text-left w-[248px]"
      data-name="Text block"
    >
      {/* Заголовок преимущества */}
      <div className="typography-h2 text-[#e1ff00] w-full">
        <h2 className="block">{content.ui.onboarding.screen02.benefits[0]}</h2>
      </div>
      {/* Описание преимущества */}
      <div className="typography-body text-[#ffffff] w-full">
        <p className="block">{content.ui.onboarding.screen02.descriptions[0]}</p>
      </div>
    </div>
  );
}

/**
 * Контейнер для первого преимущества (No Sign-Up)
 * Объединяет иконку и текст
 */
function NoLoginContainer() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-[13px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <LockIcon />
      <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
        <NoLoginTextBlock />
      </div>
    </div>
  );
}

/**
 * Иконка щита (для "Data Encryption")
 * SVG компонент для отображения безопасности данных
 */
function ShieldIcon() {
  return (
    <div className="relative shrink-0 size-12" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Icon">
          {/* Основа щита */}
          <path
            d={svgPaths.p30533c80}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          {/* Галочка внутри щита */}
          <path
            d="M18 24L22 28L30 20"
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * Блок текста для преимущества "Data Encryption"
 * Описывает защиту данных пользователя
 */
function EncryptionTextBlock() {
  const { content } = useContent();
  
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-col gap-2.5 items-end justify-start ml-0 mt-0 p-0 relative text-left w-[248px]"
      data-name="Text block"
    >
      {/* Заголовок преимущества */}
      <div className="[grid-area:1_/_1] typography-h2 ml-0 mt-0 text-[#e1ff00] w-[248px]">
        <h2 className="block">{content.ui.onboarding.screen02.benefits[1]}</h2>
      </div>
      {/* Описание шифрования */}
      <div className="typography-body text-[#ffffff] w-full">
        <p className="block">{content.ui.onboarding.screen02.descriptions[1]}</p>
      </div>
    </div>
  );
}

/**
 * Контейнер для второго преимущества (Data Encryption)
 * Объединяет иконку щита и текст
 */
function EncryptionContainer() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-[13px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <ShieldIcon />
      <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
        <EncryptionTextBlock />
      </div>
    </div>
  );
}

/**
 * Иконка мобильного устройства (для "Always with you")
 * SVG компонент для отображения мобильности
 */
function MobileIcon() {
  return (
    <div className="relative shrink-0 size-12" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Icon">
          {/* Корпус мобильного устройства */}
          <path
            d={svgPaths.p1589db80}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          {/* Кнопка на устройстве */}
          <path
            d="M24 36H24.02"
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * Блок текста для преимущества "Always with you"
 * Описывает доступность приложения
 */
function AlwaysWithYouTextBlock() {
  const { content } = useContent();
  
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-col gap-2.5 items-end justify-start ml-0 mt-0 p-0 relative text-left w-[248px]"
      data-name="Text block"
    >
      {/* Заголовок преимущества */}
      <div className="[grid-area:1_/_1] typography-h2 ml-0 mt-0 text-[#e1ff00] w-[248px]">
        <h2 className="block">{content.ui.onboarding.screen02.benefits[2]}</h2>
      </div>
      {/* Описание доступности */}
      <div className="typography-body text-[#ffffff] w-full">
        <p className="block">{content.ui.onboarding.screen02.descriptions[2]}</p>
      </div>
    </div>
  );
}

/**
 * Контейнер для третьего преимущества (Always with you)
 * Объединяет иконку мобильного устройства и текст
 */
function AlwaysWithYouContainer() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-[13px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <MobileIcon />
      <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
        <AlwaysWithYouTextBlock />
      </div>
    </div>
  );
}

/**
 * Иконка научного подхода (для "Science-based methods")
 * Сложная SVG иконка с множественными элементами
 */
function ScienceIcon() {
  return (
    <div className="relative shrink-0 size-12" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Icon">
          {/* Центральная вертикальная линия */}
          <path
            d="M24 36V10"
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          {/* Различные ветки и элементы научного дерева */}
          <path
            d={svgPaths.p2dc41780}
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d={svgPaths.p1b1a1f80}
            id="Vector_3"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d={svgPaths.p1d1c280}
            id="Vector_4"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d={svgPaths.p34270280}
            id="Vector_5"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d={svgPaths.pa33b72a}
            id="Vector_6"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d={svgPaths.pd982560}
            id="Vector_7"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d={svgPaths.pc2aa900}
            id="Vector_8"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * Блок текста для преимущества "Science-based methods"
 * Самый подробный блок с описанием методологии
 */
function ScienceTextBlock() {
  const { content } = useContent();
  
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-col gap-2.5 items-end justify-start ml-0 mt-0 p-0 relative text-left w-[248px]"
      data-name="Text block"
    >
      {/* Заголовок преимущества */}
      <div className="[grid-area:1_/_1] typography-h2 ml-0 mt-0 text-[#e1ff00] w-[248px]">
        <h2 className="block">{content.ui.onboarding.screen02.benefits[3]}</h2>
      </div>
      {/* Подробное описание методов */}
      <div className="typography-body text-[#ffffff] w-full">
        <p className="block">
          {content.ui.onboarding.screen02.descriptions[3]}
        </p>
      </div>
    </div>
  );
}

/**
 * Контейнер для четвертого преимущества (Science-based methods)
 * Объединяет научную иконку и подробный текст
 */
function ScienceContainer() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-[13px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <ScienceIcon />
      <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
        <ScienceTextBlock />
      </div>
    </div>
  );
}

/**
 * Блок с контентом всех преимуществ
 * Объединяет все четыре преимущества в вертикальный список
 */
function ContentBlock({ onComplete: _onComplete }: { onComplete: () => void }) {
  return (
    <div
      className="flex flex-col gap-10 items-start justify-start w-full max-w-[310px]"
      data-name="Content block"
    >
      {/* Первое преимущество: No Sign-Up */}
      <NoLoginContainer />
      
      {/* Второе преимущество: Data Encryption */}
      <EncryptionContainer />
      
      {/* Третье преимущество: Always with you */}
      <AlwaysWithYouContainer />
      
      {/* Четвертое преимущество: Science-based methods */}
      <ScienceContainer />
    </div>
  );
}

/**
 * Главный компонент второго экрана онбординга
 * Показывает преимущества приложения и завершает онбординг
 */
export function OnboardingScreen02({ onComplete }: OnboardingScreen02Props) {
  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden bg-[#111111] flex flex-col">
      {/* Световые эффекты */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] w-full">
          <div className="max-w-[351px] mx-auto flex flex-col items-center">
            {/* Блок с контентом всех преимуществ */}
            <ContentBlock onComplete={onComplete} />
          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <GetStartedButton onClick={onComplete} />
    </div>
  );
}