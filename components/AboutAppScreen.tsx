// Импортируем необходимые хуки
import { useState } from 'react';
import { useTranslation } from './LanguageContext';
import { MiniStripeLogo } from './ProfileLayoutComponents';

// Типы для пропсов компонента
interface AboutAppScreenProps {
  onBack: () => void; // Функция для возврата к профилю пользователя
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
 * Адаптивный компонент символа логотипа
 */
function _SymbolBig() {
  return (
    <div className="h-[10px] sm:h-[12px] md:h-[13px] relative w-[6px] sm:w-[7px] md:w-2" data-name="Symbol_big">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 13">
        <g id="Symbol_big">
          <path d="M0 0H6L8 2V4L6 6V13H4V11H2V9H0V0Z" fill="var(--fill-0, #E1FF00)" id="Union" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Адаптивный компонент названия приложения с версией beta
 */
function _MenhausenBeta() {
  return (
    <div className="absolute inset-[2.21%_6.75%_7.2%_10.77%]" data-name="Menhausen beta">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 106 12">
        <g id="Menhausen beta">
          <text x="0" y="9" fill="var(--fill-0, #E1FF00)" fontSize="9" fontFamily="Kreon, serif">
            Menhausen
          </text>
          <text x="70" y="7" fill="var(--fill-0, #CFCFCF)" fontSize="6" fontFamily="PT Sans, sans-serif">
            beta
          </text>
        </g>
      </svg>
    </div>
  );
}


/**
 * Адаптивная секция с логотипом приложения
 */
function AppLogoSection() {
  return (
    <div className="flex flex-col items-center gap-4 sm:gap-5 w-full" data-name="App logo section">
      <div className="relative size-[100px] sm:size-[110px] md:size-[120px]" data-name="App logo">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 120 120">
          <g id="App logo">
            <circle cx="60" cy="60" fill="var(--fill-0, #E1FF00)" r="60" />
            <path d="M30 30H66L72 36V48L66 54V90H54V84H42V78H30V30Z" fill="var(--fill-0, #2D2B2B)" />
          </g>
        </svg>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="typography-h1 text-[#e1ff00] text-center">
          <h1 className="block">Menhausen</h1>
        </div>
        <div className="bg-[#e1ff00] px-3 py-1 rounded-xl">
          <div className="typography-caption text-[#2d2b2b] text-center tracking-[-0.43px]">
            <p className="adjustLetterSpacing block">Beta Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Адаптивная секция информации о приложении
 */
function AppInfoSection({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full" data-name="App info section">
      <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 sm:p-5 relative" data-name="Description container">
        <div
          aria-hidden="true"
          className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
        />
        <div className="flex flex-col gap-4">
          <div className="typography-h2 text-[#e1ff00] text-left">
            <h2 className="block">{t('about_menhausen')}</h2>
          </div>
          <div className="typography-body text-[#cfcfcf] text-left">
            <p className="block">
              Menhausen is your personal mental health companion designed to help you track your mood, 
              build healthy habits, and support your emotional well-being through daily check-ins and mindful exercises.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 sm:p-5 relative" data-name="Features container">
        <div
          aria-hidden="true"
          className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
        />
        <div className="flex flex-col gap-4">
          <div className="typography-h2 text-[#e1ff00] text-left">
            <h2 className="block">{t('key_features')}</h2>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="size-2 rounded-full bg-[#e1ff00] mt-2 flex-shrink-0" />
              <div className="typography-body text-[#cfcfcf] text-left">
                <p className="block">Daily mood tracking and emotional check-ins</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-2 rounded-full bg-[#e1ff00] mt-2 flex-shrink-0" />
              <div className="typography-body text-[#cfcfcf] text-left">
                <p className="block">Personalized mental health exercises and activities</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-2 rounded-full bg-[#e1ff00] mt-2 flex-shrink-0" />
              <div className="typography-body text-[#cfcfcf] text-left">
                <p className="block">Progress tracking with levels and achievements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-2 rounded-full bg-[#e1ff00] mt-2 flex-shrink-0" />
              <div className="typography-body text-[#cfcfcf] text-left">
                <p className="block">Secure and private - your data stays yours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-2 rounded-full bg-[#e1ff00] mt-2 flex-shrink-0" />
              <div className="typography-body text-[#cfcfcf] text-left">
                <p className="block">Built specifically for Telegram Mini Apps</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Адаптивная секция команды разработчиков
 */
function TeamSection({ t }: { t: (key: string) => string }) {
  return (
    <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 sm:p-5 relative w-full" data-name="Team container">
      <div
        aria-hidden="true"
        className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
      />
      <div className="flex flex-col gap-4">
        <div className="typography-h2 text-[#e1ff00] text-left">
          <h2 className="block">{t('development_team')}</h2>
        </div>
        <div className="typography-body text-[#cfcfcf] text-left">
          <p className="block">
            Created with care by a dedicated team of developers and mental health advocates. 
            Our mission is to make mental wellness accessible and engaging for everyone.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="typography-body text-[#cfcfcf] text-left">
            <p className="block">Made with ❤️ for the Telegram community</p>
          </div>
          <div className="typography-caption text-[#696969] text-left">
            <p className="block">© 2024 Menhausen Team. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Адаптивная секция технической информации
 */
function TechnicalInfoSection({ t }: { t: (key: string) => string }) {
  const [showTechnicalInfo, setShowTechnicalInfo] = useState(false);

  return (
    <div className="flex flex-col gap-4 w-full" data-name="Technical info section">
      <button
        onClick={() => setShowTechnicalInfo(!showTechnicalInfo)}
        className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 sm:p-5 relative hover:bg-[rgba(217,217,217,0.06)] cursor-pointer min-h-[44px] min-w-[44px]"
        data-name="Technical info toggle"
      >
        <div
          aria-hidden="true"
          className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
        />
        <div className="flex items-center justify-between">
          <div className="typography-h2 text-[#e1ff00] text-left">
            <h2 className="block">{t('technical_information')}</h2>
          </div>
          <div className={`transform transition-transform duration-200 ${showTechnicalInfo ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="#e1ff00">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      
      {showTechnicalInfo && (
        <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 sm:p-5 relative animate-in slide-in-from-top-2 duration-200" data-name="Technical details">
          <div
            aria-hidden="true"
            className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
          />
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <div className="font-sans text-responsive-base text-[#cfcfcf] text-left">
                <p className="block leading-[1.5]">Version:</p>
              </div>
              <div className="font-sans text-responsive-base text-[#ffffff] text-right">
                <p className="block leading-[1.5]">1.0.0 Beta</p>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="font-sans text-responsive-base text-[#cfcfcf] text-left">
                <p className="block leading-[1.5]">Platform:</p>
              </div>
              <div className="font-sans text-responsive-base text-[#ffffff] text-right">
                <p className="block leading-[1.5]">Telegram Mini App</p>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="font-sans text-responsive-base text-[#cfcfcf] text-left">
                <p className="block leading-[1.5]">Built with:</p>
              </div>
              <div className="font-sans text-responsive-base text-[#ffffff] text-right">
                <p className="block leading-[1.5]">React & TypeScript</p>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="font-sans text-responsive-base text-[#cfcfcf] text-left">
                <p className="block leading-[1.5]">Last updated:</p>
              </div>
              <div className="font-sans text-responsive-base text-[#ffffff] text-right">
                <p className="block leading-[1.5]">December 2024</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Главный компонент страницы "О приложении"
 * Полностью адаптивный с поддержкой всех устройств и min-h-[44px] min-w-[44px] элементами
 */
export function AboutAppScreen({ onBack: _onBack }: AboutAppScreenProps) {
  const { t } = useTranslation();
  return (
    <div 
      className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto safe-top safe-bottom" 
      data-name="About App Page"
      style={{
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Основной контент */}
      <div className="flex flex-col gap-8 sm:gap-10 px-4 sm:px-6 md:px-[21px] pt-[100px] w-full max-w-[351px] mx-auto pb-6 sm:pb-8">
        
        {/* Логотип и название приложения */}
        <AppLogoSection />
        
        {/* Информация о приложении */}
        <AppInfoSection t={t} />
        
        {/* Техническая информация */}
        <TechnicalInfoSection t={t} />
        
        {/* Команда разработчиков */}
        <TeamSection t={t} />
        
        {/* Дополнительная информация */}
        <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 sm:p-5 relative w-full" data-name="Additional info">
          <div
            aria-hidden="true"
            className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
          />
          <div className="flex flex-col gap-3">
            <div className="font-heading text-responsive-2xl text-[#e1ff00] text-left">
              <h2 className="block leading-[0.8]">{t('important_note')}</h2>
            </div>
            <div className="font-sans text-responsive-base text-[#cfcfcf] text-left">
              <p className="block leading-[1.5]">
                Menhausen is designed to support your mental wellness journey, but it is not a substitute for 
                professional medical advice, diagnosis, or treatment. If you're experiencing serious mental health 
                concerns, please consult with qualified healthcare professionals.
              </p>
            </div>
            <div className="font-sans text-responsive-sm text-[#696969] text-left">
              <p className="block leading-[1.5]">
                For emergencies, please contact your local emergency services or mental health crisis hotline.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}