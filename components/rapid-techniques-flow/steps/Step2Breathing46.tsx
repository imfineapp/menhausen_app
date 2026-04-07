import React, { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

export type Step2Breathing46Props = {
  backLabel: string
  nextLabel: string
  onBack: () => void
  onNext: () => void
  title: string
  subtitle?: string
  progressText?: string
  initialCompletedCycles?: number
  onCompletedCyclesChange?: (cycles: number) => void
}

type Phase = 'inhale' | 'exhale' | 'done'

export function Step2Breathing46(props: Step2Breathing46Props) {
  const {
    backLabel,
    nextLabel,
    onBack,
    onNext,
    title,
    subtitle,
    progressText,
    initialCompletedCycles = 0,
    onCompletedCyclesChange,
  } = props

  const TOTAL_CYCLES = 3
  const INHALE = 4
  const EXHALE = 6

  const [phase, setPhase] = useState<Phase>(initialCompletedCycles >= TOTAL_CYCLES ? 'done' : 'inhale')
  const [secondsLeft, setSecondsLeft] = useState<number>(INHALE)
  const [completedCycles, setCompletedCycles] = useState<number>(Math.min(TOTAL_CYCLES, Math.max(0, initialCompletedCycles)))
  const [running, setRunning] = useState<boolean>(initialCompletedCycles < TOTAL_CYCLES)

  useEffect(() => {
    onCompletedCyclesChange?.(completedCycles)
  }, [completedCycles, onCompletedCyclesChange])

  useEffect(() => {
    if (!running) return
    if (phase === 'done') return

    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [running, phase])

  useEffect(() => {
    if (!running) return
    if (phase === 'done') return
    if (secondsLeft > 0) return

    if (phase === 'inhale') {
      setPhase('exhale')
      setSecondsLeft(EXHALE)
      return
    }

    // phase === 'exhale' ended -> cycle done
    const nextCycles = completedCycles + 1
    setCompletedCycles(nextCycles)
    if (nextCycles >= TOTAL_CYCLES) {
      setPhase('done')
      setRunning(false)
      return
    }
    setPhase('inhale')
    setSecondsLeft(INHALE)
  }, [secondsLeft, running, phase, completedCycles])

  const pulseScale = useMemo(() => {
    if (phase === 'inhale') return 1.12
    if (phase === 'exhale') return 0.92
    return 1
  }, [phase])

  const phaseLabel = phase === 'inhale' ? 'Вдох' : phase === 'exhale' ? 'Выдох' : 'Готово'
  const bigNumber = phase === 'done' ? '' : String(secondsLeft)

  const resetCycles = () => {
    setCompletedCycles(0)
    setPhase('inhale')
    setSecondsLeft(INHALE)
    setRunning(true)
  }

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
          <div className="h-px w-12 bg-[#e1ff00]/30 mx-auto" />
          <div className="text-xs uppercase tracking-[0.3em] text-[#8a8a8a]">Slowing Down</div>
        </div>

        <div className="flex flex-col items-center justify-center pt-4 pb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-[#e1ff00]/10 blur-[80px] rounded-full scale-150" aria-hidden="true" />
            <div
              className="relative w-[280px] h-[280px] rounded-full flex items-center justify-center border border-[#e1ff00]/40"
              style={{
                transform: `scale(${pulseScale})`,
                transition: 'transform 900ms ease-in-out',
                boxShadow: '0 0 40px rgba(225, 255, 0, 0.2)',
              }}
            >
              <div className="absolute inset-0 rounded-full border-2 border-[#e1ff00]" />
              <div className="relative text-center space-y-2">
                {phase !== 'done' ? (
                  <span className="text-7xl font-light text-white tabular-nums">{bigNumber}</span>
                ) : (
                  <span className="text-3xl font-semibold text-white">Готово</span>
                )}
                <div className="text-[#e1ff00] text-sm font-bold tracking-[0.2em] uppercase">{phaseLabel}</div>
                <div className="text-xs text-[#8a8a8a]">
                  Циклы: {Math.min(completedCycles, TOTAL_CYCLES)}/{TOTAL_CYCLES}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center max-w-[300px]">
            <div className="text-2xl text-white mb-3">Вдох 4 → Выдох 6</div>
            <div className="text-[#8a8a8a] text-sm leading-relaxed">
              Главное — <span className="text-white font-bold">удлинить выдох</span>. Это сигнализирует нервной системе о безопасности.
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-3">
          <Button type="button" variant="secondary" onClick={resetCycles}>
            Ещё 3 цикла
          </Button>
          <Button type="button" onClick={onNext} disabled={completedCycles < TOTAL_CYCLES}>
            {nextLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

