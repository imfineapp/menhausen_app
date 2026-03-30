// Импортируем необходимые хуки и SVG пути
import React, { useState, useEffect, useRef } from 'react';
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { LoadingScreen } from './LoadingScreen';
import { useStore } from '@nanostores/react';
import { useContent } from './ContentContext';
import { cardsMessages } from '@/src/i18n/messages/cards';
import { themesMessages } from '@/src/i18n/messages/themes';
import { StripedProgressBar } from './ui/StripedProgressBar';
import { ThemeCardManager, CardCompletionStatus } from '../utils/ThemeCardManager';
import { ThemeLoader, ThemeData } from '../utils/ThemeLoader';

// Типы для пропсов компонента
interface ThemeHomeScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
  onCardClick: (cardId: string) => void; // Функция для обработки клика по карточке
  onOpenNextLevel: () => void; // Функция для открытия следующего уровня
  themeId: string; // ID темы для загрузки
  userHasPremium?: boolean; // Статус Premium подписки пользователя
  onUnlock?: () => void; // Функция для разблокировки премиум темы
}

// Типы для карточек
interface Card {
  id: string;
  title: string;
  level: string;
  description: string;
  attempts: number;
  isActive: boolean;
  isLocked: boolean;
  completionStatus: CardCompletionStatus;
}

/**
 * Адаптивный компонент световых эффектов для фона
 */
function _Light() {
  return (
    <div
      className="absolute h-[100px] sm:h-[120px] md:h-[130px] top-[-50px] sm:top-[-60px] md:top-[-65px] translate-x-[-50%] w-[140px] sm:w-[165px] md:w-[185px] overflow-hidden"
      data-name="Light"
      style={{ left: "calc(50% + 1px)" }}
    >
      <div className="absolute inset-[-196.15%_-137.84%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 695 640">
          <g id="Light">
            <g filter="url(#filter0_f_13_381)" id="Ellipse 2">
              <ellipse cx="347.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_13_381"
              width="695"
              x="0"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_13_381" stdDeviation="127.5" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}


/**
 * Адаптивный компонент прогресс-бара темы с реальными данными
 */
function ProgressTheme({ theme: _theme, allCardIds }: { theme: ThemeData; allCardIds: string[] }) {
  const themes = useStore(themesMessages);
  
  // Используем встроенный метод ThemeCardManager для расчета прогресса
  const progressPercentage = ThemeCardManager.getThemeProgressPercentage(allCardIds);
  
  
  return (
    <div className="h-6 relative shrink-0 w-full max-w-[351px]" data-name="Progress_theme">
      <StripedProgressBar 
        progress={progressPercentage}
        size="lg" 
        className="w-full"
        showBackground={true}
      />
      <div className="absolute inset-[12.5%_4.56%_20.83%_4.56%] text-tertiary text-right">
        <p className="typography-caption block">{themes.home.progress}</p>
      </div>
    </div>
  );
}

/**
 * Компонент празднования завершения карточки
 * @unused - закомментирован в коде, но может быть использован в будущем
 */
function CompletionCelebration({ isVisible, onComplete }: { isVisible: boolean; onComplete: () => void }) {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000); // Показываем 3 секунды
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#22c55e] text-white p-8 rounded-2xl text-center animate-bounce">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Card Completed!</h2>
        <p className="text-lg">Great job! You're making progress!</p>
      </div>
    </div>
  );
}

/**
 * Адаптивная иконка попыток
 */
function AttemptsIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Checkin icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Checkin icon">
          <path
            d="M11 18H3"
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M15 18L17 20L21 16"
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M16 12H3"
            id="Vector_3"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M16 6H3"
            id="Vector_4"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * Адаптивная карточка темы с min-h-[44px] min-w-[44px] дизайном
 * Поддерживает состояния: доступна, заблокирована, в процессе
 */
function ThemeCard({ card, onClick }: { card: Card; onClick: (cardId: string) => void }) {
  const { content: _content } = useContent();
  const isLocked = card.isLocked;
  const isInProgress = card.completionStatus === CardCompletionStatus.IN_PROGRESS;
  
  // Определяем стили в зависимости от состояния карточки
  const getCardStyles = () => {
    if (isLocked) {
      return "bg-[rgba(217,217,217,0.02)] cursor-not-allowed opacity-50 hover:opacity-60 transition-all duration-300";
    }
    if (isInProgress) {
      return "bg-[rgba(255,193,7,0.1)] cursor-pointer hover:bg-[rgba(255,193,7,0.15)] active:scale-95 border-yellow-500/20 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300";
    }
    return "bg-[rgba(217,217,217,0.04)] cursor-pointer hover:bg-[rgba(217,217,217,0.08)] active:scale-95 hover:shadow-lg transition-all duration-300";
  };

  const getTitleStyles = () => {
    if (isLocked) return "text-tertiary";
    if (isInProgress) return "text-status-amber"; // Amber color for in-progress
    return "text-brand-primary";
  };

  const getDescriptionStyles = () => {
    if (isLocked) return "text-tertiary";
    return "text-primary";
  };

  const getLevelStyles = () => {
    if (isLocked) return "text-tertiary";
    return "text-tertiary";
  };
  
  return (
    <button
      onClick={() => !isLocked && onClick(card.id)}
      disabled={isLocked}
      className={`${getCardStyles()} relative rounded-xl shrink-0 w-full transition-all duration-200 min-h-[44px] min-w-[44px]`}
      data-name="Card_item"
    >
      <div
        aria-hidden="true"
        className={`absolute border border-solid inset-0 pointer-events-none rounded-xl ${
          isLocked ? "border-[#505050]" : "border-[#505050]"
        }`}
      />
      
      {/* Индикаторы состояния */}
      {isInProgress && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {isLocked && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-[15px] relative w-full text-left">
          <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-full">
            <div className={`typography-h2 ${getTitleStyles()} text-left w-[158px]`}>
              <h2 className="block">{card.title}</h2>
            </div>
            {!isLocked && (
              <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-end p-0 relative shrink-0 w-[85px]">
                <div className={`typography-h2 text-nowrap text-right ${
                  isInProgress ? 'text-status-amber' : 'text-brand-primary'
                }`}>
                  <h2 className="block whitespace-pre">{card.attempts}</h2>
                </div>
                <div className={`transition-colors duration-300 ${
                  isInProgress ? 'text-status-amber' : 'text-brand-primary'
                }`}>
                  <AttemptsIcon />
                </div>
              </div>
            )}
          </div>
          <div className={`typography-body ${getLevelStyles()} text-left w-full`}>
            <p className="block">{card.level}</p>
          </div>
          <div className={`typography-body ${getDescriptionStyles()} text-left w-full`}>
            <p className="block break-words">{card.description}</p>
          </div>
          
          {/* Индикатор прогресса для карточки */}
          {isInProgress && (
            <div className="mt-2 w-full">
              <div className="h-1 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#e1ff00] transition-all duration-300 ease-out"
                  style={{ 
                    width: `${Math.min(100, (card.attempts * 20))}%` // 20% за каждую попытку, максимум 100%
                  }}
                />
              </div>
              <p className="typography-caption text-tertiary mt-1">
                {card.attempts} {card.attempts === 1 ? 'attempt' : 'attempts'}
              </p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}


/**
 * Кнопка "Open next level" согласно Bottom Fixed Button стандарту
 * Теперь использует стандартный компонент BottomFixedButton с умным текстом
 */
function OpenNextLevelButton({ onClick, theme: _theme, allCardIds }: { 
  onClick: () => void; 
  theme: ThemeData; 
  allCardIds: string[];
}) {
  const themes = useStore(themesMessages);

  const attemptedCards = allCardIds.filter(cardId => {
    const progress = ThemeCardManager.getCardProgress(cardId);
    return progress && progress.completedAttempts.length > 0;
  });
  if (allCardIds.length > 0 && attemptedCards.length === allCardIds.length) {
    return null;
  }
  
  // Определяем текст кнопки на основе состояния темы
  const getButtonText = () => {
    const nextCardId = ThemeCardManager.getNextAvailableCard(allCardIds);
    
    // Проверяем, все ли карточки имеют хотя бы одну попытку
    const attemptedCards = allCardIds.filter(cardId => {
      const progress = ThemeCardManager.getCardProgress(cardId);
      return progress && progress.completedAttempts.length > 0;
    });
    
    if (attemptedCards.length === allCardIds.length) {
      return themes.home.allCardsAttempted;
    } else if (nextCardId) {
      const nextCardIndex = allCardIds.indexOf(nextCardId) + 1;
      return themes.home.startCard.replace('{number}', String(nextCardIndex));
    } else {
      return themes.home.nextLevel;
    }
  };
  
  return (
    <BottomFixedButton onClick={onClick}>
      {getButtonText() || ''}
    </BottomFixedButton>
  );
}

/**
 * Главный компонент домашней страницы темы
 * Адаптивный дизайн с поддержкой mobile-first подхода
 */
export function ThemeHomeScreen({ 
  onBack: _onBack, 
  onCardClick, 
  onOpenNextLevel, 
  themeId,
  userHasPremium = false,
  onUnlock
}: ThemeHomeScreenProps) {
  const { content, currentLanguage } = useContent();
  const cardsUi = useStore(cardsMessages);
  
  // Состояние для загрузки темы
  const [theme, setTheme] = useState<ThemeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для празднования завершения - отключено
  const [_showCelebration, _setShowCelebration] = React.useState(false);
  const [lastCompletedCard, setLastCompletedCard] = React.useState<string | null>(null);
  
  // Состояние для логотипа при скролле
  const [logoOpacity, setLogoOpacity] = useState<number>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Загружаем тему при монтировании
  const loadTheme = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const themeData = await ThemeLoader.loadTheme(themeId, currentLanguage);
      
      if (!themeData) {
        throw new Error(`Theme ${themeId} not found`);
      }
      
      setTheme(themeData);
    } catch (err) {
      setError(`Ошибка загрузки темы: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [themeId, currentLanguage]);

  useEffect(() => {
    loadTheme();
  }, [themeId, loadTheme]);

  // Отслеживание скролла для логотипа
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

  // Получаем ID всех карточек из загруженной темы (если тема загружена)
  const allCardIds = React.useMemo(() => 
    theme ? theme.cards.map(card => card.id) : [], 
    [theme]
  );
  
  // Отслеживаем завершение карточек для показа празднования
  React.useEffect(() => {
    if (!theme) return;
    
    const checkForNewCompletions = () => {
      allCardIds.forEach(cardId => {
        const completionStatus = ThemeCardManager.getCardCompletionStatus(cardId);
        const isCompleted = completionStatus === CardCompletionStatus.COMPLETED;
        
        // Если карточка завершена и это не последняя завершенная карточка
        if (isCompleted && cardId !== lastCompletedCard) {
          setLastCompletedCard(cardId);
          // setShowCelebration(true); // Отключено
        }
      });
    };

    // Проверяем каждые 2 секунды
    const interval = setInterval(checkForNewCompletions, 2000);
    return () => clearInterval(interval);
  }, [allCardIds, lastCompletedCard, theme]);

  // Компонент готов к работе
  
  // Состояния загрузки и ошибок
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-white text-center">
          <div className="text-lg text-red-400">{error}</div>
          <button 
            onClick={loadTheme}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }
  
  if (!theme) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-white text-center">
          <div className="text-lg">Тема не найдена</div>
        </div>
      </div>
    );
  }

  // Проверяем ошибки загрузки данных
  if (!content) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-white text-center">
          <div className="text-lg text-red-400">Content is unavailable</div>
          <div className="text-sm mt-2 text-gray-400">Theme: {themeId}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }


  // Функция для получения следующей доступной карточки
  const getNextAvailableCard = () => {
    return ThemeCardManager.getNextAvailableCard(allCardIds);
  };



  
  // Проверяем, является ли тема премиум и заблокирована ли она
  const isPremiumTheme = theme?.isPremium || false;
  const isThemeLocked = isPremiumTheme && !userHasPremium;
  
  // Создаем карточки с реальными данными прогресса и состоянием блокировки
  const cards: Card[] = theme.cards.map((cardData, index) => {
    try {
      const cardId = cardData.id;
      
      // Получаем реальные данные прогресса
      const progress = ThemeCardManager.getCardProgress(cardId);
      const attempts = progress ? progress.totalCompletedAttempts : 0;
      const completionStatus = ThemeCardManager.getCardCompletionStatus(cardId);
      const isAvailableByProgress = ThemeCardManager.isCardAvailable(cardId, allCardIds);
      
      // Карточка доступна только если:
      // 1. Тема не премиум ИЛИ пользователь имеет премиум
      // 2. И карточка доступна по прогрессу
      const isAvailable = !isThemeLocked && isAvailableByProgress;
      
      // Используем данные из JSON файла; подпись уровня — из локали (themeHome.level1 … level5)
      const title = cardData.id;
      const levelNum = Math.min(5, Math.max(1, cardData.level));
      const levelKey = `level${levelNum}` as 'level1' | 'level2' | 'level3' | 'level4' | 'level5';
      const level = cardsUi.themeHome[levelKey];
      const description = cardData.shortDescription ?? cardData.introduction;
      
      return {
        id: cardId,
        title,
        level,
        description,
        attempts,
        isActive: isAvailable,
        isLocked: !isAvailable,
        completionStatus
      };
    } catch {
      // Возвращаем fallback карточку
      // Если тема заблокирована, все карточки заблокированы
      const isAvailable = !isThemeLocked && index === 0;
      const fallbackLevelNum = Math.min(5, Math.max(1, cardData.level));
      const fallbackLevelKey = `level${fallbackLevelNum}` as 'level1' | 'level2' | 'level3' | 'level4' | 'level5';
      return {
        id: cardData.id,
        title: cardData.introduction || `Card ${index + 1}`,
        level: cardsUi.themeHome[fallbackLevelKey],
        description: 'Card description',
        attempts: 0,
        isActive: isAvailable,
        isLocked: !isAvailable,
        completionStatus: CardCompletionStatus.NOT_STARTED
      };
    }
  });

  // Обработчик клика по карточке с проверкой доступности
  const handleCardClick = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (card && !card.isLocked) {
      onCardClick(cardId);
    }
  };

  // Обработчик кнопки "Next Level" - открывает следующую доступную карточку
  const handleNextLevelClick = () => {
    const nextCardId = getNextAvailableCard();
    if (nextCardId) {
      onCardClick(nextCardId);
    } else {
      // Если все карточки завершены, можно показать сообщение или выполнить другое действие
      onOpenNextLevel();
    }
  };

  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden overflow-x-hidden bg-bg-primary flex flex-col">
      {/* Компонент празднования - отключен */}
      {/* <CompletionCelebration 
        isVisible={showCelebration} 
        onComplete={() => setShowCelebration(false)} 
      /> */}
      
      {/* Световые эффекты - отключены */}
      {/* <Light /> */}
      
      {/* Логотип */}
      <div style={{ opacity: logoOpacity, transition: 'opacity 0.2s ease-out' }}>
        <MiniStripeLogo />
      </div>
      
      {/* Контент с прокруткой */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Заголовок */}
            <div className="text-center mb-6">
              <h1 className="typography-h1 text-brand-primary mb-4">
                {theme.title}
              </h1>
            </div>
            
            {/* Описание темы */}
            <div className="mb-6">
              <p className="typography-body text-white text-center">
                {theme.description}
              </p>
            </div>
            
            {/* Прогресс темы */}
            {!isThemeLocked && (
              <div className="mb-8">
                <ProgressTheme theme={theme} allCardIds={allCardIds} />
              </div>
            )}
            
            {/* Сообщение о блокировке премиум темы */}
            {isThemeLocked && (
              <div className="mb-8 p-6 rounded-xl bg-[rgba(225,255,0,0.1)] border border-[#e1ff00]">
                <p className="typography-body text-white text-center mb-4">
                  This is a Premium theme. Unlock it to access all cards and features.
                </p>
                {onUnlock && (
                  <button
                    onClick={onUnlock}
                    className="w-full py-3 px-4 bg-[#e1ff00] text-[#111111] rounded-lg font-semibold hover:bg-[#d4e600] transition-colors"
                  >
                    Unlock Premium
                  </button>
                )}
              </div>
            )}
            
            {/* Карточки */}
            <div className="space-y-4">
              {cards.map((card) => (
                <ThemeCard 
                  key={card.id}
                  card={card}
                  onClick={isThemeLocked ? () => {} : handleCardClick}
                />
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button - открывает следующую доступную карточку */}
      <OpenNextLevelButton 
        onClick={handleNextLevelClick} 
        theme={theme}
        allCardIds={allCardIds}
      />

    </div>
  );
}