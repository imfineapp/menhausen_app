import { mentalTechniquesMessages } from '@/src/i18n/messages/mentalTechniques';
import { useStore } from '@nanostores/react';
// ========================================================================================
// КОМПОНЕНТ: Техника заземления 5-4-3-2-1
// ========================================================================================

import React, { useMemo, useState } from 'react';
import { useContent } from '../ContentContext';
import { StripedProgressBar } from '../ui/StripedProgressBar';
import { GROUNDING_54321_STEPS, getNextStepOrComplete, isGroundingStepCompleted } from '@/src/domain/grounding.domain';
import { MentalTechniqueShell } from './MentalTechniqueShell';
import { TechniqueControlsRow, TechniquePrimaryButton, TechniqueSecondaryButton } from './TechniqueControls';

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
  const steps = GROUNDING_54321_STEPS;
  
  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      {steps.map((count, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#e1ff00] flex items-center justify-center">
            <span className="text-[#e1ff00] font-bold text-sm">{count}</span>
          </div>
          <StripedProgressBar 
            progress={isGroundingStepCompleted(currentStep, index) ? 100 : 0}
            size="sm"
            className="flex-1"
            showBackground={true}
            backgroundVariant="gray"
          />
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
  const msgs = useStore(mentalTechniquesMessages);
  
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
          className="w-full px-4 py-3 bg-transparent text-[#cfcfcf] placeholder-[#8a8a8a] focus:outline-none"
        />
        {/* Счетчик символов убран из дефолта — меньше “админского” ощущения */}
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className={`
          w-full mt-3 py-2 rounded-lg font-semibold transition-all duration-200
          ${value.trim() 
            ? 'bg-[#e1ff00] text-[#2d2b2b] hover:bg-[#d4e600]' 
            : 'bg-[#333] text-[#8a8a8a] cursor-not-allowed'
          }
        `}
      >
        {msgs.done}
      </button>
    </div>
  );
}

/**
 * Главный компонент техники заземления 5-4-3-2-1
 */
export function Grounding54321Screen({ onBack }: Grounding54321ScreenProps) {
  const { getMentalTechnique, getLocalizedText } = useContent();
  const msgs = useStore(mentalTechniquesMessages);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Получаем данные техники из системы контента
  const technique = getMentalTechnique('grounding-5-4-3-2-1');

  const steps = useMemo(() => technique?.steps ?? [], [technique]);
  
  if (!technique) {
    return (
      <MentalTechniqueShell title={msgs.techniqueNotFound} subtitle={msgs.techniqueDataLoadFailed}>
        <TechniqueControlsRow>
          <TechniquePrimaryButton onClick={onBack}>{msgs.back}</TechniquePrimaryButton>
        </TechniqueControlsRow>
      </MentalTechniqueShell>
    );
  }

  const handleResponse = (response: string) => {
    const newResponses = [...responses, response];
    setResponses(newResponses);
    
    const { nextStep, isCompleted } = getNextStepOrComplete(currentStep, technique.steps.length);
    setCurrentStep(nextStep);
    if (isCompleted) setIsCompleted(true);
  };

  const currentStepData = steps[currentStep];

  // Проверяем, что currentStepData существует
  if (!currentStepData) {
    return (
      <MentalTechniqueShell title={msgs.techniqueDataError} subtitle={msgs.techniqueDataLoadFailed} metaChip={getLocalizedText(technique.duration)}>
        <TechniqueControlsRow>
          <TechniquePrimaryButton onClick={onBack}>{msgs.back}</TechniquePrimaryButton>
        </TechniqueControlsRow>
      </MentalTechniqueShell>
    );
  }

  if (isCompleted) {
    return (
      <MentalTechniqueShell
        title={msgs.techniqueCompleted}
        subtitle={msgs.grounding54321Success}
        metaChip={getLocalizedText(technique.duration)}
        accordionTitle={msgs.aboutTechnique}
        accordionItems={technique.accordionItems.map((item) => ({
          title: getLocalizedText(item.title),
          content: getLocalizedText(item.content),
        }))}
      >
        <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
          <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
          <div className="flex flex-col gap-3">
            <h3 className="typography-h3 text-[#e1ff00]">{msgs.yourResponses}</h3>
            {responses.map((response, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="size-2 rounded-full bg-[#e1ff00] mt-2 flex-shrink-0" />
                <p className="typography-caption text-[#cfcfcf]">{response}</p>
              </div>
            ))}
          </div>
        </div>

        <TechniqueControlsRow>
          <TechniquePrimaryButton onClick={onBack}>{msgs.back}</TechniquePrimaryButton>
        </TechniqueControlsRow>
      </MentalTechniqueShell>
    );
  }

  const inputPlaceholder =
    currentStepData.placeholder ? getLocalizedText(currentStepData.placeholder) : 'Коротко опишите…';

  return (
    <MentalTechniqueShell
      title={getLocalizedText(technique.title)}
      subtitle={getLocalizedText(technique.subtitle)}
      metaChip={getLocalizedText(technique.duration)}
      accordionTitle={msgs.aboutTechnique}
      accordionItems={technique.accordionItems.map((item) => ({
        title: getLocalizedText(item.title),
        content: getLocalizedText(item.content),
      }))}
    >
      <GroundingVisualization currentStep={currentStep} />

      <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
        <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
        <div className="text-center flex flex-col gap-2">
          <h3 className="typography-h3 text-[#e1ff00]">
            {msgs.step} {currentStep + 1} {msgs.of} {steps.length}
          </h3>
          <p className="typography-body text-[#cfcfcf]">{getLocalizedText(currentStepData.instruction)}</p>
        </div>
      </div>

      <InteractiveInput placeholder={inputPlaceholder} onComplete={handleResponse} />

      <TechniqueControlsRow>
        <TechniqueSecondaryButton onClick={onBack}>{msgs.back}</TechniqueSecondaryButton>
      </TechniqueControlsRow>
    </MentalTechniqueShell>
  );
}
