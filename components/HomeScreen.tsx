// Импортируем необходимые хуки и SVG пути
import { useRef, useState, useEffect } from 'react';
import svgPaths from "../imports/svg-9v3gqqhb3l";
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';
import { StripedProgressBar } from './ui/StripedProgressBar';
import { InfoModal } from './ui/InfoModal';
import { ActivityBlockNew } from './ActivityBlockNew';

// Smart Navigation imports
import { UserStateManager } from '../utils/userStateManager';
import { UserState, Recommendation, QuickAction } from '../types/userState';
import { ProgressIndicators } from './ProgressIndicators';
import { RecommendationCards } from './RecommendationCards';
import { QuickActions } from './QuickActions';

// Типы для пропсов компонента
interface HomeScreenProps {
  onGoToCheckIn: () => void; // Функция для перехода к чекину
  onGoToProfile: () => void; // Функция для перехода к профилю пользователя
  onGoToTheme: (themeId: string) => void; // Функция для перехода к теме
  onOpenMentalTechnique: (techniqueId: string) => void; // Функция для открытия ментальной техники
  userHasPremium: boolean; // Статус Premium подписки пользователя
  onGoToSurvey?: () => void; // Функция для перехода к опросу (для рекомендаций)
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
  const { getUI } = useContent();
  
  return (
    <div
      className="box-border content-stretch flex flex-row items-start justify-start p-0 relative shrink-0 w-full"
      data-name="User info"
    >
      <div className="typography-h2 text-[#e1ff00] text-left w-[140px] sm:w-[160px] md:w-[164px]">
        <h2 className="block">{getUI().home.heroTitle}</h2>
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
          {isPremium ? 'Premium' : 'Free'}
        </p>
      </div>
    </div>
  );
}

/**
 * Адаптивный уровень пользователя и статус подписки
 */
function UserLevelAndStatus({ userHasPremium }: { userHasPremium: boolean }) {
  const { getUI } = useContent();
  
  return (
    <div
      className="box-border content-stretch flex flex-row gap-4 sm:gap-5 items-center justify-start p-0 relative shrink-0"
      data-name="User level and paid status"
    >
      <div className="typography-body text-[#696969] text-left text-nowrap">
        <p className="block whitespace-pre">{getUI().home.level} 25</p>
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
 * Адаптивная иконка информации для блока чекина
 */
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

/**
 * Адаптивный заголовок блока чекина
 */
function InfoGroup({ onInfoClick }: { onInfoClick: () => void }) {
  const { getUI } = useContent();
  
  return (
    <div
      className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Info_group"
    >
      <div className="typography-h2 text-[#2d2b2b] text-left text-nowrap">
        <h2 className="block whitespace-pre">{getUI().home.howAreYou}</h2>
      </div>
      <InfoIcon onClick={onInfoClick} />
    </div>
  );
}

/**
 * Адаптивный кнопка для перехода к чекину
 */
function CheckInButton({ onClick }: { onClick: () => void }) {
  const { getUI } = useContent();
  
  return (
    <button
      onClick={onClick}
      className="bg-[#2d2b2b] h-[44px] sm:h-[46px] relative rounded-xl shrink-0 w-full cursor-pointer min-h-[44px] min-w-[44px] hover:bg-[#3d3b3b]"
      data-name="Start Mining"
    >
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2.5 h-[44px] sm:h-[46px] items-center justify-center px-[20px] sm:px-[126px] py-[12px] sm:py-[15px] relative w-full">
          <div className="typography-button text-[#696969] text-center text-nowrap tracking-[-0.43px]">
            <p className="adjustLetterSpacing block whitespace-pre">{getUI().home.checkInButton}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * Адаптивный контейнер блока чекина
 */
function CheckInContainer({ onGoToCheckIn, onInfoClick }: { onGoToCheckIn: () => void; onInfoClick: () => void }) {
  const { getUI } = useContent();
  
  return (
    <div
      className="box-border content-stretch flex flex-col gap-4 sm:gap-5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Info container"
    >
      <InfoGroup onInfoClick={onInfoClick} />
      <div className="typography-body text-[#2d2b2b] text-left w-full">
        <p className="block">{getUI().home.checkInDescription}</p>
      </div>
      <CheckInButton onClick={onGoToCheckIn} />
    </div>
  );
}

/**
 * Адаптивный главный блок "How are you?" для чекина
 */
function CheckInBlock({ onGoToCheckIn, onInfoClick }: { onGoToCheckIn: () => void; onInfoClick: () => void }) {
  return (
    <div
      className="bg-[#e1ff00] box-border content-stretch flex flex-col gap-2 sm:gap-2.5 items-start justify-start p-[16px] sm:p-[18px] md:p-[20px] relative rounded-xl shrink-0 w-full"
      data-name="HAYOU_block"
    >
      <CheckInContainer onGoToCheckIn={onGoToCheckIn} onInfoClick={onInfoClick} />
    </div>
  );
}




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
  const { getUI } = useContent();
  
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
          <p className="block">{getUI().home.progress}</p>
        </div>
      </div>
      
      {/* Информация о пользователях и статус премиум - размещаем над прогресс-баром */}
      <div className="absolute bottom-[30px] sm:bottom-[32px] md:bottom-[34px] left-[16px] sm:left-[18px] md:left-[20px] right-[16px] sm:right-[18px] md:right-[20px] box-border content-stretch flex flex-row items-center justify-between p-0 z-10">
        <div className="typography-button text-[#696969] text-left">
          <p className="block">{getUI().home.use80PercentUsers}</p>
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
  const { getAllThemes, getLocalizedText } = useContent();
  
  // Получаем все темы из контента
  const themes = getAllThemes();
  
  // Создаем массив для отображения с фиктивными данными прогресса
  const worries = themes.map((theme) => ({
    title: getLocalizedText(theme.title),
    description: getLocalizedText(theme.description),
    progress: Math.floor(Math.random() * 100), // Фиктивный прогресс для демонстрации
    isPremium: theme.isPremium,
    isAvailable: true,
    themeId: theme.id
  }));

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
      {worries.map((worry) => (
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
  const { getUI } = useContent();
  
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[24px] sm:gap-[27px] md:gap-[30px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Worries container"
    >
      <div className="typography-h2 text-[#e1ff00] text-left w-full">
        <h2 className="block">{getUI().home.whatWorriesYou}</h2>
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
function MainPageContentBlock({ onGoToCheckIn, onGoToProfile, onGoToTheme, userHasPremium, onInfoClick, onGoToSurvey }: { 
  onGoToCheckIn: () => void; 
  onGoToProfile: () => void;
  onGoToTheme: (themeId: string) => void;
  userHasPremium: boolean;
  onInfoClick: () => void;
  onGoToSurvey?: () => void;
}) {
  // Smart Navigation: Load user state and generate recommendations
  const [_userState, setUserState] = useState<UserState | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [progressIndicators, setProgressIndicators] = useState<any[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);

  useEffect(() => {
    try {
      const state = UserStateManager.analyzeUserState();
      setUserState(state);
      setRecommendations(UserStateManager.getRecommendations(state));
      setProgressIndicators(UserStateManager.getProgressIndicators(state));
      
      // Generate quick actions based on user state
      const actions: QuickAction[] = [
        {
          id: 'checkin',
          title: 'Check-in',
          description: 'How are you feeling?',
          icon: '💭',
          color: 'bg-blue-500',
          action: onGoToCheckIn,
          visible: true
        },
        {
          id: 'survey',
          title: 'Continue Survey',
          description: 'Complete your assessment',
          icon: '📋',
          color: 'bg-green-500',
          action: onGoToSurvey || (() => {}),
          visible: !state.hasCompletedSurvey
        },
        {
          id: 'exercise',
          title: 'Try Exercise',
          description: 'Mental health techniques',
          icon: '🧘',
          color: 'bg-purple-500',
          action: () => onGoToTheme('anxiety'),
          visible: state.hasCompletedSurvey && state.hasCompletedFirstCheckin
        },
        {
          id: 'profile',
          title: 'View Profile',
          description: 'Your progress & settings',
          icon: '👤',
          color: 'bg-gray-500',
          action: onGoToProfile,
          visible: true
        }
      ];
      setQuickActions(actions);
    } catch (error) {
      console.error('Failed to load user state for smart navigation:', error);
    }
  }, [onGoToCheckIn, onGoToProfile, onGoToTheme, onGoToSurvey]);

  const handleRecommendationAction = (recommendation: Recommendation) => {
    switch (recommendation.type) {
      case 'action':
        if (recommendation.title.includes('Survey')) {
          onGoToSurvey?.();
        } else if (recommendation.title.includes('Check-in')) {
          onGoToCheckIn();
        }
        break;
      case 'feature':
        onGoToTheme('anxiety');
        break;
      case 'motivation':
        // For motivation cards, just log for now
        console.log('Motivation action:', recommendation.title);
        break;
    }
  };

  return (
    <div
      className="flex flex-col gap-[48px] sm:gap-[54px] md:gap-[60px] items-start justify-start w-full max-w-[351px] mx-auto pb-6 sm:pb-7 md:pb-8"
      data-name="Main_page_contenct_block"
    >
      <UserFrameInfoBlock onClick={onGoToProfile} userHasPremium={userHasPremium} />
      
      {/* Smart Navigation Components */}
      {progressIndicators.length > 0 && (
        <ProgressIndicators indicators={progressIndicators} />
      )}
      
      {recommendations.length > 0 && (
        <RecommendationCards 
          recommendations={recommendations}
          onRecommendationAction={handleRecommendationAction}
        />
      )}
      
      {quickActions.filter(action => action.visible).length > 0 && (
        <QuickActions actions={quickActions} />
      )}
      
      <CheckInBlock onGoToCheckIn={onGoToCheckIn} onInfoClick={onInfoClick} />
      <ActivityBlockNew />
      <WorriesContainer onGoToTheme={onGoToTheme} />
    </div>
  );
}

/**
 * Адаптивный горизонтальный слайдер экстренной помощи без навигационных кнопок
 * Управляется только горизонтальными свайпами и занимает всю ширину экрана
 */
function EmergencySlider({ onOpenMentalTechnique }: { onOpenMentalTechnique: (techniqueId: string) => void }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const { getMentalTechniques, getLocalizedText } = useContent();

  // Получаем все ментальные техники
  const allTechniques = getMentalTechniques();

  /**
   * Обработчик клика на карточку
   */
  const handleCardClick = (techniqueId: string) => {
    console.log(`Opening mental technique: ${techniqueId}`);
    onOpenMentalTechnique(techniqueId);
  };

  return (
    <div
      ref={sliderRef}
      className="flex flex-row gap-[12px] sm:gap-[13px] md:gap-[15px] items-center overflow-x-auto scrollbar-hide w-full"
      data-name="Slider_emergency"
      style={{ 
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      {allTechniques.map((technique) => (
        <div 
          key={technique.id} 
          style={{ scrollSnapAlign: 'start' }}
          className="shrink-0"
        >
          <EmergencyCard 
            card={{
              id: technique.id,
              title: getLocalizedText(technique.title),
              description: getLocalizedText(technique.subtitle),
              status: 'Available',
              isAvailable: true
            }} 
            onClick={() => handleCardClick(technique.id)}
          />
        </div>
      ))}
      {/* Пустой элемент для создания отступа в конце слайдера для лучшего UX */}
      <div className="shrink-0 w-4" aria-hidden="true" />
    </div>
  );
}

/**
 * Адаптивный блок экстренной помощи с заголовком и слайдером
 * Занимает всю ширину экрана
 */
function EmergencyBlock({ onOpenMentalTechnique }: { onOpenMentalTechnique: (techniqueId: string) => void }) {
  const { getUI } = useContent();
  
  return (
    <div className="w-full mb-[48px] sm:mb-[54px] md:mb-[60px]" data-name="Emergency_block_container">
      {/* Заголовок с отступами как у основного контента */}
      <div className="px-[16px] sm:px-[20px] md:px-[21px] max-w-[calc(351px+32px)] sm:max-w-[calc(351px+40px)] md:max-w-[calc(351px+42px)] mx-auto w-full mb-4 sm:mb-5">
        <div className="typography-h2 text-[#e1ff00] text-left w-full">
          <h2 className="block">{getUI().home.quickHelpTitle}</h2>
        </div>
      </div>
      
      {/* Слайдер с отступом слева как у основного контента и с правым отступом */}
      <div className="px-[16px] sm:px-[20px] md:px-[21px]">
        <EmergencySlider onOpenMentalTechnique={onOpenMentalTechnique} />
      </div>
    </div>
  );
}

/**
 * Адаптивная социальная иконка Телеграм
 */
function TelegramIcon() {
  return (
    <div className="relative shrink-0 size-10 sm:size-11 md:size-12" data-name="Social Icons">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g clipPath="url(#clip0_2_2114)" id="Social Icons">
          <path
            clipRule="evenodd"
            d={svgPaths.p201ec800}
            fill="var(--fill-0, #2D2B2B)"
            fillRule="evenodd"
            id="Vector"
          />
        </g>
        <defs>
          <clipPath id="clip0_2_2114">
            <rect fill="white" height="48" width="48" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Адаптивная социальная иконка X (Twitter)
 */
function TwitterIcon() {
  return (
    <div className="relative shrink-0 size-10 sm:size-11 md:size-12" data-name="Social Icons">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Social Icons">
          <path d={svgPaths.p118f24c0} fill="var(--fill-0, #2D2B2B)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Адаптивная кнопка Follow с социальной иконкой
 */
function FollowButton({ 
  icon, 
  platform: _platform, 
  onClick 
}: { 
  icon: React.ReactNode; 
  platform: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="h-[65px] sm:h-[69px] md:h-[73px] relative w-full cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200 min-h-[44px] min-w-[44px]"
      data-name="Follow button"
    >
      <div className="absolute contents inset-0">
        <div className="absolute bg-[#e1ff00] inset-0 rounded-xl" />
        <div className="absolute box-border content-stretch flex flex-row gap-[10px] sm:gap-[11px] md:gap-[13px] inset-[17.81%_7.83%_16.44%_7.83%] items-center justify-center p-0">
          {icon}
          <div className="typography-h2 text-[#2d2b2b] text-nowrap text-right">
            <h2 className="block whitespace-pre">Follow</h2>
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * Адаптивный блок социальных кнопок
 */
function SocialFollowBlock() {
  const handleFollow = (platform: string) => {
    console.log(`Following on ${platform}`);
    // TODO: Добавить реальные ссылки на социальные сети
    if (platform === 'telegram') {
      window.open('https://t.me/menhausen', '_blank');
    } else if (platform === 'twitter') {
      window.open('https://twitter.com/menhausen', '_blank');
    }
  };

  return (
    <div
      className="grid grid-cols-2 gap-[15px] sm:gap-[17px] md:gap-[19px] w-full"
      data-name="Follow_block"
    >
      <FollowButton 
        icon={<TelegramIcon />}
        platform="telegram"
        onClick={() => handleFollow('telegram')}
      />
      <FollowButton 
        icon={<TwitterIcon />}
        platform="twitter"
        onClick={() => handleFollow('twitter')}
      />
    </div>
  );
}

/**
 * Адаптивный главный компонент домашней страницы
 * Объединяет все блоки и управляет навигацией с полной поддержкой всех устройств
 */
export function HomeScreen({ onGoToCheckIn, onGoToProfile, onGoToTheme, onOpenMentalTechnique, userHasPremium, onGoToSurvey }: HomeScreenProps) {
  const { getUI } = useContent();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleInfoClick = () => {
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
            onGoToCheckIn={onGoToCheckIn} 
            onGoToProfile={onGoToProfile} 
            onGoToTheme={onGoToTheme}
            userHasPremium={userHasPremium}
            onInfoClick={handleInfoClick}
            onGoToSurvey={onGoToSurvey}
          />
        </div>
        
        {/* Отступ между блоками */}
        <div className="h-[40px]"></div>
        
        {/* Блок экстренной помощи - независимый, на всю ширину экрана */}
        <EmergencyBlock onOpenMentalTechnique={onOpenMentalTechnique} />
        
        {/* Блок с кнопками социальных сетей - на всю ширину экрана */}
        <div className="w-full mb-[48px] sm:mb-[54px] md:mb-[60px]" data-name="Social_follow_container">
          {/* Заголовок с отступами как у основного контента */}
          <div className="px-[16px] sm:px-[20px] md:px-[21px] w-full">
            <SocialFollowBlock />
          </div>
        </div>
      </div>

      {/* Модальное окно с информацией о чекине */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={handleCloseInfoModal}
        title={getUI().home.checkInInfo.title}
        content={getUI().home.checkInInfo.content}
      />
    </div>
  );
}