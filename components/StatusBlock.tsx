import React from 'react';

interface StatusBlockProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  onClick?: () => void;
}

/**
 * Компонент статусного блока в стиле блока активностей
 * Включает подложку, иконку с кружком и свечением, и два текста
 */
export function StatusBlock({ icon, title, value, subtitle, onClick }: StatusBlockProps) {
  return (
    <button
      onClick={onClick}
      className="relative rounded-xl p-3 sm:p-4 w-full cursor-pointer min-h-[44px] min-w-[44px] hover:bg-[rgba(217,217,217,0.06)] transition-colors duration-200"
      data-name="Status block"
    >
      {/* Подложка блока */}
      <div className="absolute inset-0" data-name="status_block_background">
        <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
          <div
            aria-hidden="true"
            className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
          />
        </div>
      </div>
      
      {/* Контент блока */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-2 sm:gap-3 w-full">
        {/* Иконка с эффектом свечения */}
        <div className="relative mb-1">
          <div className="absolute inset-0 bg-[#e1ff00]/30 rounded-full blur-lg scale-150"></div>
          <div className="relative w-14 h-14 sm:w-15 sm:h-15 flex items-center justify-center">
            {icon}
          </div>
        </div>
        
        {/* Основное значение */}
        <div className="text-lg sm:text-xl font-bold text-white text-center leading-tight">
          {value}
        </div>
        
        {/* Заголовок */}
        <div className="text-sm text-[#696969] text-center leading-tight">
          {title}
        </div>
        
        {/* Дополнительный подзаголовок (если есть) */}
        {subtitle && (
          <div className="text-xs text-[#696969] text-center leading-tight">
            {subtitle}
          </div>
        )}
      </div>
    </button>
  );
}
