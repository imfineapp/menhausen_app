// ========================================================================================
// КОМПОНЕНТ: Квадратное дыхание
// ========================================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useContent } from '../ContentContext';
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
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 200 200">
        <rect 
          x="20" y="20" 
          width="160" height="160" 
          fill="none" 
          stroke="#e1ff00" 
          strokeWidth="3"
          strokeDasharray="5,5"
        />
        <circle 
          cx={pos.x}
          cy={pos.y}
          r="8" 
          fill="#e1ff00"
          className="transition-all duration-1000 ease-in-out"
        />
        {/* Подсветка текущей стороны */}
        <rect 
          x="20" y="20" 
          width="160" height="160" 
          fill="none" 
          stroke="#e1ff00" 
          strokeWidth="1"
          strokeOpacity="0.3"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}

/**
 * Интерактивный таймер для квадратного дыхания
 */
function SquareTimer({ 
  duration, 
  onComplete, 
  isRunning, 
  onToggle 
}: { 
  duration: number; 
  onComplete: () => void; 
  isRunning: boolean; 
  onToggle: () => void; 
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          setProgress(((duration - newTime) / duration) * 100);
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      onComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, duration, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setTimeLeft(duration);
    setProgress(0);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Круглый прогресс-бар */}
      <div className="relative w-20 h-20">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#212121"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e1ff00"
            strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#e1ff00] font-bold text-sm">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="flex gap-3">
        <button
          onClick={onToggle}
          className="px-4 py-2 bg-[#e1ff00] text-[#2d2b2b] rounded-lg font-semibold hover:bg-[#d4e600] transition-colors text-sm"
        >
          {isRunning ? 'Пауза' : 'Старт'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 border border-[#e1ff00] text-[#e1ff00] rounded-lg font-semibold hover:bg-[#e1ff00] hover:text-[#2d2b2b] transition-colors text-sm"
        >
          Сброс
        </button>
      </div>
    </div>
  );
}

/**
 * Главный компонент квадратного дыхания
 */
export function SquareBreathingScreen({ onBack }: SquareBreathingScreenProps) {
  const { getMentalTechnique, getLocalizedText } = useContent();
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  // Получаем данные техники из системы контента
  const technique = getMentalTechnique('breathing-square');

  const handleTimerComplete = useCallback(() => {
    if (!technique || !technique.steps) return;
    
    if (currentStep < technique.steps.length - 1) {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        // Дополнительная проверка, что следующий шаг существует
        if (nextStep < technique.steps.length) {
          return nextStep;
        }
        return prev; // Остаемся на текущем шаге, если следующий не существует
      });
      setProgress(0);
    } else {
      // Цикл завершен - сбрасываем на первый шаг
      setCycleCount(prev => prev + 1);
      setCurrentStep(0);
      setProgress(0);
    }
  }, [technique, currentStep]);

  const handleToggle = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);
  
  if (!technique) {
    return (
      <div className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto">
        <MiniStripeLogo />
        <div className="flex flex-col gap-6 px-4 pt-[100px] pb-6 max-w-md mx-auto">
          <div className="text-center">
            <h1 className="text-[#e1ff00] text-3xl font-bold mb-2">
              Техника не найдена
            </h1>
            <button
              onClick={onBack}
              className="w-full py-3 bg-[#e1ff00] text-[#2d2b2b] rounded-lg font-semibold hover:bg-[#d4e600] transition-colors"
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = technique.steps[currentStep];

  // Проверяем, что currentStepData существует
  if (!currentStepData) {
    return (
      <div className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto">
        <MiniStripeLogo />
        <div className="flex flex-col gap-6 px-4 pt-[100px] pb-6 max-w-md mx-auto">
          <div className="text-center">
            <h1 className="text-[#e1ff00] text-3xl font-bold mb-2">
              Ошибка загрузки техники
            </h1>
            <p className="text-[#cfcfcf] text-lg">
              Не удалось загрузить данные техники
            </p>
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
          <div className="mt-2 flex items-center justify-center gap-4">
            <span className="bg-[#e1ff00] text-[#2d2b2b] px-3 py-1 rounded-lg text-sm font-semibold">
              {getLocalizedText(technique.duration)}
            </span>
            <span className="text-[#cfcfcf] text-sm">
              Цикл {cycleCount + 1}
            </span>
          </div>
        </div>

        {/* Визуализация */}
        <div className="flex justify-center">
          <SquareVisualization position={currentStep} progress={progress} />
        </div>

        {/* Текущий шаг */}
        <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
          <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
          <div className="text-center">
            <h3 className="text-[#e1ff00] text-lg font-semibold mb-2">
              Шаг {currentStep + 1} из {technique.steps.length}
            </h3>
            <p className="text-[#cfcfcf] text-base">
              {getLocalizedText(currentStepData.instruction)}
            </p>
          </div>
        </div>

        {/* Таймер */}
        <SquareTimer
          duration={currentStepData.duration}
          onComplete={handleTimerComplete}
          isRunning={isRunning}
          onToggle={handleToggle}
        />

        {/* Дополнительная информация */}
        <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
          <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
          <div className="flex flex-col gap-4">
            <h3 className="text-[#e1ff00] text-lg font-semibold">О технике</h3>
            <MentalTechniqueAccordion 
              items={technique.accordionItems.map(item => ({
                title: getLocalizedText(item.title),
                content: getLocalizedText(item.content)
              }))}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
