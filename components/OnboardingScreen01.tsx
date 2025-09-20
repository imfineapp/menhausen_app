// Импортируем необходимые компоненты
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';

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
      className="absolute h-[130px] top-[-65px] translate-x-[-50%] w-[185px] pointer-events-none"
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
  const { content } = useContent();
  
  return (
    <BottomFixedButton onClick={onClick} dataName="Next button" ariaLabel="Next">
      {content.ui.onboarding.screen01.buttonText}
    </BottomFixedButton>
  );
}

/**
 * Блок соглашения расположенный выше кнопки с запасом для двух строк
 * Содержит текст о принятии условий с кликабельными ссылками
 */
function AgreementTextBlock({ onShowPrivacy, onShowTerms }: { onShowPrivacy: () => void; onShowTerms: () => void }) {
  const { content } = useContent();
  
  return (
    <div
      className="flex flex-col items-center justify-start p-0 w-full max-w-[351px]"
      data-name="agreement text block"
    >
      <div className="typography-body text-[#ffffff] text-center w-full">
        <p className="block">
          <span>{content.ui.onboarding.screen01.agreementText} </span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onShowTerms();
            }}
            className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] typography-body cursor-pointer hover:text-[#e1ff00] text-[#ffffff] min-h-[44px] min-w-[44px] inline transition-colors duration-200"
          >
            {content.ui.onboarding.screen01.termsText}
          </a>
          <span className="typography-body"> и</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onShowPrivacy();
            }}
            className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] typography-body cursor-pointer hover:text-[#e1ff00] text-[#ffffff] min-h-[44px] min-w-[44px] inline transition-colors duration-200"
          >
            {` ${content.ui.onboarding.screen01.privacyText}`}
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
  const { content } = useContent();
  
  return (
    <div
      className="flex flex-col gap-10 items-center justify-start leading-[0] text-center w-full max-w-[351px]"
      data-name="main_content"
    >
      <div className="typography-h1 text-[#e1ff00] w-full">
        <h1 className="block">{content.ui.onboarding.screen01.title}</h1>
      </div>
      <div className="typography-body text-[#ffffff] w-full">
        <p className="block">{content.ui.onboarding.screen01.subtitle}</p>
      </div>
    </div>
  );
}

/**
 * Компонент большого логотипа SVG
 * Размещается между MiniStripeLogo и основным контентом
 */
function BigLogo() {
  return (
    <div className="flex justify-center items-center w-full mb-8">
      <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32">
        <svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M269.881 486.487C262.541 493.838 250.643 493.838 243.303 486.487L123.686 366.701C116.352 359.35 116.348 347.434 123.686 340.086C131.025 332.738 142.923 332.741 150.264 340.086L237.797 427.743L237.797 248.237L178.505 248.237C168.009 248.237 159.5 239.913 159.5 229.644C159.5 219.376 168.009 211.053 178.505 211.053L237.797 211.053L237.797 172.032C237.797 171.868 237.799 171.704 237.804 171.541C204.675 163.168 180.157 133.164 180.157 97.4335C180.157 55.2202 214.378 20.9999 256.592 20.9999C298.805 21 333.026 55.2202 333.026 97.4335C333.026 133.164 308.509 163.167 275.381 171.541C275.385 171.704 275.387 171.868 275.387 172.032L275.387 211.053L330.547 211.053C341.043 211.053 349.553 219.376 349.553 229.644C349.553 239.913 341.043 248.237 330.547 248.237L275.387 248.237L275.387 427.743L362.92 340.086C370.26 332.741 382.16 332.737 389.498 340.086C396.836 347.434 396.832 359.35 389.498 366.701L269.881 486.487ZM256.592 135.651C277.698 135.651 294.809 118.54 294.809 97.4335C294.808 76.327 277.698 59.2168 256.592 59.2167C235.485 59.2167 218.375 76.3269 218.375 97.4335C218.375 118.54 235.485 135.651 256.592 135.651Z" fill="#E1FF00"/>
        </svg>
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
      
      {/* Центральный блок контента с равными отступами */}
      <div className="flex-1 flex flex-col justify-center items-center px-[16px] sm:px-[20px] md:px-[21px]">
        <div className="max-w-[351px] mx-auto flex flex-col items-center justify-center gap-12">
          {/* Большой логотип SVG */}
          <BigLogo />
          
          {/* Основной контент */}
          <MainContent />
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