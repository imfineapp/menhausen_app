import React, { useState, useRef, useEffect } from 'react';
import { BadgeCard } from './BadgeCard';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: string | null;
  progress?: number; // прогресс для заблокированных карточек (0-100)
}

interface BadgesSliderProps {
  badges: Badge[];
  onCurrentIndexChange?: (index: number) => void;
}

/**
 * Компонент слайдера с карточками достижений
 */
export function BadgesSlider({ badges, onCurrentIndexChange }: BadgesSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Уведомляем родительский компонент об изменении текущего индекса
  useEffect(() => {
    onCurrentIndexChange?.(currentIndex);
  }, [currentIndex, onCurrentIndexChange]);

  // Обработка свайпа
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Обработка касаний для мобильных устройств
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Обновление текущего индекса при скролле
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handleScroll = () => {
      const cardWidth = 272; // 64 * 4 + gap (w-64 + gap-4)
      const newIndex = Math.round(slider.scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    };

    slider.addEventListener('scroll', handleScroll);
    return () => slider.removeEventListener('scroll', handleScroll);
  }, []);

  // Переход к следующей карточке
  const goToNext = () => {
    if (currentIndex < badges.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (sliderRef.current) {
        sliderRef.current.scrollTo({
          left: nextIndex * 272,
          behavior: 'smooth'
        });
      }
    }
  };

  // Переход к предыдущей карточке
  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      if (sliderRef.current) {
        sliderRef.current.scrollTo({
          left: prevIndex * 272,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <div className="relative w-full">
      {/* Слайдер */}
      <div
        ref={sliderRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 px-4 py-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        data-name="Badges Slider"
      >
        {badges.map((badge, index) => (
          <div
            key={badge.id}
            className="flex-shrink-0 snap-center py-4"
            style={{ width: '256px' }}
          >
            <BadgeCard
              {...badge}
              isActive={index === currentIndex}
            />
          </div>
        ))}
      </div>

      {/* Индикаторы */}
      <div className="flex justify-center items-center mt-6 space-x-2 h-2">
        {badges.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 flex-shrink-0 cursor-pointer min-w-0 min-h-0 max-w-2 max-h-2 ${
              index === currentIndex
                ? 'bg-white'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              minWidth: '8px',
              minHeight: '8px',
              maxWidth: '8px',
              maxHeight: '8px'
            }}
            onClick={() => {
              setCurrentIndex(index);
              if (sliderRef.current) {
                sliderRef.current.scrollTo({
                  left: index * 272,
                  behavior: 'smooth'
                });
              }
            }}
          />
        ))}
      </div>

      {/* Кнопки навигации (скрыты на мобильных) */}
      <div className="hidden md:block">
        {currentIndex > 0 && (
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            onClick={goToPrevious}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {currentIndex < badges.length - 1 && (
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            onClick={goToNext}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
