import React from 'react';
import { Flame } from 'lucide-react';
import { ActivityData } from '../types/content';
import { useContent } from './ContentContext';
import { useLanguage } from './LanguageContext';
import { DailyCheckinManager } from '../utils/DailyCheckinManager';
import { getRussianDayForm, getEnglishDayForm } from '../utils/pluralization';  
import { PointsManager } from '../utils/PointsManager';
import { useEffect, useMemo, useState, useRef } from 'react';
import { getActivityDataForPeriod, ActivityType } from '../utils/ActivityDataManager';

interface ActivityBlockNewProps {
  activityData?: ActivityData;
}

export function ActivityBlockNew({ activityData }: ActivityBlockNewProps) {     
  const { getUI } = useContent();
  const { language } = useLanguage();

  // Get real check-in data from DailyCheckinManager
  const totalCheckins = DailyCheckinManager.getTotalCheckins();
  const _currentStreak = DailyCheckinManager.getCheckinStreak();
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [nextTarget, setNextTarget] = useState<number>(1000);
  const [weeklyActivityData, setWeeklyActivityData] = useState<Array<{ date: string; activityType: ActivityType; dateKey: string }>>([]);

  // Используем ref для отслеживания предыдущих значений и предотвращения бесконечных циклов
  const prevPointsRef = useRef<{ earned: number; target: number }>({ earned: 0, target: 1000 });

  useEffect(() => {
    const readPoints = () => {
      try {
        const total = PointsManager.getBalance();
        const target = PointsManager.getNextLevelTarget(1000);
        
        // Обновляем состояние только если значения действительно изменились
        if (prevPointsRef.current.earned !== total) {
          setEarnedPoints(total);
          prevPointsRef.current.earned = total;
        }
        if (prevPointsRef.current.target !== target) {
          setNextTarget(target);
          prevPointsRef.current.target = target;
        }
      } catch (error) {
        console.warn('ActivityBlockNew: failed to load points/level target', error);                                                                            
      }
    };
    readPoints();
    const onUpdate = () => readPoints();
    window.addEventListener('storage', onUpdate);
    window.addEventListener('points:updated', onUpdate as EventListener);       
    return () => {
      window.removeEventListener('storage', onUpdate);
      window.removeEventListener('points:updated', onUpdate as EventListener);  
    };
  }, []);

  useEffect(() => {
    const readWeekly = () => {
      try {
        // Вычисляем понедельник текущей недели
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const dayOfWeek = today.getDay(); // 0 = воскресенье, 1 = понедельник
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        const monday = new Date(today);
        monday.setDate(today.getDate() - daysToMonday);
        monday.setHours(0, 0, 0, 0);
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        
        // Получаем данные активности за текущую неделю
        const activityData = getActivityDataForPeriod(monday, sunday);
        
        // Преобразуем в формат с dateKey для удобства
        const weeklyData = activityData.map(item => ({
          date: item.date,
          activityType: item.activityType,
          dateKey: item.date
        }));
        
        setWeeklyActivityData(weeklyData);
      } catch (error) {
        console.warn('ActivityBlockNew: failed to load weekly activity data', error);                                                                               
      }
    };
    readWeekly();
    const onUpdate = () => readWeekly();
    window.addEventListener('storage', onUpdate);
    window.addEventListener('points:updated', onUpdate as EventListener);
    window.addEventListener('card:completed', onUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', onUpdate);
      window.removeEventListener('points:updated', onUpdate as EventListener);
      window.removeEventListener('card:completed', onUpdate as EventListener);
    };
  }, []);
  
  // Данные по умолчанию для демонстрации (fallback)
  const defaultData: ActivityData = {
    streakDays: totalCheckins > 0 ? totalCheckins : 0,
    currentPoints: earnedPoints,
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
  const activityMap = useMemo(() => {
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
        return '#e1ff00'; // Яркий желтый
      case ActivityType.CHECKIN_ONLY:
        return '#b8b800'; // Приглушенный желтый
      case ActivityType.NONE:
      default:
        return 'rgba(128, 128, 128, 0.1)'; // Серый с прозрачностью 10%
    }
  };
  
  // Получаем эффект свечения для типа активности
  const getGlowStyle = (activityType: ActivityType): string => {
    if (activityType === ActivityType.NONE) {
      return 'none';
    }
    const glowColor = activityType === ActivityType.CHECKIN_AND_EXERCISE 
      ? 'rgba(225, 255, 0, 0.5)' // Яркий желтый
      : 'rgba(184, 184, 0, 0.4)'; // Приглушенный желтый
    return `0 0 10px 0 ${glowColor}`;
  };
  
  // Получаем тип активности для дня недели
  const getActivityTypeForDay = useMemo(() => {
    // Вычисляем понедельник текущей недели (та же логика, что и в daysOfWeek)
    const today = new Date();
    const dow = today.getDay(); // 0=Sun..6=Sat
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(today.getDate() - ((dow === 0 ? 7 : dow) - 1));
    
    return (dayKey: string): ActivityType => {
      const dayIndex = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].indexOf(dayKey);
      if (dayIndex === -1) return ActivityType.NONE;
      
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + dayIndex);
      targetDate.setHours(0, 0, 0, 0);
      
      const dateKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
      
      return activityMap.get(dateKey) ?? ActivityType.NONE;
    };
  }, [activityMap]);    

  // Функция для получения правильной формы слова "день"
  const getDayLabel = (count: number) => {
    if (language === 'ru') {
      return getRussianDayForm(count);
    } else {
      return getEnglishDayForm(count);
    }
  };

  const daysOfWeek = useMemo(() => {
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });    

    // Compute Monday of current week to keep order Mon..Sun
    const today = new Date();
    const dow = today.getDay(); // 0=Sun..6=Sat
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(today.getDate() - ((dow === 0 ? 7 : dow) - 1));

    const keys: Array<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'> = ['mon','tue','wed','thu','fri','sat','sun'];                                                 
    const days = [] as Array<{ key: typeof keys[number]; label: string }>;      
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      let label = formatter.format(d);
      // Normalize: remove trailing dot and trim, capitalize first letter for en
      label = label.replace(/\.$/, '').trim();
      if (language !== 'ru' && label) {
        label = label.charAt(0).toUpperCase() + label.slice(1);
      }
      days.push({ key: keys[i], label });
    }
    return days;
  }, [language]);

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
              <Flame className="w-8 h-8 text-[#696969] flame-glow" />
            </div>
          </div>

          {/* Количество дней стрика */}
          <div className="text-lg sm:text-xl font-bold text-white mb-1 text-center">                                                                            
            {data.streakDays} {getDayLabel(data.streakDays)}
          </div>

          {/* Подпись */}
          <div className="text-sm text-[#696969] text-center">
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
                const activityType = getActivityTypeForDay(day.key);
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
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
