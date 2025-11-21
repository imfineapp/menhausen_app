// Articles Block Component for Home Screen
// Displays articles in a horizontal slider layout

import React, { useState, useRef, useEffect } from 'react';
import { useContent, useArticles } from './ContentContext';
import { useAchievements } from '../contexts/AchievementsContext';
import { getRequiredPointsForArticle, isArticleLocked } from '../utils/articlesAccess';
	
interface ArticlesBlockProps {
  onArticleClick: (articleId: string) => void;
  onViewAll: () => void;
}

interface ArticlesSliderProps {
  articles: Array<{
    id: string;
    title: string;
    preview: string;
    order: number;
  }>;
  onArticleClick: (articleId: string) => void;
  onViewAll: () => void;
}

/**
 * Individual Article Card Component
 */
function ArticleCard({ 
  article, 
  onClick,
  locked,
  requiredPoints,
  badgeText,
  checkIfSwiped
}: { 
  article: {
    id: string;
    title: string;
    preview: string;
    order: number;
  }; 
  onClick: () => void;
  locked: boolean;
  requiredPoints: number;
  badgeText: string;
  checkIfSwiped?: () => boolean;
}) {
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Если был свайп, не вызываем onClick
    if (checkIfSwiped && checkIfSwiped()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick();
  };
  
  const handleTouchStart = (_e: React.TouchEvent) => {
    // Не блокируем событие, чтобы слайдер мог обработать свайп
    // Событие будет обработано слайдером
  };
  
  return (
    <button
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={(e) => {
        // Для touch событий также проверяем свайп
        if (checkIfSwiped && checkIfSwiped()) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        handleClick(e);
      }}
      disabled={locked}
      style={{ touchAction: 'pan-x' }}
      className={`box-border content-stretch flex flex-col gap-2 sm:gap-2.5 items-start justify-start p-[16px] sm:p-[18px] md:p-[20px] relative shrink-0 w-full min-h-[44px] min-w-[44px] transition-all duration-300 flex-1 ${locked ? 'cursor-not-allowed hover:bg-bg-card' : 'cursor-pointer hover:bg-bg-card-hover'}`}
      data-name="Article card"
    >
      <div className="absolute inset-0" data-name="article_block_background">
        {locked ? (
          <div className="article-card-background-locked" data-name="Block">
            <div aria-hidden="true" className="article-card-border article-card-border-locked" />
          </div>
        ) : (
          <div className="article-card-background-unlocked" data-name="Block">
            <div aria-hidden="true" className="article-card-border article-card-border-unlocked" />
          </div>
        )}
      </div>
      
      {/* Article content */}
      <div className="article-card-content box-border content-stretch flex flex-col gap-2 sm:gap-2.5 items-start justify-start p-0 shrink-0 w-full">
        <div className="flex items-start gap-2 w-full">
          <div className={locked ? 'article-card-title-locked text-left w-full' : 'article-card-title-unlocked text-left w-full'}>
            <h2 className="block line-clamp-2">{article.title}</h2>
          </div>
        </div>
        <div className={locked ? 'article-card-text-locked text-left w-full' : 'article-card-text-unlocked text-left w-full'}>
          <p className="block line-clamp-2">{article.preview}</p>
        </div>
        {locked && (
          <div className="mt-2">
            <span className="article-card-badge">
              {badgeText.replace('{points}', String(requiredPoints))}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

/**
 * View All Articles Card Component
 */
function ViewAllCard({ onClick, checkIfSwiped }: { onClick: () => void; checkIfSwiped?: () => boolean }) {
  const { content } = useContent();
  
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Если был свайп, не вызываем onClick
    if (checkIfSwiped && checkIfSwiped()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick();
  };
  
  const handleTouchStart = (_e: React.TouchEvent) => {
    // Не блокируем событие, чтобы слайдер мог обработать свайп
    // Событие будет обработано слайдером
  };
  
  return (
    <button
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={(e) => {
        // Для touch событий также проверяем свайп
        if (checkIfSwiped && checkIfSwiped()) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        handleClick(e);
      }}
      style={{ touchAction: 'pan-x' }}
      className="box-border content-stretch flex flex-col gap-2 sm:gap-2.5 items-center justify-center p-[16px] sm:p-[18px] md:p-[20px] relative shrink-0 w-full cursor-pointer min-h-[44px] min-w-[44px] hover:bg-bg-card-hover transition-all duration-300 flex-1"
      data-name="View all articles card"
    >
      <div className="absolute inset-0" data-name="view_all_background">
        <div className="absolute bg-[var(--color-text-dark)] inset-0 rounded-xl" data-name="Block">
          <div
            aria-hidden="true"
            className="absolute border border-brand-primary border-solid inset-0 pointer-events-none rounded-xl"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 box-border content-stretch flex flex-col gap-2 sm:gap-2.5 items-center justify-center p-0 shrink-0 w-full">
        <div className="typography-h2 text-brand-primary text-center w-full">
          <h2 className="block">{content.ui.articles?.viewAll || 'Все статьи'}</h2>
        </div>
      </div>
    </button>
  );
}

/**
 * Articles Slider Component
 */
function ArticlesSlider({ articles, onArticleClick, onViewAll }: ArticlesSliderProps) {
  const { content, getLocalizedText } = useContent();
  const { totalXP } = useAchievements();
  // Тип контента может не содержать поля lockedBadge в типах — берём через any с запасной строкой
  const lockedBadgeText = getLocalizedText(((content.ui as any)?.articles?.lockedBadge) || 'Opens at {points}');
  const [_currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  // Отслеживание, был ли свайп (движение пальца), чтобы предотвратить onClick при свайпе
  const wasSwipedRef = useRef(false);
  const touchStartXRef = useRef(0);
  const SWIPE_THRESHOLD = 10; // Порог в пикселях для определения свайпа

  // Общее количество карточек (статьи + ViewAll)
  const _totalCards = articles.length + 1;

  // Обработка свайпа мышью
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    sliderRef.current.style.scrollSnapType = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (!sliderRef.current) return;
    setIsDragging(false);
    sliderRef.current.style.scrollSnapType = 'x mandatory';
    
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
    wasSwipedRef.current = false;
    touchStartXRef.current = e.touches[0].pageX;
    sliderRef.current.style.scrollSnapType = 'none';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    
    // Проверяем, было ли движение (свайп) для предотвращения onClick на карточках
    const deltaX = Math.abs(e.touches[0].pageX - touchStartXRef.current);
    if (deltaX > SWIPE_THRESHOLD) {
      wasSwipedRef.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (!sliderRef.current) return;
    setIsDragging(false);
    sliderRef.current.style.scrollSnapType = 'x mandatory';
    
    const cardWidth = getCardWidth();
    const currentScroll = sliderRef.current.scrollLeft;
    const targetIndex = Math.round(currentScroll / cardWidth);
    const targetScroll = targetIndex * cardWidth;
    
    sliderRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
    
    // Сбрасываем флаг свайпа через небольшую задержку, чтобы кнопки успели проверить его
    setTimeout(() => {
      wasSwipedRef.current = false;
    }, 100);
  };

  const handleTouchCancel = () => {
    if (!sliderRef.current) return;
    setIsDragging(false);
    wasSwipedRef.current = false;
    sliderRef.current.style.scrollSnapType = 'x mandatory';
  };
  
  // Функция для проверки, был ли свайп (используется в кнопках)
  const checkIfSwiped = (): boolean => {
    return wasSwipedRef.current;
  };

  // Обновление текущего индекса при скролле
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const firstCard = slider.querySelector('.flex-shrink-0') as HTMLElement;
        if (firstCard) {
          const cardWidth = firstCard.offsetWidth + 16; // 16px gap
          const newIndex = Math.round(slider.scrollLeft / cardWidth);
          setCurrentIndex(newIndex);
        }
      }, 100);
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

  return (
    <div className="relative w-full">
      {/* Слайдер */}
      <div
        ref={sliderRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 px-4 items-stretch"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-x pinch-zoom' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        data-name="Articles Slider"
      >
        {articles.map((article, index) => {
  const order = article.order ?? (index + 1);
  const required = getRequiredPointsForArticle(order);
  const locked = isArticleLocked(order, totalXP);
  return (
    <div
      key={article.id}
      className="flex-shrink-0 snap-center flex"
      style={{ width: '256px', touchAction: 'pan-x' }}
      onTouchStart={(_e) => {
        // Позволяем событиям всплывать к слайдеру для обработки свайпа
        // Событие будет обработано слайдером через handleTouchStart
      }}
    >
      <ArticleCard
        article={article}
        onClick={() => { if (!locked) onArticleClick(article.id); }}
        locked={locked}
        requiredPoints={required}
        badgeText={lockedBadgeText}
        checkIfSwiped={checkIfSwiped}
      />
    </div>
  );
})}
        
        {/* View All Card */}
        <div
          className="flex-shrink-0 snap-center flex"
          style={{ width: '256px', touchAction: 'pan-x' }}
          onTouchStart={(_e) => {
            // Позволяем событиям всплывать к слайдеру для обработки свайпа
            // Событие будет обработано слайдером через handleTouchStart
          }}
        >
          <ViewAllCard onClick={onViewAll} checkIfSwiped={checkIfSwiped} />
        </div>
      </div>

      {/* Индикаторы скрыты */}

    </div>
  );
}

/**
 * Articles Block Container Component
 */
export function ArticlesBlock({ onArticleClick, onViewAll }: ArticlesBlockProps) {
  const { content } = useContent();
  const articles = useArticles();
  
  // Показываем только первые 5 статей
  const displayArticles = articles.slice(0, 5);
  
  if (displayArticles.length === 0) {
    return (
      <div
        className="box-border content-stretch flex flex-col gap-[24px] sm:gap-[27px] md:gap-[30px] items-start justify-start p-0 relative shrink-0 w-full"
        data-name="Articles container"
      >
        <div className="typography-body text-tertiary text-center w-full py-8">
          <p className="block">{content.ui.articles?.noArticles || 'Статьи скоро появятся'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div
      className="box-border content-stretch flex flex-col gap-0 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Articles container"
    >
      
      {/* Articles Slider */}
      <ArticlesSlider 
        articles={displayArticles}
        onArticleClick={onArticleClick}
        onViewAll={onViewAll}
      />
    </div>
  );
}





