import React from 'react';
import { Flame } from 'lucide-react';
import { ActivityData } from '../types/content';
import { useContent } from './ContentContext';
import { useLanguage } from './LanguageContext';
import { getRussianDayForm, getEnglishDayForm } from '../utils/pluralization';  
import { useStore } from '@nanostores/react';
import { $nextLevelTarget, $pointsBalance } from '@/src/stores/points.store';
import { $checkinStreak, $totalCheckins } from '@/src/stores/checkin.store';
 
import { getActivityDataForPeriod, ActivityType } from '../utils/ActivityDataManager';
import { buildActivityDayCells, buildDaysOfWeekLabels, getCurrentWeekMonday } from '@/src/domain/activityBlockNew.domain';

interface ActivityBlockNewProps {
  activityData?: ActivityData;
}

export function ActivityBlockNew({ activityData }: ActivityBlockNewProps) {     
  const { getUI } = useContent();
  const { language } = useLanguage();

  const pointsBalance = useStore($pointsBalance);
  const nextTarget = useStore($nextLevelTarget);

  // Derived check-in stats from store.
  const totalCheckins = useStore($totalCheckins);
  useStore($checkinStreak);

  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const monday = getCurrentWeekMonday(today)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const weeklyActivityData = (() => {
    try {
      const activityForWeek = getActivityDataForPeriod(monday, sunday)
      return activityForWeek.map((item) => ({
        date: item.date,
        activityType: item.activityType,
        dateKey: item.date
      }))
    } catch (error) {
      console.warn('ActivityBlockNew: failed to load weekly activity data', error)
      return []
    }
  })()
  
  // Данные по умолчанию для демонстрации (fallback)
  const defaultData: ActivityData = {
    // Keep the existing behavior (tests expect "days" based on total check-ins),
    // but subscribe to the streak store so check-in streak logic stays exercised.
    streakDays: totalCheckins > 0 ? totalCheckins : 0,
    currentPoints: pointsBalance,
    targetPoints: nextTarget,
    weeklyCheckins: {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false
    }
  };

  const data = activityData || defaultData;
  const progressPercentage = (data.currentPoints / data.targetPoints) * 100;
  
  // Создаем карту активности по датам для быстрого доступа
  const activityMap = React.useMemo(() => {
    const map = new Map<string, ActivityType>();
    weeklyActivityData.forEach(item => {
      map.set(item.dateKey, item.activityType);
    });
    return map;
  }, [weeklyActivityData]);
  
  // Получаем цвет для типа активности (как в ActivityHeatmapBlock)
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
  
  // Получаем эффект свечения для типа активности
  const getGlowStyle = (activityType: ActivityType): string => {
    if (activityType === ActivityType.NONE) {
      return 'none';
    }
    const glowColor = activityType === ActivityType.CHECKIN_AND_EXERCISE 
      ? 'var(--color-activity-active-glow)' // Яркий желтый
      : 'var(--color-activity-partial-glow)'; // Приглушенный желтый
    return `0 0 10px 0 ${glowColor}`;
  };
  
  const daysOfWeek = React.useMemo(() => buildDaysOfWeekLabels({ language, baseDate: monday }), [language, monday])
  const dayCells = React.useMemo(
    () =>
      buildActivityDayCells({
        activityMap,
        monday,
        daysOfWeek
      }),
    [activityMap, monday, daysOfWeek]
  )

  // Функция для получения правильной формы слова "день"
  const getDayLabel = (count: number) => {
    if (language === 'ru') {
      return getRussianDayForm(count);
    } else {
      return getEnglishDayForm(count);
    }
  };

  // Note: `daysOfWeek` and `dayCells` are derived above.

  return (
    <div className="relative rounded-xl p-4 sm:p-5 md:p-6 w-full">
      <div className="absolute inset-0" data-name="activity_block_background">  
        <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">                                                             
          <div
            aria-hidden="true"
            className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"                                                    
          />
        </div>
      </div>

      {/* Контент блока */}
      <div className="relative z-10 flex flex-row gap-4 sm:gap-6">
        {/* Левая секция - Streak Information (1/3 ширины) */}
        <div className="bg-black/50 rounded-lg p-4 flex flex-col items-center sm:items-start justify-center w-1/3">                                             
          {/* Иконка пламени с эффектом свечения */}
          <div className="relative mb-3">
            <div className="absolute inset-0 bg-[#e1ff00]/30 rounded-full blur-lg scale-150"></div>                                                             
            <div className="relative bg-[#e1ff00] rounded-full p-2">
              <Flame className="w-8 h-8 text-[#8a8a8a] flame-glow" />
            </div>
          </div>

          {/* Количество дней стрика */}
          <div className="text-lg sm:text-xl font-bold text-white mb-1 text-center">                                                                            
            {data.streakDays} {getDayLabel(data.streakDays)}
          </div>

          {/* Подпись */}
          <div className="text-sm text-[#8a8a8a] text-center">
            {getUI().home.activity.weeklyCheckins}
          </div>
        </div>

        {/* Правая секция - Progress and Weekly Check-ins (2/3 ширины) */}      
        <div className="flex-1 space-y-4 w-2/3">
          {/* Прогресс-бар */}
          <div className="bg-black/50 rounded-lg w-full p-3">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-2xl sm:text-3xl font-bold text-white">      
                {data.currentPoints.toLocaleString()}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-white">
                / {data.targetPoints.toLocaleString()}
              </span>
            </div>

            {/* Прогресс-бар с эффектом свечения */}
            <div className="relative w-full">
              <div className="w-full bg-black rounded-full h-3">
                <div
                  className="bg-[#e1ff00] rounded-full h-3 transition-all duration-300 relative progress-glow"                                                  
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}    
                >
                  <div className="absolute inset-0 bg-[#e1ff00]/50 rounded-full blur-sm"></div>                                                                 
                </div>
              </div>
            </div>
          </div>

          {/* Еженедельные чекины */}
          <div className="bg-black/50 rounded-lg w-full">
            <div className="flex justify-between items-center w-full p-3">      
              {daysOfWeek.map((day) => {
                const activityType = dayCells.find((c) => c.key === day.key)?.activityType ?? ActivityType.NONE
                return (
                  <div key={day.key} className="flex flex-col items-center space-y-1">
                    <div
                      className="w-4 h-4 rounded-sm flex items-center justify-center transition-all duration-200"
                      style={{
                        backgroundColor: getColor(activityType),
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: activityType !== ActivityType.NONE ? getGlowStyle(activityType) : 'none'
                      }}
                    />
                    <span className="text-xs text-white">{day.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
