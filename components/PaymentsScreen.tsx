import { useState, useEffect, useRef } from 'react';
import svgPaths from "../imports/svg-4zkt7ew0xn";
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { Light } from './Light';
import { useContent } from './ContentContext';
import { telegramStarsPaymentService } from '../utils/telegramStarsPaymentService';

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
// Light переиспользуется из общего компонента

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
  const { content } = useContent();
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      data-name="Plan Info"
    >
      <div className="typography-body text-[#ffffff] mb-2">
        <p className="block">{content.payments.currentPlan}</p>
      </div>
      <div className="typography-h2 text-[#e1ff00]">
        <h2 className="block">{content.payments.freePlan}</h2>
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
    <div className="absolute inset-0 w-[351px]" data-name="theme_block_background">
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
  const { content } = useContent();
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-col gap-2.5 items-center justify-start ml-0 mt-0 px-[19px] py-4 relative w-[351px] min-h-[198px]"
      data-name="Container"
    >
      <ThemeBlockBackground1 />
      <div className="typography-h2 text-[#e1ff00] text-center text-nowrap">
        <h2 className="block whitespace-pre">{content.payments.premiumTitle}</h2>
      </div>
      <div className="typography-body text-[#ffffff] text-left w-[310px]">
        <p className="block mb-0">{content.payments.benefitsTitle}</p>
        {Array.isArray(content.payments.premiumThemes) && content.payments.premiumThemes.length > 0 ? (
          <ul className="css-ed5n1g list-disc">
            {content.payments.premiumThemes.map((theme, idx) => (
              <li key={idx} className={idx < (content.payments.premiumThemes?.length || 0) - 1 ? 'mb-0 ms-[30px]' : 'ms-[30px]'}>
                <span className="leading-none">{theme}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="css-ed5n1g list-disc">
            <li className="mb-0 ms-[30px]">
              <span className="leading-none">{content.payments.benefits.angry}</span>
            </li>
            <li className="mb-0 ms-[30px]">
              <span className="leading-none">{content.payments.benefits.sadness}</span>
            </li>
            <li className="mb-0 ms-[30px]">
              <span className="leading-none">{content.payments.benefits.anxiety}</span>
            </li>
            <li className="mb-0 ms-[30px]">
              <span className="leading-none">{content.payments.benefits.confidence}</span>
            </li>
            <li className="ms-[30px]">
              <span className="leading-none">{content.payments.benefits.relationships}</span>
            </li>
          </ul>
        )}
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
    <div className="absolute inset-0 w-[351px]" data-name="theme_block_background">
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
  id,
  title, 
  price, 
  period, 
  isSelected, 
  isHighlighted, 
  badge
}: { 
  id: string;
  title: string; 
  price: string; 
  period: string; 
  isSelected: boolean; 
  isHighlighted: boolean;
  badge?: string;
}) {
  const color = isHighlighted ? '#2d2b2b' : '#ffffff';
  
  return (
    <label
      htmlFor={id}
      className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-[310px] cursor-pointer"
      data-name="Plan Option"
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
    >
      <div className="flex flex-col gap-1">
        {!!badge && (
          <div className="self-start text-[#111] bg-[#e1ff00] rounded-[999px] px-2 py-[2px] text-[12px] font-medium">
            {badge}
          </div>
        )}
        <PlanDetails title={title} price={price} period={period} color={color} />
      </div>
      <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
        <input id={id} name="plan" type="radio" checked={isSelected} readOnly className="appearance-none w-0 h-0 absolute" />
        <RadioButton isSelected={isSelected} color={color} />
      </div>
    </label>
  );
}

/**
 * Контейнер месячного плана
 */
function MonthlyPlanContainer({ isSelected, onSelect }: { isSelected: boolean; onSelect: () => void }) {
  const { content } = useContent();
  return (
    <button 
      onClick={onSelect}
      className="relative shrink-0 w-full min-h-[44px] min-w-[44px] hover:bg-[rgba(217,217,217,0.06)] focus:outline-none focus:ring-2 focus:ring-[#e1ff00] rounded-xl" 
      data-name="Container"
    >
      <div className="flex flex-col items-center justify-center relative">
        <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-center px-5 py-[15px] relative w-full min-h-[82px]">
          {isSelected && <ThemeBlockBackground2 />}
          {!isSelected && (
            <div className="absolute inset-0 w-[351px]" data-name="theme_block_background">
              <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
                <div
                  aria-hidden="true"
                  className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
                />
              </div>
            </div>
          )}
          <PlanOption 
            id="plan-monthly"
            title={content.payments.plans.monthly} 
            price={"150"} 
            period={content.payments.plans.perMonth} 
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
  const { content } = useContent();
  return (
    <button 
      onClick={onSelect}
      className="relative shrink-0 w-full min-h-[44px] min-w-[44px] hover:bg-[rgba(217,217,217,0.06)] focus:outline-none focus:ring-2 focus:ring-[#e1ff00] rounded-xl" 
      data-name="Container"
    >
      <div className="flex flex-col items-center justify-center relative">
        <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-center px-5 py-[15px] relative w-full min-h-[82px]">
          <div className="absolute inset-0 w-[351px]" data-name="theme_block_background">
            <div className={`absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl ${isSelected ? 'border border-[#e1ff00]' : ''}`} data-name="Block">
              <div
                aria-hidden="true"
                className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
              />
            </div>
          </div>
          <PlanOption 
            id="plan-annually"
            title={content.payments.plans.annually} 
            price={"1500"} 
            period={content.payments.plans.perYear} 
            isSelected={isSelected}
            isHighlighted={false}
            badge={content.payments.plans.savingsBadge || content.payments.plans.mostPopularBadge}
          />
        </div>
      </div>
    </button>
  );
}

/**
 * Контейнер бессрочного плана
 */
function LifetimePlanContainer({ isSelected, onSelect }: { isSelected: boolean; onSelect: () => void }) {
  const { content } = useContent();
  return (
    <button 
      onClick={onSelect}
      className="relative shrink-0 w-full min-h-[44px] min-w-[44px] hover:bg-[rgba(217,217,217,0.06)] focus:outline-none focus:ring-2 focus:ring-[#e1ff00] rounded-xl" 
      data-name="Container"
    >
      <div className="flex flex-col items-center justify-center relative">
        <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-center px-5 py-[15px] relative w-full min-h-[82px]">
          <div className="absolute inset-0 w-[351px]" data-name="theme_block_background">
            <div className={`absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl ${isSelected ? 'border border-[#e1ff00]' : ''}`} data-name="Block">
              <div
                aria-hidden="true"
                className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
              />
            </div>
          </div>
          <PlanOption 
            id="plan-lifetime"
            title={content.payments.plans.lifetime} 
            price={"2500"} 
            period={content.payments.plans.perLifetime} 
            isSelected={isSelected}
            isHighlighted={false}
            badge={content.payments.plans.mostPopularBadge}
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
  selectedPlan: 'monthly' | 'annually' | 'lifetime'; 
  onSelectPlan: (plan: 'monthly' | 'annually' | 'lifetime') => void;
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
      <LifetimePlanContainer 
        isSelected={selectedPlan === 'lifetime'} 
        onSelect={() => onSelectPlan('lifetime')} 
      />
    </div>
  );
}

/**
 * Основной контейнер с информацией и выбором планов
 */
function MainContainer({ 
  selectedPlan, 
  onSelectPlan,
  promo,
  setPromo,
  promoStatus,
  setPromoStatus,
  applyPromo
}: { 
  selectedPlan: 'monthly' | 'annually' | 'lifetime'; 
  onSelectPlan: (plan: 'monthly' | 'annually' | 'lifetime') => void;
  promo: string;
  setPromo: (value: string) => void;
  promoStatus: 'idle' | 'applied' | 'invalid';
  setPromoStatus: (status: 'idle' | 'applied' | 'invalid') => void;
  applyPromo: () => void;
}) {
  const { content } = useContent();
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 w-full"
      data-name="Container"
    >
      <PlanComparisonContainer />
      <PlanSelectionContainer selectedPlan={selectedPlan} onSelectPlan={onSelectPlan} />
      {content.payments.keyBenefits && content.payments.keyBenefits.length > 0 && (
        <div className="mt-2 text-[#ffffff]">
          <ul className="list-disc ms-[18px]">
            {content.payments.keyBenefits.slice(0, 5).map((item, idx) => (
              <li key={idx} className="mb-1">{item}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Промокод */}
      {content.payments.promo && (
        <div className="mt-4 flex items-center gap-2 w-full">
          <input
            type="text"
            value={promo}
            onChange={(e) => { setPromo(e.target.value); setPromoStatus('idle'); }}
            placeholder={content.payments.promo.placeholder}
            className="flex-1 bg-[#1a1a1a] border border-[#212121] rounded-lg px-3 py-2 text-[#fff] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#e1ff00]"
          />
          <button
            onClick={applyPromo}
            className="px-3 py-2 bg-[#e1ff00] text-[#111] rounded-lg hover:opacity-90"
          >
            {content.payments.promo.apply}
          </button>
        </div>
      )}
      {promoStatus !== 'idle' && (
        <div className={`text-[12px] ${promoStatus === 'applied' ? 'text-[#9be15d]' : 'text-[#ff6b6b]'}`}>
          {promoStatus === 'applied' ? content.payments.promo?.applied : content.payments.promo?.invalid}
        </div>
      )}
      
      {content.payments.legal && (
        <div className="max-w-[351px] text-[#9a9a9a] text-[12px] leading-4 mt-2">
          {content.payments.legal.disclaimer}
          <div className="mt-1">
            <a className="underline" href={content.payments.legal.termsHref || '/terms'} target="_blank" rel="noreferrer">{content.payments.legal.termsText}</a>
            {' '}
            <a className="underline" href={content.payments.legal.privacyHref || '/privacy'} target="_blank" rel="noreferrer">{content.payments.legal.privacyText}</a>
          </div>
        </div>
      )}
    </div>
  );
}


/**
 * Основной компонент экрана покупки Premium подписки
 */
export function PaymentsScreen({ onBack: _onBack, onPurchaseComplete: _onPurchaseComplete }: PaymentsScreenProps) {
  const { content } = useContent();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annually' | 'lifetime'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [promo, setPromo] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'applied' | 'invalid'>('idle');
  const [logoOpacity, setLogoOpacity] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Listen for premium activation events
  useEffect(() => {
    const handlePremiumActivated = (event: CustomEvent) => {
      console.log('[PaymentsScreen] Premium activated:', event.detail);
      // Premium status will be updated via localStorage and sync
      // UI will update automatically when premium status changes
    };
    
    window.addEventListener('premium:activated', handlePremiumActivated as EventListener);
    return () => {
      window.removeEventListener('premium:activated', handlePremiumActivated as EventListener);
    };
  }, []);

  // Отслеживание скролла для изменения прозрачности логотипа
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const fadeStart = 1; // Начинаем затухание после 1px скролла
      const fadeEnd = 50; // Полностью прозрачный после 50px скролла
      
      if (scrollTop <= fadeStart) {
        setLogoOpacity(1);
      } else if (scrollTop >= fadeEnd) {
        setLogoOpacity(0);
      } else {
        // Плавное затухание между fadeStart и fadeEnd
        const fadeProgress = (scrollTop - fadeStart) / (fadeEnd - fadeStart);
        setLogoOpacity(1 - fadeProgress);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePlanSelect = (plan: 'monthly' | 'annually' | 'lifetime') => {
    setSelectedPlan(plan);
  };

  const handlePurchase = async () => {
    try {
      console.log('Starting Premium purchase process...', { plan: selectedPlan });
      setIsLoading(true);

      // Проверяем доступность Telegram WebApp API
      if (!window.Telegram?.WebApp?.openInvoice) {
        throw new Error('Telegram WebApp API not available. Please open this app in Telegram.');
      }

      // Тактильная обратная связь
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }

      // Создаём инвойс и открываем его в Telegram
      const paymentStatus = await telegramStarsPaymentService.purchasePremium(selectedPlan);

      if (paymentStatus === 'paid') {
        // Успешная оплата
        console.log('Premium purchase completed successfully');
        
        // Показываем успешное сообщение
        if (window.Telegram?.WebApp?.showAlert) {
          window.Telegram.WebApp.showAlert(content.payments.messages.successWithPlan);
        } else {
          alert(content.payments.messages.successWithPlan);
        }

        // Вызываем callback для обновления UI
        _onPurchaseComplete();
      } else if (paymentStatus === 'cancelled') {
        // Пользователь отменил оплату - ничего не делаем
        console.log('Payment cancelled by user');
      } else {
        // Ошибка оплаты
        console.error('Payment failed:', paymentStatus);
        const errorMessage = content.payments.messages.error;
        if (window.Telegram?.WebApp?.showAlert) {
          window.Telegram.WebApp.showAlert(errorMessage);
        } else {
          alert(errorMessage);
        }
      }

    } catch (error) {
      console.error('Error purchasing Premium:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : content.payments.messages.error;
      
      if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const applyPromo = () => {
    // Простая имитация валидации промокода
    if (promo.trim().toLowerCase() === 'save40') {
      setPromoStatus('applied');
    } else {
      setPromoStatus('invalid');
    }
  };

  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden bg-[#111111] flex flex-col">
      {/* Световые эффекты */}
      <Light />
      
      {/* Логотип */}
      <div 
        className="fixed top-0 left-0 right-0 z-10 transition-opacity duration-300"
        style={{ opacity: logoOpacity }}
      >
        <MiniStripeLogo />
      </div>
      
      {/* Контент с прокруткой */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Основной контейнер с информацией и выбором планов */}
            <MainContainer 
              selectedPlan={selectedPlan} 
              onSelectPlan={handlePlanSelect}
              promo={promo}
              setPromo={setPromo}
              promoStatus={promoStatus}
              setPromoStatus={setPromoStatus}
              applyPromo={applyPromo}
            />

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <BottomFixedButton 
        onClick={handlePurchase}
        disabled={isLoading}
        className={isLoading ? 'opacity-70 cursor-not-allowed' : ''}
      >
        {isLoading ? content.payments.cta.processing : content.payments.cta.buy}
      </BottomFixedButton>

    </div>
  );
}