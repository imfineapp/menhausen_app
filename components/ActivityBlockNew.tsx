import React from 'react';
import { Flame } from 'lucide-react';
import { ActivityData } from '../types/content';
import { useContent } from './ContentContext';
import { useLanguage } from './LanguageContext';
import { DailyCheckinManager } from '../utils/DailyCheckinManager';
import { getRussianDayForm, getEnglishDayForm } from '../utils/pluralization';  
import { PointsManager } from '../utils/PointsManager';
import { useEffect, useMemo, useState, useRef } from 'react';

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
  const [weeklyCheckins, setWeeklyCheckins] = useState<Record<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', boolean>>({                                            
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false
  });

  // Используем ref для отслеживания предыдущих значений и предотвращения бесконечных циклов
  const prevPointsRef = useRef<{ earned: number; target: number }>({ earned: 0, target: 1000 });
  const prevWeeklyRef = useRef<Record<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', boolean> | null>(null);

  // Вспомогательная функция для сравнения объектов weeklyCheckins
  const areWeeklyCheckinsEqual = (
    a: Record<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', boolean>,
    b: Record<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', boolean>
  ): boolean => {
    const keys: Array<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'> = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    return keys.every(key => a[key] === b[key]);
  };

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
        const weekly = DailyCheckinManager.getWeeklyCheckinsStatus();
        
        // Обновляем состояние только если значения действительно изменились
        if (!prevWeeklyRef.current || !areWeeklyCheckinsEqual(prevWeeklyRef.current, weekly)) {
          setWeeklyCheckins(weekly);
          prevWeeklyRef.current = weekly;
        }
      } catch (error) {
        console.warn('ActivityBlockNew: failed to load weekly check-ins', error);                                                                               
      }
    };
    readWeekly();
    const onUpdate = () => readWeekly();
    window.addEventListener('storage', onUpdate);
    window.addEventListener('points:updated', onUpdate as EventListener);       
    return () => {
      window.removeEventListener('storage', onUpdate);
      window.removeEventListener('points:updated', onUpdate as EventListener);
    };
  }, []);
  
  // Данные по умолчанию для демонстрации (fallback)
  const defaultData: ActivityData = {
    streakDays: totalCheckins > 0 ? totalCheckins : 0,
    currentPoints: earnedPoints,
    targetPoints: nextTarget,
    weeklyCheckins: weeklyCheckins
  };

  const data = activityData || defaultData;
  const progressPercentage = (data.currentPoints / data.targetPoints) * 100;    

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
              <span className="text-lg text-[#696969]">
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
              {daysOfWeek.map((day) => (
                <div key={day.key} className="flex flex-col items-center space-y-1">                                                                            
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${                                            
                      data.weeklyCheckins[day.key]
                        ? 'bg-[#e1ff00] checkin-glow' 
                        : 'bg-black'
                    }`}
                  >
                    {data.weeklyCheckins[day.key] && (
                      <svg
                        className="w-2 h-2 text-[#696969]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-white">{day.label}</span>       
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
