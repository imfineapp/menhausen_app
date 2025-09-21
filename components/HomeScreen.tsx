// Импортируем необходимые хуки и SVG пути
import { useState } from 'react';
import svgPaths from "../imports/svg-9v3gqqhb3l";
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { StripedProgressBar } from './ui/StripedProgressBar';
import { InfoModal } from './ui/InfoModal';
import { ActivityBlockNew } from './ActivityBlockNew';


// Типы для пропсов компонента
interface HomeScreenProps {
  onGoToProfile: () => void; // Функция для перехода к профилю пользователя
  onGoToTheme: (themeId: string) => void; // Функция для перехода к теме
  userHasPremium: boolean; // Статус Premium подписки пользователя
}

// Типы для пропсов основного блока контента
interface MainPageContentBlockProps {
  onGoToProfile: () => void;
  onGoToTheme: (themeId: string) => void;
  userHasPremium: boolean;
}

// Типы для элементов слайдера экстренной помощи
interface EmergencyCard {
  id: string;
  title: string;
  description: string;
  status: 'Soon' | 'Available';
  isAvailable: boolean;
}

// Данные карточек экстренной помощи (не используется, заменено на динамические данные)
const _EMERGENCY_CARDS: EmergencyCard[] = [
  {
    id: 'breathing',
    title: 'Emergency breathing patterns',
    description: "Check in with yourself — it's the first step to self-care! Do it everyday.",
    status: 'Soon',
    isAvailable: false
  },
  {
    id: 'meditation',
    title: 'Quick meditation techniques',
    description: 'Calm your mind with guided meditation exercises for immediate relief.',
    status: 'Soon',
    isAvailable: false
  },
  {
    id: 'grounding',
    title: '5-4-3-2-1 Grounding method',
    description: 'Use your senses to ground yourself and reduce anxiety in moments of panic.',
    status: 'Available',
    isAvailable: true
  },
  {
    id: 'affirmations',
    title: 'Positive affirmations',
    description: 'Boost your confidence and self-worth with personalized positive statements.',
    status: 'Soon',
    isAvailable: false
  },
  {
    id: 'visualization',
    title: 'Calming visualizations',
    description: 'Transport your mind to peaceful places with guided visualization exercises.',
    status: 'Available',
    isAvailable: true
  }
];

/**
 * Адаптивный компонент световых эффектов для фона
 */
function Light() {
  return (
    <div
      className="absolute h-[100px] sm:h-[120px] md:h-[130px] top-[-50px] sm:top-[-60px] md:top-[-65px] translate-x-[-50%] w-[140px] sm:w-[165px] md:w-[185px] overflow-hidden"
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
 * Адаптивный аватар пользователя
 */
function UserAvatar() {
  return (
    <div className="relative shrink-0 size-[52px] sm:size-[58px] md:size-[62px]" data-name="User avatar">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 62 62">
        <g id="User avatar">
          <circle cx="31" cy="31" fill="var(--fill-0, #E1FF00)" id="Ellipse 5" r="31" />
          <path d={svgPaths.p1b541b00} fill="var(--fill-0, #2D2B2B)" id="Logo" />
        </g>
      </svg>
    </div>
  );
}



/**
 * Адаптивная инфо��мация о пользователе с именем
 */
function UserInfo() {
  return (
    <div
      className="box-border content-stretch flex flex-row items-start justify-start p-0 relative shrink-0 w-full"
      data-name="User info"
    >
      <div className="typography-h2 text-[#e1ff00] text-left w-[140px] sm:w-[160px] md:w-[164px]">
        <h2 className="block">Герой #1</h2>
      </div>
    </div>
  );
}

/**
 * Адаптивный статус аккаунта пользователя (Premium/Free)
 */
function UserAccountStatus({ isPremium = false }: { isPremium?: boolean }) {
  return (
    <div
      className={`box-border content-stretch flex flex-row h-[16px] sm:h-[17px] md:h-[18px] items-center justify-center p-0 relative rounded-xl shrink-0 ${
        isPremium 
          ? 'bg-[#e1ff00] w-[60px] sm:w-[65px] md:w-[69px]' 
          : 'bg-[#2d2b2b] w-[55px] sm:w-[58px] md:w-[62px]'
      }`}
      data-name="User_account_status"
    >
      <div className={`typography-button text-center text-nowrap tracking-[-0.43px] ${
        isPremium 
          ? 'text-[#2d2b2b]' 
          : 'text-[#696969]'
      }`}>
        <p className="adjustLetterSpacing block whitespace-pre">
          {isPremium ? 'Премиум' : 'Бесплатно'}
        </p>
      </div>
    </div>
  );
}

/**
 * Адаптивный уровень пользователя и статус подписки
 */
function UserLevelAndStatus({ userHasPremium }: { userHasPremium: boolean }) {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-4 sm:gap-5 items-center justify-start p-0 relative shrink-0"
      data-name="User level and paid status"
    >
      <div className="typography-body text-[#696969] text-left text-nowrap">
        <p className="block whitespace-pre">Уровень 1</p>
      </div>
      <UserAccountStatus isPremium={userHasPremium} />
    </div>
  );
}

/**
 * Адаптивный блок с информацией о пользователе
 */
function UserInfoBlock({ userHasPremium }: { userHasPremium: boolean }) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 sm:gap-2.5 items-start justify-start p-0 relative shrink-0 w-[220px] sm:w-[250px] md:w-[274px]"
      data-name="User info block"
    >
      <UserInfo />
      <UserLevelAndStatus userHasPremium={userHasPremium} />
    </div>
  );
}

/**
 * Адаптивный полный блок пользователя с аватаром и информацией
 */
function UserFrameInfoBlock({ onClick, userHasPremium }: { onClick: () => void; userHasPremium: boolean }) {
  return (
    <button
      onClick={onClick}
      className="box-border content-stretch flex flex-row gap-4 sm:gap-5 items-center justify-start p-0 relative shrink-0 w-full cursor-pointer rounded-lg min-h-[44px] min-w-[44px] hover:bg-[rgba(217,217,217,0.06)]"
      data-name="User frame info block"
      aria-label="Open user profile"
    >
      <UserAvatar />
      <UserInfoBlock userHasPremium={userHasPremium} />
    </button>
  );
}

/**
 * Адаптивная иконка информации для блока чекина - СКРЫТ ПО ТРЕБОВАНИЮ
 */
/*
function InfoIcon({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative shrink-0 size-10 sm:size-12 cursor-pointer hover:opacity-70 transition-opacity duration-200 p-2"
      data-name="Info icon"
      aria-label="Показать информацию о чекине"
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
        <g id="Info icon">
          <path
            d={svgPaths.pace200}
            id="Vector"
            stroke="var(--stroke-0, #2D2B2B)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M12 16V12"
            id="Vector_2"
            stroke="var(--stroke-0, #2D2B2B)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M12 8H12.01"
            id="Vector_3"
            stroke="var(--stroke-0, #2D2B2B)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </button>
  );
}
*/

/**
 * Адаптивный заголовок блока чекина - СКРЫТ ПО ТРЕБОВАНИЮ
 */
/*
function InfoGroup({ onInfoClick }: { onInfoClick: () => void }) {
  return (
    <div
      className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Info_group"
    >
      <div className="typography-h2 text-[#2d2b2b] text-left text-nowrap">
        <h2 className="block whitespace-pre">Как дела?</h2>
      </div>
      <InfoIcon onClick={onInfoClick} />
    </div>
  );
}
*/

/**
 * Адаптивный кнопка для перехода к чекину - СКРЫТ ПО ТРЕБОВАНИЮ
 */
/*
function CheckInButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-[#2d2b2b] h-[44px] sm:h-[46px] relative rounded-xl shrink-0 w-full cursor-pointer min-h-[44px] min-w-[44px] hover:bg-[#3d3b3b]"
      data-name="Start Mining"
    >
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2.5 h-[44px] sm:h-[46px] items-center justify-center px-[20px] sm:px-[126px] py-[12px] sm:py-[15px] relative w-full">
          <div className="typography-button text-[#696969] text-center text-nowrap tracking-[-0.43px]">
            <p className="adjustLetterSpacing block whitespace-pre">Отправить</p>
          </div>
        </div>
      </div>
    </button>
  );
}
*/


/**
 * Адаптивная карточка темы с прогрессом и обработкой кликов
 */
function ThemeCard({
  title,
  description,
  progress = 0,
  isPremium = false,
  onClick
}: {
  title: string;
  description: string;
  progress?: number;
  isPremium?: boolean;
  onClick?: () => void;
}) {
  
  return (
    <button
      onClick={onClick}
      className="box-border content-stretch flex flex-col gap-2 sm:gap-2.5 h-[140px] sm:h-[147px] md:h-[154px] items-start justify-start p-[16px] sm:p-[18px] md:p-[20px] relative shrink-0 w-full cursor-pointer min-h-[44px] min-w-[44px] hover:bg-[rgba(217,217,217,0.06)]"
      data-name="Theme card narrow"
    >
      <div className="absolute inset-0" data-name="theme_block_background">
        <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
          <div
            aria-hidden="true"
            className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
          />
        </div>
      </div>
      
      {/* Контент карточки */}
      <div className="relative z-10 box-border content-stretch flex flex-col gap-2 sm:gap-2.5 items-start justify-start p-0 shrink-0 w-full">
        <div className="typography-h2 text-[#e1ff00] text-left w-full">
          <h2 className="block">{title}</h2>
        </div>
        <div className="typography-body text-[#ffffff] text-left w-full">
          <p className="block">{description}</p>
        </div>
      </div>
      
      {/* Индикатор прогресса */}
      <div className="absolute bottom-0 left-0 right-0 h-5 sm:h-6 z-10" data-name="Progress_theme">
        <StripedProgressBar 
          progress={progress} 
          size="lg" 
          className="w-full"
          showBackground={true}
        />
        <div className="absolute typography-caption top-1/2 left-0 right-0 -translate-y-1/2 text-[#696969] text-right pr-2">
          <p className="block">Прогресс</p>
        </div>
      </div>
      
      {/* Информация о пользователях и статус премиум - размещаем над прогресс-баром */}
      <div className="absolute bottom-[30px] sm:bottom-[32px] md:bottom-[34px] left-[16px] sm:left-[18px] md:left-[20px] right-[16px] sm:right-[18px] md:right-[20px] box-border content-stretch flex flex-row items-center justify-between p-0 z-10">
        <div className="typography-button text-[#696969] text-left">
          <p className="block">Используют 80% пользователей</p>
        </div>
        <UserAccountStatus isPremium={isPremium} />
      </div>
    </button>
  );
}

/**
 * Адаптивный список проблем пользователя с обработкой кликов на доступные темы
 */
function WorriesList({ onGoToTheme }: { onGoToTheme: (themeId: string) => void }) {
  // Фиктивные данные для демонстрации
  const worries = [
    {
      title: 'Стресс',
      description: 'Обучение управлению ежедневным стрессом и развитие здоровых механизмов преодоления.',
      progress: Math.floor(Math.random() * 100),
      isPremium: false,
      isAvailable: true,
      themeId: 'stress-management'
    }
  ];

  const handleThemeClick = (themeId: string, isAvailable: boolean) => {
    if (isAvailable) {
      console.log(`Opening theme: ${themeId}`);
      onGoToTheme(themeId);
    } else {
      console.log(`Theme ${themeId} is not available`);
      // TODO: Показать модальное окно с информацией о том, что тема недоступна
    }
  };

  return (
    <div
      className="box-border content-stretch flex flex-col gap-8 sm:gap-10 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Worries list"
    >
      {worries.map((worry: any) => (
        <ThemeCard 
          key={worry.themeId}
          title={worry.title}
          description={worry.description}
          progress={worry.progress}
          isPremium={worry.isPremium}
          onClick={() => handleThemeClick(worry.themeId, worry.isAvailable)}
        />
      ))}
    </div>
  );
}

/**
 * Адаптивный контейнер блока "What worries you?"
 */
function WorriesContainer({ onGoToTheme }: { onGoToTheme: (themeId: string) => void }) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[24px] sm:gap-[27px] md:gap-[30px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Worries container"
    >
      <div className="typography-h2 text-[#e1ff00] text-left w-full">
        <h2 className="block">Что вас беспокоит?</h2>
      </div>
      <WorriesList onGoToTheme={onGoToTheme} />
    </div>
  );
}

/**
 * Адаптивная карточка экстренной помощи
 */
function EmergencyCard({ card, onClick }: { card: EmergencyCard; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!card.isAvailable}
      className={`bg-[#e1ff00] box-border content-stretch flex flex-col gap-2 sm:gap-2.5 h-[180px] sm:h-[190px] md:h-[197px] items-start justify-start p-[16px] sm:p-[18px] md:p-[20px] relative rounded-xl shrink-0 w-[260px] sm:w-[270px] md:w-[280px] min-h-[44px] min-w-[44px] ${
        card.isAvailable 
          ? 'cursor-pointer hover:bg-[#d1ef00]' 
          : 'opacity-75 cursor-not-allowed'
      }`}
      data-name="Emergency card"
    >
      <div className="box-border content-stretch flex flex-col gap-4 sm:gap-5 items-start justify-start p-0 relative shrink-0 w-full">
          <div
            className="typography-h2 w-full text-[#313131] text-left"
          >
            <h2 className="block">{card.title}</h2>
          </div>
        <div
          className="typography-body w-full text-[#333333] text-left"
        >
          <p className="block">{card.description}</p>
        </div>
        <div
          className={`box-border content-stretch flex flex-row h-[16px] sm:h-[17px] md:h-[18px] items-start justify-center p-0 relative rounded-xl shrink-0 ${
            card.isAvailable 
              ? 'bg-[#2d2b2b]' 
              : 'bg-[#2d2b2b]'
          }`}
          data-name="Card_anons_status"
        >
          <div className={`typography-button text-center tracking-[-0.43px] w-[60px] sm:w-[63px] md:w-[66px] ${
            card.isAvailable 
              ? 'text-[#e1ff00]' 
              : 'text-[#e1ff00]'
          }`}>
            <p className="adjustLetterSpacing block">{card.status}</p>
          </div>
        </div>
      </div>
    </button>
  );
}


/**
 * Адаптивный основной контейнер контента главной страницы
 */
function MainPageContentBlock({ onGoToProfile, onGoToTheme, userHasPremium }:
  MainPageContentBlockProps) {

  return (
    <div
      className="flex flex-col gap-[48px] sm:gap-[54px] md:gap-[60px] items-start justify-start w-full max-w-[351px] mx-auto pb-6 sm:pb-7 md:pb-8"
      data-name="Main_page_contenct_block"
    >
      <UserFrameInfoBlock onClick={onGoToProfile} userHasPremium={userHasPremium} />

      {/* CheckInBlock скрыт по требованию */}
      {/* <CheckInBlock onGoToCheckIn={onGoToCheckIn} onInfoClick={onInfoClick} /> */}
      <ActivityBlockNew />
      <WorriesContainer onGoToTheme={onGoToTheme} />
    </div>
  );
}


/**
 * Адаптивный главный компонент домашней страницы
 * Объединяет все блоки и управляет навигацией с полной поддержкой всех устройств
 */
export function HomeScreen({ onGoToProfile, onGoToTheme, userHasPremium }: HomeScreenProps) {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const _handleInfoClick = () => {
    setIsInfoModalOpen(true);
  };

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
  };

  return (
    <div 
      className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden safe-top safe-bottom" 
      data-name="004_Home (Main page)"
      data-testid="home-ready"
      style={{
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px]">
          {/* Основной контент страницы */}
          <MainPageContentBlock
            onGoToProfile={onGoToProfile}
            onGoToTheme={onGoToTheme}
            userHasPremium={userHasPremium}
          />
        </div>
        
        {/* Отступ между блоками */}
        <div className="h-[40px]"></div>
        
        {/* Блок экстренной помощи - СКРЫТ ПО ТРЕБОВАНИЮ */}
        {/* <EmergencyBlock onOpenMentalTechnique={onOpenMentalTechnique} /> */}
        
        {/* Блок с кнопками социальных сетей - СКРЫТ ПО ТРЕБОВАНИЮ */}
        {/* <div className="w-full mb-[48px] sm:mb-[54px] md:mb-[60px]" data-name="Social_follow_container">
          <div className="px-[16px] sm:px-[20px] md:px-[21px] w-full">
            <SocialFollowBlock />
          </div>
        </div> */}
      </div>

      {/* Модальное окно с информацией о чекине */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={handleCloseInfoModal}
        title="Зачем нужен ежедневный чекин?"
        content="Ежедневный чекин — это простой, но мощный инструмент для улучшения вашего ментального здоровья. Вот почему это важно:\n\n• Самосознание: Регулярная проверка эмоций помогает лучше понимать свои чувства и реакции\n\n• Раннее выявление: Позволяет заметить изменения в настроении до того, как они станут серьезной проблемой\n\n• Привычка заботы: Формирует полезную привычку обращать внимание на свое психологическое состояние\n\n• Трекинг прогресса: Помогает отслеживать изменения в вашем эмоциональном состоянии со временем\n\n• Мотивация: Понимание своих эмоций — первый шаг к их управлению и улучшению качества жизни\n\nВсего несколько минут в день могут значительно повлиять на ваше общее благополучие."
      />
    </div>
  );
}