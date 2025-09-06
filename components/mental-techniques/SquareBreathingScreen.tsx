// ========================================================================================
// КОМПОНЕНТ: Квадратное дыхание
// ========================================================================================

import React, { useState, useEffect } from 'react';
import { useContent } from '../ContentContext';
import { useTranslation } from '../LanguageContext';
import { MiniStripeLogo } from '../ProfileLayoutComponents';
// import { MentalTechniqueAccordion } from '../ui/accordion-mental-technique'; // Unused

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
  const { t } = useTranslation();
  
  return (
    <div className="text-center space-y-4">
      <button
        onClick={onToggle}
        className="px-8 py-4 bg-[#e1ff00] text-[#2d2b2b] rounded-lg font-semibold hover:bg-[#d4e600] transition-colors"
      >
        {isRunning ? t('pause') : t('start')}
      </button>
      
      <button
        onClick={onComplete}
        className="px-6 py-2 bg-[#333] text-[#cfcfcf] rounded-lg hover:bg-[#444] transition-colors"
      >
        {t('reset')}
      </button>
    </div>
  );
}

/**
 * Дополнительная информация
 */
function AdditionalInfo({ technique }: { technique: any }) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <h3 className="text-[#e1ff00] text-lg font-semibold">{t('about_technique')}</h3>
      <div className="text-[#cfcfcf] text-sm space-y-2">
        <p>{technique?.description || t('square_breathing_description')}</p>
      </div>
    </div>
  );
}

/**
 * Главный компонент квадратного дыхания
 */
export function SquareBreathingScreen({ onBack }: SquareBreathingScreenProps) {
  const { getMentalTechniques } = useContent();
  const { t } = useTranslation();
  
  // Получаем данные техники из системы контента
  const techniques = getMentalTechniques();
  const technique = techniques.find(t => t.id === 'square-breathing');
  
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
              {t('technique_not_found')}
            </h1>
            <button
              onClick={onBack}
              className="w-full py-3 bg-[#e1ff00] text-[#2d2b2b] rounded-lg font-semibold hover:bg-[#d4e600] transition-colors"
            >
              {t('back')}
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
            {technique.title}
          </h1>
        </div>

        {/* Визуализация */}
        <SquareVisualization position={position} progress={progress} />

        {/* Текущий шаг */}
        <div className="text-center">
          <p className="text-white text-lg mb-2">
            {t('cycle')} {Math.floor(position / 4) + 1} - {t('step')} {position + 1} {t('of')} 4
          </p>
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