// ========================================================================================
// КОМПОНЕНТ: Техника дыхания 4-7-8
// ========================================================================================

import React, { useState, useEffect } from 'react';
import { useContent } from '../ContentContext';
import { useLanguage } from '../LanguageContext';
import { MiniStripeLogo } from '../ProfileLayoutComponents';
import { MentalTechniqueAccordion } from '../ui/accordion-mental-technique';

interface Breathing478ScreenProps {
  onBack: () => void;
}

/**
 * Визуализация дыхания 4-7-8
 */
function BreathingVisualization({ 
  phase, 
  progress 
}: { 
  phase: 'inhale' | 'hold' | 'exhale'; 
  progress: number; 
}) {
  const getScale = () => {
    switch (phase) {
      case 'inhale': return 1 + (progress / 100) * 0.5; // 1.0 -> 1.5
      case 'hold': return 1.5; // статично
      case 'exhale': return 1.5 - (progress / 100) * 0.5; // 1.5 -> 1.0
      default: return 1;
    }
  };

  const getOpacity = () => {
    return phase === 'hold' ? 0.8 : 1;
  };

  return (
    <div className="relative w-32 h-32 mx-auto">
      <div 
        className="absolute inset-0 rounded-full border-4 border-[#e1ff00] transition-all duration-1000 ease-in-out"
        style={{ 
          transform: `scale(${getScale()})`,
          opacity: getOpacity()
        }}
      />
      <div className="absolute inset-4 rounded-full bg-[#e1ff00] opacity-20" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[#e1ff00] font-bold text-lg">
          {phase === 'inhale' ? '4' : phase === 'hold' ? '7' : '8'}
        </span>
      </div>
    </div>
  );
}

/**
 * Интерактивный таймер
 */
function InteractiveTimer({ 
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
  const { language } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return language === 'ru' ? ruText : enText;
  };
  
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
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#212121"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e1ff00"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#e1ff00] font-bold text-lg">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="flex gap-3">
        <button
          onClick={onToggle}
          className="px-6 py-2 bg-[#e1ff00] text-[#2d2b2b] rounded-lg font-semibold hover:bg-[#d4e600] transition-colors"
        >
          {isRunning ? getText('Пауза', 'Pause') : getText('Старт', 'Start')}
        </button>
        <button
          onClick={reset}
          className="px-6 py-2 border border-[#e1ff00] text-[#e1ff00] rounded-lg font-semibold hover:bg-[#e1ff00] hover:text-[#2d2b2b] transition-colors"
        >
          {getText('Сброс', 'Reset')}
        </button>
      </div>
    </div>
  );
}

/**
 * Главный компонент техники дыхания 4-7-8
 */
export function Breathing478Screen({ onBack }: Breathing478ScreenProps) {
  const { getMentalTechnique, getLocalizedText } = useContent();
  const { language } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return language === 'ru' ? ruText : enText;
  };
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [progress, _setProgress] = useState(0);

  // Получаем данные техники из системы контента
  const technique = getMentalTechnique('breathing-4-7-8');
  
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

  const handleTimerComplete = () => {
    if (currentStep < technique.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setPhase(prev => 
        prev === 'inhale' ? 'hold' : 
        prev === 'hold' ? 'exhale' : 'inhale'
      );
    } else {
      // Техника завершена
      setIsRunning(false);
    }
  };

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  const currentStepData = technique.steps[currentStep];

  // Проверяем, что currentStepData существует
  if (!currentStepData) {
    return (
      <div className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto">
        <MiniStripeLogo />
        <div className="flex flex-col gap-6 px-4 pt-[100px] pb-6 max-w-md mx-auto">
          <div className="text-center">
            <h1 className="text-[#e1ff00] text-3xl font-bold mb-2">
              {getText('Ошибка загрузки техники', 'Technique loading error')}
            </h1>
            <p className="text-[#cfcfcf] text-lg">
              {getText('Не удалось загрузить данные техники', 'Failed to load technique data')}
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
          <div className="mt-2">
            <span className="bg-[#e1ff00] text-[#2d2b2b] px-3 py-1 rounded-lg text-sm font-semibold">
              {getLocalizedText(technique.duration)}
            </span>
          </div>
        </div>

        {/* Визуализация */}
        <div className="flex justify-center">
          <BreathingVisualization phase={phase} progress={progress} />
        </div>

        {/* Текущий шаг */}
        <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
          <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
          <div className="text-center">
            <h3 className="text-[#e1ff00] text-lg font-semibold mb-2">
              {getText('Шаг', 'Step')} {currentStep + 1} {getText('из', 'of')} {technique.steps.length}
            </h3>
            <p className="text-[#cfcfcf] text-base">
              {getLocalizedText(currentStepData.instruction)}
            </p>
          </div>
        </div>

        {/* Таймер */}
        <InteractiveTimer
          duration={currentStepData.duration}
          onComplete={handleTimerComplete}
          isRunning={isRunning}
          onToggle={handleToggle}
        />

        {/* Дополнительная информация */}
        <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
          <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
          <div className="flex flex-col gap-4">
            <h3 className="text-[#e1ff00] text-lg font-semibold">{getText('О технике', 'About the technique')}</h3>
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
