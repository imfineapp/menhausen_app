// Главный компонент экрана профиля пользователя с поддержкой Premium статуса
import React, { useState, useEffect } from 'react';
import { useTranslation } from './LanguageContext';
import { useContent } from './ContentContext';
import { PointsManager } from '../utils/PointsManager';
import { PointsTransaction } from '../types/points';

// Импортируем выделенные компоненты
import { 
  SettingsIcon
} from './UserProfileIcons';
import { UserInfoSection } from './UserProfileComponents';
import { ReferralSection } from './ProfileReferralSection';
import { Light, MiniStripeLogo } from './ProfileLayoutComponents';
import { StatusBlocksRow } from './StatusBlocksRow';
import { AchievementsBlock } from './AchievementsBlock';
import { MentalLevelBlock } from './MentalLevelBlock';
import { ActivityHeatmapBlock } from './ActivityHeatmapBlock';
import { PremiumUnlockBlock } from './PremiumUnlockBlock';

// Типы для пропсов компонента
interface UserProfileScreenProps {
  onBack: () => void; // Функция для возврата к главной странице
  onShowPayments: () => void; // Функция для перехода к странице покупки Premium подписки
  onGoToBadges: () => void; // Функция для перехода к странице достижений
  onShowSettings: () => void; // Функция для перехода к странице настроек приложения
  userHasPremium: boolean; // Статус Premium подписки пользователя
}

/**
 * Главный компонент страницы профиля пользователя
 * Полностью адаптивный с поддержкой всех устройств и min-h-[44px] min-w-[44px] элементами
 */
export function UserProfileScreen({ 
  onBack: _onBack, 
  onShowPayments, 
  onGoToBadges,
  onShowSettings,
  userHasPremium 
}: UserProfileScreenProps) {
  const { t } = useTranslation();
  const { getUI } = useContent();
  
  // Получаем переводы UI
  const ui = getUI();
  
  // Состояние для истории баллов
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  // Состояние для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Количество элементов на странице
  
  // Загрузка истории баллов
  useEffect(() => {
    const updatePointsData = () => {
      try {
        // Get all transactions, sorted newest first
        const transactions = PointsManager.getTransactions().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setPointsHistory(transactions);
        // Сброс на первую страницу при обновлении данных
        setCurrentPage(1);
      } catch (error) {
        console.warn('UserProfileScreen: failed to load points history', error);
      }
    };

    updatePointsData(); // Initial load

    window.addEventListener('storage', updatePointsData);
    window.addEventListener('points:updated', updatePointsData as EventListener);

    return () => {
      window.removeEventListener('storage', updatePointsData);
      window.removeEventListener('points:updated', updatePointsData as EventListener);
    };
  }, []);
  
  // Вычисление данных для пагинации
  const totalPages = Math.ceil(pointsHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageItems = pointsHistory.slice(startIndex, endIndex);
  
  // Обработчики навигации
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };
  
  // Получаем локализованные тексты для действий
  const getLocalizedAction = (transaction: PointsTransaction) => {
    const actions = ui.levels.actions;
    switch (transaction.correlationId?.split('_')[0]) {
      case 'checkin':
        return actions.dailyCheckin;
      case 'card':
        return actions.exerciseComplete;
      case 'achievement':
        return actions.achievementEarned;
      default:
        return transaction.note || transaction.type;
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  /**
   * Обработчики для различных действий профиля
   */
  const handleStatusBlockBadges = () => {
    console.log('Status block badges clicked - navigating to badges');
    onGoToBadges();
  };

  const handleStatusBlockStatus = () => {
    console.log('Status block status clicked - redirecting to Under Construction');
    // TODO: Implement status block click handler
  };

  return (
    <div 
      className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden safe-top safe-bottom" 
      data-name="User Profile Page"
      style={{
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px]">
          {/* Основной контент */}
          <div className="flex flex-col gap-8 sm:gap-10 w-full max-w-[351px] mx-auto pb-6 sm:pb-8">
            
            {/* Информация о пользователе с иконкой настроек */}
            <div className="relative w-full">
              <UserInfoSection userHasPremium={userHasPremium} />
              {/* Иконка настроек в правой части на уровне верхней границы UserAvatar */}
              <button
                onClick={onShowSettings}
                className="absolute top-0 right-0 flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer hover:opacity-80 transition-opacity"
                data-name="Settings icon button"
                aria-label={t('settings')}
              >
                <SettingsIcon />
              </button>
            </div>
            
            {/* Ряд статусных блоков */}
            <div className="w-full mt-6 sm:mt-8">
              <StatusBlocksRow 
                onBadgesClick={handleStatusBlockBadges}
                onStatusClick={handleStatusBlockStatus}
              />
            </div>
          </div>
          
          {/* Основной контент (продолжение) */}
          <div className="flex flex-col gap-8 sm:gap-10 w-full max-w-[351px] mx-auto pb-6 sm:pb-8">
            {/* Блок активности с heat map и блок разблокировки премиума */}
            <div className="w-full mt-3 sm:mt-4">
              {!userHasPremium ? (
                <div className="flex flex-row gap-3 sm:gap-4 w-full items-stretch">
                  <div className="flex-1">
                    <ActivityHeatmapBlock weeksCount={7} />
                  </div>
                  <div className="flex-1">
                    <PremiumUnlockBlock onClick={onShowPayments} />
                  </div>
                </div>
              ) : (
                <ActivityHeatmapBlock weeksCount={14} />
              )}
            </div>
            
            {/* Блок истории чекинов */}
            <div className="w-full mt-3 sm:mt-4">
              <MentalLevelBlock />
            </div>
            {/* Блок достижений */}
            <div className="w-full mt-3 sm:mt-4">
              <AchievementsBlock onClick={handleStatusBlockBadges} />
            </div>
            
            {/* Секция реферальной программы */}
            <div className="w-full mt-3 sm:mt-4">
              <ReferralSection />
            </div>
            
            {/* История получения баллов */}
            <div className="w-full mt-6 sm:mt-8">
              <div className="relative rounded-xl p-4 sm:p-5 md:p-6 w-full">
                {/* Фон блока */}
                <div className="absolute inset-0" data-name="points_history_block_background">
                  <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
                    <div
                      aria-hidden="true"
                      className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
                    />
                  </div>
                </div>
                
                {/* Контент блока */}
                <div className="relative z-10">
                  <h3 className="text-white text-lg font-semibold mb-4">{ui.levels.pointsHistory}</h3>
                  <div className="space-y-3">
                    {currentPageItems.length > 0 ? (
                      currentPageItems.map((tx, index) => (
                        <div key={tx.id || index} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm w-20">{formatDate(tx.timestamp)}</span>
                            <span className="text-white text-sm">{getLocalizedAction(tx)}</span>
                          </div>
                          <span className="text-[#e1ff00] text-sm font-semibold">{tx.type === 'earn' ? '+' : '-'}{tx.amount}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-sm text-center py-4">
                        {t('no_points_history')}
                      </div>
                    )}
                  </div>
                  
                  {/* Пагинация */}
                  {pointsHistory.length > itemsPerPage && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px]"
                        aria-label={ui.navigation.previous}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">{ui.navigation.previous}</span>
                      </button>
                      
                      <span className="text-gray-400 text-sm">
                        {t('page')} {currentPage} {t('of')} {totalPages}
                      </span>
                      
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px]"
                        aria-label={ui.navigation.next}
                      >
                        <span className="hidden sm:inline">{ui.navigation.next}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}