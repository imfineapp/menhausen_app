// ========================================================================================
// КОМПОНЕНТ: Техника заземления 5-4-3-2-1
// ========================================================================================

import React, { useState } from 'react';
import { useContent } from '../ContentContext';
import { MiniStripeLogo } from '../ProfileLayoutComponents';
import { MentalTechniqueAccordion } from '../ui/accordion-mental-technique';

interface Grounding54321ScreenProps {
  onBack: () => void;
}

/**
 * Визуализация прогресса техники 5-4-3-2-1
 */
function GroundingVisualization({ 
  currentStep 
}: { 
  currentStep: number; 
}) {
  const steps = [5, 4, 3, 2, 1];
  const colors = ['#e1ff00', '#d4e600', '#c7cc00', '#b8b300', '#a8a600'];
  
  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      {steps.map((count, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#e1ff00] flex items-center justify-center">
            <span className="text-[#e1ff00] font-bold text-sm">{count}</span>
          </div>
          <div className="flex-1 h-2 bg-[#212121] rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${
                index <= currentStep ? colors[index] : 'bg-transparent'
              }`}
              style={{ width: index <= currentStep ? '100%' : '0%' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Интерактивное поле ввода
 */
function InteractiveInput({ 
  placeholder, 
  onComplete, 
  maxLength = 100 
}: { 
  placeholder: string; 
  onComplete: (value: string) => void; 
  maxLength?: number; 
}) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (value.trim()) {
      onComplete(value.trim());
      setValue('');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className={`
        relative border-2 rounded-lg transition-all duration-200
        ${isFocused 
          ? 'border-[#e1ff00] bg-[#1a1a1a]' 
          : 'border-[#333] bg-[#111111]'
        }
      `}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full px-4 py-3 bg-transparent text-[#cfcfcf] placeholder-[#696969] focus:outline-none"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <span className="text-[#696969] text-sm">
            {value.length}/{maxLength}
          </span>
        </div>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className={`
          w-full mt-3 py-2 rounded-lg font-semibold transition-all duration-200
          ${value.trim() 
            ? 'bg-[#e1ff00] text-[#2d2b2b] hover:bg-[#d4e600]' 
            : 'bg-[#333] text-[#696969] cursor-not-allowed'
          }
        `}
      >
        Готово
      </button>
    </div>
  );
}

/**
 * Главный компонент техники заземления 5-4-3-2-1
 */
export function Grounding54321Screen({ onBack }: Grounding54321ScreenProps) {
  const { getMentalTechnique, getLocalizedText } = useContent();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Получаем данные техники из системы контента
  const technique = getMentalTechnique('grounding-5-4-3-2-1');
  
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

  const handleResponse = (response: string) => {
    const newResponses = [...responses, response];
    setResponses(newResponses);
    
    if (currentStep < technique.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
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

  if (isCompleted) {
    return (
      <div className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto">
        <MiniStripeLogo />
        
        <div className="flex flex-col gap-6 px-4 pt-[100px] pb-6 max-w-md mx-auto">
          {/* Заголовок завершения */}
          <div className="text-center">
            <h1 className="text-[#e1ff00] text-3xl font-bold mb-2">
              Техника завершена
            </h1>
            <p className="text-[#cfcfcf] text-lg">
              Вы успешно выполнили упражнение заземления
            </p>
          </div>

          {/* Ваши ответы */}
          <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
            <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
            <div className="flex flex-col gap-3">
              <h3 className="text-[#e1ff00] text-lg font-semibold">Ваши ответы</h3>
              {responses.map((response, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-[#e1ff00] mt-2 flex-shrink-0" />
                  <p className="text-[#cfcfcf] text-sm">
                    {response}
                  </p>
                </div>
              ))}
            </div>
          </div>

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

        {/* Визуализация прогресса */}
        <GroundingVisualization currentStep={currentStep} />

        {/* Текущий шаг */}
        <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
          <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
          <div className="text-center">
            <h3 className="text-[#e1ff00] text-lg font-semibold mb-2">
              Шаг {currentStep + 1} из {technique.steps.length}
            </h3>
            <p className="text-[#cfcfcf] text-base mb-4">
              {getLocalizedText(currentStepData.instruction)}
            </p>
          </div>
        </div>

        {/* Поле ввода */}
        <InteractiveInput
          placeholder={currentStepData.placeholder ? getLocalizedText(currentStepData.placeholder) : ''}
          onComplete={handleResponse}
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
