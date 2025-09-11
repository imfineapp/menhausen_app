import React from 'react';

interface ProgressRowProps {
  icon: React.ReactNode;
  value: string;
  progress: number; // Процент от 0 до 100
}

/**
 * Компонент строки прогресса с иконкой, значением и прогресс-баром
 */
export function ProgressRow({ icon, value, progress }: ProgressRowProps) {
  return (
    <div className="flex items-center gap-3 w-full">
      {/* Иконка с эффектом свечения */}
      <div className="relative shrink-0">
        <div className="absolute inset-0 bg-[#e1ff00]/30 rounded-full blur-lg scale-150"></div>
        <div className="relative w-8 h-8 flex items-center justify-center">
          {icon}
        </div>
      </div>
      
      {/* Значение */}
      <div className="text-lg font-bold text-white min-w-[40px]">
        {value}
      </div>
      
      {/* Прогресс-бар */}
      <div className="flex-1">
        <div className="relative w-full">
          <div className="w-full bg-black rounded-full h-2">
            <div 
              className="bg-[#e1ff00] rounded-full h-2 transition-all duration-300 relative"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              <div className="absolute inset-0 bg-[#e1ff00]/50 rounded-full blur-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
