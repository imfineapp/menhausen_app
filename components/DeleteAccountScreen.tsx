import { useState } from 'react';
import svgPaths from "../imports/svg-tf9lg82y07";
import WarningIcon from "../imports/Frame-6-24";
import warningIconPaths from "../imports/svg-iawz1hhk6y";

/**
 * Компонент страницы удаления аккаунта
 * Основан на импортированном дизайне 005DeletePage.tsx
 * Включает предупреждение, подтверждение и функциональность удаления
 */

interface DeleteAccountScreenProps {
  onBack: () => void;
  onDeleteAccount: () => void;
}

/**
 * Декоративный световой эффект в верхней части экрана
 */
function Light() {
  return (
    <div
      className="absolute h-[917px] top-[-65px] translate-x-[-50%] w-[211px]"
      data-name="Light"
      style={{ left: "calc(50% + 1px)" }}
    >
      <div className="absolute inset-[-27.81%_-120.85%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 721 1427">
          <g id="Light">
            <g filter="url(#filter0_f_1_264)" id="Ellipse 2">
              <ellipse cx="361.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
            <g filter="url(#filter1_f_1_264)" id="Ellipse 1">
              <ellipse cx="360.5" cy="1113.5" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="105.5" ry="58.5" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_1_264"
              width="695"
              x="14"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_264" stdDeviation="127.5" />
            </filter>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="627"
              id="filter1_f_1_264"
              width="721"
              x="0"
              y="800"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_264" stdDeviation="127.5" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

/**
 * Кнопка удаления аккаунта с состоянием загрузки
 */
function DeleteButton({ onDelete, isLoading }: { onDelete: () => void; isLoading: boolean }) {
  return (
    <button
      onClick={onDelete}
      disabled={isLoading}
      className={`bg-[#e1ff00] h-[46px] relative rounded-xl shrink-0 w-full touch-friendly hover:bg-[#d1ef00] ${
        isLoading ? 'opacity-70 cursor-not-allowed' : ''
      }`}
      data-name="Delete Button"
    >
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2.5 h-[46px] items-center justify-center px-[126px] py-[15px] relative w-full">
          <div className="font-['PT_Sans:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center text-nowrap tracking-[-0.43px]">
            <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">
              {isLoading ? 'Deleting...' : 'Delete'}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * Блок с предупреждением и кнопкой удаления
 */
function ButtonBlock({ onDelete, isLoading }: { onDelete: () => void; isLoading: boolean }) {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-10 items-start justify-start left-1/2 -translate-x-1/2 p-0 bottom-4 sm:bottom-6 md:bottom-8 w-[351px]"
      data-name="button block"
    >
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#e1ff00] text-[14px] text-center w-full">
        <p className="block leading-none">
          By clicking the button I understand that all data about me will be deleted without the possibility of return
        </p>
      </div>
      <DeleteButton onDelete={onDelete} isLoading={isLoading} />
    </div>
  );
}

/**
 * Иконка предупреждения над основным контентом
 */
function WarningIconComponent() {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-[280px] w-20 h-20 flex items-center justify-center"
      data-name="warning_icon"
    >
      <div className="w-16 h-16">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 256 256">
          <g id="Frame">
            <path
              d={warningIconPaths.p71a7ef0}
              id="Vector"
              stroke="var(--stroke-0, #E1FF00)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="21.3333"
            />
            <path
              d="M128 96V138.667"
              id="Vector_2"
              stroke="var(--stroke-0, #E1FF00)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="21.3333"
            />
            <path
              d="M128 181.333H128.107"
              id="Vector_3"
              stroke="var(--stroke-0, #E1FF00)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="21.3333"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

/**
 * Основной контент с заголовком и описанием
 */
function MainContent() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-10 items-start justify-start leading-[0] left-1/2 -translate-x-1/2 p-0 text-center top-[380px] w-[351px]"
      data-name="main_content"
    >
      <div className="font-['Roboto_Slab:Regular',_sans-serif] font-normal relative shrink-0 text-[#e1ff00] text-[36px] w-full">
        <p className="block leading-[0.8]">Danger zone</p>
      </div>
      <div className="font-['PT_Sans:Regular',_sans-serif] not-italic relative shrink-0 text-[#ffffff] text-[20px] w-full">
        <p className="block leading-none">
          In this section you can delete all information about yourself and your account from the application
        </p>
      </div>
    </div>
  );
}

/**
 * SVG иконка для стрелки назад
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
 * Логотип Menhausen
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
 * Мини-логотип с иконкой
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
 * Кнопка "Назад" с touch-friendly размером
 */
function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="absolute left-[21px] size-12 top-[53px] touch-friendly hover:opacity-80"
      data-name="Back Button"
      aria-label="Go back to profile"
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Back Button">
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
 * Заголовочный блок с логотипом и кнопкой назад
 */
function HeaderBlock({ onBack }: { onBack: () => void }) {
  return (
    <div className="absolute contents left-[21px] top-[53px]" data-name="Header block">
      <MiniStripeLogo />
      <BackButton onBack={onBack} />
    </div>
  );
}

/**
 * Основной компонент экрана удаления аккаунта
 */
export function DeleteAccountScreen({ onBack, onDeleteAccount }: DeleteAccountScreenProps) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Обработчик удаления аккаунта с подтверждением
   */
  const handleDelete = async () => {
    try {
      // Подтверждение действия
      const confirmed = confirm(
        'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.'
      );

      if (!confirmed) {
        return;
      }

      console.log('Starting account deletion process...');
      setIsLoading(true);

      // Добавляем тактильную обратную связь если доступна
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
      }

      // Имитация API запроса на удаление аккаунта
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Account deletion completed');
      
      // Показываем уведомление об успешном удалении
      alert('Your account has been successfully deleted. You will be redirected to the welcome screen.');

      // Вызываем callback для удаления аккаунта
      onDeleteAccount();

    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An error occurred while deleting your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] relative size-full" data-name="Delete Account Screen">
      <Light />
      <ButtonBlock onDelete={handleDelete} isLoading={isLoading} />
      <WarningIconComponent />
      <MainContent />
      <HeaderBlock onBack={onBack} />
    </div>
  );
}