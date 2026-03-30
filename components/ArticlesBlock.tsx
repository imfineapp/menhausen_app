// Articles Block Component for Home Screen
// Displays articles in a horizontal slider layout

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { useArticles } from './ContentContext';
import { articlesMessages } from '@/src/i18n/messages/articles';
import { $pointsBalance } from '@/src/stores/points.store';
import { getRequiredPointsForArticle, isArticleLocked } from '../utils/articlesAccess';
import { PINNED_ARTICLE_IDS } from '../utils/articlesList';
	
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
  const handleClick = (e: React.MouseEvent | React.PointerEvent | React.TouchEvent) => {
    // Если был свайп, не вызываем onClick
    if (checkIfSwiped && checkIfSwiped()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick();
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={locked}
      style={{ touchAction: 'manipulation' }}
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
  const articlesUi = useStore(articlesMessages);
  
  const handleClick = (e: React.MouseEvent | React.PointerEvent | React.TouchEvent) => {
    // Если был свайп, не вызываем onClick
    if (checkIfSwiped && checkIfSwiped()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick();
  };
  
  return (
    <button
      onClick={handleClick}
      style={{ touchAction: 'manipulation' }}
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
          <h2 className="block">{articlesUi.viewAll}</h2>
        </div>
      </div>
    </button>
  );
}

/**
 * Articles Slider Component
 */
function ArticlesSlider({ articles, onArticleClick, onViewAll }: ArticlesSliderProps) {
  const articlesUi = useStore(articlesMessages);
  const pointsBalance = useStore($pointsBalance);
  const lockedBadgeText = articlesUi.lockedBadge;
  const [_currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  // Отслеживание, был ли свайп (движение пальца), чтобы предотвратить onClick при свайпе
  const wasSwipedRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const pointerStartXRef = useRef(0);
  const pointerStartYRef = useRef(0);
  const pointerStartScrollLeftRef = useRef(0);
  const SWIPE_THRESHOLD = 10; // Порог в пикселях для определения свайпа

  // Общее количество карточек (статьи + ViewAll)
  const _totalCards = articles.length + 1;

  const finishDragAndSnap = () => {
    if (!sliderRef.current) return;
    setIsDragging(false);
    sliderRef.current.style.scrollSnapType = 'x mandatory';

    const cardWidth = getCardWidth();
    const currentScroll = sliderRef.current.scrollLeft;
    const targetIndex = Math.round(currentScroll / cardWidth);
    const targetScroll = targetIndex * cardWidth;

    sliderRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });

    setTimeout(() => {
      wasSwipedRef.current = false;
    }, 100);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;

    // Игнорируем дополнительные указатели, обрабатываем только первый активный
    if (activePointerIdRef.current !== null) return;

    activePointerIdRef.current = e.pointerId;
    wasSwipedRef.current = false;
    pointerStartXRef.current = e.pageX;
    pointerStartYRef.current = e.pageY;
    pointerStartScrollLeftRef.current = sliderRef.current.scrollLeft;

    setIsDragging(true);
    sliderRef.current.style.scrollSnapType = 'none';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    if (!isDragging) return;
    if (activePointerIdRef.current !== e.pointerId) return;

    if (e.pointerType === 'mouse') {
      e.preventDefault();
    }

    const dx = e.pageX - pointerStartXRef.current;
    const dy = e.pageY - pointerStartYRef.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    const movedEnough = absDx > SWIPE_THRESHOLD || absDy > SWIPE_THRESHOLD;

    if (movedEnough) {
      wasSwipedRef.current = true;
    }

    // Вертикальный жест — отдаём управление странице
    if (absDy > absDx && absDy > SWIPE_THRESHOLD) {
      activePointerIdRef.current = null;
      finishDragAndSnap();
      return;
    }

    // Горизонтальный жест — двигаем слайдер, имитируя drag
    const walk = dx * 1.5;
    sliderRef.current.scrollLeft = pointerStartScrollLeftRef.current - walk;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    activePointerIdRef.current = null;
    finishDragAndSnap();
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    activePointerIdRef.current = null;
    if (!sliderRef.current) return;

    setIsDragging(false);
    wasSwipedRef.current = false;
    sliderRef.current.style.scrollSnapType = 'x mandatory';
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    activePointerIdRef.current = null;
    finishDragAndSnap();
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
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-x pan-y pinch-zoom' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUpCapture={handlePointerUp}
        onPointerCancelCapture={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
        data-name="Articles Slider"
      >
        {articles.map((article) => {
  const order = article.order;
  const isPinned = (PINNED_ARTICLE_IDS as unknown as string[]).includes(article.id);
  const required = isPinned ? 0 : getRequiredPointsForArticle(order);
  const locked = isPinned ? false : isArticleLocked(order, pointsBalance);
  return (
    <div
      key={article.id}
      className="flex-shrink-0 snap-center flex"
      style={{ width: '256px', touchAction: 'pan-x pan-y' }}
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
          style={{ width: '256px', touchAction: 'pan-x pan-y' }}
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
  const articlesUi = useStore(articlesMessages);
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
          <p className="block">{articlesUi.noArticles}</p>
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





