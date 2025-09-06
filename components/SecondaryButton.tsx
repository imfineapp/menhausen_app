// Адаптивный компонент Secondary Button согласно Guidelines.md
import React from 'react';

// Типы для пропсов компонента
interface SecondaryButtonProps {
  onClick: () => void; // Функция обработки клика
  disabled?: boolean; // Состояние отключения кнопки
  children: React.ReactNode; // Содержимое кнопки
  className?: string; // Дополнительные CSS классы
}

/**
 * Адаптивный Secondary Button согласно Guidelines.md
 * 
 * Характеристики:
 * - Ширина: 350px (адаптивная)
 * - Высота: 46px (соответствует min-h-[44px] min-w-[44px])
 * - Позиционирование: абсолютное с bottom-[35px] для фиксированного размещения на экране
 * - Центрирование: кнопка по центру экрана (left-1/2 transform -translate-x-1/2)
 * - Стиль: Outline с желтой рамкой и прозрачным фоном
 * - Цвет: желтый текст, #E1FF00 цвет и рамка, при hover меняется фон и цвет текста
 * - Типографика: PT Sans Bold, 15px, #E1FF00 цвет
 * - Радиус: 12px (rounded-xl)
 * - Touch-friendly: минимум 44px высота, удобные отступы
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
           typography-button
           text-[#e1ff00] text-center
           hover:bg-[rgba(225,255,0,0.1)] hover:text-[#2d2b2b]
           active:scale-[0.98] transition-all duration-200
           min-h-[44px] min-w-[44px] cursor-pointer ${className}`}
      data-name='Secondary Button'
    >
      {children}
    </button>
  );
}