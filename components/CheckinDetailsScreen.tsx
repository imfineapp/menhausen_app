// Импортируем необходимые хуки и SVG пути
import { BottomFixedButton } from "./BottomFixedButton";
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';

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
  practiceTask: string;
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
      <div className="font-heading font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-left w-full">
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
          <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#cfcfcf] text-[18px] sm:text-[19px] md:text-[20px] text-left w-full">
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
  const { content, getLocalizedText } = useContent();
  
  return (
    <div className="box-border content-stretch flex flex-col gap-[30px] items-start justify-start p-0 relative shrink-0 w-full">
      {/* Первый вопрос */}
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#e1ff00] text-[18px] sm:text-[19px] md:text-[20px] text-left w-full">
        <p className="block leading-none">{checkinData.question1}</p>
      </div>
      <InputAnswerBlock answer={checkinData.answer1} height={85} />
      
      {/* Второй вопрос */}
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#e1ff00] text-[18px] sm:text-[19px] md:text-[20px] text-left w-full">
        <p className="block leading-none">{checkinData.question2}</p>
      </div>
      <InputAnswerBlock answer={checkinData.answer2} height={83} />
      
      {/* Инструкции и пояснения */}
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[18px] sm:text-[19px] md:text-[20px] text-left w-full">
        <p className="block leading-none mb-0">
          {checkinData.instructions}
        </p>
        <p className="block leading-none mb-0">&nbsp;</p>
        <p className="block leading-none mb-0">
          {checkinData.practiceTask}
        </p>
        <p className="block leading-none mb-0">&nbsp;</p>
        <p className="leading-none">
          <span className="text-[#e1ff00]">{getLocalizedText(content.ui.cards.final.why)}</span>
          <span> {checkinData.whyNote}</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Кнопка для страницы деталей чекина
 */
function CheckinDetailsBottomButton({ onClick }: { onClick: () => void }) {
  const { content, getLocalizedText } = useContent();
  
  return (
    <BottomFixedButton onClick={onClick}>
      {getLocalizedText(content.ui.navigation.continue)}
    </BottomFixedButton>
  );
}


/**
 * Главный компонент страницы деталей чекина
 * Адаптивный дизайн с поддержкой mobile-first подхода и корректным скроллингом
 */
export function CheckinDetailsScreen({ onBack, checkinId, cardTitle = "Card #1", checkinDate }: CheckinDetailsScreenProps) {
  const { getLocalizedText, getCard } = useContent();
  
  /**
   * Функция для получения данных чекина
   * В реальном приложении данные будут загружаться с сервера
   */
  const getCheckinData = (id: string): CheckinData => {
    // Получаем данные карточки для переводов вопросов и рекомендаций
    const cardData = getCard('card-1'); // Используем первую карточку как пример
    
    // Моковые данные ответов пользователей (не переводятся)
    const userAnswersMapping: Record<string, { answer1: string; answer2: string }> = {
      "1": {
        answer1: "Oh, I don't know what to say. Everyone just pisses me off.",
        answer2: "I want everyone to just leave me alone and that's it"
      },
      "2": {
        answer1: "When people don't listen to what I'm saying and interrupt me constantly.",
        answer2: "I expect people to respect my time and opinions when I'm speaking."
      },
      "3": {
        answer1: "People who are always late and don't apologize for it.",
        answer2: "I expect punctuality and respect for other people's schedules."
      }
    };

    const defaultAnswers = {
      answer1: "This is a sample answer for demonstration purposes.",
      answer2: "This is another sample answer to show the format."
    };

    const userAnswers = userAnswersMapping[id] || defaultAnswers;

    // Получаем переведенные вопросы и рекомендации из карточки
    const question1 = cardData?.questions?.[0] ? getLocalizedText(cardData.questions[0].text) : "What in other people's behavior most often irritates or offends you?";
    const question2 = cardData?.questions?.[1] ? getLocalizedText(cardData.questions[1].text) : "What are your expectations behind this reaction?";
    const instructions = cardData?.finalMessage?.message ? getLocalizedText(cardData.finalMessage.message) : "Awareness of expectations reduces the automaticity of emotional reactions.";
    const practiceTask = cardData?.finalMessage?.practiceTask ? getLocalizedText(cardData.finalMessage.practiceTask) : "Track 3 irritating reactions over the course of a week and write down what you expected to happen at those moments.";
    const whyNote = cardData?.finalMessage?.whyExplanation ? getLocalizedText(cardData.finalMessage.whyExplanation) : "You learn to distinguish people's behavior from your own projections.";

    return {
      id,
      cardTitle: cardTitle,
      date: checkinDate || "2025-01-01",
      formattedDate: checkinDate || "01.01.2025",
      question1,
      answer1: userAnswers.answer1,
      question2,
      answer2: userAnswers.answer2,
      instructions,
      practiceTask,
      whyNote
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
      <CheckinDetailsBottomButton onClick={onBack} />
    </div>
  );
}