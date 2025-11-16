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
  const isClickable = !!onClick;
  const Component = isClickable ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`relative rounded-xl p-3 sm:p-4 w-full h-full min-h-[44px] min-w-[44px] transition-colors duration-200 ${
        isClickable ? 'cursor-pointer hover:bg-[rgba(217,217,217,0.06)]' : 'cursor-default'
      }`}
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
      <div className="relative z-10 flex flex-col items-center w-full h-full pt-3 pb-2">
        {/* Иконка с эффектом свечения - фиксированный отступ от верха */}
        <div className="relative flex-shrink-0 h-14 sm:h-15 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#e1ff00]/15 rounded-full blur-md scale-125"></div>
          <div className="relative w-14 h-14 sm:w-15 sm:h-15 flex items-center justify-center">
            {icon}
          </div>
        </div>
        
        {/* Основное значение - фиксированный отступ от иконки */}
        <div className="text-2xl font-semibold text-white text-center leading-tight flex-shrink-0 h-8 flex items-center justify-center mt-3">
          {value}
        </div>
        
        {/* Заголовок - фиксированный отступ от числа */}
        <div className="text-sm text-[#696969] text-center leading-tight flex-shrink-0 flex items-center justify-center mt-3">
          {title}
        </div>
        
        {/* Дополнительный подзаголовок (если есть) */}
        {subtitle && (
          <div className="text-xs text-[#696969] text-center leading-tight flex-shrink-0 mt-1">
            {subtitle}
          </div>
        )}
      </div>
    </Component>
  );
}
