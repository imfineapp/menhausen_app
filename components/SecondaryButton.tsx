// Стандартный компонент Secondary Button согласно Guidelines.md
import React from 'react';

// Типы для пропсов компонента
interface SecondaryButtonProps {
  onClick: () => void; // Функция обработки клика
  disabled?: boolean; // Состояние блокировки кнопки
  children: React.ReactNode; // Текст кнопки
  className?: string; // Дополнительные CSS классы
}

/**
 * Стандартная Secondary Button согласно Guidelines.md
 * 
 * Спецификации:
 * - Ширина: 350px (фиксированная)
 * - Высота: 46px (минимум min-h-[44px] min-w-[44px])
 * - Позиционирование: Абсолютное с bottom-[35px] для корректного отступа от нижнего края
 * - Центрирование: Строго по центру горизонта экрана (left-1/2 transform -translate-x-1/2)
 * - Стиль: Outline с прозрачным фоном и желтой рамкой
 * - Цвета: Прозрачный фон, #E1FF00 рамка и текст, при hover полупрозрачный желтый фон
 * - Типографика: PT Sans Bold, 15px, #E1FF00 цвет
 * - Радиус: 12px (rounded-xl)
 * - Touch-friendly: Минимум 44px высота, активные состояния
 */
export function SecondaryButton({ 
  onClick, 
  disabled = false, 
  children, 
  className = '' 
}: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`absolute left-1/2 transform -translate-x-1/2 bottom-[35px] w-[350px] h-[46px] 
           bg-transparent border border-[#e1ff00] rounded-xl 
           font-sans font-bold text-[15px] 
           text-[#e1ff00] text-center
           hover:bg-[rgba(225,255,0,0.1)] hover:text-[#2d2b2b]
           active:scale-[0.98] transition-all duration-200
           min-h-[44px] min-w-[44px] cursor-pointer ${className || ''}`}
      data-name="Secondary Button"
    >
      {children}
    </button>
  );
}
