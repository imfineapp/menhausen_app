// ThemeCard Component
// Reusable theme card with progress and premium status

import React, { useMemo } from 'react';
import { StripedProgressBar } from './ui/StripedProgressBar';
import { UserAccountStatus } from './UserProfileComponents';
import { useContent } from './ContentContext';
import { getThemeMatchPercentage } from '../utils/themeTestMapping';
import { cn } from './ui/utils';

/**
 * Пропсы компонента ThemeCard
 */
interface ThemeCardProps {
  /** Заголовок темы */
  title: string;
  /** Описание темы */
  description: string;
  /** Прогресс прохождения темы (0-100) */
  progress?: number;
  /** Является ли тема премиум */
  isPremium?: boolean;
  /** Есть ли у пользователя премиум подписка */
  userHasPremium?: boolean;
  /** Обработчик клика по карточке */
  onClick?: () => void;
  /** ID темы для расчета процента соответствия из результатов теста */
  themeId?: string;
  /** Заблокирована ли карточка */
  disabled?: boolean;
  /** Показывать ли индикатор загрузки */
  loading?: boolean;
  /** Дополнительные CSS классы для основного контейнера */
  className?: string;
  /** Дополнительные CSS классы для контента */
  contentClassName?: string;
  /** Дополнительные CSS классы для прогресс-бара */
  progressBarClassName?: string;
  /** Показывать ли процент соответствия темы */
  showMatchPercentage?: boolean;
  /** Показывать ли прогресс-бар */
  showProgress?: boolean;
  /** Вариант отображения карточки */
  variant?: 'default' | 'compact';
}

/**
 * Адаптивная карточка темы с прогрессом и обработкой кликов
 * 
 * @example
 * ```tsx
 * <ThemeCard
 *   title="Стресс"
 *   description="Управление стрессом"
 *   progress={75}
 *   isPremium={false}
 *   themeId="stress"
 *   onClick={() => navigate('/theme/stress')}
 * />
 * ```
 */
export function ThemeCard({
  title,
  description,
  progress = 0,
  isPremium = false,
  userHasPremium = false,
  onClick,
  themeId,
  disabled = false,
  loading = false,
  className,
  contentClassName,
  progressBarClassName,
  showMatchPercentage = true,
  showProgress = true,
  variant: _variant = 'default'
}: ThemeCardProps) {
  const { content } = useContent();
  
  // Нормализуем прогресс в диапазон 0-100
  const normalizedProgress = Math.max(0, Math.min(100, progress ?? 0));
  
  // Определяем, должна ли тема быть заблокирована (премиум тема без подписки)
  const isThemeLocked = isPremium && !userHasPremium;
  
  // Скрываем прогресс-бар для заблокированных премиум тем
  const shouldShowProgress = showProgress && !isThemeLocked;
  
  // Получаем процент соответствия из результатов теста
  const matchPercentage = useMemo(() => {
    if (!themeId) return null;
    return getThemeMatchPercentage(themeId);
  }, [themeId]);
  
  // Формируем текст с процентом, если он доступен
  const matchText = useMemo(() => {
    if (!showMatchPercentage || matchPercentage === null) return null;
    const template = content.ui.home.themeMatchPercentage || 'Подходит тебе на {percentage}%';
    return template.replace('{percentage}', String(Math.round(matchPercentage)));
  }, [matchPercentage, content.ui.home.themeMatchPercentage, showMatchPercentage]);

  // Генерируем уникальные ID для доступности
  const cardId = themeId ? `theme-card-${themeId}` : `theme-card-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const titleId = `${cardId}-title`;
  const descriptionId = `${cardId}-description`;
  const progressId = `${cardId}-progress`;

  // Формируем aria-label для карточки
  const ariaLabel = useMemo(() => {
    const parts = [title, description];
    if (shouldShowProgress && normalizedProgress > 0) {
      parts.push(`Прогресс: ${normalizedProgress}%`);
    }
    if (matchText) {
      parts.push(matchText);
    }
    return parts.join('. ');
  }, [title, description, normalizedProgress, matchText, shouldShowProgress]);

  // Обработчик клика с проверкой состояний
  const handleClick = () => {
    if (disabled || loading || !onClick) return;
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      tabIndex={disabled || loading ? -1 : 0}
      aria-label={ariaLabel}
      aria-describedby={descriptionId}
      aria-disabled={disabled || loading}
      className={cn(
        "box-border content-stretch flex flex-col",
        "min-h-[var(--theme-card-height-xs)] sm:min-h-[var(--theme-card-height-sm)] md:min-h-[var(--theme-card-height-md)]",
        "items-start justify-start",
        "p-[var(--theme-card-padding-xs)] sm:p-[var(--theme-card-padding-sm)] md:p-[var(--theme-card-padding-md)]",
        "gap-[var(--theme-card-gap-xs)] sm:gap-[var(--theme-card-gap-sm)]",
        "relative shrink-0 w-full",
        "min-w-[44px]",
        "rounded-xl",
        "bg-[var(--theme-card-bg)]",
        "border border-[var(--theme-card-border)] border-solid",
        "transition-all duration-200",
        disabled || loading
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:bg-[var(--theme-card-hover)] active:scale-[0.98]",
        loading && "pointer-events-none",
        className
      )}
      data-name="Theme card narrow"
    >
      {/* Фон карточки */}
      <div className="absolute inset-0 rounded-xl pointer-events-none" data-name="theme_block_background" aria-hidden="true">
        <div className="absolute bg-[var(--theme-card-bg)] inset-0 rounded-xl" data-name="Block" />
      </div>
      
      {/* Контент карточки */}
      <div 
        className={cn(
          "relative z-10 box-border content-stretch flex flex-col",
          "gap-[var(--theme-card-gap-xs)] sm:gap-[var(--theme-card-gap-sm)]",
          "items-start justify-start p-0 shrink-0 w-full flex-1",
          contentClassName
        )}
      >
        <div className="typography-h2 text-[var(--theme-card-title)] text-left w-full">
          <h2 id={titleId} className="block">{title}</h2>
        </div>
        <div className="typography-body text-[var(--theme-card-text)] text-left w-full">
          <p id={descriptionId} className="block">{description}</p>
        </div>
      </div>
      
      {/* Футер: процент соответствия, статус премиум и прогресс */}
      <div className="relative z-10 w-full mt-auto">
        {/* Информация о соответствии темы и статус премиум */}
        {(matchText || isPremium) && (
          <div className="box-border content-stretch flex flex-row items-center p-0 mb-2">
            {matchText && (
              <div className="typography-button text-[var(--theme-card-text-secondary)] text-left flex-1">
                <p className="block">{matchText}</p>
              </div>
            )}
            {isPremium && (
              <div className={cn(matchText ? "" : "ml-auto")}>
                <UserAccountStatus isPremium={isPremium} />
              </div>
            )}
          </div>
        )}
        
        {/* Индикатор прогресса */}
        {shouldShowProgress && (
          <div 
            className={cn(
              "relative h-5 sm:h-6",
              progressBarClassName
            )}
            data-name="Progress_theme"
            role="progressbar"
            aria-valuenow={normalizedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Прогресс прохождения темы: ${normalizedProgress}%`}
            id={progressId}
          >
            <StripedProgressBar 
              progress={normalizedProgress} 
              size="lg" 
              className="w-full"
              showBackground={true}
            />
            <div className="absolute typography-caption top-1/2 left-0 right-0 -translate-y-1/2 text-[var(--theme-card-text-secondary)] text-right pr-2 pointer-events-none">
              <p className="block">{content.ui.home.activity.progressLabel}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Индикатор загрузки */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--theme-card-bg)]/50 rounded-xl z-20" aria-hidden="true">
          <div className="w-6 h-6 border-2 border-[var(--theme-card-title)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
}






