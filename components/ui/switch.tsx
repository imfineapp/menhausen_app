"use client";

import * as React from "react";

// Типы для компонента Switch
interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

/**
 * Адаптивный Switch компонент без внешних зависимостей
 * Совместим с shadcn API, но реализован нативно для Figma Make
 * Включает фирменные цвета и touch-friendly дизайн
 */
function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
  className = "",
  'data-testid': testId,
  ...props
}: SwitchProps) {
  const handleClick = () => {
    if (disabled) return;
    onCheckedChange?.(!checked);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onCheckedChange?.(!checked);
    }
  };

  return (
    <button
      role="switch"
      type="button"
      aria-checked={checked}
      aria-disabled={disabled}
      data-state={checked ? "checked" : "unchecked"}
      data-slot="switch"
      data-testid={testId}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center
        rounded-full border-2 border-transparent transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        focus-visible:ring-offset-2 focus-visible:ring-offset-background
        disabled:cursor-not-allowed disabled:opacity-50 touch-friendly
        ${checked 
          ? 'bg-[#e1ff00] data-[state=checked]:bg-[#e1ff00]' 
          : 'bg-[#2d2b2b] data-[state=unchecked]:bg-[#2d2b2b]'
        }
        ${className}
      `.trim()}
      {...props}
    >
      <span
        data-state={checked ? "checked" : "unchecked"}
        data-slot="switch-thumb"
        className={`
          pointer-events-none block h-4 w-4 rounded-full ring-0 transition-transform duration-200
          ${checked 
            ? 'translate-x-4 bg-[#2d2b2b] data-[state=checked]:bg-[#2d2b2b]' 
            : 'translate-x-0 bg-[#ffffff] data-[state=unchecked]:bg-[#ffffff]'
          }
        `.trim()}
      />
    </button>
  );
}

export { Switch };