import { useState } from 'react';
import svgPaths from "../imports/svg-4zkt7ew0xn";
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';

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
      <div className="[grid-area:1_/_1] typography-body ml-[74px] mt-0 text-[#ffffff] translate-x-[-50%]">
        <p className="block">Your current plan</p>
      </div>
      <div className="[grid-area:1_/_1] typography-h2 ml-[74px] mt-[30px] text-[#e1ff00] translate-x-[-50%]">
        <h2 className="block text-nowrap whitespace-pre">FREE</h2>
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
      <div className="typography-h2 text-[#e1ff00] text-center text-nowrap">
        <h2 className="block whitespace-pre">Premium</h2>
      </div>
      <div className="typography-body h-[131px] text-[#ffffff] text-left w-[310px]">
        <p className="block mb-0">Opened all themes and cards</p>
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
      <div className={`typography-body text-[${color}] text-left text-nowrap`}>
        <p className="block whitespace-pre">{price}</p>
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
      <div className={`typography-body text-[${color}] text-left text-nowrap`}>
        <p className="block whitespace-pre">{period}</p>
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
        className={`typography-body min-w-full text-[${color}] text-left`}
        style={{ width: "min-content" }}
      >
        <p className="block">{title}</p>
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
      <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
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
      className="h-[82px] relative shrink-0 w-full min-h-[44px] min-w-[44px] hover:bg-[rgba(217,217,217,0.06)]" 
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
      className="h-[82px] relative shrink-0 w-full min-h-[44px] min-w-[44px] hover:bg-[rgba(217,217,217,0.06)]" 
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
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 w-full"
      data-name="Container"
    >
      <PlanComparisonContainer />
      <PlanSelectionContainer selectedPlan={selectedPlan} onSelectPlan={onSelectPlan} />
    </div>
  );
}


/**
 * Основной компонент экрана покупки Premium подписки
 */
export function PaymentsScreen({ onBack: _onBack, onPurchaseComplete }: PaymentsScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annually'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelect = (plan: 'monthly' | 'annually') => {
    setSelectedPlan(plan);
  };

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
    <div className="w-full h-screen max-h-screen relative overflow-hidden bg-[#111111] flex flex-col">
      {/* Световые эффекты */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Основной контейнер с информацией и выбором планов */}
            <MainContainer selectedPlan={selectedPlan} onSelectPlan={handlePlanSelect} />

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <BottomFixedButton 
        onClick={handlePurchase}
        disabled={isLoading}
        className={isLoading ? 'opacity-70 cursor-not-allowed' : ''}
      >
        {isLoading ? 'Processing...' : 'Buy Premium'}
      </BottomFixedButton>

    </div>
  );
}