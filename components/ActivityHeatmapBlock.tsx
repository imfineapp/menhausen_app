import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useContent } from './ContentContext';
import { getActivityDataForLastMonths, ActivityType } from '../utils/ActivityDataManager';

interface ActivityHeatmapBlockProps {
  weeksCount?: number; // Количество недель для отображения (7 или 14)
}

/**
 * Блок для отображения активности пользователя за последние N недель
 * Визуализация в виде календарной heat map с квадратиками
 * Дни недели по вертикали, недели по горизонтали
 */
export function ActivityHeatmapBlock({ weeksCount = 14 }: ActivityHeatmapBlockProps) {
  const { getUI } = useContent();
  const ui = getUI();
  const [activityData, setActivityData] = useState<ReturnType<typeof getActivityDataForLastMonths>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Получаем данные активности (берем больше данных, чтобы покрыть 14 недель)
  useEffect(() => {
    const data = getActivityDataForLastMonths(3); // 3 месяца назад + текущий для покрытия 14 недель
    setActivityData(data);
  }, []);

  // Обновляем данные при изменении storage (чекины или упражнения)
  useEffect(() => {
    const handleStorageUpdate = () => {
      const data = getActivityDataForLastMonths(3);
      setActivityData(data);
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('points:updated', handleStorageUpdate);
    window.addEventListener('card:completed', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('points:updated', handleStorageUpdate);
      window.removeEventListener('card:completed', handleStorageUpdate);
    };
  }, []);

  // Формируем данные для календарной сетки: дни недели по вертикали, недели по горизонтали
  const calendarData = useMemo(() => {
    // Создаем карту активности по датам
    const activityMap = new Map<string, { activityType: ActivityType; exerciseCount: number }>();
    activityData.forEach(item => {
      activityMap.set(item.date, {
        activityType: item.activityType,
        exerciseCount: item.exerciseCount || 0
      });
    });

    // Получаем текущую дату
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Находим понедельник текущей недели
    const currentMonday = new Date(today);
    const dayOfWeek = currentMonday.getDay(); // 0 = воскресенье, 1 = понедельник
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    currentMonday.setDate(currentMonday.getDate() - daysToMonday);
    currentMonday.setHours(0, 0, 0, 0);

    // Вычисляем понедельник N недель назад ((N-1) недель назад + текущая = N)
    const startMonday = new Date(currentMonday);
    startMonday.setDate(startMonday.getDate() - ((weeksCount - 1) * 7));

    // Создаем массив всех дней для отображения (N недель = N * 7 дней)
    const allDays: Array<{ date: Date; activityType: ActivityType; exerciseCount: number; dateKey: string }> = [];
    
    const currentDate = new Date(startMonday);
    const endDate = new Date(currentMonday);
    endDate.setDate(endDate.getDate() + 6); // Воскресенье текущей недели
    endDate.setHours(23, 59, 59, 999);
    
    const dateIterator = new Date(currentDate);
    while (dateIterator <= endDate) {
      const dateKey = `${dateIterator.getFullYear()}-${String(dateIterator.getMonth() + 1).padStart(2, '0')}-${String(dateIterator.getDate()).padStart(2, '0')}`;
      
      const activityInfo = activityMap.get(dateKey);
      allDays.push({
        date: new Date(dateIterator),
        activityType: activityInfo?.activityType ?? ActivityType.NONE,
        exerciseCount: activityInfo?.exerciseCount ?? 0,
        dateKey
      });
      
      dateIterator.setDate(dateIterator.getDate() + 1);
    }

    // Группируем по неделям (N недель по 7 дней)
    const weeks: Array<Array<{ date: Date; activityType: ActivityType; exerciseCount: number; dateKey: string }>> = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    // Транспонируем: преобразуем из [недели][дни] в [дни недели][недели]
    // Теперь каждая строка - это один день недели (Пн, Вт, ...), а столбцы - недели
    const daysOfWeekData: Array<Array<{ date: Date; activityType: ActivityType; exerciseCount: number; dateKey: string }>> = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayRow: Array<{ date: Date; activityType: ActivityType; exerciseCount: number; dateKey: string }> = [];
      for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
        if (weeks[weekIndex] && weeks[weekIndex][dayIndex]) {
          dayRow.push(weeks[weekIndex][dayIndex]);
        }
      }
      daysOfWeekData.push(dayRow);
    }

    return daysOfWeekData;
  }, [activityData, weeksCount]);

  // Получаем цвет для типа активности
  const getColor = (activityType: ActivityType): string => {
    switch (activityType) {
      case ActivityType.CHECKIN_AND_EXERCISE:
        return '#e1ff00'; // Яркий желтый
      case ActivityType.CHECKIN_ONLY:
        return '#b8b800'; // Приглушенный желтый
      case ActivityType.NONE:
      default:
        return 'rgba(128, 128, 128, 0.1)'; // Серый с прозрачностью 10%
    }
  };

  // Получаем эффект свечения (Glow) для типа активности
  const getGlowStyle = (activityType: ActivityType): string => {
    // Эффект свечения только для дней с активностью
    if (activityType === ActivityType.NONE) {
      return 'none';
    }

    const glowColor = activityType === ActivityType.CHECKIN_AND_EXERCISE 
      ? 'rgba(225, 255, 0, 0.5)' // Яркий желтый
      : 'rgba(184, 184, 0, 0.4)'; // Приглушенный желтый

    // box-shadow: x-offset y-offset blur-radius spread-radius color
    // Glow: x=0, y=0, blur=10px, opacity=0.5/0.4
    return `0 0 10px 0 ${glowColor}`;
  };

  // Получаем заголовок
  const title = ui.profile?.yourActivity || 'Твоя активность';

  // Форматирование даты для tooltip
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Форматирование значения для tooltip
  const getTooltipText = (day: { date: Date; activityType: ActivityType; exerciseCount: number; dateKey: string } | null): string => {
    if (!day) return '';
    
    const dateStr = formatDate(day.date);
    const heatmap = ui.profile?.heatmap;
    
    switch (day.activityType) {
      case ActivityType.CHECKIN_AND_EXERCISE: {
        const exerciseText = day.exerciseCount === 1 
          ? (heatmap?.checkinAndExercise || 'Чекин + {count} упражнение').replace('{count}', day.exerciseCount.toString())
          : (heatmap?.checkinAndExercisePlural || 'Чекин + {count} упражнений').replace('{count}', day.exerciseCount.toString());
        return `${dateStr} ∙ ${exerciseText}`;
      }
      case ActivityType.CHECKIN_ONLY:
        return `${dateStr} ∙ ${heatmap?.checkinOnly || 'Только чекин'}`;
      case ActivityType.NONE:
      default:
        return `${dateStr} ∙ ${heatmap?.noActivity || 'Нет активности'}`;
    }
  };

  return (
    <div 
      ref={containerRef}
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
              {ui.common?.loading || 'Нет данных для отображения'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

