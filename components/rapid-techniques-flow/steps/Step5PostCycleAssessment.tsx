import React, { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

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
    <div className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden safe-top safe-bottom">
      <div className="px-4 pt-[84px] pb-10 max-w-[351px] mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} type="button">
            {backLabel}
          </Button>
          {progressText ? <div className="text-sm text-[#8a8a8a]">{progressText}</div> : <div />}
        </div>

        <div className="flex flex-col gap-2">
          <div className="typography-h2 text-[#e1ff00]">
            <h2>{title}</h2>
          </div>
          {subtitle ? <div className="typography-body text-[#8a8a8a]">{subtitle}</div> : null}
        </div>

        <div className="flex flex-col items-center justify-center text-center gap-4 py-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[#e1ff00]/10 blur-[80px] rounded-full scale-150" aria-hidden="true" />
            <div className="text-[96px] leading-none text-white font-medium tabular-nums relative">{value}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] tracking-[0.2em] font-bold text-[#8a8a8a] uppercase">ТЕКУЩИЙ УРОВЕНЬ</div>
            <div className="text-xl font-medium text-[#e1ff00]">{label}</div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Slider
            min={0}
            max={10}
            step={1}
            value={[value]}
            onValueChange={(vals) => setValue(Math.max(0, Math.min(10, vals?.[0] ?? 0)))}
          />
          <div className="flex justify-between items-center mt-1 px-1">
            <span className="text-[10px] font-medium text-[#8a8a8a] uppercase tracking-widest">0 спокойно</span>
            <span className="text-[10px] font-medium text-[#8a8a8a] uppercase tracking-widest">10 очень тяжело</span>
          </div>
        </div>

        <Button type="button" onClick={onNext}>
          {nextLabel}
        </Button>
      </div>
    </div>
  )
}

