// Article Screen Component
// Displays individual article content

import React, { useState, useEffect, useRef } from 'react';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { BackButton } from './ui/back-button';
import { useStore } from '@nanostores/react';
import { useContent, useArticle } from './ContentContext';
import { articlesMessages } from '@/src/i18n/messages/articles';
import { navigationMessages } from '@/src/i18n/messages/navigation';
import { markArticleRead } from '../services/userStatsService';
import { ThemeCard } from './ThemeCard';
import { ThemeCardManager } from '../utils/ThemeCardManager';
import { getAchievementsToShow, markAchievementsAsShown } from '../services/achievementDisplayService';
import { AppScreen } from '../types/userState';
import { loadUserPreferences, saveUserPreferences } from '../utils/userPreferencesStorage';
import { formatArticleContent } from '@/src/domain/articleContent.domain';

/** Article body font size (px) by step: -1 = small, 0 = medium, 1 = large */
const ARTICLE_FONT_SIZES: Record<number, number> = { [-1]: 14, 0: 18, 1: 22 };
const ARTICLE_FONT_STEP_MIN = -1;
const ARTICLE_FONT_STEP_MAX = 1;

interface ArticleScreenProps {
  articleId: string;
  onBack: () => void;
  onGoToTheme?: (themeId: string) => void;
  userHasPremium?: boolean;
  checkAndShowAchievements?: (delay?: number, forceCheck?: boolean) => Promise<void>;
  navigateTo?: (screen: AppScreen) => void;
  earnedAchievementIds?: string[];
  setEarnedAchievementIds?: (ids: string[] | ((prev: string[]) => string[])) => void;
}

/**
 * Main Article Screen Component
 */
export function ArticleScreen({ 
  articleId, 
  onBack, 
  onGoToTheme, 
  userHasPremium = false,
  checkAndShowAchievements,
  navigateTo,
  earnedAchievementIds = [],
  setEarnedAchievementIds
}: ArticleScreenProps) {
  const { getLocalizedText, getTheme } = useContent();
  const articlesUi = useStore(articlesMessages);
  const nav = useStore(navigationMessages);
  const article = useArticle(articleId);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [articleFontStep, setArticleFontStep] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const didMarkRef = useRef(false);
  const achievementCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Mark article as read when component mounts (idempotent per article)
  React.useEffect(() => {
    if (article && !didMarkRef.current) {
      markArticleRead(article.id);
      didMarkRef.current = true;
      
      // Проверяем достижения после чтения статьи (с задержкой)
      if (checkAndShowAchievements) {
        achievementCheckTimeoutRef.current = setTimeout(() => {
          checkAndShowAchievements(300, true);
        }, 300);
      }
    }
    
    // Cleanup: очищаем таймер при размонтировании или изменении зависимостей
    return () => {
      if (achievementCheckTimeoutRef.current) {
        clearTimeout(achievementCheckTimeoutRef.current);
        achievementCheckTimeoutRef.current = null;
      }
    };
  }, [article, checkAndShowAchievements]);

  // Load and persist article font size from preferences
  useEffect(() => {
    void loadUserPreferences().then((prefs) => {
      const step = prefs.articleFontSizeStep ?? 0;
      const clamped = Math.max(ARTICLE_FONT_STEP_MIN, Math.min(ARTICLE_FONT_STEP_MAX, step));
      setArticleFontStep(clamped);
    });
  }, []);

  const handleArticleFontSizeChange = (delta: number) => {
    setArticleFontStep((prev) => {
      const next = Math.max(ARTICLE_FONT_STEP_MIN, Math.min(ARTICLE_FONT_STEP_MAX, prev + delta));
      if (next === prev) return prev;
      void loadUserPreferences().then((prefs) => {
        void saveUserPreferences({ ...prefs, articleFontSizeStep: next });
      });
      return next;
    });
  };
  
  // Обработчик кнопки "назад" с проверкой достижений
  const handleBack = () => {
    // Проверяем, есть ли достижения, связанные со статьями, которые еще не были показаны
    if (navigateTo && setEarnedAchievementIds) {
      // Используем централизованный сервис для получения достижений для показа
      const result = getAchievementsToShow({
        screen: 'article-back',
        earnedAchievementIds: earnedAchievementIds.length > 0 ? earnedAchievementIds : undefined,
        excludeFromStorageCheck: earnedAchievementIds // Исключаем из проверки storage, если уже есть в earnedAchievementIds
      });
      
      if (result.shouldNavigate && result.achievementsToShow.length > 0) {
        console.log('[ArticleScreen] Showing article-related achievements on back:', result.achievementsToShow);
        
        // ВАЖНО: Синхронно устанавливаем флаги ПЕРЕД навигацией
        markAchievementsAsShown(result.achievementsToShow, 'article-back');
        
        // Устанавливаем достижения и переходим на reward screen
        setEarnedAchievementIds(result.achievementsToShow);
        navigateTo('reward');
        return;
      }
    }
    
    // Если нет достижений для показа, выполняем обычный возврат
    onBack();
  };
  
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
        setOverlayOpacity(0);
      } else if (scrollTop >= fadeEnd) {
        setLogoOpacity(0);
        setOverlayOpacity(1);
      } else {
        // Плавное изменение прозрачности
        const opacity = 1 - (scrollTop - fadeStart) / (fadeEnd - fadeStart);
        setLogoOpacity(Math.max(0, Math.min(1, opacity)));

        // Инвертированная прозрачность для верхней плашки
        const overlay = (scrollTop - fadeStart) / (fadeEnd - fadeStart);
        setOverlayOpacity(Math.max(0, Math.min(1, overlay)));
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
        <BackButton onBack={handleBack} />
        
        <div style={{ opacity: logoOpacity, transition: 'opacity 0.2s ease-out' }}>
          <MiniStripeLogo />
        </div>
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] pb-[100px]">
            <div className="max-w-[351px] mx-auto">
              <div className="text-center py-12">
                <div className="typography-body text-[#8a8a8a]">
                  {articlesUi.noArticles}
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
      <BackButton onBack={handleBack} />
      
      {/* Верхняя градиентная плашка для отделения системной шторки */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '100px',
          zIndex: 20,
          pointerEvents: 'none',
          opacity: overlayOpacity,
          transition: 'opacity 0.2s ease-out',
          backgroundImage:
            'linear-gradient(to bottom, #111111 0%, #111111 40%, rgba(17,17,17,0.8) 70%, rgba(17,17,17,0) 100%)'
        }}
      />
      
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
              <p className="typography-body text-[#8a8a8a] mb-6">
                {articlePreview}
              </p>
              {/* Article text size controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={nav.previous}
                  onClick={() => handleArticleFontSizeChange(-1)}
                  disabled={articleFontStep <= ARTICLE_FONT_STEP_MIN}
                  className="min-w-[36px] h-9 rounded-md border border-[#333] bg-[#1a1a1a] text-[#e1ff00] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#252525] transition-colors"
                >
                  A−
                </button>
                <button
                  type="button"
                  aria-label={nav.next}
                  onClick={() => handleArticleFontSizeChange(1)}
                  disabled={articleFontStep >= ARTICLE_FONT_STEP_MAX}
                  className="min-w-[36px] h-9 rounded-md border border-[#333] bg-[#1a1a1a] text-[#e1ff00] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#252525] transition-colors"
                >
                  A+
                </button>
              </div>
            </div>
            
            {/* Article Content — размер задаётся через CSS-переменную, чтобы переопределить .typography-body и .prose у потомков */}
            <div
              className="article-content typography-body text-[#ffffff] prose prose-invert max-w-none"
              style={
                {
                  ['--article-body-font-size' as string]: `${ARTICLE_FONT_SIZES[articleFontStep] ?? 18}px`,
                } as React.CSSProperties
              }
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
                  <p className="typography-body text-[#8a8a8a] mb-6">
                    {articlesUi.relatedThemes}
                  </p>
                  <div className="flex flex-col gap-8 sm:gap-10">
                    {themeCards.map((card) => (
                      <ThemeCard
                        key={card.key}
                        title={card.title}
                        description={card.description}
                        progress={card.progress}
                        isPremium={card.isPremium}
                        userHasPremium={userHasPremium}
                        onClick={() => onGoToTheme?.(card.normalizedThemeId)}
                        themeId={card.normalizedThemeId}
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

