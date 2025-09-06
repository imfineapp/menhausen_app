// ========================================================================================
// КОМПОНЕНТ: Техника якоря
// ========================================================================================

import React, { useState } from "react";
import { useContent } from "../ContentContext";
import { useLanguage } from "../LanguageContext";
import { MiniStripeLogo } from "../ProfileLayoutComponents";
import { MentalTechniqueAccordion } from "../ui/accordion-mental-technique";

interface GroundingAnchorScreenProps {
  onBack: () => void;
}

/**
 * Визуализация техники якоря
 */
function AnchorVisualization({ 
  currentStep 
}: { 
  currentStep: number; 
}) {
  const { language } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return language === 'ru' ? ruText : enText;
  };
  
  const steps = [
    { icon: "", text: getText("Ноги на пол", "Feet on floor") },
    { icon: "", text: getText("3 глубоких вдоха", "3 deep breaths") },
    { icon: "", text: getText("Фраза безопасности", "Safety phrase") },
    { icon: "", text: getText("Оглянись вокруг", "Look around") }
  ];
  
  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl transition-all duration-500 ${
            index <= currentStep 
              ? "border-[#e1ff00] bg-[#e1ff00] text-[#2d2b2b]" 
              : "border-[#333] text-[#696969]"
          }`}>
            {step.icon}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium transition-colors duration-500 ${
              index <= currentStep ? "text-[#e1ff00]" : "text-[#696969]"
            }`}>
              {step.text}
            </p>
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
  maxLength = 50 
}: { 
  placeholder: string; 
  onComplete: (value: string) => void; 
  maxLength?: number; 
}) {
  const { language } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return language === 'ru' ? ruText : enText;
  };
  
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (value.trim()) {
      onComplete(value.trim());
      setValue("");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className={`
        relative border-2 rounded-lg transition-all duration-200
        ${isFocused 
          ? "border-[#e1ff00] bg-[#1a1a1a]" 
          : "border-[#333] bg-[#111111]"
        }
      `}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
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
            ? "bg-[#e1ff00] text-[#2d2b2b] hover:bg-[#d4e600]" 
            : "bg-[#333] text-[#696969] cursor-not-allowed"
          }
        `}
      >
        {getText('Готово', 'Done')}
      </button>
    </div>
  );
}

/**
 * Чекбокс для подтверждения
 */
function ConfirmationCheckbox({ 
  text, 
  onComplete 
}: { 
  text: string; 
  onComplete: () => void; 
}) {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheck = () => {
    setIsChecked(!isChecked);
    if (!isChecked) {
      onComplete();
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <button
        onClick={handleCheck}
        className={`
          w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
          ${isChecked 
            ? "border-[#e1ff00] bg-[#e1ff00] text-[#2d2b2b]" 
            : "border-[#333] bg-[#111111] text-[#cfcfcf] hover:border-[#555]"
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-6 h-6 rounded border-2 flex items-center justify-center
            ${isChecked 
              ? "border-[#2d2b2b] bg-[#2d2b2b]" 
              : "border-[#696969]"
            }
          `}>
            {isChecked && (
              <span className="text-[#e1ff00] text-sm font-bold"></span>
            )}
          </div>
          <span className="font-medium">{text}</span>
        </div>
      </button>
    </div>
  );
}

/**
 * Главный компонент техники якоря
 */
export function GroundingAnchorScreen({ onBack }: GroundingAnchorScreenProps) {
  const { getMentalTechnique, getLocalizedText } = useContent();
  const { language } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return language === 'ru' ? ruText : enText;
  };
  
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Получаем данные техники из системы контента
  const technique = getMentalTechnique('grounding-anchor');
  
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

  const handleResponse = (response: string) => {
    const newResponses = [...responses, response];
    setResponses(newResponses);
    
    if (currentStep < technique.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleCheckboxComplete = () => {
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

  if (isCompleted) {
    return (
      <div className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto">
        <MiniStripeLogo />
        
        <div className="flex flex-col gap-6 px-4 pt-[100px] pb-6 max-w-md mx-auto">
          {/* Заголовок завершения */}
          <div className="text-center">
            <h1 className="text-[#e1ff00] text-3xl font-bold mb-2">
              {getText('Техника завершена', 'Technique completed')}
            </h1>
            <p className="text-[#cfcfcf] text-lg">
              {getText('Вы успешно выполнили технику якоря', 'You have successfully completed the anchor technique')}
            </p>
          </div>

          {/* Ваши ответы */}
          {responses.length > 0 && (
            <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
              <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
              <div className="flex flex-col gap-3">
                <h3 className="text-[#e1ff00] text-lg font-semibold">{getText('Ваши ответы', 'Your responses')}</h3>
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
          )}

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
        <AnchorVisualization currentStep={currentStep} />

        {/* Текущий шаг */}
        <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
          <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
          <div className="text-center">
            <h3 className="text-[#e1ff00] text-lg font-semibold mb-2">
              {getText('Шаг', 'Step')} {currentStep + 1} {getText('из', 'of')} {technique.steps.length}
            </h3>
            <p className="text-[#cfcfcf] text-base mb-4">
              {getLocalizedText(currentStepData.instruction)}
            </p>
          </div>
        </div>

        {/* Интерактивный элемент в зависимости от типа шага */}
        {currentStepData.input === "text" ? (
          <InteractiveInput
            placeholder={currentStepData.placeholder ? getLocalizedText(currentStepData.placeholder) : ''}
            onComplete={handleResponse}
          />
        ) : currentStepData.input === "checkbox" ? (
          <ConfirmationCheckbox
            text={currentStepData.placeholder ? getLocalizedText(currentStepData.placeholder) : ''}
            onComplete={handleCheckboxComplete}
          />
        ) : (
          <div className="text-center">
            <p className="text-[#cfcfcf] text-sm">
              {getText('Выполните инструкцию выше', 'Follow the instruction above')}
            </p>
          </div>
        )}

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
