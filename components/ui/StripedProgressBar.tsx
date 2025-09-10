import React from 'react';

interface StripedProgressBarProps {
  progress: number; // Процент прогресса от 0 до 100
  className?: string; // Дополнительные CSS классы
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Размер прогресс-бара
  showBackground?: boolean; // Показывать ли фон
  backgroundVariant?: 'light' | 'dark' | 'gray'; // Вариант фона
  animated?: boolean; // Анимированные полосы
  active?: boolean; // Активное состояние
}

/**
 * Универсальный компонент полосатого прогресс-бара
 * Использует CSS классы для консистентного дизайна
 */
export function StripedProgressBar({ 
  progress, 
  className = "", 
  size = 'md',
  showBackground = true,
  backgroundVariant = 'light',
  animated = false,
  active = false
}: StripedProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  const sizeClass = `striped-progress-bar-${size}`;
  const backgroundClass = showBackground ? `striped-progress-bar-bg-${backgroundVariant}` : '';
  const animatedClass = animated ? 'striped-progress-bar-animated' : '';
  const activeClass = active ? 'striped-progress-bar-active' : '';
  
  return (
    <div className={`striped-progress-bar ${sizeClass} ${animatedClass} ${activeClass} ${className}`}>
      {showBackground && (
        <div className={`striped-progress-bar-bg ${backgroundClass}`} />
      )}
      {clampedProgress > 0 && (
        <div 
          className="striped-progress-bar-fill"
          style={{ width: `${clampedProgress}%` }}
        />
      )}
    </div>
  );
}
