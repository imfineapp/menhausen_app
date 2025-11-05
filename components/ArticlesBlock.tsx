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
  badgeText
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
}) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={`box-border content-stretch flex flex-col gap-2 sm:gap-2.5 items-start justify-start p-[16px] sm:p-[18px] md:p-[20px] relative shrink-0 w-full min-h-[44px] min-w-[44px] transition-all duration-300 flex-1 ${locked ? 'cursor-not-allowed hover:bg-[rgba(217,217,217,0.04)]' : 'cursor-pointer hover:bg-[rgba(217,217,217,0.06)]'}`}
      data-name="Article card"
    >
      <div className="absolute inset-0" data-name="article_block_background">
        {locked ? (
          <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
            <div aria-hidden="true" className="absolute border border-[#505050] border-solid inset-0 pointer-events-none rounded-xl" />
          </div>
        ) : (
          <div className="absolute bg-[#e1ff00] inset-0 rounded-xl" data-name="Block">
            <div aria-hidden="true" className="absolute border border-[#2d2b2b] border-solid inset-0 pointer-events-none rounded-xl" />
          </div>
        )}
      </div>
      
      {/* Article content */}
      <div className="relative z-10 box-border content-stretch flex flex-col gap-2 sm:gap-2.5 items-start justify-start p-0 shrink-0 w-full">
        <div className="flex items-start gap-2 w-full">
          <div className={`typography-h2 text-left w-full ${locked ? 'text-[#9a9a9a]' : 'text-[#2d2b2b]'}`}>
            <h2 className="block line-clamp-2">{article.title}</h2>
          </div>
        </div>
        <div className={`typography-body text-left w-full ${locked ? 'text-[#8a8a8a]' : 'text-[#2d2b2b]'}`}>
          <p className="block line-clamp-2">{article.preview}</p>
        </div>
        {locked && (
          <div className="mt-2">
            <span className="bg-[#e1ff00] text-[#2d2b2b] rounded-[999px] px-2 py-[2px] text-[12px] font-medium">
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
function ViewAllCard({ onClick }: { onClick: () => void }) {
  const { content } = useContent();
  
  return (
    <button
      onClick={onClick}
      className="box-border content-stretch flex flex-col gap-2 sm:gap-2.5 items-center justify-center p-[16px] sm:p-[18px] md:p-[20px] relative shrink-0 w-full cursor-pointer min-h-[44px] min-w-[44px] hover:bg-[rgba(217,217,217,0.06)] transition-all duration-300 flex-1"
      data-name="View all articles card"
    >
      <div className="absolute inset-0" data-name="view_all_background">
        <div className="absolute bg-[#2d2b2b] inset-0 rounded-xl" data-name="Block">
          <div
            aria-hidden="true"
            className="absolute border border-[#e1ff00] border-solid inset-0 pointer-events-none rounded-xl"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 box-border content-stretch flex flex-col gap-2 sm:gap-2.5 items-center justify-center p-0 shrink-0 w-full">
        <div className="typography-h2 text-[#e1ff00] text-center w-full">
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
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    sliderRef.current.style.scrollSnapType = 'none';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeft - walk;
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
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 px-4 py-2 items-stretch"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        data-name="Articles Slider"
      >
        {articles.map((article, index) => {
  const order = article.order ?? (index + 1);
  const required = getRequiredPointsForArticle(order);
  const locked = isArticleLocked(order, totalXP);
  return (
    <div
      key={article.id}
      className="flex-shrink-0 snap-center py-2 flex"
      style={{ width: '256px' }}
    >
      <ArticleCard
        article={article}
        onClick={() => { if (!locked) onArticleClick(article.id); }}
        locked={locked}
        requiredPoints={required}
        badgeText={lockedBadgeText}
      />
    </div>
  );
})}
        
        {/* View All Card */}
        <div
          className="flex-shrink-0 snap-center py-2 flex"
          style={{ width: '256px' }}
        >
          <ViewAllCard onClick={onViewAll} />
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
        <div className="typography-body text-[#696969] text-center w-full py-8">
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





