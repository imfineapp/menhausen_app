// All Articles Screen Component
// Displays list of all available articles

import React from 'react';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { BackButton } from './ui/back-button';
import { useContent, useArticles } from './ContentContext';

interface AllArticlesScreenProps {
  onBack: () => void;
  onArticleClick: (articleId: string) => void;
}

/**
 * Individual Article List Item Component
 */
function ArticleListItem({ 
  article, 
  onClick 
}: { 
  article: {
    id: string;
    title: string;
    preview: string;
    order: number;
  }; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-[rgba(217,217,217,0.04)] rounded-xl border border-[#212121] hover:bg-[rgba(217,217,217,0.08)] transition-colors mb-4 min-h-fit"
    >
      <div className="flex items-start gap-4">
        {/* Article content */}
        <div className="flex-1 min-w-0">
          <h3 className="typography-h2 text-[#e1ff00] mb-2">
            {article.title}
          </h3>
          <p className="typography-body text-[#ffffff] line-clamp-3">
            {article.preview}
          </p>
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
  const { content } = useContent();
  const articles = useArticles();
  
  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden overflow-x-hidden bg-[#111111] flex flex-col">
      {/* Telegram Back Button */}
      <BackButton onBack={onBack} />
      
      {/* Logo */}
      <MiniStripeLogo />
      
      {/* Content with scroll */}
      <div className="flex-1 overflow-y-auto">
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
                {articles.map((article) => (
                  <ArticleListItem 
                    key={article.id}
                    article={article}
                    onClick={() => onArticleClick(article.id)}
                  />
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}


