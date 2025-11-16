// All Articles Screen Component
// Displays list of all available articles

import React, { useState, useRef, useEffect } from 'react';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { BackButton } from './ui/back-button';
import { useContent, useArticles } from './ContentContext';
import { useAchievements } from '../contexts/AchievementsContext';
import { getRequiredPointsForArticle, isArticleLocked } from '../utils/articlesAccess';
	
interface AllArticlesScreenProps {
  onBack: () => void;
  onArticleClick: (articleId: string) => void;
}

/**
 * Individual Article List Item Component
 */
function ArticleListItem({ 
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
      className={`w-full text-left p-4 rounded-xl border transition-colors mb-4 min-h-fit ${locked ? 'bg-[rgba(217,217,217,0.04)] border-[#2A2A2A] cursor-not-allowed' : 'bg-[rgba(217,217,217,0.04)] hover:bg-[rgba(217,217,217,0.08)] border-[#212121]'}`}
    >
      <div className="flex items-start gap-4">
        {/* Article content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className={`typography-h2 mb-2 ${locked ? 'text-[#9a9a9a]' : 'text-[#e1ff00]'}`}>
              {article.title}
            </h3>
          </div>
          <p className={`typography-body line-clamp-3 ${locked ? 'text-[#8a8a8a]' : 'text-[#ffffff]'}`}>
            {article.preview}
          </p>
          {locked && (
            <div className="mt-2">
              <span className="bg-[#e1ff00] text-[#2d2b2b] rounded-[999px] px-2 py-[2px] text-[12px] font-medium">
                {badgeText.replace('{points}', String(requiredPoints))}
              </span>
            </div>
          )}
        </div>
        
        {/* Arrow icon */}
        <div className="flex-shrink-0 flex items-center">
          <svg className="w-5 h-5 text-[#696969]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

/**
 * Main All Articles Screen Component
 */
export function AllArticlesScreen({ onBack, onArticleClick }: AllArticlesScreenProps) {
  const { content, getLocalizedText } = useContent();
  const articles = useArticles();
  const { totalXP } = useAchievements();
  // Берём через any, т.к. тип ui.articles может не включать lockedBadge
  const lockedBadgeText = ((content.ui as any)?.articles?.lockedBadge) || 'Откроется за {points}';
  
  const [logoOpacity, setLogoOpacity] = useState<number>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Handle scroll to fade logo when content scrolls under it
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    
    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      // Логотип находится примерно на высоте 60px + padding top 100px = 160px от начала контента
      // Когда прокрутка достигает начала логотипа, начинаем делать его прозрачным
      const fadeStart = 0; // Начинаем затемнять сразу при прокрутке
      const fadeEnd = 80; // Полностью прозрачный при прокрутке на 80px
      
      if (scrollTop <= fadeStart) {
        setLogoOpacity(1);
      } else if (scrollTop >= fadeEnd) {
        setLogoOpacity(0);
      } else {
        // Плавное изменение прозрачности
        const opacity = 1 - (scrollTop - fadeStart) / (fadeEnd - fadeStart);
        setLogoOpacity(Math.max(0, Math.min(1, opacity)));
      }
    };
    
    scrollContainer.addEventListener('scroll', handleScroll);
    // Вызываем сразу на случай, если уже есть прокрутка
    handleScroll();
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden overflow-x-hidden bg-[#111111] flex flex-col">
      {/* Telegram Back Button */}
      <BackButton onBack={onBack} />
      
      {/* Logo with dynamic opacity */}
      <div style={{ opacity: logoOpacity, transition: 'opacity 0.2s ease-out' }}>
        <MiniStripeLogo />
      </div>
      
      {/* Content with scroll */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] pb-[100px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="typography-h1 text-[#e1ff00] mb-4">
                {content.ui.articles?.viewAll || 'Все статьи'}
              </h1>
              <p className="typography-body text-[#696969]">
                Полезные статьи для улучшения психического здоровья
              </p>
            </div>
            
            {/* Articles List */}
            {articles.length === 0 ? (
              <div className="text-center py-12">
                <div className="typography-body text-[#696969]">
                  {content.ui.articles?.noArticles || 'Статьи скоро появятся'}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article, idx) => {
  const order = article.order ?? (idx + 1);
  const required = getRequiredPointsForArticle(order);
  const locked = isArticleLocked(order, totalXP);
  return (
    <ArticleListItem 
      key={article.id}
      article={article}
      onClick={() => { if (!locked) onArticleClick(article.id); }}
      locked={locked}
      requiredPoints={required}
      badgeText={getLocalizedText(lockedBadgeText)}
    />
  );
})}
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}





