// ========================================================================================
// КОМПОНЕНТ: Квадратное дыхание
// ========================================================================================

import React, { useState, useEffect } from 'react';
import { useContent } from '../ContentContext';
import { useLanguage } from '../LanguageContext';
import { MiniStripeLogo } from '../ProfileLayoutComponents';
import { MentalTechniqueAccordion } from '../ui/accordion-mental-technique';

interface SquareBreathingScreenProps {
  onBack: () => void;
}

/**
 * Визуализация квадратного дыхания
 */
function SquareVisualization({ 
  position, 
  progress 
}: { 
  position: number; // 0-3 для сторон квадрата
  progress: number; // 0-100 для текущей стороны
}) {
  const getPosition = () => {
    const sideLength = 140;
    const padding = 20;
    
    switch (position) {
      case 0: // Левая сторона (вверх)
        return {
          x: padding,
          y: padding + (sideLength * progress / 100)
        };
      case 1: // Верхняя сторона (вправо)
        return {
          x: padding + (sideLength * progress / 100),
          y: padding
        };
      case 2: // Правая сторона (вниз)
        return {
          x: padding + sideLength,
          y: padding + (sideLength * progress / 100)
        };
      case 3: // Нижняя сторона (влево)
        return {
          x: padding + sideLength - (sideLength * progress / 100),
          y: padding + sideLength
        };
      default:
        return { x: padding, y: padding };
    }
  };

  const pos = getPosition();
  
  return (
    <div className="flex justify-center items-center">
      <div className="relative w-[180px] h-[180px] border-2 border-[#e1ff00] rounded-lg">
        {/* Квадрат */}
        <div className="absolute inset-0 border-2 border-[#e1ff00] rounded-lg"></div>
        
        {/* Подсветка текущей стороны */}
        <div 
          className="absolute w-2 h-2 bg-[#e1ff00] rounded-full transition-all duration-100"
          style={{
            left: pos.x - 4,
            top: pos.y - 4
          }}
        ></div>
      </div>
    </div>
  );
}

/**
 * Интерактивный таймер для квадратного дыхания
 */
function BreathingTimer({ 
  isRunning, 
  onToggle, 
  onComplete 
}: { 
  isRunning: boolean;
  onToggle: () => void;
  onComplete: () => void;
}) {
  const { language } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return language === 'ru' ? ruText : enText;
  };
  
  return (
    <div className="text-center space-y-4">
      <button
        onClick={onToggle}
        className="px-8 py-4 bg-[#e1ff00] text-[#2d2b2b] rounded-lg font-semibold hover:bg-[#d4e600] transition-colors"
      >
        {isRunning ? getText('Пауза', 'Pause') : getText('Старт', 'Start')}
      </button>
      
      <button
        onClick={onComplete}
        className="px-6 py-2 bg-[#333] text-[#cfcfcf] rounded-lg hover:bg-[#444] transition-colors"
      >
        {getText('Сброс', 'Reset')}
      </button>
    </div>
  );
}

/**
 * Дополнительная информация
 */
function AdditionalInfo({ technique }: { technique: any }) {
  const { getLocalizedText } = useContent();
  const { language } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return language === 'ru' ? ruText : enText;
  };
  
  return (
    <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
      <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
      <div className="space-y-4">
        <h3 className="text-[#e1ff00] text-lg font-semibold">{getText('О технике', 'About the technique')}</h3>
        <MentalTechniqueAccordion 
          items={technique?.accordionItems?.map((item: any) => ({
            title: getLocalizedText(item.title),
            content: getLocalizedText(item.content)
          })) || []}
        />
      </div>
    </div>
  );
}

/**
 * Главный компонент квадратного дыхания
 */
export function SquareBreathingScreen({ onBack }: SquareBreathingScreenProps) {
  const { getMentalTechnique, getLocalizedText } = useContent();
  const { language } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return language === 'ru' ? ruText : enText;
  };
  
  // Получаем данные техники из системы контента
  const technique = getMentalTechnique('breathing-square');
  
  // Состояние для анимации
  const [isRunning, setIsRunning] = useState(false);
  const [position, setPosition] = useState(0); // 0-3 для сторон квадрата
  const [progress, setProgress] = useState(0); // 0-100 для текущей стороны
  
  // Таймер для анимации
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setPosition(prevPos => (prevPos + 1) % 4);
          return 0;
        }
        return prev + 1;
      });
    }, 50); // Обновляем каждые 50мс для плавной анимации
    
    return () => clearInterval(interval);
  }, [isRunning]);
  
  const handleToggle = () => {
    setIsRunning(prev => !prev);
  };
  
  const handleComplete = () => {
    setIsRunning(false);
    setPosition(0);
    setProgress(0);
  };
  
  if (!technique) {
    return (
      <div className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto">
        <MiniStripeLogo />
        <div className="flex flex-col gap-6 px-4 pt-[100px] pb-6 max-w-md mx-auto">
          <div className="text-center">
            <h1 className="text-[#e1ff00] text-3xl font-bold mb-2">
              {getText('Техника не найдена', 'Technique not found')}
            </h1>
            <button
              onClick={onBack}
              className="w-full py-3 bg-[#e1ff00] text-[#2d2b2b] rounded-lg font-semibold hover:bg-[#d4e600] transition-colors"
            >
              {getText('Назад', 'Back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto">
      <MiniStripeLogo />
      
      <div className="flex flex-col gap-6 px-4 pt-[100px] pb-6 max-w-md mx-auto">
        {/* Заголовок */}
        <div className="text-center">
          <h1 className="text-[#e1ff00] text-3xl font-bold mb-2">
            {getLocalizedText(technique.title)}
          </h1>
          <p className="text-[#cfcfcf] text-lg">
            {getLocalizedText(technique.subtitle)}
          </p>
          <div className="mt-2">
            <span className="bg-[#e1ff00] text-[#2d2b2b] px-3 py-1 rounded-lg text-sm font-semibold">
              {getLocalizedText(technique.duration)}
            </span>
          </div>
        </div>

        {/* Визуализация */}
        <SquareVisualization position={position} progress={progress} />

        {/* Текущий шаг */}
        <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
          <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
          <div className="text-center">
            <p className="text-white text-lg mb-2">
              {getText('Цикл', 'Cycle')} {Math.floor(position / 4) + 1} - {getText('Шаг', 'Step')} {position + 1} {getText('из', 'of')} 4
            </p>
          </div>
        </div>

        {/* Интерактивный таймер */}
        <BreathingTimer 
          isRunning={isRunning}
          onToggle={handleToggle}
          onComplete={handleComplete}
        />

        {/* Дополнительная информация */}
        <AdditionalInfo technique={technique} />
      </div>
    </div>
  );
}