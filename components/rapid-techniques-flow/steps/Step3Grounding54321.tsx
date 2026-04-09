import React, { useEffect, useMemo, useState } from 'react'

import { FixedBottomCta } from '@/components/rapid-techniques-flow/ui/FixedBottomCta'
import { FlowHeader } from '@/components/rapid-techniques-flow/ui/FlowHeader'
import { RapidFlowShell } from '@/components/rapid-techniques-flow/ui/RapidFlowShell'
import { Ear, Eye, Hand, Utensils, Wind } from 'lucide-react'

type GroundingItem = {
  n: 5 | 4 | 3 | 2 | 1
  label: string
  title: string
  icon: React.ReactNode
}

export type Step3Grounding54321Props = {
  backLabel: string
  nextLabel: string
  onBack: () => void
  onNext: () => void
  title: string
  subtitle?: string
  progressText?: string
  initialCompletedCount?: number
  onCompletedCountChange?: (count: number) => void
}

export function Step3Grounding54321(props: Step3Grounding54321Props) {
  const {
    backLabel,
    nextLabel,
    onBack,
    onNext,
    title,
    subtitle,
    progressText,
    initialCompletedCount = 0,
    onCompletedCountChange,
  } = props

  const items: GroundingItem[] = useMemo(
    () => [
      { n: 5, label: 'Вижу', title: '5 вещей вокруг', icon: <Eye className="w-5 h-5" /> },
      { n: 4, label: 'Ощущаю', title: '4 телесных чувства', icon: <Hand className="w-5 h-5" /> },
      { n: 3, label: 'Слышу', title: '3 разных звука', icon: <Ear className="w-5 h-5" /> },
      { n: 2, label: 'Запах', title: '2 аромата рядом', icon: <Wind className="w-5 h-5" /> },
      { n: 1, label: 'Вкус', title: '1 вкус во рту', icon: <Utensils className="w-5 h-5" /> },
    ],
    [],
  )

  const [completedCount, setCompletedCount] = useState<number>(Math.max(0, Math.min(5, initialCompletedCount)))

  useEffect(() => {
    onCompletedCountChange?.(completedCount)
  }, [completedCount, onCompletedCountChange])

  const activeIndex = Math.min(4, completedCount)
  const isDone = completedCount >= 5

  const handleCompleteCurrent = () => {
    setCompletedCount((c) => Math.min(5, c + 1))
  }

  const progressShort = `${Math.min(completedCount + 1, 5)}/5`
  const progressPct = Math.round((completedCount / 5) * 100)

  return (
    <RapidFlowShell>
      <div className="flex-1 overflow-y-auto overflow-x-hidden safe-top safe-bottom">
        <div className="px-4 pt-[100px] pb-32 max-w-[351px] mx-auto flex flex-col gap-6">
          <FlowHeader
            backLabel={backLabel}
            onBack={onBack}
            right={progressText ? <div className="text-sm text-[#8a8a8a]">{progressText}</div> : undefined}
          />

          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <div className="typography-h2 text-[#e1ff00]">
                <h2>{title}</h2>
              </div>
              <div className="text-sm font-bold text-[#e1ff00]">{progressShort}</div>
            </div>
            <div className="h-2 w-full bg-[rgba(217,217,217,0.04)] rounded-full overflow-hidden">
              <div className="h-full bg-[#e1ff00]" style={{ width: `${progressPct}%` }} />
            </div>
            {subtitle ? <div className="typography-body text-[#8a8a8a]">{subtitle}</div> : null}
          </div>

        <div className="flex flex-col gap-3">
          {items.map((item, idx) => {
            const isCompleted = idx < completedCount
            const isActive = idx === activeIndex && !isDone
            const dimmed = idx > activeIndex

            return (
              <button
                key={item.n}
                type="button"
                onClick={() => {
                  if (!isActive) return
                  handleCompleteCurrent()
                }}
                disabled={!isActive}
                aria-current={isActive ? 'step' : undefined}
                className={[
                  'relative rounded-2xl p-4 flex items-center gap-4 border',
                  isActive ? 'bg-[rgba(217,217,217,0.06)] border-[#e1ff00]/30' : 'bg-[rgba(217,217,217,0.04)] border-white/5',
                  dimmed ? 'opacity-50' : 'opacity-100',
                  isActive ? 'cursor-pointer active:scale-[0.99] transition-transform' : 'cursor-default',
                ].join(' ')}
              >
                <div className="flex-shrink-0">
                  <div
                    className={[
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      isActive ? 'bg-[#e1ff00] text-[#111111]' : 'bg-[#e1ff00]/10 text-[#e1ff00]',
                    ].join(' ')}
                  >
                    <span className="text-xl" aria-hidden="true">
                      {item.icon}
                    </span>
                  </div>
                </div>

                <div className="flex-grow">
                  <div className={['text-xs font-bold uppercase tracking-wider mb-0.5', isActive ? 'text-[#e1ff00]' : 'text-[#8a8a8a]'].join(' ')}>
                    {item.label}
                  </div>
                  <div className="text-base font-bold text-white">{item.title}</div>
                </div>

                <div>
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-md bg-[#e1ff00] flex items-center justify-center text-[#111111] font-bold">
                      ✓
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-md border-2 border-white/10" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        </div>
      </div>

      <FixedBottomCta
        primaryLabel={isDone ? nextLabel : 'Отметить и дальше'}
        onPrimary={isDone ? onNext : handleCompleteCurrent}
        primaryDisabled={false}
      />
    </RapidFlowShell>
  )
}

