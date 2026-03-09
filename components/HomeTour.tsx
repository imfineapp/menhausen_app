// Пошаговый тур по главной странице: подсветка блоков, затемнение остального, нотации

import React, { useEffect, useState, useCallback } from 'react';
import { useContent } from './ContentContext';

const TOUR_STEP_SELECTORS = ['[data-tour="profile"]', '[data-tour="activity"]', '[data-tour="articles"]', '[data-tour="themes"]'] as const;
const SCROLL_DELAY_MS = 450;
const TOOLTIP_MIN_SPACE_BELOW = 240;
const OVERLAY_OPACITY = 0.94;
const TOOLTIP_MIN_TOP = 220;

export interface HomeTourStepConfig {
  selector: string;
  title: string;
  description: string;
}

interface HomeTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const STEP_COUNT = 4;

export function HomeTour({ onComplete, onSkip }: HomeTourProps) {
  const { content } = useContent();
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [step4Ready, setStep4Ready] = useState(false);

  const measureTarget = useCallback(() => {
    const selector = stepIndex < STEP_COUNT ? TOUR_STEP_SELECTORS[stepIndex] : null;
    if (!selector) {
      setSpotlightRect(null);
      return;
    }
    const el = document.querySelector(selector) as HTMLElement | null;
    if (el) {
      setSpotlightRect(el.getBoundingClientRect());
    } else {
      setSpotlightRect(null);
    }
  }, [stepIndex]);

  // Перед показом шага 4 прокручиваем блок тем в зону видимости
  useEffect(() => {
    if (stepIndex !== 3) {
      setStep4Ready(false);
      measureTarget();
      return;
    }
    setSpotlightRect(null);
    const themesEl = document.querySelector('[data-tour="themes"]') as HTMLElement | null;
    if (!themesEl) {
      measureTarget();
      setStep4Ready(true);
      return;
    }
    themesEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timeoutId = setTimeout(() => {
      measureTarget();
      setStep4Ready(true);
    }, SCROLL_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [stepIndex, measureTarget]);

  // Обновление позиции spotlight при ресайзе и при смене шага (кроме шага 4 — там после задержки)
  useEffect(() => {
    if (stepIndex === 3 && !step4Ready) return;
    measureTarget();
    const onResize = () => measureTarget();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [stepIndex, step4Ready, measureTarget]);

  const handleNext = () => {
    if (stepIndex === STEP_COUNT - 1) {
      onComplete();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const tour = content.ui?.home?.tour;
  if (!tour) return null;

  const steps: HomeTourStepConfig[] = [
    { selector: TOUR_STEP_SELECTORS[0], title: tour.step1.title, description: tour.step1.description },
    { selector: TOUR_STEP_SELECTORS[1], title: tour.step2.title, description: tour.step2.description },
    { selector: TOUR_STEP_SELECTORS[2], title: tour.step3.title, description: tour.step3.description },
    { selector: TOUR_STEP_SELECTORS[3], title: tour.step4.title, description: tour.step4.description },
  ];

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === STEP_COUNT - 1;

  if (!currentStep) return null;

  const spaceBelow = spotlightRect && typeof window !== 'undefined' ? window.innerHeight - spotlightRect.bottom : 0;
  const placeTooltipAbove =
    spotlightRect &&
    (stepIndex >= 2 || spaceBelow < TOOLTIP_MIN_SPACE_BELOW);

  const win = typeof window !== 'undefined' ? window : null;
  const vw = win?.innerWidth ?? 400;
  const vh = win?.innerHeight ?? 600;

  const displayRect = spotlightRect
    ? (() => {
        if (stepIndex === 3) {
          const left = Math.max(0, spotlightRect.left);
          const top = Math.max(0, spotlightRect.top);
          const right = Math.min(vw, spotlightRect.right);
          const bottom = Math.min(vh, spotlightRect.bottom);
          const width = Math.max(0, right - left);
          const height = Math.max(0, bottom - top);
          return { left, top, width, height };
        }
        return {
          left: spotlightRect.left,
          top: spotlightRect.top,
          width: spotlightRect.width,
          height: spotlightRect.height,
        };
      })()
    : null;

  const tooltipTopEnough = displayRect && displayRect.top >= TOOLTIP_MIN_TOP;
  const tooltipStyle = displayRect
    ? placeTooltipAbove
      ? tooltipTopEnough
        ? { bottom: vh - displayRect.top + 16, top: 'auto' as const }
        : { top: 16, bottom: 'auto' as const }
      : { top: displayRect.top + displayRect.height + 16 }
    : { top: '50%', transform: 'translateY(-50%)' as const };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto" aria-modal="true" role="dialog" aria-label="Обучение по главной странице">
      {/* Затемнение: слой с «вырезом» через box-shadow у элемента по размеру цели */}
      {displayRect && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: displayRect.left,
            top: displayRect.top,
            width: displayRect.width,
            height: displayRect.height,
            boxShadow: `0 0 0 9999px rgba(0, 0, 0, ${OVERLAY_OPACITY})`,
            borderRadius: 12,
          }}
        />
      )}

      {/* Кликабельный overlay — клики не проходят к контенту */}
      <div className="absolute inset-0 pointer-events-auto" aria-hidden="true" />

      {/* Нотация: над блоком, если внизу не хватает места (шаги 3–4 и низ экрана) */}
      <div
        className="absolute left-4 right-4 z-[101] pointer-events-auto rounded-xl border border-[#212121] bg-[#1a1a1a] p-4 sm:p-5 shadow-xl"
        style={{
          ...tooltipStyle,
          maxWidth: 343,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <h3 className="typography-h2 text-[#e1ff00] mb-2">{currentStep.title}</h3>
        <p className="typography-body text-[#e5e5e5] mb-5 whitespace-pre-line">{currentStep.description}</p>
        <div className="flex flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={handleSkip}
            className="typography-button text-[#696969] hover:text-[#888] transition-colors px-4 py-2"
          >
            {tour.skip}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="typography-button bg-[#e1ff00] text-[#2d2b2b] px-4 py-2 rounded-xl hover:opacity-90 transition-opacity min-w-[100px]"
          >
            {isLastStep ? tour.finish : tour.next}
          </button>
        </div>
      </div>
    </div>
  );
}
