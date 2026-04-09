import React from 'react'

import { FixedBottomCta } from '@/components/rapid-techniques-flow/ui/FixedBottomCta'
import { FlowHeader } from '@/components/rapid-techniques-flow/ui/FlowHeader'
import { RapidFlowShell } from '@/components/rapid-techniques-flow/ui/RapidFlowShell'

export type Step7WrapUpProps = {
  backLabel: string
  nextLabel: string
  onBack: () => void
  onNext: () => void
  title: string
  subtitle?: string
  progressText?: string
}

export function Step7WrapUp(props: Step7WrapUpProps) {
  const { backLabel, nextLabel, onBack, onNext, title, subtitle, progressText } = props

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

        <div className="bg-[rgba(217,217,217,0.04)] border border-white/5 rounded-2xl p-5 text-white/90 leading-relaxed">
          Остался последний шаг — оценим стресс после серии, чтобы увидеть итог.
        </div>
        </div>
      </div>

      <FixedBottomCta primaryLabel={nextLabel} onPrimary={onNext} />
    </RapidFlowShell>
  )
}

