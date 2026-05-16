import { mentalTechniquesMessages } from '@/src/i18n/messages/mentalTechniques';
import { useStore } from '@nanostores/react';
// ========================================================================================
// КОМПОНЕНТ: Квадратное дыхание
// ========================================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { useContent } from '../ContentContext';
import { getSquareBreathingDotPosition } from '@/src/domain/squareBreathing.domain';
import { MentalTechniqueShell } from './MentalTechniqueShell';
import { TechniqueControlsRow, TechniquePrimaryButton, TechniqueSecondaryButton } from './TechniqueControls';

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
  const pos = getSquareBreathingDotPosition(position, progress);
  
  return (
    <div className="flex justify-center items-center">
      <div className="relative w-[196px] h-[196px] rounded-2xl">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl border-2 border-[#e1ff00] opacity-80"
          style={{ boxShadow: '0 0 24px rgba(225, 255, 0, 0.18)' }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-5 rounded-xl border border-[#e1ff00] opacity-25"
        />
        <div
          className="absolute w-3.5 h-3.5 bg-[#e1ff00] rounded-full transition-all duration-150"
          style={{
            left: pos.x - 7,
            top: pos.y - 7,
            boxShadow: '0 0 18px rgba(225, 255, 0, 0.35)',
          }}
          aria-hidden="true"
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
  const msgs = useStore(mentalTechniquesMessages);
  
  // Получаем данные техники из системы контента
  const technique = getMentalTechnique('breathing-square');
  
  const steps = useMemo(() => technique?.steps ?? [], [technique]);
  const [isRunning, setIsRunning] = useState(false);
  const [position, setPosition] = useState(0); // 0-3 стороны квадрата
  const [progress, setProgress] = useState(0); // 0-100 по стороне
  const [cycle, setCycle] = useState(1);

  const stepIndex = position % 4;
  const currentStep = steps[stepIndex];
  const stepDurationSec = currentStep?.duration ?? 4;
  const currentInstruction = currentStep?.instruction ?? '';

  // Осмысленный тайминг: 100% за duration секунд.
  const tickMs = Math.max(20, Math.round((stepDurationSec * 1000) / 100));

  useEffect(() => {
    if (!isRunning) return;
    
    const interval = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setPosition(prevPos => {
            const next = (prevPos + 1) % 4;
            // цикл считаем по полному кругу (после 4-й стороны)
            if (prevPos === 3) setCycle((c) => c + 1);
            return next;
          });
          return 0;
        }
        return prev + 1;
      });
    }, tickMs);
    
    return () => clearInterval(interval);
  }, [isRunning, tickMs]);
  
  const handleToggle = () => {
    setIsRunning(prev => !prev);
  };
  
  const handleReset = () => {
    setIsRunning(false);
    setPosition(0);
    setProgress(0);
    setCycle(1);
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

  return (
    <MentalTechniqueShell
      title={getLocalizedText(technique.title)}
      subtitle={getLocalizedText(technique.subtitle)}
      metaChip={getLocalizedText(technique.duration)}
      accordionTitle={msgs.aboutTechnique}
      accordionItems={(technique.accordionItems ?? []).map((item: any) => ({
        title: getLocalizedText(item.title),
        content: getLocalizedText(item.content),
      }))}
    >
      <SquareVisualization position={position} progress={progress} />

      <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
        <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
        <div className="text-center flex flex-col gap-2">
          <p className="typography-caption text-[#8a8a8a]">
            {msgs.cycle} {cycle} • {msgs.step} {stepIndex + 1} {msgs.of} 4
          </p>
          <p className="typography-body text-[#cfcfcf]">
            {getLocalizedText(currentInstruction as any)}
          </p>
        </div>
      </div>

      <TechniqueControlsRow>
        <TechniquePrimaryButton onClick={handleToggle}>{isRunning ? msgs.pause : msgs.start}</TechniquePrimaryButton>
        <TechniqueSecondaryButton onClick={handleReset}>{msgs.reset}</TechniqueSecondaryButton>
      </TechniqueControlsRow>
    </MentalTechniqueShell>
  );
}