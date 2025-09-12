import React from 'react';
import { Light, MiniStripeLogo } from './ProfileLayoutComponents';
// import { StatusBlocksRow } from './StatusBlocksRow';
import { ProgressBlock } from './ProgressBlock';
import { Rocket } from 'lucide-react';
import { useContent } from './ContentContext';

interface LevelsScreenProps {
  onBack: () => void;
  onGoToBadges: () => void;
}

/**
 * Страница уровней пользователя
 * Показывает текущий уровень, прогресс и историю получения баллов
 */
export function LevelsScreen({ onBack: _onBack, onGoToBadges }: LevelsScreenProps) {
  const { getUI } = useContent();
  const _uiContent = getUI();

  // Получаем локализованные тексты для действий
  const getLocalizedAction = (actionKey: string) => {
    const actions = {
      dailyCheckin: 'Ежедневный чекин',
      exerciseComplete: 'Завершение упражнения', 
      achievementEarned: 'Получение достижения'
    };
    return actions[actionKey as keyof typeof actions] || actionKey;
  };

  // Моковые данные для истории баллов
  const pointsHistory = [
    { date: '12.01.2025', action: getLocalizedAction('dailyCheckin'), points: '+50' },
    { date: '12.01.2025', action: getLocalizedAction('exerciseComplete'), points: '+100' },
    { date: '11.01.2025', action: getLocalizedAction('dailyCheckin'), points: '+50' },
    { date: '11.01.2025', action: getLocalizedAction('achievementEarned'), points: '+500' },
    { date: '10.01.2025', action: getLocalizedAction('dailyCheckin'), points: '+50' },
    { date: '10.01.2025', action: getLocalizedAction('exerciseComplete'), points: '+100' },
    { date: '09.01.2025', action: getLocalizedAction('dailyCheckin'), points: '+50' },
    { date: '09.01.2025', action: getLocalizedAction('exerciseComplete'), points: '+100' },
    { date: '08.01.2025', action: getLocalizedAction('dailyCheckin'), points: '+50' },
    { date: '08.01.2025', action: getLocalizedAction('achievementEarned'), points: '+500' },
    { date: '07.01.2025', action: getLocalizedAction('dailyCheckin'), points: '+50' },
    { date: '07.01.2025', action: getLocalizedAction('exerciseComplete'), points: '+100' },
    { date: '06.01.2025', action: getLocalizedAction('dailyCheckin'), points: '+50' },
    { date: '06.01.2025', action: getLocalizedAction('exerciseComplete'), points: '+100' },
    { date: '05.01.2025', action: getLocalizedAction('dailyCheckin'), points: '+50' },
    { date: '05.01.2025', action: getLocalizedAction('achievementEarned'), points: '+500' },
    { date: '04.01.2025', action: getLocalizedAction('dailyCheckin'), points: '+50' },
    { date: '04.01.2025', action: getLocalizedAction('exerciseComplete'), points: '+100' },
    { date: '03.01.2025', action: getLocalizedAction('dailyCheckin'), points: '+50' },
    { date: '03.01.2025', action: getLocalizedAction('exerciseComplete'), points: '+100' }
  ];

  return (
    <div 
      className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden safe-top safe-bottom" 
      data-name="Levels Page"
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
            
            {/* Информация о пользователе - модифицированная */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-10">
                <div className="relative">
                  <Rocket className="w-18 h-18 text-[#e1ff00] relative z-10" />
                  <div className="absolute inset-0 bg-[#e1ff00] rounded-full blur-xl opacity-30 scale-110 animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">12,450</h1>
                <div className="h-6 w-6">
                  <svg className="block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512">
                    <path d="M269.881 486.487C262.541 493.838 250.643 493.838 243.303 486.487L123.686 366.701C116.352 359.35 116.348 347.434 123.686 340.086C131.025 332.738 142.923 332.741 150.264 340.086L237.797 427.743L237.797 248.237L178.505 248.237C168.009 248.237 159.5 239.913 159.5 229.644C159.5 219.376 168.009 211.053 178.505 211.053L237.797 211.053L237.797 172.032C237.797 171.868 237.799 171.704 237.804 171.541C204.675 163.168 180.157 133.164 180.157 97.4335C180.157 55.2202 214.378 20.9999 256.592 20.9999C298.805 21 333.026 55.2202 333.026 97.4335C333.026 133.164 308.509 163.167 275.381 171.541C275.385 171.704 275.387 171.868 275.387 172.032L275.387 211.053L330.547 211.053C341.043 211.053 349.553 219.376 349.553 229.644C349.553 239.913 341.043 248.237 330.547 248.237L275.387 248.237L275.387 427.743L362.92 340.086C370.26 332.741 382.16 332.737 389.498 340.086C396.836 347.434 396.832 359.35 389.498 366.701L269.881 486.487ZM256.592 135.651C277.698 135.651 294.809 118.54 294.809 97.4335C294.808 76.327 277.698 59.2168 256.592 59.2167C235.485 59.2167 218.375 76.3269 218.375 97.4335C218.375 118.54 235.485 135.651 256.592 135.651Z" fill="#e1ff00"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Блок прогресса */}
            <div className="w-full mt-6 sm:mt-8">
              <ProgressBlock onBadgesClick={onGoToBadges} />
            </div>
            
            {/* История получения баллов */}
            <div className="w-full mt-6">
              <div className="relative rounded-xl p-4 sm:p-5 md:p-6 w-full">
                {/* Фон блока */}
                <div className="absolute inset-0">
                  <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl">
                    <div
                      aria-hidden="true"
                      className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
                    />
                  </div>
                </div>
                
                {/* Контент блока */}
                <div className="relative z-10">
                  <h3 className="text-white text-lg font-semibold mb-4">История баллов</h3>
                  <div className="space-y-3">
                    {pointsHistory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm w-20">{item.date}</span>
                          <span className="text-white text-sm">{item.action}</span>
                        </div>
                        <span className="text-[#e1ff00] text-sm font-semibold">{item.points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
