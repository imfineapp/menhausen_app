// Article Screen Component
// Displays individual article content

import React, { useState, useEffect, useRef } from 'react';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { BackButton } from './ui/back-button';
import { useContent, useArticle } from './ContentContext';
import { markArticleRead } from '../services/userStatsService';
import { ThemeCard } from './ThemeCard';
import { ThemeCardManager } from '../utils/ThemeCardManager';

interface ArticleScreenProps {
  articleId: string;
  onBack: () => void;
  onGoToTheme?: (themeId: string) => void;
  userHasPremium?: boolean;
}

/**
 * Format markdown-like content to HTML
 */
function formatArticleContent(content: string): string {
  // Simple markdown-like formatting
  let formatted = content;
  
  // Headers (## Header)
  formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="typography-h3 text-[#e1ff00] mt-6 mb-3">$1</h3>');
  formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="typography-h2 text-[#e1ff00] mt-8 mb-4">$1</h2>');
  formatted = formatted.replace(/^# (.*$)/gim, '<h1 class="typography-h1 text-[#e1ff00] mt-8 mb-4">$1</h1>');
  
  // Bold (**text**)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  
  // Lists (- item)
  formatted = formatted.replace(/^- (.*$)/gim, '<li class="ml-4 mb-2">$1</li>');
  formatted = formatted.replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc list-inside mb-4 space-y-2">$&</ul>');
  
  // Line breaks
  formatted = formatted.replace(/\n\n/g, '</p><p class="mb-4">');
  formatted = formatted.replace(/\n/g, '<br />');
  
  // Wrap in paragraph if not already wrapped
  if (!formatted.startsWith('<')) {
    formatted = '<p class="mb-4">' + formatted + '</p>';
  }
  
  return formatted;
}

/**
 * Main Article Screen Component
 */
export function ArticleScreen({ articleId, onBack, onGoToTheme, userHasPremium: _userHasPremium = false }: ArticleScreenProps) {
  const { content, getLocalizedText, getTheme } = useContent();
  const article = useArticle(articleId);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const didMarkRef = useRef(false);
  
  // Mark article as read when component mounts (idempotent per article)
  React.useEffect(() => {
    if (article && !didMarkRef.current) {
      markArticleRead(article.id);
      didMarkRef.current = true;
    }
  }, [article]);
  
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
  
  if (!article) {
    return (
      <div className="w-full h-screen max-h-screen relative overflow-hidden overflow-x-hidden bg-[#111111] flex flex-col">
        <BackButton onBack={onBack} />
        <div style={{ opacity: logoOpacity, transition: 'opacity 0.2s ease-out' }}>
          <MiniStripeLogo />
        </div>
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] pb-[100px]">
            <div className="max-w-[351px] mx-auto">
              <div className="text-center py-12">
                <div className="typography-body text-[#696969]">
                  {content.ui.articles?.noArticles || 'Статья не найдена'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const articleTitle = getLocalizedText(article.title);
  const articlePreview = getLocalizedText(article.preview);
  const articleContent = getLocalizedText(article.content);
  const formattedContent = formatArticleContent(articleContent);
  
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
            
            {/* Article Header */}
            <div className="mb-8">
              <h1 className="typography-h1 text-[#e1ff00] mb-4">
                {articleTitle}
              </h1>
              <p className="typography-body text-[#696969] mb-6">
                {articlePreview}
              </p>
            </div>
            
            {/* Article Content */}
            <div 
              className="typography-body text-[#ffffff] prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
            
            {/* Related Themes */}
            {(() => {
              if (!article.relatedThemeIds || article.relatedThemeIds.length === 0) {
                return null;
              }
              
              // Собираем все найденные темы
              const themeCards = article.relatedThemeIds
                .map((themeId) => {
                  // Преобразуем ID темы: удаляем префикс "01-", "02-" и т.д.
                  // Например: "01-stress" -> "stress", "07-burnout-recovery" -> "burnout-recovery"
                  const normalizedThemeId = themeId.replace(/^\d+-/, '');
                  const theme = getTheme(normalizedThemeId);
                  if (!theme) {
                    console.warn(`Theme not found for ID: ${themeId} (normalized: ${normalizedThemeId})`);
                    return null;
                  }
                  
                  // Вычисляем прогресс темы (как в WorriesList)
                  const allCardIds: string[] = Array.isArray(theme.cards)
                    ? theme.cards.map((c: any) => c.id)
                    : Array.isArray(theme.cardIds)
                      ? theme.cardIds
                      : [];

                  const attemptedCardsCount = allCardIds.filter((cardId: string) => {
                    const progress = ThemeCardManager.getCardProgress(cardId);
                    return progress && progress.completedAttempts.length > 0;
                  }).length;

                  const totalCards = allCardIds.length;
                  const progress = totalCards > 0 ? Math.round((attemptedCardsCount / totalCards) * 100) : 0;
                  
                  const themeTitle = getLocalizedText(theme.title);
                  const themeDescription = getLocalizedText(theme.description);
                  
                  return {
                    key: themeId,
                    normalizedThemeId,
                    title: themeTitle,
                    description: themeDescription,
                    progress,
                    isPremium: !!theme.isPremium
                  };
                })
                .filter((card): card is NonNullable<typeof card> => card !== null);
              
              // Показываем блок только если есть хотя бы одна найденная тема
              if (themeCards.length === 0) {
                return null;
              }
              
              return (
                <div className="mt-8 pt-6 border-t border-[#212121]">
                  <p className="typography-body text-[#696969] mb-6">
                    {content.ui.articles?.relatedThemes || 'Связанные темы:'}
                  </p>
                  <div className="flex flex-col gap-8 sm:gap-10">
                    {themeCards.map((card) => (
                      <ThemeCard
                        key={card.key}
                        title={card.title}
                        description={card.description}
                        progress={card.progress}
                        isPremium={card.isPremium}
                        onClick={() => onGoToTheme?.(card.normalizedThemeId)}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      </div>

    </div>
  );
}

