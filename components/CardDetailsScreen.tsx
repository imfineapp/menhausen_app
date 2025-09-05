// Импортируем необходимые хуки и SVG пути
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';

// Типы для пропсов компонента
interface CardDetailsScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
  onOpenCard: () => void; // Функция для открытия карточки (упражнения)
  onOpenCheckin?: (checkinId: string, cardTitle: string, date: string) => void; // Функция для открытия чекина
  cardId: string; // ID карточки
  cardTitle?: string; // Название карточки (опционально)
  cardDescription?: string; // Описание карточки (опционально)
}

// Типы для чекинов
interface Checkin {
  id: string;
  date: string;
  formattedDate: string;
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
 * Адаптивный заголовок карточки с описанием
 */
function CardHeader({ cardTitle = "Card #1", cardDescription }: { cardTitle?: string; cardDescription?: string }) {
  const defaultDescription = "Difficulties with others often start with uncertainty in oneself. Let's figure out what exactly is bothering us.";
  
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 text-left w-full"
      data-name="Card Header"
    >
      <div className="font-heading font-normal relative shrink-0 text-[#e1ff00] text-[24px] w-full">
        <p className="block leading-[0.8]">{cardTitle}</p>
      </div>
      <div className="font-sans not-italic relative shrink-0 text-[#ffffff] text-[20px] w-full">
        <p className="block leading-none">{cardDescription || defaultDescription}</p>
      </div>
    </div>
  );
}

/**
 * Адаптивный элемент чекина
 */
function CheckinItem({ checkin, onClick }: { checkin: Checkin; onClick?: (checkinId: string) => void }) {
  return (
    <button
      onClick={() => onClick?.(checkin.id)}
      className="h-[60px] relative shrink-0 w-full cursor-pointer hover:bg-[rgba(217,217,217,0.06)] active:scale-98 transition-all duration-200 min-h-[44px] min-w-[44px]"
      data-name="Checkin"
    >
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Background">
        <div
          aria-hidden="true"
          className="absolute border border-[#505050] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
      <div className="absolute font-sans inset-[33.33%_4.84%_33.33%_3.7%] leading-[0] not-italic text-[#ffffff] text-[20px] text-left">
        <p className="block leading-none">{checkin.formattedDate}</p>
      </div>
    </button>
  );
}

/**
 * Адаптивный контейнер списка чекинов
 */
function CheckinsContainer({ checkins, onCheckinClick }: { checkins: Checkin[]; onCheckinClick?: (checkinId: string) => void }) {
  return (
    <div
      className="relative shrink-0 w-full"
      data-name="Checkins Container"
    >
      <div className="font-heading font-normal leading-[0] mb-[39px] relative text-[#e1ff00] text-[24px] text-left w-full">
        <p className="block leading-[0.8]">Checkins</p>
      </div>
      <div
        className="flex flex-col gap-2.5 items-start justify-start relative w-full"
        data-name="Checkins List"
      >
        {checkins.map((checkin) => (
          <CheckinItem
            key={checkin.id}
            checkin={checkin}
            onClick={onCheckinClick}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Адаптивная кнопка "Open card"
 * Теперь использует стандартный компонент BottomFixedButton
 */
function OpenCardButton({ onClick }: { onClick: () => void }) {
  return (
    <BottomFixedButton onClick={onClick}>
      Open card
    </BottomFixedButton>
  );
}

/**
 * Главный компонент страницы деталей карточки
 * Адаптивный дизайн с поддержкой mobile-first подхода и корректным скроллингом
 */
export function CardDetailsScreen({ onBack: _onBack, onOpenCard, onOpenCheckin, cardId, cardTitle, cardDescription }: CardDetailsScreenProps) {
  // Моковые данные чекинов (в реальном приложении будут загружаться с сервера)
  const checkins: Checkin[] = [
    { id: "1", date: "1984-02-26", formattedDate: "26.02.1984" },
    { id: "2", date: "1986-02-26", formattedDate: "26.02.1986" },
    { id: "3", date: "2000-02-26", formattedDate: "26.02.2000" },
    { id: "4", date: "2001-02-26", formattedDate: "26.02.2001" },
    { id: "5", date: "2025-02-26", formattedDate: "26.02.2025" },
    { id: "6", date: "2026-02-26", formattedDate: "26.02.2026" },
    { id: "7", date: "2024-12-08", formattedDate: "08.12.2024" }
  ];

  /**
   * Функция для обработки клика по чекину
   * Переходит к странице деталей чекина с заполненными ответами
   */
  const handleCheckinClick = (checkinId: string) => {
    console.log(`Checkin clicked: ${checkinId}`);
    
    // Получаем дату чекина из данных
    const checkin = checkins.find(c => c.id === checkinId);
    if (checkin && onOpenCheckin) {
      onOpenCheckin(checkinId, cardTitle || 'Card', checkin.date);
    } else {
      // Fallback alert если функция не передана
      alert(`Opening checkin: ${checkinId}. Checkin details will be available soon!`);
    }
  };

  /**
   * Функция для обработки кнопки "Open card"
   * Переходит к упражнению карточки
   */
  const handleOpenCard = () => {
    console.log(`Opening card exercise: ${cardId}`);
    onOpenCard();
  };

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
            
            {/* Заголовок карточки */}
            <CardHeader 
              cardTitle={cardTitle} 
              cardDescription={cardDescription}
            />
            
            {/* Контейнер чекинов */}
            <CheckinsContainer 
              checkins={checkins}
              onCheckinClick={handleCheckinClick}
            />

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <OpenCardButton onClick={handleOpenCard} />

    </div>
  );
}