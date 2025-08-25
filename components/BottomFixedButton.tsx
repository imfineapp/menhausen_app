// Стандартный компонент Bottom Fixed CTA Button согласно Guidelines.md
import React from 'react';

// Типы для пропсов компонента
interface BottomFixedButtonProps {
  onClick: () => void; // Функция обработки клика
  disabled?: boolean; // Состояние блокировки кнопки
  children: React.ReactNode; // Текст кнопки
  className?: string; // Дополнительные CSS классы
}

/**
 * Стандартная Bottom Fixed CTA Button согласно Guidelines.md
 * 
 * Спецификации:
 * - Ширина: 350px (фиксированная)
 * - Высота: 46px (минимум touch-friendly)
 * - Позиционирование: Абсолютное с bottom-[35px] для корректного отступа от нижнего края
 * - Центрирование: Строго по центру горизонта экрана (left-1/2 transform -translate-x-1/2)
 * - Цвета: #E1FF00 фон, #D1EF00 при hover
 * - Типографика: PT Sans Bold, 15px, #2D2B2B цвет
 * - Радиус: 12px (rounded-xl)
 * - Touch-friendly: Минимум 44px высота, активные состояния
 */
export function BottomFixedButton({ 
  onClick, 
  disabled = false, 
  children, 
  className = '' 
}: BottomFixedButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`absolute bg-[#e1ff00] box-border content-stretch flex flex-row gap-2.5 h-[46px] items-center justify-center left-1/2 transform -translate-x-1/2 px-[126px] py-[15px] rounded-xl bottom-[35px] w-[350px] touch-friendly ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:bg-[#d1ef00] active:scale-[0.98] transition-all duration-200'
      } ${className}`}
      data-name="Bottom Fixed CTA Button"
    >
      <div className="font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] font-bold leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center text-nowrap tracking-[-0.43px]">
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">{children}</p>
      </div>
    </button>
  );
}