// Компоненты для отображения информации пользователя в профиле
import svgPaths from "../imports/svg-x18dvlov3w";
import { ArrowIcon } from './UserProfileIcons';

/**
 * Адаптивный аватар пользователя
 */
export function UserAvatar() {
  return (
    <div className="relative shrink-0 size-[100px] sm:size-[110px] md:size-[120px]" data-name="User avatar">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 120 120">
        <g id="User avatar">
          <circle cx="60" cy="60" fill="var(--fill-0, #E1FF00)" id="Ellipse 5" r="60" />
          <path d={svgPaths.p129d46f0} fill="var(--fill-0, #2D2B2B)" id="Logo" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Адаптивный статус аккаунта
 */
export function UserAccountStatus({ isPremium = false }: { isPremium?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center px-3 py-1 rounded-xl ${
        isPremium ? 'bg-[#e1ff00]' : 'bg-[#2d2b2b]'
      }`}
      data-name="User account status"
    >
      <div className={`font-sans text-[14px] sm:text-[15px] text-center tracking-[-0.43px] ${
        isPremium ? 'text-[#2d2b2b]' : 'text-[#696969]'
      }`}>
        <p className="adjustLetterSpacing block leading-[14px] sm:leading-[16px]">
          {isPremium ? 'Premium' : 'Free'}
        </p>
      </div>
    </div>
  );
}

/**
 * Адаптивная информация о пользователе
 */
export function UserInfoBlock({ userHasPremium }: { userHasPremium: boolean }) {
  return (
    <div className="flex flex-col gap-2.5 items-center justify-start w-full" data-name="User info block">
      <div className="font-['Kreon:Regular',_sans-serif] text-[22px] sm:text-[24px] text-[#e1ff00] text-center">
        <p className="block leading-[0.8]">Hero #1275</p>
      </div>
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="font-sans text-[18px] sm:text-[20px] text-[#696969] text-left">
          <p className="block leading-none">Level 25</p>
        </div>
        <UserAccountStatus isPremium={userHasPremium} />
      </div>
    </div>
  );
}

/**
 * Адаптивная секция информации о пользователе
 */
export function UserInfoSection({ userHasPremium }: { userHasPremium: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 items-center justify-start w-full" data-name="User info section">
      <UserAvatar />
      <UserInfoBlock userHasPremium={userHasPremium} />
    </div>
  );
}

/**
 * Адаптивная разделительная линия
 */
export function SeparationLine() {
  return (
    <div className="h-0 w-full relative" data-name="Separation Line">
      <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" role="presentation" viewBox="0 0 351 1">
          <g id="Separation Line">
            <rect fill="white" height="3.06854e-05" transform="translate(0 1)" width="351" />
            <line
              id="Sepapration line"
              stroke="var(--stroke-0, #2D2B2B)"
              x1="4.37114e-08"
              x2="351"
              y1="0.5"
              y2="0.500031"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

/**
 * Проверяет, является ли rightElement Switch компонентом
 */
function isSwitchElement(element: React.ReactNode): boolean {
  if (!element || typeof element !== 'object') return false;
  
  // Проверяем, является ли элемент Switch компонентом на основе props
  if ('type' in element && typeof element.type === 'object' && element.type !== null) {
    return 'displayName' in element.type && (element.type as any).displayName === 'Switch';
  }
  
  // Проверяем по data-testid для Switch
  if ('props' in element && element.props && 'data-testid' in element.props) {
    return element.props['data-testid'] === 'notifications-switch';
  }
  
  // Проверяем по className для Switch
  if ('props' in element && element.props && 'className' in element.props) {
    const className = element.props.className;
    return typeof className === 'string' && className.includes('data-[state=checked]:bg-[#e1ff00]');
  }
  
  return false;
}

/**
 * Адаптивный элемент списка настроек
 */
export function SettingsItem({ 
  icon, 
  title, 
  rightElement, 
  onClick,
  isHighlighted = false 
}: { 
  icon: React.ReactNode; 
  title: string; 
  rightElement?: React.ReactNode;
  onClick?: () => void;
  isHighlighted?: boolean;
}) {
  
  // Проверяем, является ли rightElement Switch компонентом
  const hasSwitch = rightElement && isSwitchElement(rightElement);
  
  // Если rightElement является Switch, используем div для избежания вложенности кликабельных элементов
  if (hasSwitch) {
    return (
      <div
        className="w-full h-16 relative hover:bg-[rgba(217,217,217,0.06)]"
        data-name="Settings item"
      >
        <div className="absolute flex items-center justify-between inset-x-0 top-5 px-0">
          <div className="flex items-center gap-2.5">
            {icon}
            <div className={`font-sans text-[18px] sm:text-[20px] text-left ${
              isHighlighted ? 'text-[#e1ff00]' : 'text-[#ffffff]'
            }`}>
              <p className="block leading-none">{title}</p>
            </div>
          </div>
          <div className="flex items-center">
            {rightElement}
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute border-[#696969] border-b inset-x-0 bottom-0 pointer-events-none"
        />
      </div>
    );
  }

  // Для всех остальных элементов (включая те со стрелками) используем button для кликабельности
  return (
    <button
      onClick={onClick}
      className="w-full h-16 relative cursor-pointer min-h-[44px] min-w-[44px] hover:bg-[rgba(217,217,217,0.06)]"
      data-name="Settings item"
    >
      <div className="absolute flex items-center justify-between inset-x-0 top-5 px-0">
        <div className="flex items-center gap-2.5">
          {icon}
          <div className={`font-sans text-[18px] sm:text-[20px] text-left ${
            isHighlighted ? 'text-[#e1ff00]' : 'text-[#ffffff]'
          }`}>
            <p className="block leading-none">{title}</p>
          </div>
        </div>
        <div className="flex items-center">
          {rightElement || <ArrowIcon />}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border-[#696969] border-b inset-x-0 bottom-0 pointer-events-none"
      />
    </button>
  );
}