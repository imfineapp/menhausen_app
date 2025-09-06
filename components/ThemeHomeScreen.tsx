// Импортируем необходимые хуки и SVG пути
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';

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
 * Адаптивный компонент прогресс-бара темы
 */
function ProgressTheme() {
  const { content, getLocalizedText } = useContent();
  
  return (
    <div className="h-6 relative shrink-0 w-full max-w-[351px]" data-name="Progress_theme">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block" />
      <div className="absolute bg-[#e1ff00] bottom-0 left-0 right-[70.08%] rounded-xl top-0" data-name="Block" />
      <div className="absolute inset-[12.5%_4.56%_20.83%_4.56%] text-[#696969] text-right">
        <p className="typography-caption block">{getLocalizedText(content.ui.themes.home.progress)}</p>
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
  const { content: _content } = useContent();
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
            <div className={`typography-h2 ${
              isInactive ? "text-[#696969]" : "text-[#e1ff00]"
            } text-left w-[158px]`}>
              <h2 className="block">{card.title}</h2>
            </div>
            {card.isActive && (
              <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-end p-0 relative shrink-0 w-[85px]">
                <div className="typography-h2 text-[#e1ff00] text-nowrap text-right">
                  <h2 className="block whitespace-pre">{card.checkins}</h2>
                </div>
                <CheckinIcon />
              </div>
            )}
          </div>
          <div className={`typography-body ${
            isInactive ? "text-[#696969]" : "text-[#696969]"
          } text-left w-full`}>
            <p className="block">{card.level}</p>
          </div>
          <div className={`typography-body ${
            isInactive ? "text-[#696969]" : "text-[#ffffff]"
          } text-left w-full`}>
            <p className="block">{card.description}</p>
          </div>
        </div>
      </div>
    </button>
  );
}


/**
 * Кнопка "Open next level" согласно Bottom Fixed Button стандарту
 * Теперь использует стандартный компонент BottomFixedButton
 */
function OpenNextLevelButton({ onClick }: { onClick: () => void }) {
  const { content, getLocalizedText } = useContent();
  
  return (
    <BottomFixedButton onClick={onClick}>
      {getLocalizedText(content.ui.themes.home.nextLevel)}
    </BottomFixedButton>
  );
}

/**
 * Главный компонент домашней страницы темы
 * Адаптивный дизайн с поддержкой mobile-first подхода
 */
export function ThemeHomeScreen({ onBack: _onBack, onCardClick, onOpenNextLevel, themeTitle = "Stress", completedCards: _completedCards = new Set(), cardCompletionCounts: _cardCompletionCounts = {} }: ThemeHomeScreenProps) {
  const { content, getLocalizedText } = useContent();
  
  // Проверяем, что контент загружен
  if (!content?.ui?.cards?.themeHome) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#111111]">
        <div className="text-white text-center">
          <div className="text-lg">Loading content...</div>
        </div>
      </div>
    );
  }
  
  // Моковые данные карточек с локализованными текстами
  const cards: Card[] = [
    {
      id: "card-1",
      title: getLocalizedText(content.ui.cards.themeHome.card1),
      level: getLocalizedText(content.ui.cards.themeHome.level1),
      description: getLocalizedText(content.ui.cards.themeHome.description),
      checkins: 1,
      isActive: true
    },
    {
      id: "card-2", 
      title: getLocalizedText(content.ui.cards.themeHome.card1),
      level: getLocalizedText(content.ui.cards.themeHome.level1),
      description: getLocalizedText(content.ui.cards.themeHome.description),
      checkins: 20,
      isActive: true
    },
    {
      id: "card-3",
      title: getLocalizedText(content.ui.cards.themeHome.card2),
      level: getLocalizedText(content.ui.cards.themeHome.level1), 
      description: getLocalizedText(content.ui.cards.themeHome.description),
      checkins: 4,
      isActive: true
    },
    {
      id: "card-4",
      title: getLocalizedText(content.ui.cards.themeHome.card3),
      level: getLocalizedText(content.ui.cards.themeHome.level2),
      description: getLocalizedText(content.ui.cards.themeHome.description),
      checkins: 7,
      isActive: true
    },
    {
      id: "card-5",
      title: getLocalizedText(content.ui.cards.themeHome.card4),
      level: getLocalizedText(content.ui.cards.themeHome.level2),
      description: getLocalizedText(content.ui.cards.themeHome.description),
      checkins: 0,
      isActive: false
    },
    {
      id: "card-6",
      title: getLocalizedText(content.ui.cards.themeHome.card5),
      level: getLocalizedText(content.ui.cards.themeHome.level3),
      description: getLocalizedText(content.ui.cards.themeHome.description),
      checkins: 0,
      isActive: false
    },
    {
      id: "card-7",
      title: getLocalizedText(content.ui.cards.themeHome.card6),
      level: getLocalizedText(content.ui.cards.themeHome.level3),
      description: getLocalizedText(content.ui.cards.themeHome.description),
      checkins: 0,
      isActive: false
    },
    {
      id: "card-8",
      title: getLocalizedText(content.ui.cards.themeHome.card7),
      level: getLocalizedText(content.ui.cards.themeHome.level4),
      description: getLocalizedText(content.ui.cards.themeHome.description),
      checkins: 0,
      isActive: false
    },
    {
      id: "card-9",
      title: getLocalizedText(content.ui.cards.themeHome.card8),
      level: getLocalizedText(content.ui.cards.themeHome.level4),
      description: getLocalizedText(content.ui.cards.themeHome.description),
      checkins: 0,
      isActive: false
    },
    {
      id: "card-10",
      title: getLocalizedText(content.ui.cards.themeHome.card9),
      level: getLocalizedText(content.ui.cards.themeHome.level5),
      description: getLocalizedText(content.ui.cards.themeHome.description),
      checkins: 0,
      isActive: false
    },
    {
      id: "card-11",
      title: getLocalizedText(content.ui.cards.themeHome.card10),
      level: getLocalizedText(content.ui.cards.themeHome.level5),
      description: getLocalizedText(content.ui.cards.themeHome.description),
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
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Заголовок */}
            <div className="text-center mb-8">
              <h1 className="typography-h1 text-white mb-4">
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