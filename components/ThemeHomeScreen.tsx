// Импортируем необходимые хуки и SVG пути
import svgPaths from "../imports/svg-9v3gqqhb3l";
import { BottomFixedButton } from './BottomFixedButton';

// Типы для пропсов компонента
interface ThemeHomeScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
  onCardClick: (cardId: string) => void; // Функция для обработки клика по карточке
  onOpenNextLevel: () => void; // Функция для открытия следующего уровня
  themeTitle?: string; // Название темы (опционально)
  completedCards?: Set<string>; // Множество ID завершенных карточек
  cardCompletionCounts?: Record<string, number>; // Количество прохождений каждой карточки
}

// Типы для карточек
interface Card {
  id: string;
  title: string;
  level: string;
  description: string;
  checkins: number;
  isActive: boolean;
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
            <g filter="url(#filter0_f_13_381)" id="Ellipse 2">
              <ellipse cx="347.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_13_381"
              width="695"
              x="0"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_13_381" stdDeviation="127.5" />
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
function SymbolBig() {
  return (
    <div className="h-[10px] sm:h-[12px] md:h-[13px] relative w-[6px] sm:w-[7px] md:w-2" data-name="Symbol_big">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 13">
        <g id="Symbol_big">
          <path d={svgPaths.p377b7c00} fill="var(--fill-0, #E1FF00)" id="Union" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Адаптивный компонент названия приложения с версией beta
 */
function MenhausenBeta() {
  return (
    <div className="absolute inset-[2.21%_6.75%_7.2%_10.77%]" data-name="Menhausen beta">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 106 12">
        <g id="Menhausen beta">
          <path d={svgPaths.p25a36300} fill="var(--fill-0, #E1FF00)" id="Vector" />
          <path d={svgPaths.p1120ed00} fill="var(--fill-0, #E1FF00)" id="Vector_2" />
          <path d={svgPaths.p33898780} fill="var(--fill-0, #E1FF00)" id="Vector_3" />
          <path d={svgPaths.p9060800} fill="var(--fill-0, #E1FF00)" id="Vector_4" />
          <path d={svgPaths.p32d14cf0} fill="var(--fill-0, #CFCFCF)" id="Vector_5" />
          <path d={svgPaths.p1786c280} fill="var(--fill-0, #CFCFCF)" id="Vector_6" />
          <path d={svgPaths.p23ce7e00} fill="var(--fill-0, #CFCFCF)" id="Vector_7" />
          <path d={svgPaths.p35fc2600} fill="var(--fill-0, #CFCFCF)" id="Vector_8" />
          <path d={svgPaths.p30139900} fill="var(--fill-0, #CFCFCF)" id="Vector_9" />
          <path d={svgPaths.p33206e80} fill="var(--fill-0, #CFCFCF)" id="Vector_10" />
          <path d={svgPaths.p2cb2bd40} fill="var(--fill-0, #CFCFCF)" id="Vector_11" />
          <path d={svgPaths.p3436ffe0} fill="var(--fill-0, #CFCFCF)" id="Vector_12" />
          <path d={svgPaths.p296762f0} fill="var(--fill-0, #CFCFCF)" id="Vector_13" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Адаптивный мини-логотип с символом и названием
 */
function MiniStripeLogo() {
  return (
    <div className="absolute h-[10px] sm:h-[12px] md:h-[13px] left-1/2 transform -translate-x-1/2 top-[60px] sm:top-[65px] md:top-[69px] w-[80px] sm:w-[100px] md:w-32" data-name="Mini_stripe_logo">
      <div className="absolute flex h-[10px] sm:h-[12px] md:h-[13px] items-center justify-center left-0 top-1/2 translate-y-[-50%] w-[6px] sm:w-[7px] md:w-2">
        <div className="flex-none rotate-[180deg]">
          <SymbolBig />
        </div>
      </div>
      <MenhausenBeta />
    </div>
  );
}

/**
 * Адаптивный компонент прогресс-бара темы
 */
function ProgressTheme() {
  return (
    <div className="h-6 relative shrink-0 w-full max-w-[351px]" data-name="Progress_theme">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block" />
      <div className="absolute bg-[#e1ff00] bottom-0 left-0 right-[70.08%] rounded-xl top-0" data-name="Block" />
      <div className="absolute font-sans inset-[12.5%_4.56%_20.83%_4.56%] leading-[0] not-italic text-[#696969] text-[16px] text-right">
        <p className="block leading-none">Progress</p>
      </div>
    </div>
  );
}

/**
 * Адаптивная иконка чекина
 */
function CheckinIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Checkin icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Checkin icon">
          <path
            d="M11 18H3"
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M15 18L17 20L21 16"
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M16 12H3"
            id="Vector_3"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M16 6H3"
            id="Vector_4"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * Адаптивная карточка темы с min-h-[44px] min-w-[44px] дизайном
 */
function ThemeCard({ card, onClick }: { card: Card; onClick: (cardId: string) => void }) {
  const isInactive = !card.isActive;
  
  return (
    <button
      onClick={() => onClick(card.id)}
      disabled={isInactive}
      className={`${
        isInactive 
          ? "bg-[rgba(217,217,217,0.02)] cursor-not-allowed" 
          : "bg-[rgba(217,217,217,0.04)] cursor-pointer hover:bg-[rgba(217,217,217,0.06)] active:scale-98"
      } h-[106px] relative rounded-xl shrink-0 w-full transition-all duration-200 min-h-[44px] min-w-[44px]`}
      data-name="Card_item"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#505050] border-solid inset-0 pointer-events-none rounded-xl"
      />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-2.5 h-[106px] items-start justify-start p-[15px] relative w-full text-left">
          <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-full">
            <div className={`font-heading font-normal leading-[0] relative shrink-0 ${
              isInactive ? "text-[#696969]" : "text-[#e1ff00]"
            } text-[24px] text-left w-[158px]`}>
              <p className="block leading-[0.8]">{card.title}</p>
            </div>
            {card.isActive && (
              <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-end p-0 relative shrink-0 w-[85px]">
                <div className="font-heading font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-[20px] text-nowrap text-right">
                  <p className="block leading-[0.8] whitespace-pre">{card.checkins}</p>
                </div>
                <CheckinIcon />
              </div>
            )}
          </div>
          <div className={`font-sans font-bold leading-[0] not-italic relative shrink-0 ${
            isInactive ? "text-[#696969]" : "text-[#696969]"
          } text-[20px] text-left w-full`}>
            <p className="block leading-none">{card.level}</p>
          </div>
          <div className={`font-sans font-bold leading-[0] not-italic relative shrink-0 ${
            isInactive ? "text-[#696969]" : "text-[#ffffff]"
          } text-[20px] text-left w-full`}>
            <p className="block leading-none">{card.description}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * Адаптивная кнопка возврата к предыдущему экрану
 */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute left-4 sm:left-6 md:left-[21px] size-12 top-[53px] cursor-pointer hover:opacity-80 min-h-[44px] min-w-[44px]"
      data-name="Back button"
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Back button">
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
 * Кнопка "Open next level" согласно Bottom Fixed Button стандарту
 * Теперь использует стандартный компонент BottomFixedButton
 */
function OpenNextLevelButton({ onClick }: { onClick: () => void }) {
  return (
    <BottomFixedButton onClick={onClick}>
      Open next level
    </BottomFixedButton>
  );
}

/**
 * Главный компонент домашней страницы темы
 * Адаптивный дизайн с поддержкой mobile-first подхода
 */
export function ThemeHomeScreen({ onBack, onCardClick, onOpenNextLevel, themeTitle = "Stress", completedCards: _completedCards = new Set(), cardCompletionCounts: _cardCompletionCounts = {} }: ThemeHomeScreenProps) {
  // Моковые данные карточек (в реальном приложении будут загружаться с сервера)
  const cards: Card[] = [
    {
      id: "card-1",
      title: "Card #1",
      level: "Level 1",
      description: "Some text about card and more.",
      checkins: 1,
      isActive: true
    },
    {
      id: "card-2", 
      title: "Card #1",
      level: "Level 1",
      description: "Some text about card and more.",
      checkins: 20,
      isActive: true
    },
    {
      id: "card-3",
      title: "Card #2",
      level: "Level 1", 
      description: "Some text about card and more.",
      checkins: 4,
      isActive: true
    },
    {
      id: "card-4",
      title: "Card #3",
      level: "Level 2",
      description: "Some text about card and more.",
      checkins: 7,
      isActive: true
    },
    {
      id: "card-5",
      title: "Card #4",
      level: "Level 2",
      description: "Some text about card and more.",
      checkins: 0,
      isActive: false
    },
    {
      id: "card-6",
      title: "Card #5",
      level: "Level 3",
      description: "Some text about card and more.",
      checkins: 0,
      isActive: false
    },
    {
      id: "card-7",
      title: "Card #6",
      level: "Level 3",
      description: "Some text about card and more.",
      checkins: 0,
      isActive: false
    },
    {
      id: "card-8",
      title: "Card #7",
      level: "Level 4",
      description: "Some text about card and more.",
      checkins: 0,
      isActive: false
    },
    {
      id: "card-9",
      title: "Card #8",
      level: "Level 4",
      description: "Some text about card and more.",
      checkins: 0,
      isActive: false
    },
    {
      id: "card-10",
      title: "Card #9",
      level: "Level 5",
      description: "Some text about card and more.",
      checkins: 0,
      isActive: false
    },
    {
      id: "card-11",
      title: "Card #10",
      level: "Level 5",
      description: "Some text about card and more.",
      checkins: 0,
      isActive: false
    }
  ];

  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden bg-[#111111] flex flex-col">
      {/* Световые эффекты */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Кнопка назад */}
      <BackButton onClick={onBack} />
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[120px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Заголовок */}
            <div className="text-center mb-8">
              <h1 className="font-heading font-normal text-white text-[36px] mb-4 leading-[0.8]">
                {themeTitle}
              </h1>
            </div>
            
            {/* Прогресс темы */}
            <div className="mb-8">
              <ProgressTheme />
            </div>
            
            {/* Карточки */}
            <div className="space-y-4">
              {cards.map((card) => (
                <ThemeCard 
                  key={card.id}
                  card={card}
                  onClick={() => onCardClick(card.id)}
                />
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <OpenNextLevelButton onClick={onOpenNextLevel} />

    </div>
  );
}