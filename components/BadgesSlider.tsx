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
  xp?: number;
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
    // Отключаем snap во время перетаскивания
    sliderRef.current.style.scrollSnapType = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Уменьшили множитель для более плавного движения
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (!sliderRef.current) return;
    setIsDragging(false);
    // Включаем snap обратно
    sliderRef.current.style.scrollSnapType = 'x mandatory';
    
    // Плавно переходим к ближайшей карточке
    const cardWidth = getCardWidth();
    const currentScroll = sliderRef.current.scrollLeft;
    const targetIndex = Math.round(currentScroll / cardWidth);
    const targetScroll = targetIndex * cardWidth;
    
    sliderRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  // Обработка касаний для мобильных устройств
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    // Отключаем snap во время перетаскивания
    sliderRef.current.style.scrollSnapType = 'none';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    // Нативная прокрутка браузера обрабатывает движение
  };

  const handleTouchEnd = () => {
    if (!sliderRef.current) return;
    setIsDragging(false);
    // Включаем snap обратно
    sliderRef.current.style.scrollSnapType = 'x mandatory';
    
    // Плавно переходим к ближайшей карточке
    const cardWidth = getCardWidth();
    const currentScroll = sliderRef.current.scrollLeft;
    const targetIndex = Math.round(currentScroll / cardWidth);
    const targetScroll = targetIndex * cardWidth;
    
    sliderRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  // Обновление текущего индекса при скролле с debounce
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Получаем реальную ширину карточки с учетом gap
        const firstCard = slider.querySelector('.flex-shrink-0') as HTMLElement;
        if (firstCard) {
          const cardWidth = firstCard.offsetWidth + 16; // 16px gap
          const newIndex = Math.round(slider.scrollLeft / cardWidth);
          setCurrentIndex(newIndex);
        }
      }, 100); // Debounce 100ms
    };

    slider.addEventListener('scroll', handleScroll);
    return () => {
      slider.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Получение реальной ширины карточки
  const getCardWidth = () => {
    if (!sliderRef.current) return 272;
    const firstCard = sliderRef.current.querySelector('.flex-shrink-0') as HTMLElement;
    return firstCard ? firstCard.offsetWidth + 16 : 272; // 16px gap
  };

  // Переход к следующей карточке
  const goToNext = () => {
    if (currentIndex < badges.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (sliderRef.current) {
        const cardWidth = getCardWidth();
        sliderRef.current.scrollTo({
          left: nextIndex * cardWidth,
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
        const cardWidth = getCardWidth();
        sliderRef.current.scrollTo({
          left: prevIndex * cardWidth,
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
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-x pinch-zoom' }}
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
              xp={badge.xp}
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
                const cardWidth = getCardWidth();
                sliderRef.current.scrollTo({
                  left: index * cardWidth,
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
