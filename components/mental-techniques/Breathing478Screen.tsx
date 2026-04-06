import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '@nanostores/react';

import { mentalTechniquesMessages } from '@/src/i18n/messages/mentalTechniques';
import { useContent } from '../ContentContext';
import { MentalTechniqueShell } from './MentalTechniqueShell';
import { TechniqueControlsRow, TechniquePrimaryButton, TechniqueSecondaryButton } from './TechniqueControls';
import {
  computeBreathingProgressPercent,
  formatTimeMMSS,
  getBreathingOpacity,
  getBreathingScale,
  nextBreathingPhase,
  type BreathingPhase
} from '@/src/domain/breathing.domain';

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
  phase: BreathingPhase; 
  progress: number; 
}) {
  return (
    <div className="relative w-36 h-36 mx-auto">
      <div 
        className="absolute inset-0 rounded-full border-4 border-[#e1ff00] transition-all duration-700 ease-in-out"
        style={{ 
          transform: `scale(${getBreathingScale(phase, progress)})`,
          opacity: getBreathingOpacity(phase)
        }}
      />
      <div className="absolute inset-4 rounded-full bg-[#e1ff00] opacity-20" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="typography-h2 text-[#e1ff00]">
          {phase === 'inhale' ? '4' : phase === 'hold' ? '7' : '8'}
        </span>
      </div>
    </div>
  );
}

/**
 * Главный компонент техники дыхания 4-7-8
 */
export function Breathing478Screen({ onBack }: Breathing478ScreenProps) {
  const { getMentalTechnique, getLocalizedText } = useContent();
  const msgs = useStore(mentalTechniquesMessages);
  
  const technique = getMentalTechnique('breathing-4-7-8');

  const steps = useMemo(() => technique?.steps ?? [], [technique]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [timeLeft, setTimeLeft] = useState(0);

  const currentStepData = steps[currentStep];
  const currentDuration = currentStepData?.duration ?? 0;

  const phaseLabel = phase === 'inhale' ? 'Вдох' : phase === 'hold' ? 'Задержка' : 'Выдох';

  const phaseProgress = useMemo(() => {
    if (!currentDuration) return 0;
    return computeBreathingProgressPercent(currentDuration, timeLeft);
  }, [currentDuration, timeLeft]);

  useEffect(() => {
    if (!currentDuration) return;
    setTimeLeft(currentDuration);
  }, [currentDuration]);

  useEffect(() => {
    if (!isRunning) return;
    if (!currentDuration) return;
    if (timeLeft <= 0) return;

    const id = window.setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [isRunning, currentDuration, timeLeft]);

  useEffect(() => {
    if (!isRunning) return;
    if (!currentDuration) return;
    if (timeLeft !== 0) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
      setPhase((p) => nextBreathingPhase(p));
    } else {
      setIsRunning(false);
    }
  }, [currentDuration, currentStep, isRunning, steps.length, timeLeft]);

  const handleToggle = () => setIsRunning((v) => !v);
  const handleReset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setPhase('inhale');
    if (steps[0]?.duration) setTimeLeft(steps[0].duration);
  };

  if (!technique) {
    return (
      <MentalTechniqueShell title={msgs.techniqueNotFound} subtitle={msgs.techniqueDataLoadFailed}>
        <TechniqueControlsRow>
          <TechniquePrimaryButton onClick={onBack}>{msgs.back}</TechniquePrimaryButton>
        </TechniqueControlsRow>
      </MentalTechniqueShell>
    );
  }

  if (!currentStepData) {
    return (
      <MentalTechniqueShell
        title={msgs.techniqueDataError}
        subtitle={msgs.techniqueDataLoadFailed}
        metaChip={getLocalizedText(technique.duration)}
      >
        <TechniqueControlsRow>
          <TechniquePrimaryButton onClick={onBack}>{msgs.back}</TechniquePrimaryButton>
        </TechniqueControlsRow>
      </MentalTechniqueShell>
    );
  }

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
      <div className="flex justify-center">
        <BreathingVisualization phase={phase} progress={phaseProgress} />
      </div>

      <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
        <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
        <div className="text-center flex flex-col gap-2">
          <p className="typography-caption text-[#8a8a8a]">
            {msgs.phase}: <span className="text-[#cfcfcf]">{phaseLabel}</span>
          </p>
          <h3 className="typography-h3 text-[#e1ff00]">
            {msgs.step} {currentStep + 1} {msgs.of} {steps.length}
          </h3>
          <p className="typography-body text-[#cfcfcf]">{getLocalizedText(currentStepData.instruction)}</p>
        </div>
      </div>

      <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
        <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
        <div className="flex items-center justify-between">
          <div className="typography-body text-[#cfcfcf]">{formatTimeMMSS(timeLeft)}</div>
          <div className="typography-caption text-[#8a8a8a]">{Math.round(phaseProgress)}%</div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#212121] overflow-hidden">
          <div
            className="h-full bg-[#e1ff00] transition-all duration-300 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, phaseProgress))}%` }}
          />
        </div>
      </div>

      <TechniqueControlsRow>
        <TechniquePrimaryButton onClick={handleToggle}>{isRunning ? msgs.pause : msgs.start}</TechniquePrimaryButton>
        <TechniqueSecondaryButton onClick={handleReset}>{msgs.reset}</TechniqueSecondaryButton>
      </TechniqueControlsRow>
    </MentalTechniqueShell>
  );
}
