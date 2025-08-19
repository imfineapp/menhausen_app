import { useState } from 'react';
import svgPaths from "../imports/svg-4zkt7ew0xn";

/**
 * Компонент страницы покупки Premium подписки
 * Основан на импортированном дизайне PaymentsPage.tsx
 * Включает выбор планов подписки и интерактивную покупку
 */

interface PaymentsScreenProps {
  onBack: () => void;
  onPurchaseComplete: () => void;
}

/**
 * Декоративный световой эффект в верхней части экрана
 */
function Light() {
  return (
    <div
      className="absolute h-[130px] top-[-65px] translate-x-[-50%] w-[185px]"
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
 * Кнопка покупки Premium с состоянием загрузки
 */
function BuyButton({ onPurchase, isLoading, selectedPlan: _selectedPlan }: { onPurchase: () => void; isLoading: boolean; selectedPlan: 'monthly' | 'annually' }) {
  return (
    <button
      onClick={onPurchase}
      disabled={isLoading}
      className={`absolute bg-[#e1ff00] box-border content-stretch flex flex-row gap-2.5 h-[46px] items-center justify-center left-[23px] px-[126px] py-[15px] rounded-xl top-[758px] w-[350px] touch-friendly hover:bg-[#d1ef00] ${
        isLoading ? 'opacity-70 cursor-not-allowed' : ''
      }`}
      data-name="Buy Button"
    >
      <div className="font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] font-bold leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center text-nowrap tracking-[-0.43px]">
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">
          {isLoading ? 'Processing...' : 'Buy Premium'}
        </p>
      </div>
    </button>
  );
}

/**
 * Фон для блока текущего плана
 */
function ThemeBlockBackground() {
  return (
    <div className="absolute h-[95px] left-0 top-0 w-[351px]" data-name="theme_block_background">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
        <div
          aria-hidden="true"
          className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
    </div>
  );
}

/**
 * Информация о текущем плане пользователя
 */
function PlanInfo() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 text-center text-nowrap"
      data-name="Plan Info"
    >
      <div className="[grid-area:1_/_1] font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] ml-[74px] mt-0 not-italic relative text-[#ffffff] text-[20px] translate-x-[-50%]">
        <p className="block leading-none text-nowrap whitespace-pre">Your current plan</p>
      </div>
      <div className="[grid-area:1_/_1] font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] font-normal ml-[74px] mt-[30px] relative text-[#e1ff00] text-[24px] translate-x-[-50%]">
        <p className="block leading-[0.8] text-nowrap whitespace-pre">FREE</p>
      </div>
    </div>
  );
}

/**
 * Контейнер для информации о текущем плане
 */
function CurrentPlanContainer() {
  return (
    <div className="h-[95px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col gap-2.5 h-[95px] items-center justify-center px-[97px] py-5 relative w-full">
          <ThemeBlockBackground />
          <PlanInfo />
        </div>
      </div>
    </div>
  );
}

/**
 * Фон для Premium блока
 */
function ThemeBlockBackground1() {
  return (
    <div className="absolute h-[198px] left-0 top-0 w-[351px]" data-name="theme_block_background">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
        <div
          aria-hidden="true"
          className="absolute border border-[#e1ff00] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
    </div>
  );
}

/**
 * Описание Premium плана с преимуществами
 */
function PremiumContainer() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-col gap-2.5 h-[198px] items-center justify-start ml-0 mt-0 px-[19px] py-4 relative w-[351px]"
      data-name="Container"
    >
      <ThemeBlockBackground1 />
      <div className="font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-[24px] text-center text-nowrap">
        <p className="block leading-[0.8] whitespace-pre">Premium</p>
      </div>
      <div className="font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] h-[131px] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left w-[310px]">
        <p className="block leading-none mb-0">Opened all themes and cards</p>
        <ul className="css-ed5n1g list-disc">
          <li className="mb-0 ms-[30px]">
            <span className="leading-none">Angry</span>
          </li>
          <li className="mb-0 ms-[30px]">
            <span className="leading-none">Sadness and apathy</span>
          </li>
          <li className="mb-0 ms-[30px]">
            <span className="leading-none">Anxiety</span>
          </li>
          <li className="mb-0 ms-[30px]">
            <span className="leading-none">Lack and self-confidence</span>
          </li>
          <li className="ms-[30px]">
            <span className="leading-none">Relationships and family</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Контейнер Premium описания
 */
function PremiumInfoContainer() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0"
      data-name="Container"
    >
      <PremiumContainer />
    </div>
  );
}

/**
 * Объединенный контейнер для текущего плана и Premium описания
 */
function PlanComparisonContainer() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <CurrentPlanContainer />
      <PremiumInfoContainer />
    </div>
  );
}

/**
 * Фон для выбранного месячного плана
 */
function ThemeBlockBackground2() {
  return (
    <div className="absolute h-[82px] left-0 top-0 w-[351px]" data-name="theme_block_background">
      <div className="absolute bg-[#e1ff00] inset-0 rounded-xl" data-name="Block" />
    </div>
  );
}

/**
 * Иконка Premium звезды
 */
function _PlanIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Plan Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Plan Icon">
          <path
            d={svgPaths.p9b81900}
            id="Vector"
            stroke="var(--stroke-0, #2D2B2B)"
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
 * Контейнер цены плана
 */
function PlanPriceContainer({ price, color }: { price: string; color: string }) {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-[5px] items-center justify-start p-0 relative shrink-0"
      data-name="Plan Price Container"
    >
      <div className={`font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] font-bold leading-[0] not-italic relative shrink-0 text-[${color}] text-[20px] text-left text-nowrap`}>
        <p className="block leading-none whitespace-pre">{price}</p>
      </div>
      <div className="relative shrink-0 size-6" data-name="Plan Icon">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <g id="Plan Icon">
            <path
              d={svgPaths.p9b81900}
              id="Vector"
              stroke={color === '#2d2b2b' ? "var(--stroke-0, #2D2B2B)" : "var(--stroke-0, #E1FF00)"}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

/**
 * Стоимость плана с периодом
 */
function PlanCost({ price, period, color }: { price: string; period: string; color: string }) {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center p-0 relative shrink-0"
      data-name="Plan Cost"
    >
      <PlanPriceContainer price={price} color={color} />
      <div className={`font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] font-bold leading-[0] not-italic relative shrink-0 text-[${color}] text-[20px] text-left text-nowrap`}>
        <p className="block leading-none whitespace-pre">{period}</p>
      </div>
    </div>
  );
}

/**
 * Детали плана подписки
 */
function PlanDetails({ title, price, period, color }: { title: string; price: string; period: string; color: string }) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0"
      data-name="Plan Details"
    >
      <div
        className={`font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] font-normal leading-[0] min-w-full relative shrink-0 text-[${color}] text-[20px] text-left`}
        style={{ width: "min-content" }}
      >
        <p className="block leading-[0.8]">{title}</p>
      </div>
      <PlanCost price={price} period={period} color={color} />
    </div>
  );
}

/**
 * Радио кнопка для выбора плана
 */
function RadioButton({ isSelected, color }: { isSelected: boolean; color: string }) {
  return (
    <div className="relative shrink-0 size-3.5" data-name="Radio_button">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Radio_button">
          <circle 
            cx="7" 
            cy="7" 
            id="Ellipse 5" 
            r="6" 
            stroke={color === '#2d2b2b' ? "var(--stroke-0, #2D2B2B)" : "var(--stroke-0, #696969)"} 
            strokeWidth="2" 
          />
          {isSelected && (
            <circle 
              cx="7" 
              cy="7" 
              r="3" 
              fill={color === '#2d2b2b' ? "#2d2b2b" : "#e1ff00"} 
            />
          )}
        </g>
      </svg>
    </div>
  );
}

/**
 * Опция выбора плана
 */
function PlanOption({ 
  title, 
  price, 
  period, 
  isSelected, 
  isHighlighted 
}: { 
  title: string; 
  price: string; 
  period: string; 
  isSelected: boolean; 
  isHighlighted: boolean;
}) {
  const color = isHighlighted ? '#2d2b2b' : '#ffffff';
  
  return (
    <div
      className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-[310px]"
      data-name="Plan Option"
    >
      <PlanDetails title={title} price={price} period={period} color={color} />
      <div className="touch-friendly flex items-center justify-center">
        <RadioButton isSelected={isSelected} color={color} />
      </div>
    </div>
  );
}

/**
 * Контейнер месячного плана
 */
function MonthlyPlanContainer({ isSelected, onSelect }: { isSelected: boolean; onSelect: () => void }) {
  return (
    <button 
      onClick={onSelect}
      className="h-[82px] relative shrink-0 w-full touch-friendly hover:bg-[rgba(217,217,217,0.06)]" 
      data-name="Container"
    >
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col gap-2.5 h-[82px] items-center justify-center px-5 py-[15px] relative w-full">
          {isSelected && <ThemeBlockBackground2 />}
          {!isSelected && (
            <div className="absolute h-[82px] left-0 top-0 w-[351px]" data-name="theme_block_background">
              <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
                <div
                  aria-hidden="true"
                  className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
                />
              </div>
            </div>
          )}
          <PlanOption 
            title="Monthly" 
            price="150" 
            period="/ month" 
            isSelected={isSelected}
            isHighlighted={isSelected}
          />
        </div>
      </div>
    </button>
  );
}

/**
 * Контейнер годового плана
 */
function AnnuallyPlanContainer({ isSelected, onSelect }: { isSelected: boolean; onSelect: () => void }) {
  return (
    <button 
      onClick={onSelect}
      className="h-[82px] relative shrink-0 w-full touch-friendly hover:bg-[rgba(217,217,217,0.06)]" 
      data-name="Container"
    >
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col gap-2.5 h-[82px] items-center justify-center px-5 py-[15px] relative w-full">
          <div className="absolute h-[82px] left-0 top-0 w-[351px]" data-name="theme_block_background">
            <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
              <div
                aria-hidden="true"
                className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
              />
            </div>
          </div>
          <PlanOption 
            title="Annually" 
            price="150" 
            period="/ year" 
            isSelected={isSelected}
            isHighlighted={false}
          />
        </div>
      </div>
    </button>
  );
}

/**
 * Контейнер выбора планов подписки
 */
function PlanSelectionContainer({ 
  selectedPlan, 
  onSelectPlan 
}: { 
  selectedPlan: 'monthly' | 'annually'; 
  onSelectPlan: (plan: 'monthly' | 'annually') => void;
}) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <MonthlyPlanContainer 
        isSelected={selectedPlan === 'monthly'} 
        onSelect={() => onSelectPlan('monthly')} 
      />
      <AnnuallyPlanContainer 
        isSelected={selectedPlan === 'annually'} 
        onSelect={() => onSelectPlan('annually')} 
      />
    </div>
  );
}

/**
 * Основной контейнер с информацией и выбором планов
 */
function MainContainer({ 
  selectedPlan, 
  onSelectPlan 
}: { 
  selectedPlan: 'monthly' | 'annually'; 
  onSelectPlan: (plan: 'monthly' | 'annually') => void;
}) {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-5 items-start justify-start left-[19px] p-0 top-[120px] w-[352px]"
      data-name="Container"
    >
      <PlanComparisonContainer />
      <PlanSelectionContainer selectedPlan={selectedPlan} onSelectPlan={onSelectPlan} />
    </div>
  );
}

/**
 * SVG иконка для стрелки назад
 */
function SymbolBig() {
  return (
    <div className="h-[13px] relative w-2" data-name="Symbol_big">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 13">
        <g id="Symbol_big">
          <path d={svgPaths.p377b7c00} fill="var(--fill-0, #E1FF00)" id="Union" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Логотип Menhausen Beta
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
 * Мини-логотип с иконкой
 */
function MiniStripeLogo() {
  return (
    <div className="absolute h-[13px] left-[133px] top-[69px] w-32" data-name="Mini_stripe_logo">
      <div className="absolute flex h-[13px] items-center justify-center left-0 top-1/2 translate-y-[-50%] w-2">
        <div className="flex-none rotate-[180deg]">
          <SymbolBig />
        </div>
      </div>
      <MenhausenBeta />
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
      data-name="Back button"
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
 * Основной компонент экрана покупки Premium подписки
 */
export function PaymentsScreen({ onBack, onPurchaseComplete }: PaymentsScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annually'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Обработчик покупки Premium подписки
   */
  const handlePurchase = async () => {
    try {
      console.log('Starting Premium purchase process...', { plan: selectedPlan });
      setIsLoading(true);

      // Добавляем тактильную обратную связь если доступна
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }

      // Имитация API запроса на покупку подписки
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Premium purchase completed');
      
      // Показываем уведомление об успешной покупке
      alert(`Premium ${selectedPlan} subscription activated successfully! Welcome to Premium!`);

      // Вызываем callback для завершения покупки
      onPurchaseComplete();

    } catch (error) {
      console.error('Error purchasing Premium:', error);
      alert('An error occurred while processing your purchase. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] relative size-full" data-name="Payments Screen">
      <Light />
      <BuyButton onPurchase={handlePurchase} isLoading={isLoading} selectedPlan={selectedPlan} />
      <MainContainer selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} />
      <MiniStripeLogo />
      <BackButton onBack={onBack} />
    </div>
  );
}