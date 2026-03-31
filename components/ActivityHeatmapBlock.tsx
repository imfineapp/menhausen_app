import React from 'react';
import { useStore } from '@nanostores/react';
import { profileMessages } from '@/src/i18n/messages/profile';
import { $language } from '@/src/stores/language.store';
import { getActivityDataForLastMonths, ActivityType } from '../utils/ActivityDataManager';
import { $pointsBalance } from '@/src/stores/points.store';
import { $totalCheckins } from '@/src/stores/checkin.store';
import { $totalCompletedAttempts } from '@/src/stores/theme-progress.store';
import { buildActivityHeatmapDaysOfWeekData } from '@/src/domain/activityHeatmap.domain';

interface ActivityHeatmapBlockProps {
  weeksCount?: number; // Количество недель для отображения (7 или 14)
}

/**
 * Блок для отображения активности пользователя за последние N недель
 * Визуализация в виде календарной heat map с квадратиками
 * Дни недели по вертикали, недели по горизонтали
 */
export function ActivityHeatmapBlock({ weeksCount = 14 }: ActivityHeatmapBlockProps) {
  const profile = useStore(profileMessages);
  const language = useStore($language);

  useStore($pointsBalance)
  useStore($totalCheckins) // triggers updates when checkins change
  useStore($totalCompletedAttempts) // triggers updates when card progress changes

  // Recompute on each render; store subscriptions above trigger renders when activity inputs change.
  const activityData = getActivityDataForLastMonths(3)

  // Формируем данные для календарной сетки: дни недели по вертикали, недели по горизонтали
  const calendarData = React.useMemo(() => {
    return buildActivityHeatmapDaysOfWeekData({ activityData, weeksCount });
  }, [activityData, weeksCount]);

  // Получаем цвет для типа активности
  const getColor = (activityType: ActivityType): string => {
    switch (activityType) {
      case ActivityType.CHECKIN_AND_EXERCISE:
        return 'var(--color-activity-active)'; // Яркий желтый
      case ActivityType.CHECKIN_ONLY:
        return 'var(--color-activity-partial)'; // Приглушенный желтый
      case ActivityType.NONE:
      default:
        return 'var(--color-activity-none)'; // Серый с прозрачностью 10%
    }
  };

  // Получаем эффект свечения (Glow) для типа активности
  const getGlowStyle = (activityType: ActivityType): string => {
    // Эффект свечения только для дней с активностью
    if (activityType === ActivityType.NONE) {
      return 'none';
    }

    const glowColor = activityType === ActivityType.CHECKIN_AND_EXERCISE 
      ? 'var(--color-activity-active-glow)' // Яркий желтый
      : 'var(--color-activity-partial-glow)'; // Приглушенный желтый

    // box-shadow: x-offset y-offset blur-radius spread-radius color
    // Glow: x=0, y=0, blur=10px, opacity=0.5/0.4
    return `0 0 10px 0 ${glowColor}`;
  };

  // Получаем заголовок
  const title = profile.yourActivity;

  // Форматирование даты для tooltip
  const formatDate = (date: Date): string => {
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    return date.toLocaleDateString(locale, { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Форматирование значения для tooltip
  const getTooltipText = (day: { date: Date; activityType: ActivityType; exerciseCount: number; dateKey: string } | null): string => {
    if (!day) return '';
    
    const dateStr = formatDate(day.date);
    const heatmap = profile.heatmap;
    
    switch (day.activityType) {
      case ActivityType.CHECKIN_AND_EXERCISE: {
        const exerciseText = day.exerciseCount === 1 
          ? (heatmap?.checkinAndExercise ?? '').replace('{count}', day.exerciseCount.toString())
          : (heatmap?.checkinAndExercisePlural ?? '').replace('{count}', day.exerciseCount.toString());
        return `${dateStr} ∙ ${exerciseText}`;
      }
      case ActivityType.CHECKIN_ONLY:
        return `${dateStr} ∙ ${heatmap?.checkinOnly ?? ''}`;
      case ActivityType.NONE:
      default:
        return `${dateStr} ∙ ${heatmap?.noActivity ?? ''}`;
    }
  };

  return (
    <div 
      className="relative rounded-xl p-4 sm:p-5 md:p-6 w-full h-full min-h-[200px]" 
      data-name="Activity heatmap block"
    >
      {/* Фон блока */}
      <div className="absolute inset-0" data-name="activity_heatmap_block_background">
        <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
          <div
            aria-hidden="true"
            className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
          />
        </div>
      </div>
      
      {/* Контент блока */}
      <div className="relative z-10 flex flex-col gap-4 w-full">
        {/* Заголовок в верхнем левом углу */}
        <div className="text-left">
          <h3 className="text-[#e1ff00] text-base sm:text-lg font-semibold">
            {title}
          </h3>
        </div>
        
        {/* Календарная heat map: дни недели по вертикали, недели по горизонтали */}
        <div className="w-full overflow-x-auto">
          {calendarData.length > 0 ? (
            <div className="inline-block min-w-full">
              {/* Сетка: дни недели (строки) × недели (столбцы) */}
              <div className="flex flex-col gap-1">
                {calendarData.map((dayRow, dayIndex) => (
                  <div key={dayIndex} className="flex gap-1">
                    {dayRow.map((day, weekIndex) => (
                      <div
                        key={`${dayIndex}-${weekIndex}`}
                        className="flex-1 aspect-square min-w-[10px] rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: day ? getColor(day.activityType) : 'transparent',
                          border: day ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                          boxShadow: day && day.activityType !== ActivityType.NONE 
                            ? getGlowStyle(day.activityType) 
                            : 'none'
                        }}
                        title={day ? getTooltipText(day) : ''}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
              {profile.heatmap?.noActivity ?? ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

