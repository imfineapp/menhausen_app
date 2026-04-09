import React, { useMemo } from 'react'

import { FixedBottomCta } from '@/components/rapid-techniques-flow/ui/FixedBottomCta'
import { FlowHeader } from '@/components/rapid-techniques-flow/ui/FlowHeader'
import { RapidFlowShell } from '@/components/rapid-techniques-flow/ui/RapidFlowShell'

export type Step6ResultsSummaryProps = {
  backLabel: string
  nextLabel: string
  onBack: () => void
  onNext: () => void
  title: string
  subtitle?: string
  progressText?: string
  stressBefore?: number | null
  stressAfter?: number | null
}

function pctFromStress(v: number): number {
  // Presentational mapping for Stitch-like cards.
  return Math.round((v / 10) * 100)
}

export function Step6ResultsSummary(props: Step6ResultsSummaryProps) {
  const { backLabel, nextLabel, onBack, onNext, title, subtitle, progressText, stressBefore, stressAfter } = props

  const beforePct = typeof stressBefore === 'number' ? pctFromStress(stressBefore) : null
  const afterPct = typeof stressAfter === 'number' ? pctFromStress(stressAfter) : null
  const deltaPct = beforePct !== null && afterPct !== null ? Math.max(0, beforePct - afterPct) : null

  const insight = useMemo(() => {
    if (deltaPct === null) {
      return 'Финальную разницу мы посчитаем после последней оценки стресса.'
    }
    if (deltaPct >= 30) return 'Похоже, вы хорошо переключили нервную систему в более спокойное состояние.'
    if (deltaPct >= 10) return 'Есть заметное снижение напряжения. Отличная динамика.'
    return 'Даже небольшой сдвиг — это прогресс. Продолжим и зафиксируем результат.'
  }, [deltaPct])

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
          <div className="text-[10px] tracking-[0.15em] uppercase text-[#8a8a8a]">Rapid Techniques Series</div>
          <div className="typography-h2 text-[#e1ff00]">
            <h2>{title}</h2>
          </div>
          {subtitle ? <div className="typography-body text-[#8a8a8a]">{subtitle}</div> : null}
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-5 flex flex-col justify-between aspect-square border border-white/5">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-[#8a8a8a]">Before</div>
              </div>
              <div className="flex items-baseline gap-1">
                <div className="text-3xl text-white font-semibold tabular-nums">{beforePct ?? '—'}</div>
                <div className="text-[#8a8a8a] text-sm">%</div>
              </div>
            </div>
            <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-5 flex flex-col justify-between aspect-square border border-white/5">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-[#8a8a8a]">After</div>
              </div>
              <div className="flex items-baseline gap-1">
                <div className="text-3xl text-white font-semibold tabular-nums">{afterPct ?? '—'}</div>
                <div className="text-[#8a8a8a] text-sm">%</div>
              </div>
            </div>
          </div>

          <div className="bg-[#e1ff00] rounded-xl p-5 flex items-center justify-between">
            <div>
              <div className="text-black/60 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Stress Reduction</div>
              <div className="text-3xl text-black font-bold tabular-nums">{deltaPct !== null ? `Δ ${deltaPct}%` : 'Δ —'}</div>
            </div>
            <div className="bg-black/10 p-3 rounded-full">
              <div className="text-black text-3xl leading-none">☺</div>
            </div>
          </div>

          <div className="bg-[rgba(217,217,217,0.04)] p-5 rounded-xl border-l-4 border-[#e1ff00]">
            <div className="text-white text-sm leading-relaxed">{insight}</div>
          </div>
        </div>

        </div>
      </div>

      <FixedBottomCta primaryLabel={nextLabel} onPrimary={onNext} />
    </RapidFlowShell>
  )
}

