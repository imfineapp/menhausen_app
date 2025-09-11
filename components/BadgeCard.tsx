import React from 'react';
import { CheckCircle, Lock } from 'lucide-react';
import { useContent } from './ContentContext';

interface CircularProgressProps {
  progress: number; // от 0 до 100
  size: number; // размер в пикселях
  strokeWidth: number; // толщина линии
}

/**
 * Компонент кругового прогресс-бара
 */
function CircularProgress({ progress, size, strokeWidth }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Фоновый круг (черный контур) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#000000"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Прогресс круг (желтый контур) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e1ff00"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
    </div>
  );
}

interface BadgeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: string | null;
  isActive?: boolean;
  progress?: number; // прогресс для заблокированных карточек (0-100)
}

/**
 * Компонент карточки достижения со сплошным фоном и эффектами
 */
export function BadgeCard({ 
  title, 
  description, 
  icon, 
  unlocked, 
  unlockedAt: _unlockedAt, 
  isActive = false,
  progress = 0
}: BadgeCardProps) {
  const { getLocalizedBadges } = useContent();
  return (
    <div
      className={`
        relative w-64 h-80 rounded-2xl p-6 transition-all duration-300
        ${isActive ? 'scale-105' : 'scale-100'}
        hover:scale-105
      `}
      data-name="Badge Card"
    >
      {/* Сплошной фон */}
      <div className={`absolute inset-0 rounded-2xl ${unlocked ? 'bg-[#E1FF00]' : 'bg-[#2D2B2B]'}`} />
      
      {/* Контент карточки */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Верхняя часть с иконкой и статусом */}
        <div className="flex justify-between items-start mb-4">
           {/* Иконка достижения в верхнем левом углу */}
           <div className="flex justify-start">
             <div className="w-20 h-20 flex items-center justify-center">
               {unlocked ? (
                 <div className="text-black [&>*]:text-black">
                   {icon}
                 </div>
               ) : (
                 <div className="relative">
                   {/* Эффект свечения для заблокированных карточек */}
                   <div className="absolute inset-0 bg-[#e1ff00]/30 rounded-full blur-lg scale-150"></div>
                   <div className="relative text-[#e1ff00] [&>*]:text-[#e1ff00]">
                     {icon}
                   </div>
                 </div>
               )}
             </div>
           </div>
          
          {/* Статус в верхнем правом углу */}
          <div className="flex justify-end">
            {unlocked ? (
              <div className="bg-black/10 rounded-full px-3 py-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-gray-500" />
                <span className="text-gray-500 text-xs font-medium">
                  {getLocalizedBadges().unlocked}
                </span>
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                {/* Круговой прогресс-бар (в 2 раза больше иконки блокировки) */}
                <CircularProgress 
                  progress={progress} 
                  size={40} // размер прогресс-бара (в 2 раза больше 20px иконки)
                  strokeWidth={3}
                />
                {/* Иконка блокировки в центре прогресс-бара */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white/70" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Нижняя часть с текстом */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="text-left">
             {/* Заголовок */}
             <h1 className={`text-2xl font-bold mb-2 ${unlocked ? 'text-gray-600' : 'text-[#e1ff00]'}`}>
               {title}
             </h1>
             
             {/* Описание */}
             <p className={`text-sm leading-relaxed ${unlocked ? 'text-gray-500' : 'text-white'}`}>
               {description}
             </p>
             
             {/* Блок с баллами для заблокированных карточек */}
             {!unlocked && (
               <div className="mt-3">
                 <div className="text-lg font-bold text-[#e1ff00]">
                   +500
                 </div>
                 <div className="text-xs text-gray-400">
                   баллов за открытие
                 </div>
               </div>
             )}
             
             {/* Блок с количеством получений для разблокированных карточек */}
             {unlocked && (
               <div className="mt-3">
                 <div className="text-lg font-bold text-gray-600">
                   x3
                 </div>
                 <div className="text-xs text-gray-500">
                   раз получено
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
