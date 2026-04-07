// Импортируем необходимые хуки и SVG пути
import { lazy, Suspense, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import svgPaths from "../imports/svg-9v3gqqhb3l";
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { Light } from './Light';
import { ThemeCardManager } from '../utils/ThemeCardManager';
import { InfoModal } from './ui/InfoModal';
import { ArticlesBlock } from './ArticlesBlock';
import { useContent } from './ContentContext';
import { homeMessages } from '@/src/i18n/messages/home';
import { profileMessages } from '@/src/i18n/messages/profile';
import { themesMessages } from '@/src/i18n/messages/themes';
import { getUserDisplayId } from '../utils/telegramUserUtils';
import { useStore } from '@nanostores/react';
import { $currentLevel } from '@/src/stores/points.store';
import { $topicTestVersion } from '@/src/stores/topic-test.store';
import { useAchievementAutoCheck } from '../hooks/useAchievementAutoCheck';
import { ThemeCard } from './ThemeCard';
import { getThemeMatchPercentage } from '../utils/themeTestMapping';
import { sortWorries, type ThemeWorry } from '@/src/domain/homeWorriesList.domain';
import { openPage } from '@nanostores/router'
import { $router } from '@/src/stores/router.store'
import { rapidTechniquesFlowMessages } from '@/src/i18n/messages/rapidTechniquesFlow'

const ActivityBlockNew = lazy(() => import('./ActivityBlockNew').then((m) => ({ default: m.ActivityBlockNew })));

// Типы для пропсов компонента
interface HomeScreenProps {
  onGoToProfile: () => void; // Функция для перехода к профилю пользователя
  onGoToTheme: (themeId: string) => void; // Функция для перехода к теме
  onArticleClick?: (articleId: string) => void; // Функция для открытия статьи
  onViewAllArticles?: () => void; // Функция для просмотра всех статей
  userHasPremium: boolean; // Статус Premium подписки пользователя
}

// Типы для пропсов основного блока контента
interface MainPageContentBlockProps {
  onGoToProfile: () => void;
  onGoToTheme: (themeId: string) => void;
  onArticleClick?: (articleId: string) => void;
  onViewAllArticles?: () => void;
  userHasPremium: boolean;
}

// Emergency card interface removed - not currently used in implementation

// Emergency cards data is now managed through the i18n content system
// Emergency help copy lives in i18n message stores (e.g. homeMessages.emergencyHelp).

/**
 * Адаптивный компонент световых эффектов для фона
 */
// Light переиспользуется из общего компонента

/**
 * Адаптивный аватар пользователя
 */
function UserAvatar() {
  return (
    <div className="relative shrink-0 size-[52px] sm:size-[58px] md:size-[62px]" data-name="User avatar">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 62 62">
        <g id="User avatar">
          <circle cx="31" cy="31" fill="var(--fill-0, #E1FF00)" id="Ellipse 5" r="31" />
          <path d={svgPaths.p1b541b00} fill="var(--fill-0, #2D2B2B)" id="Logo" />
        </g>
      </svg>
    </div>
  );
}



/**
 * Адаптивная инфо��мация о пользователе с именем
 */
function UserInfo() {
  const home = useStore(homeMessages);
  const userDisplayId = getUserDisplayId();
  // Extract text part without any ID and combine with dynamic user ID
  const heroTitle = home.heroTitle || 'Hero';
  const textPart = heroTitle.replace(/\s*#[A-Z0-9]+/, '').trim();
  const displayText = `${textPart} ${userDisplayId}`;
  
  return (
    <div
      className="box-border content-stretch flex flex-row items-start justify-start p-0 relative shrink-0 w-full"
      data-name="User info"
    >
      <div className="typography-h2 text-[#e1ff00] text-left w-[140px] sm:w-[160px] md:w-[164px]">
        <h2 className="block text-nowrap">{displayText}</h2>
      </div>
    </div>
  );
}

/**
 * Адаптивный статус аккаунта пользователя (Premium/Free)
 */
function UserAccountStatus({ isPremium = false }: { isPremium?: boolean }) {
  const profile = useStore(profileMessages);
  return (
    <div
      className={`box-border content-stretch flex flex-row h-[16px] sm:h-[17px] md:h-[18px] items-center justify-center px-[6px] sm:px-[7px] md:px-[8px] relative rounded-xl shrink-0 ${
        isPremium 
          ? 'bg-[#e1ff00]'
          : 'bg-[#2d2b2b]'
      }`}
      data-name="User_account_status"
    >
      <div className={`typography-button text-center text-nowrap tracking-[-0.43px] ${
        isPremium 
          ? 'text-[#2d2b2b]' 
          : 'text-[#8a8a8a]'
      }`}>
        <p className="adjustLetterSpacing block whitespace-pre">
          {isPremium ? profile.premium : profile.free}
        </p>
      </div>
    </div>
  );
}

/**
 * Адаптивный уровень пользователя и статус подписки
 */
function UserLevelAndStatus({ userHasPremium }: { userHasPremium: boolean }) {
  const home = useStore(homeMessages);
  const displayLevel = useStore($currentLevel);

  return (
    <div
      className="box-border content-stretch flex flex-row gap-4 sm:gap-5 items-center justify-start p-0 relative shrink-0"
      data-name="User level and paid status"
    >
      <div className="typography-body text-[#8a8a8a] text-left text-nowrap">
        <p className="block whitespace-pre">{home.level} {displayLevel.toLocaleString()}</p>
      </div>
      <UserAccountStatus isPremium={userHasPremium} />
    </div>
  );
}

/**
 * Адаптивный блок с информацией о пользователе
 */
function UserInfoBlock({ userHasPremium }: { userHasPremium: boolean }) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 sm:gap-2.5 items-start justify-start p-0 relative shrink-0 w-[220px] sm:w-[250px] md:w-[274px]"
      data-name="User info block"
    >
      <UserInfo />
      <UserLevelAndStatus userHasPremium={userHasPremium} />
    </div>
  );
}

/**
 * Адаптивный полный блок пользователя с аватаром и информацией
 */
function UserFrameInfoBlock({ onClick, userHasPremium }: { onClick: () => void; userHasPremium: boolean }) {
  const profile = useStore(profileMessages);
  const profileAriaLabel = profile.openProfile || profile.title || 'Open user profile';
  return (
    <div className="relative rounded-xl p-4 sm:p-5 md:p-6 w-full">
      {/* Фон блока */}
      <div className="absolute inset-0" data-name="user_frame_info_block_background">
        <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
          <div
            aria-hidden="true"
            className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
          />
        </div>
      </div>

      {/* Контент блока */}
      <button
        onClick={onClick}
        className="relative z-10 box-border content-stretch flex flex-row gap-4 sm:gap-5 items-center justify-between w-full cursor-pointer min-h-[44px] min-w-[44px] hover:opacity-80 transition-opacity"
        data-name="User frame info block"
        aria-label={profileAriaLabel}
      >
        <div className="flex flex-row gap-4 sm:gap-5 items-center justify-start">
          <UserAvatar />
          <UserInfoBlock userHasPremium={userHasPremium} />
        </div>
        <ChevronRight className="w-5 h-5 text-[#8a8a8a] flex-shrink-0" />
      </button>
    </div>
  );
}

/**
 * Адаптивный список проблем пользователя с обработкой кликов на доступные темы
 */
function WorriesList({ onGoToTheme, userHasPremium }: { onGoToTheme: (themeId: string) => void; userHasPremium: boolean }) {
  const { content } = useContent();
  const home = useStore(homeMessages);
  const themes = useStore(themesMessages);
  const topicTestVersion = useStore($topicTestVersion);

  const worries: ThemeWorry[] = useMemo(() => {
    // topicTestVersion: bump when embedded topic test completes — refresh match % on list
    void topicTestVersion
    // Берём все темы из контента; если пусто — создаём безопасный плейсхолдер
    const themeList = Object.values(content.themes || {});
    const source = themeList.length > 0
      ? themeList
      : [{ id: 'demo', title: themes.welcome.title || home.themesTitle, description: home.quickHelpTitle, isPremium: false } as any];

    return source.map((theme: any) => {
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

      // Получаем процент соответствия из результатов психологического теста (topicTestVersion сбрасывает мемо после embedded topic test)
      const matchPercentage = getThemeMatchPercentage(theme.id);

      return {
        title: theme.title,
        description: theme.description,
        progress,
        isPremium: !!theme.isPremium,
        isAvailable: userHasPremium || !theme.isPremium,
        themeId: theme.id,
        order: theme.order || 999, // Используем порядок из файла, если не указан - в конец
        matchPercentage: matchPercentage ?? -1, // Используем -1 для тем без соответствия, чтобы они шли в конец
      };
    });
  }, [content.themes, themes.welcome.title, home.themesTitle, home.quickHelpTitle, userHasPremium, topicTestVersion]);

  const sortedWorries = sortWorries(worries)

  const handleThemeClick = (themeId: string, _isAvailable: boolean) => {
    // Всегда открываем экран темы. Для премиум тем без подписки
    // ThemeWelcomeScreen отобразит экран блокировки с кнопкой "Разблокировать"
    console.log(`Opening theme: ${themeId}`);
    onGoToTheme(themeId);
  };

  return (
    <div
      className="box-border content-stretch flex flex-col gap-8 sm:gap-10 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Worries list"
    >
      {sortedWorries.map((worry) => (
        <ThemeCard 
          key={worry.themeId}
          title={worry.title}
          description={worry.description}
          progress={worry.progress}
          isPremium={worry.isPremium}
          userHasPremium={userHasPremium}
          onClick={() => handleThemeClick(worry.themeId, worry.isAvailable)}
          themeId={worry.themeId}
        />
      ))}
    </div>
  );
}

/**
 * Адаптивный контейнер блока "What worries you?"
 */
function WorriesContainer({ onGoToTheme, userHasPremium }: { onGoToTheme: (themeId: string) => void; userHasPremium: boolean }) {
  const home = useStore(homeMessages);
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[24px] sm:gap-[27px] md:gap-[30px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Worries container"
    >
      <div className="typography-h2 text-[#e1ff00] text-left w-full">
        <h2 className="block">{home.whatWorriesYou}</h2>
      </div>
      <WorriesList onGoToTheme={onGoToTheme} userHasPremium={userHasPremium} />
    </div>
  );
}

// EmergencyCard component removed - not currently used in implementation


/**
 * Адаптивный основной контейнер контента главной страницы
 */
function MainPageContentBlock({ onGoToProfile, onGoToTheme, onArticleClick, onViewAllArticles, userHasPremium }:
  MainPageContentBlockProps) {

  return (
    <div
      className="flex flex-col gap-[48px] sm:gap-[54px] md:gap-[60px] items-start justify-start w-full max-w-[351px] mx-auto pb-6 sm:pb-7 md:pb-8"
      data-name="Main_page_contenct_block"
    >
      <UserFrameInfoBlock onClick={onGoToProfile} userHasPremium={userHasPremium} />

      {/* CheckInBlock скрыт по требованию */}
      {/* <CheckInBlock onGoToCheckIn={onGoToCheckIn} onInfoClick={onInfoClick} /> */}
      <Suspense fallback={<div className="h-[220px] w-full rounded-xl bg-[rgba(217,217,217,0.04)]" aria-hidden="true" />}>
        <ActivityBlockNew />
      </Suspense>
      {onArticleClick && onViewAllArticles && (
        <ArticlesBlock 
          onArticleClick={onArticleClick} 
          onViewAll={onViewAllArticles} 
        />
      )}
      <WorriesContainer onGoToTheme={onGoToTheme} userHasPremium={userHasPremium} />
    </div>
  );
}


/**
 * Адаптивный главный компонент домашней страницы
 * Объединяет все блоки и управляет навигацией с полной поддержкой всех устройств
 */
export function HomeScreen({ onGoToProfile, onGoToTheme, onArticleClick, onViewAllArticles, userHasPremium }: HomeScreenProps) {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const home = useStore(homeMessages);
  const rapid = useStore(rapidTechniquesFlowMessages)
  
  // Автоматическая проверка достижений при изменении статистики
  useAchievementAutoCheck();

  const _handleInfoClick = () => {
    setIsInfoModalOpen(true);
  };

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
  };

  return (
    <div 
      className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden safe-top safe-bottom" 
      data-name="004_Home (Main page)"
      data-testid="home-ready"
      style={{
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Контент с прокруткой */}
      <div 
        className="flex-1 overflow-y-auto"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px]">
          <div className="max-w-[351px] mx-auto mb-6">
            <button
              type="button"
              onClick={() => openPage($router, 'rapidTechniquesFlow', { step: '0' })}
              className="w-full rounded-xl p-4 bg-[rgba(217,217,217,0.04)] border border-[#212121] hover:opacity-90 transition-opacity text-left"
            >
              <div className="typography-h2 text-[#e1ff00]">
                <h2>{rapid.homeCtaTitle}</h2>
              </div>
              <div className="typography-body text-[#8a8a8a] mt-2">
                {rapid.homeCtaDescription}
              </div>
            </button>
          </div>
          {/* Основной контент страницы */}
          <MainPageContentBlock
            onGoToProfile={onGoToProfile}
            onGoToTheme={onGoToTheme}
            onArticleClick={onArticleClick}
            onViewAllArticles={onViewAllArticles}
            userHasPremium={userHasPremium}
          />
        </div>
        
        {/* Отступ между блоками */}
        <div className="h-[40px]"></div>
        
        {/* Блок экстренной помощи - СКРЫТ ПО ТРЕБОВАНИЮ */}
        {/* <EmergencyBlock onOpenMentalTechnique={onOpenMentalTechnique} /> */}
        
        {/* Блок с кнопками социальных сетей - СКРЫТ ПО ТРЕБОВАНИЮ */}
        {/* <div className="w-full mb-[48px] sm:mb-[54px] md:mb-[60px]" data-name="Social_follow_container">
          <div className="px-[16px] sm:px-[20px] md:px-[21px] w-full">
            <SocialFollowBlock />
          </div>
        </div> */}
      </div>

      {/* Модальное окно с информацией о чекине */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={handleCloseInfoModal}
        title={home.checkInInfo.title}
        content={home.checkInInfo.content}
      />
    </div>
  );
}