// Импортируем необходимые хуки и SVG пути
import svgPaths from "../imports/svg-yl2fpr7m1a";
import { BottomFixedButton } from "./BottomFixedButton";

// Типы для пропсов компонента
interface CheckinDetailsScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
  checkinId: string; // ID чекина
  cardTitle?: string; // Название карточки (опционально)
  checkinDate?: string; // Дата чекина (опционально)
}

// Типы для данных чекина
interface CheckinData {
  id: string;
  cardTitle: string;
  date: string;
  formattedDate: string;
  question1: string;
  answer1: string;
  question2: string;
  answer2: string;
  instructions: string;
  whyNote: string;
}

/**
 * Адаптивный компонент световых эффектов для фона
 */
function Light() {
  return (
    <div
      className="absolute h-[917px] sm:h-[1000px] md:h-[1100px] left-1/2 top-[-65px] translate-x-[-50%] w-[211px] sm:w-[240px] md:w-[280px]"
      data-name="Light"
    >
      <div className="absolute inset-[-27.81%_-120.85%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 721 1427">
          <g id="Light">
            <g filter="url(#filter0_f_17_905)" id="Ellipse 2">
              <ellipse cx="361.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
            <g filter="url(#filter1_f_17_905)" id="Ellipse 1">
              <ellipse cx="360.5" cy="1113.5" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="105.5" ry="58.5" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_17_905"
              width="695"
              x="14"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_17_905" stdDeviation="127.5" />
            </filter>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="627"
              id="filter1_f_17_905"
              width="721"
              x="0"
              y="800"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_17_905" stdDeviation="127.5" />
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
 * Адаптивная разделительная линия
 */
function SeparationLine() {
  return (
    <div
      className="bg-[#ffffff] relative shrink-0 w-full"
      data-name="Separation Line"
      style={{ height: "3.06854e-05px" }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 top-[-1px]"
        style={{ "--stroke-0": "rgba(45, 43, 43, 1)" } as React.CSSProperties}
      >
        <svg className="block size-full" fill="none" preserveAspectRatio="none" role="presentation" viewBox="0 0 351 1">
          <line
            id="Sepapration line"
            stroke="var(--stroke-0, #2D2B2B)"
            x1="4.37114e-08"
            x2="351"
            y1="0.5"
            y2="0.500031"
          />
        </svg>
      </div>
    </div>
  );
}

/**
 * Адаптивный заголовок карточки с информацией
 */
function CardInfo({ cardTitle, formattedDate }: { cardTitle: string; formattedDate: string }) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Card Info"
    >
      <div className="font-['Roboto_Slab:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-left w-full">
        <p className="leading-[0.8] text-[20px] sm:text-[22px] md:text-[24px]">
          <span>{cardTitle} / </span>
          <span className="text-[#696969]">{formattedDate}</span>
        </p>
      </div>
      <SeparationLine />
    </div>
  );
}

/**
 * Адаптивный блок с ответом пользователя
 */
function InputAnswerBlock({ answer, height = 85 }: { answer: string; height?: number }) {
  return (
    <div
      className={`bg-[rgba(217,217,217,0.04)] relative rounded-xl shrink-0 w-full`}
      style={{ minHeight: `${height}px` }}
      data-name="Input answer block"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
      />
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className={`box-border content-stretch flex flex-row gap-2.5 items-center justify-center p-[20px] relative w-full`} style={{ minHeight: `${height}px` }}>
          <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#cfcfcf] text-[18px] sm:text-[19px] md:text-[20px] text-left w-full">
            <p className="block leading-none">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Адаптивный основной контейнер с вопросами и ответами
 */
function MainContent({ checkinData }: { checkinData: CheckinData }) {
  return (
    <div className="box-border content-stretch flex flex-col gap-[30px] items-start justify-start p-0 relative shrink-0 w-full">
      {/* Первый вопрос */}
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#e1ff00] text-[18px] sm:text-[19px] md:text-[20px] text-left w-full">
        <p className="block leading-none">{checkinData.question1}</p>
      </div>
      <InputAnswerBlock answer={checkinData.answer1} height={85} />
      
      {/* Второй вопрос */}
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#e1ff00] text-[18px] sm:text-[19px] md:text-[20px] text-left w-full">
        <p className="block leading-none">{checkinData.question2}</p>
      </div>
      <InputAnswerBlock answer={checkinData.answer2} height={83} />
      
      {/* Инструкции и пояснения */}
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[18px] sm:text-[19px] md:text-[20px] text-left w-full">
        <p className="block leading-none mb-0">
          {checkinData.instructions}
        </p>
        <p className="block leading-none mb-0">&nbsp;</p>
        <p className="block leading-none mb-0">
          Track 3 irritating reactions over the course of a week and write down what you expected to happen at those moments.
        </p>
        <p className="block leading-none mb-0">&nbsp;</p>
        <p className="leading-none">
          <span className="text-[#e1ff00]">Why:</span>
          <span> {checkinData.whyNote}</span>
        </p>
      </div>
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
 * Главный компонент страницы деталей чекина
 * Адаптивный дизайн с поддержкой mobile-first подхода и корректным скроллингом
 */
export function CheckinDetailsScreen({ onBack, checkinId, cardTitle = "Card #1", checkinDate }: CheckinDetailsScreenProps) {
  /**
   * Функция для получения данных чекина
   * В реальном приложении данные будут загружаться с сервера
   */
  const getCheckinData = (id: string): CheckinData => {
    // Моковые данные чекинов (в реальном приложении будут загружаться с сервера)
    const checkinMapping: Record<string, Omit<CheckinData, 'id'>> = {
      "1": {
        cardTitle: "Card #1",
        date: "1984-02-26",
        formattedDate: "26.02.1984",
        question1: "What in other people's behavior most often irritates or offends you?",
        answer1: "Oh, I don't know what to say. Everyone just pisses me off.",
        question2: "What are your expectations behind this reaction?",
        answer2: "I want everyone to just leave me alone and that's it",
        instructions: "Awareness of expectations reduces the automaticity of emotional reactions.",
        whyNote: "You learn to distinguish people's behavior from your own projections."
      },
      "2": {
        cardTitle: "Card #1",
        date: "1986-02-26",
        formattedDate: "26.02.1986",
        question1: "What in other people's behavior most often irritates or offends you?",
        answer1: "When people don't listen to what I'm saying and interrupt me constantly.",
        question2: "What are your expectations behind this reaction?",
        answer2: "I expect people to respect my time and opinions when I'm speaking.",
        instructions: "Awareness of expectations reduces the automaticity of emotional reactions.",
        whyNote: "You learn to distinguish people's behavior from your own projections."
      },
      "3": {
        cardTitle: "Card #2",
        date: "2000-02-26",
        formattedDate: "26.02.2000",
        question1: "What in other people's behavior most often irritates or offends you?",
        answer1: "People who are always late and don't apologize for it.",
        question2: "What are your expectations behind this reaction?",
        answer2: "I expect punctuality and respect for other people's schedules.",
        instructions: "Awareness of expectations reduces the automaticity of emotional reactions.",
        whyNote: "You learn to distinguish people's behavior from your own projections."
      }
    };

    const defaultData = {
      cardTitle: cardTitle,
      date: checkinDate || "2025-01-01",
      formattedDate: checkinDate || "01.01.2025",
      question1: "What in other people's behavior most often irritates or offends you?",
      answer1: "This is a sample answer for demonstration purposes.",
      question2: "What are your expectations behind this reaction?",
      answer2: "This is another sample answer to show the format.",
      instructions: "Awareness of expectations reduces the automaticity of emotional reactions.",
      whyNote: "You learn to distinguish people's behavior from your own projections."
    };

    return {
      id,
      ...(checkinMapping[id] || defaultData)
    };
  };

  const checkinData = getCheckinData(checkinId);

  return (
    <div 
      className="bg-[#111111] relative size-full min-h-screen" 
      data-name="Checkin Details Page"
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
            {/* Заголовок карточки с информацией */}
            <CardInfo 
              cardTitle={checkinData.cardTitle} 
              formattedDate={checkinData.formattedDate}
            />
            
            {/* Основной контент с вопросами и ответами */}
            <MainContent checkinData={checkinData} />
          </div>
        </div>
      </div>
      
      {/* Bottom Fixed CTA Button согласно Guidelines.md */}
      <BottomFixedButton onClick={onBack}>
        Continue
      </BottomFixedButton>
    </div>
  );
}