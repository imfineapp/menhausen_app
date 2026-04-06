import { mentalTechniquesMessages } from '@/src/i18n/messages/mentalTechniques';
import { useStore } from '@nanostores/react';
// ========================================================================================
// КОМПОНЕНТ: Техника якоря
// ========================================================================================

import React, { useMemo, useState } from "react";
import { useContent } from "../ContentContext";
import { getNextStepOrComplete, isGroundingStepCompleted } from '@/src/domain/grounding.domain';
import { MentalTechniqueShell } from './MentalTechniqueShell';
import { TechniqueControlsRow, TechniquePrimaryButton, TechniqueSecondaryButton } from './TechniqueControls';

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
  const msgs = useStore(mentalTechniquesMessages);
  
  const steps = [
    { icon: "👣", text: msgs.feetOnFloor },
    { icon: "🌬", text: msgs.threeDeepBreaths },
    { icon: "🗣", text: msgs.safetyPhrase },
    { icon: "👀", text: msgs.lookAround }
  ];
  
  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl transition-all duration-500 ${
            isGroundingStepCompleted(currentStep, index)
              ? "border-[#e1ff00] bg-[#e1ff00] text-[#2d2b2b]" 
              : "border-[#333] text-[#8a8a8a]"
          }`}>
            <span aria-hidden="true">{step.icon}</span>
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium transition-colors duration-500 ${
              isGroundingStepCompleted(currentStep, index) ? "text-[#e1ff00]" : "text-[#8a8a8a]"
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
  const msgs = useStore(mentalTechniquesMessages);
  
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
            ? "bg-[#e1ff00] text-[#2d2b2b] hover:bg-[#d4e600]" 
            : "bg-[#333] text-[#8a8a8a] cursor-not-allowed"
          }
        `}
      >
        {msgs.done}
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
              : "border-[#8a8a8a]"
            }
          `}>
            {isChecked && (
              <svg className="w-4 h-4 text-[#e1ff00]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
  const msgs = useStore(mentalTechniquesMessages);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Получаем данные техники из системы контента
  const technique = getMentalTechnique('grounding-anchor');

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

  const handleCheckboxComplete = () => {
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
        subtitle={msgs.groundingAnchorSuccess}
        metaChip={getLocalizedText(technique.duration)}
        accordionTitle={msgs.aboutTechnique}
        accordionItems={technique.accordionItems.map((item) => ({
          title: getLocalizedText(item.title),
          content: getLocalizedText(item.content),
        }))}
      >
        {responses.length > 0 ? (
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
        ) : null}

        <TechniqueControlsRow>
          <TechniquePrimaryButton onClick={onBack}>{msgs.back}</TechniquePrimaryButton>
        </TechniqueControlsRow>
      </MentalTechniqueShell>
    );
  }

  const placeholderText =
    currentStepData.placeholder ? getLocalizedText(currentStepData.placeholder) : '';

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
      <AnchorVisualization currentStep={currentStep} />

      <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
        <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
        <div className="text-center flex flex-col gap-2">
          <h3 className="typography-h3 text-[#e1ff00]">
            {msgs.step} {currentStep + 1} {msgs.of} {steps.length}
          </h3>
          <p className="typography-body text-[#cfcfcf]">{getLocalizedText(currentStepData.instruction)}</p>
        </div>
      </div>

      {currentStepData.input === "text" ? (
        <InteractiveInput
          placeholder={placeholderText}
          onComplete={handleResponse}
        />
      ) : currentStepData.input === "checkbox" ? (
        <ConfirmationCheckbox
          text={placeholderText}
          onComplete={handleCheckboxComplete}
        />
      ) : (
        <div className="text-center">
          <p className="typography-caption text-[#cfcfcf]">{msgs.followInstructionAbove}</p>
        </div>
      )}

      <TechniqueControlsRow>
        <TechniqueSecondaryButton onClick={onBack}>{msgs.back}</TechniqueSecondaryButton>
      </TechniqueControlsRow>
    </MentalTechniqueShell>
  );
}
