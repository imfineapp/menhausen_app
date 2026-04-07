import React, { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

export type Step1StopFrameProps = {
  backLabel: string
  nextLabel: string
  onBack: () => void
  onNext: () => void
  onDoneChange?: (done: boolean) => void
  title: string
  subtitle?: string
  progressText?: string
  initialDone?: boolean
}

type TimerState = 'idle' | 'running' | 'done'

export function Step1StopFrame(props: Step1StopFrameProps) {
  const { backLabel, nextLabel, onBack, onNext, onDoneChange, title, subtitle, progressText, initialDone } = props
  const TOTAL = 10
  const [state, setState] = useState<TimerState>(initialDone ? 'done' : 'idle')
  const [remaining, setRemaining] = useState<number>(initialDone ? 0 : TOTAL)
  const startedAtRef = useRef<number | null>(null)

  const done = state === 'done'

  useEffect(() => {
    onDoneChange?.(done)
  }, [done, onDoneChange])

  useEffect(() => {
    if (state !== 'running') return
    const id = window.setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1)
        if (next === 0) {
          setState('done')
        }
        return next
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [state])

  const ringProgress = useMemo(() => {
    const p = (TOTAL - remaining) / TOTAL
    return Math.max(0, Math.min(1, p))
  }, [remaining])

  const start = () => {
    startedAtRef.current = Date.now()
    setRemaining(TOTAL)
    setState('running')
  }

  const restart = () => {
    start()
  }

  const buttonLabel = state === 'done' ? 'OK' : state === 'running' ? String(remaining) : String(TOTAL)

  return (
    <div className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden safe-top safe-bottom">
      <div className="px-4 pt-[84px] pb-10 max-w-[351px] mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} type="button">
            {backLabel}
          </Button>
          {progressText ? <div className="text-sm text-[#8a8a8a]">{progressText}</div> : <div />}
        </div>

        <div className="flex flex-col gap-2 text-center">
          <div className="typography-h2 text-[#e1ff00]">
            <h2>{title}</h2>
          </div>
          {subtitle ? <div className="typography-body text-[#8a8a8a]">{subtitle}</div> : null}
          <div className="text-xs text-[#8a8a8a] tracking-wide">
            <span>Пауза</span> <span className="mx-2">→</span> <span>Назови</span> <span className="mx-2">→</span> <span>1 действие</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative">
            <div className="absolute -inset-8 bg-[#e1ff00]/10 blur-3xl rounded-full" aria-hidden="true" />
            <div
              className="relative w-[260px] h-[260px] rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(#e1ff00 ${ringProgress * 360}deg, rgba(255,255,255,0.08) 0deg)`,
              }}
            >
              <div className="w-[240px] h-[240px] rounded-full bg-[#111111] flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (state === 'idle') start()
                    else if (state === 'running') restart()
                    else restart()
                  }}
                  className="w-[184px] h-[184px] rounded-full bg-[#e1ff00] text-[#111111] flex flex-col items-center justify-center active:scale-95 transition-transform shadow-[0_0_50px_rgba(225,255,0,0.15)]"
                >
                  <span className="text-5xl font-bold tracking-tight">{buttonLabel}</span>
                  <span className="text-xs uppercase font-bold tracking-[0.2em] mt-2">Секунд</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-sm text-[#8a8a8a] bg-[rgba(217,217,217,0.04)] px-5 py-2.5 rounded-full border border-white/5">
            Без анализа. 10 секунд.
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button type="button" onClick={onNext} disabled={!done}>
            {nextLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

