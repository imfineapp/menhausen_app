import React, { useEffect, useMemo, useState } from 'react'

import { Slider } from '@/components/ui/slider'
import { FixedBottomCta } from '@/components/rapid-techniques-flow/ui/FixedBottomCta'
import { FlowHeader } from '@/components/rapid-techniques-flow/ui/FlowHeader'
import { RapidFlowShell } from '@/components/rapid-techniques-flow/ui/RapidFlowShell'

export type Step5PostCycleAssessmentProps = {
  backLabel: string
  nextLabel: string
  onBack: () => void
  onNext: () => void
  title: string
  subtitle?: string
  progressText?: string
  initialStress?: number
  onStressChange?: (v: number) => void
}

function stressLabel(value: number): string {
  if (value <= 2) return 'Спокойно'
  if (value <= 4) return 'Лёгкое напряжение'
  if (value <= 6) return 'Умеренное напряжение'
  if (value <= 8) return 'Сильное напряжение'
  return 'Очень тяжело'
}

export function Step5PostCycleAssessment(props: Step5PostCycleAssessmentProps) {
  const { backLabel, nextLabel, onBack, onNext, title, subtitle, progressText, initialStress = 5, onStressChange } = props
  const [value, setValue] = useState<number>(Math.max(0, Math.min(10, initialStress)))

  useEffect(() => {
    onStressChange?.(value)
  }, [value, onStressChange])

  const label = useMemo(() => stressLabel(value), [value])

  return (
    <RapidFlowShell>
      <div className="flex-1 overflow-y-auto overflow-x-hidden safe-top safe-bottom">
        <div className="px-4 pt-[100px] pb-28 max-w-[351px] mx-auto flex flex-col gap-6">
          <FlowHeader
            backLabel={backLabel}
            onBack={onBack}
            right={progressText ? <div className="text-sm text-[#8a8a8a]">{progressText}</div> : undefined}
          />

          <div className="flex flex-col gap-2">
            <div className="typography-h2 text-[#e1ff00]">
              <h2>{title}</h2>
            </div>
            {subtitle ? <div className="typography-body text-[#8a8a8a]">{subtitle}</div> : null}
          </div>

          {/* Сделано по аналогии с первым экраном серии: число + подпись + “neon” slider */}
          <div className="flex flex-col gap-4 pt-1">
            <div className="flex flex-col items-start">
              <div className="typography-h1 text-[#e1ff00] tabular-nums">
                <div className="font-bold tracking-tight">{value}</div>
              </div>
              <div className="typography-body text-[#8a8a8a] font-bold mt-1">{label}</div>
            </div>

            <div className="px-1">
              <Slider
                min={0}
                max={10}
                step={1}
                value={[value]}
                onValueChange={(vals) => setValue(Math.max(0, Math.min(10, vals?.[0] ?? 0)))}
                className={[
                  // Match the first screen: thin track, neon thumb, subtle glow.
                  '[&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-[#2a2a2a]',
                  '[&_[data-slot=slider-range]]:bg-[#e1ff00]',
                  '[&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:bg-[#e1ff00] [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-[#111111]',
                  '[&_[data-slot=slider-thumb]]:shadow-[0_0_12px_rgba(225,255,0,0.35)]',
                ].join(' ')}
              />
              <div className="flex justify-between mt-3">
                <div className="flex flex-col items-start">
                  <div className="typography-caption text-[#8a8a8a] font-bold">0</div>
                  <div className="typography-caption text-white">спокойно</div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="typography-caption text-[#8a8a8a] font-bold">10</div>
                  <div className="typography-caption text-white">очень тяжело</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <FixedBottomCta primaryLabel={nextLabel} onPrimary={onNext} />
    </RapidFlowShell>
  )
}

