"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "./utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      // Базовые стили - используем только минимальные размеры для touch-friendly
      "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
      // Принудительные размеры с !important
      "!h-[16px] !w-[37px]",
      // Дополнительные классы для принудительного размера
      "h-[16px] w-[37px] min-h-[16px] max-h-[16px]",
      // Переходы и анимации
      "transition-colors duration-200 ease-in-out",
      // Фокус и доступность
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e1ff00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]",
      // Состояния
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Фирменные цвета
      "data-[state=checked]:bg-[#e1ff00] data-[state=unchecked]:bg-[#2d2b2b]",
      className
    )}
    style={{
      height: '16px',
      width: '37px',
      minHeight: '16px',
      maxHeight: '16px',
      ...props.style
    }}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        // Базовые стили для thumb (уменьшено в 1.5 раза)
        "pointer-events-none block rounded-full",
        // Принудительные размеры для круглой формы
        "!h-4 !w-4 h-4 w-4 min-h-4 max-h-4 min-w-4 max-w-4",
        // Тень
        "shadow-lg ring-0",
        // Переходы
        "transition-transform duration-200 ease-in-out",
        // Позиционирование - 16px thumb в 37px контейнере (уменьшено в 1.5 раза)
        "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        // Цвета - белый по умолчанию, серый во включенном состоянии
        "bg-white data-[state=checked]:bg-gray-400"
      )}
      style={{
        height: '16px',
        width: '16px',
        minHeight: '16px',
        maxHeight: '16px',
        minWidth: '16px',
        maxWidth: '16px'
      }}
    />
  </SwitchPrimitive.Root>
));

Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };