import React from 'react';
import { Flame } from 'lucide-react';
import { ActivityData } from '../types/content';
import { useContent } from './ContentContext';

interface ActivityBlockNewProps {
  activityData?: ActivityData;
}

export function ActivityBlockNew({ activityData }: ActivityBlockNewProps) {
  const { getUI } = useContent();
  
  // Данные по умолчанию для демонстрации
  const defaultData: ActivityData = {
    streakDays: 142,
    currentPoints: 5863,
    targetPoints: 8000,
    weeklyCheckins: {
      mon: true,
      tue: true,
      wed: true,
      thu: false,
      fri: false,
      sat: false,
      sun: false
    }
  };

  const data = activityData || defaultData;
  const progressPercentage = (data.currentPoints / data.targetPoints) * 100;

  const daysOfWeek = [
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' }
  ];

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
            {data.streakDays} {getUI().home.activity.streakLabel}
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