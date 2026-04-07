import React, { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

type GroundingItem = {
  n: 5 | 4 | 3 | 2 | 1
  label: string
  title: string
  icon: string
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
      { n: 5, label: 'Вижу', title: '5 вещей вокруг', icon: 'visibility' },
      { n: 4, label: 'Ощущаю', title: '4 телесных чувства', icon: 'back_hand' },
      { n: 3, label: 'Слышу', title: '3 разных звука', icon: 'hearing' },
      { n: 2, label: 'Запах', title: '2 аромата рядом', icon: 'air' },
      { n: 1, label: 'Вкус', title: '1 вкус во рту', icon: 'restaurant' },
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
    <div className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden safe-top safe-bottom">
      <div className="px-4 pt-[84px] pb-10 max-w-[351px] mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} type="button">
            {backLabel}
          </Button>
          {progressText ? <div className="text-sm text-[#8a8a8a]">{progressText}</div> : <div />}
        </div>

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
              <div
                key={item.n}
                className={[
                  'relative rounded-2xl p-4 flex items-center gap-4 border',
                  isActive ? 'bg-[rgba(217,217,217,0.06)] border-[#e1ff00]/30' : 'bg-[rgba(217,217,217,0.04)] border-white/5',
                  dimmed ? 'opacity-50' : 'opacity-100',
                ].join(' ')}
              >
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 text-5xl font-bold opacity-10 text-[#e1ff00] pointer-events-none">
                  {item.n}
                </div>

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
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 mt-2">
          {!isDone ? (
            <Button type="button" onClick={handleCompleteCurrent}>
              Отметить и дальше
            </Button>
          ) : null}
          <Button type="button" onClick={onNext} disabled={!isDone}>
            {nextLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

