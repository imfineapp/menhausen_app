// Импортируем необходимые хуки и SVG пути
import svgPaths from "../imports/svg-3cs3yu7qqd";

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
 * Адаптивная кнопка возврата к предыдущему экрану
 */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute left-4 sm:left-6 md:left-[21px] size-12 top-[53px] cursor-pointer hover:opacity-80 touch-friendly"
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
 * Адаптивный заголовок карточки с описанием
 */
function CardHeader({ cardTitle = "Card #1", cardDescription }: { cardTitle?: string; cardDescription?: string }) {
  const defaultDescription = "Difficulties with others often start with uncertainty in oneself. Let's figure out what exactly is bothering us.";
  
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 text-left w-full"
      data-name="Card Header"
    >
      <div className="font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] font-normal relative shrink-0 text-[#e1ff00] text-[24px] w-full">
        <p className="block leading-[0.8]">{cardTitle}</p>
      </div>
      <div className="font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] not-italic relative shrink-0 text-[#ffffff] text-[20px] w-full">
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
      className="h-[60px] relative shrink-0 w-full cursor-pointer hover:bg-[rgba(217,217,217,0.06)] active:scale-98 transition-all duration-200 touch-friendly"
      data-name="Checkin"
    >
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Background">
        <div
          aria-hidden="true"
          className="absolute border border-[#505050] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
      <div className="absolute font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] inset-[33.33%_4.84%_33.33%_3.7%] leading-[0] not-italic text-[#ffffff] text-[20px] text-left">
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
      <div className="font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] font-normal leading-[0] mb-[39px] relative text-[#e1ff00] text-[24px] text-left w-full">
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
 */
function OpenCardButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute bg-[#e1ff00] box-border content-stretch flex flex-row gap-2.5 h-[46px] items-center justify-center left-[23px] px-[126px] py-[15px] rounded-xl top-[758px] w-[350px] cursor-pointer touch-friendly hover:bg-[#d1ef00] active:scale-98 transition-all duration-200"
      data-name="Button"
    >
      <div className="font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] font-bold leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center text-nowrap tracking-[-0.43px]">
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">Open card</p>
      </div>
    </button>
  );
}

/**
 * Главный компонент страницы деталей карточки
 * Адаптивный дизайн с поддержкой mobile-first подхода и корректным скроллингом
 */
export function CardDetailsScreen({ onBack, onOpenCard, onOpenCheckin, cardId, cardTitle, cardDescription }: CardDetailsScreenProps) {
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
    <div 
      className="bg-[#111111] relative size-full min-h-screen" 
      data-name="Card Details Page"
    >
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Мини-логотип */}
      <MiniStripeLogo />
      
      {/* Кнопка возврата */}
      <BackButton onClick={onBack} />
      
      {/* Основной контент - скроллируемый */}
      <div className="absolute top-[141px] left-0 right-0 bottom-0 overflow-y-auto">
        <div className="px-4 sm:px-6 md:px-[21px] py-5 pb-[180px]">
          <div className="w-full max-w-[351px] mx-auto flex flex-col gap-10">
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
      
      {/* Bottom Fixed CTA Button согласно Guidelines.md */}
      <OpenCardButton onClick={handleOpenCard} />
    </div>
  );
}