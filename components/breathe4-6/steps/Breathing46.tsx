import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { FixedBottomCta } from '@/components/breathe4-6/ui/FixedBottomCta'
import { FlowHeader } from '@/components/breathe4-6/ui/FlowHeader'
import { BreatheShell } from '@/components/breathe4-6/ui/BreatheShell'

export type Breathing46Props = {
  backLabel: string
  nextLabel: string
  onBack: () => void
  onNext: () => void
  title: string
  subtitle?: string
  startLabel?: string
  repeatLabel?: string
  phaseLabels?: {
    inhale: string
    exhale: string
    done: string
  }
  tipText?: string
  initialCompletedCycles?: number
  onComplete?: () => void
}

type Phase = 'inhale' | 'exhale' | 'done'

type Particle = {
  id: string
  originX: number
  originY: number
  angleRad: number
  travelPx: number
  sizePx: number
  durationMs: number
  startOpacity: number
  driftPx: number
}

export function Breathing46(props: Breathing46Props) {
  const {
    backLabel,
    nextLabel,
    onBack,
    onNext,
    title,
    subtitle,
    startLabel = 'Start',
    repeatLabel = 'Repeat',
    phaseLabels = { inhale: 'Inhale', exhale: 'Exhale', done: 'Ready' },
    tipText,
    initialCompletedCycles = 0,
    onComplete,
  } = props

  const TOTAL_CYCLES = 3
  const INHALE = 4
  const EXHALE = 6

  const [phase, setPhase] = useState<Phase>(initialCompletedCycles >= TOTAL_CYCLES ? 'done' : 'inhale')
  const [secondsLeft, setSecondsLeft] = useState<number>(INHALE)
  const [completedCycles, setCompletedCycles] = useState<number>(Math.min(TOTAL_CYCLES, Math.max(0, initialCompletedCycles)))
  const [running, setRunning] = useState<boolean>(false)
  const shouldReduceMotion = useReducedMotion()
  const circleRef = useRef<HTMLDivElement | null>(null)
  const spawnTimeoutRef = useRef<number | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])

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

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (phase === 'done') {
      onCompleteRef.current?.()
    }
  }, [phase])

  useEffect(() => {
    if (shouldReduceMotion) return

    const emitting = running && phase !== 'done'
    if (!emitting) {
      if (spawnTimeoutRef.current) window.clearTimeout(spawnTimeoutRef.current)
      spawnTimeoutRef.current = null
      setParticles([])
      return
    }

    let cancelled = false

    const scheduleNext = () => {
      if (cancelled) return
      const nextInMs = 40 + Math.random() * 120
      spawnTimeoutRef.current = window.setTimeout(() => {
        if (cancelled) return

        const rect = circleRef.current?.getBoundingClientRect?.()
        const centerX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
        const centerY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
        const radius = rect ? Math.min(rect.width, rect.height) / 2 : 140

        const angleRad = Math.random() * Math.PI * 2
        const ringJitterPx = -2 + Math.random() * 6
        const startR = Math.max(0, radius + ringJitterPx)

        const originX = centerX + Math.cos(angleRad) * startR
        const originY = centerY + Math.sin(angleRad) * startR

        const travelPx = radius * (0.65 + Math.random() * 0.55)
        const sizePx = 1 + Math.random() * 3.5
        const durationMs = 4200 + Math.random() * 3200
        const startOpacity = 0.10 + Math.random() * 0.22
        const driftPx = -8 + Math.random() * 16

        const p: Particle = {
          id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
          originX,
          originY,
          angleRad,
          travelPx,
          sizePx,
          durationMs,
          startOpacity,
          driftPx,
        }

        setParticles((prev) => {
          const next = prev.length > 60 ? prev.slice(prev.length - 60) : prev
          return [...next, p]
        })

        scheduleNext()
      }, nextInMs)
    }

    scheduleNext()

    return () => {
      cancelled = true
      if (spawnTimeoutRef.current) window.clearTimeout(spawnTimeoutRef.current)
      spawnTimeoutRef.current = null
    }
  }, [running, phase, shouldReduceMotion])

  const pulseScale = useMemo(() => {
    if (!running && phase !== 'done') return 0.92
    if (phase === 'inhale') return 1.12
    if (phase === 'exhale') return 0.92
    return 1
  }, [phase, running])

  const phaseDurationMs = useMemo(() => {
    if (!running) return 0
    if (phase === 'inhale') return INHALE * 1000
    if (phase === 'exhale') return EXHALE * 1000
    return 0
  }, [phase, running])

  const progress = useMemo(() => {
    if (phase === 'done') return 1
    if (!running) return 0
    const perCycle = INHALE + EXHALE
    const total = TOTAL_CYCLES * perCycle
    const phaseTotal = phase === 'inhale' ? INHALE : EXHALE
    const phaseElapsed = Math.max(0, Math.min(phaseTotal, phaseTotal - secondsLeft))
    const cycleBase = completedCycles * perCycle + (phase === 'exhale' ? INHALE : 0)
    const elapsed = cycleBase + phaseElapsed
    return Math.max(0, Math.min(1, total > 0 ? elapsed / total : 0))
  }, [running, phase, secondsLeft, completedCycles])

  const ring = useMemo(() => {
    const r = 46
    const circumference = 2 * Math.PI * r
    const dashoffset = (1 - progress) * circumference
    return { r, circumference, dashoffset }
  }, [progress])

  const phaseLabel = phase === 'inhale' ? phaseLabels.inhale : phase === 'exhale' ? phaseLabels.exhale : phaseLabels.done
  const bigNumber = phase === 'done' ? '' : String(secondsLeft)

  const resetCycles = () => {
    setCompletedCycles(0)
    setPhase('inhale')
    setSecondsLeft(INHALE)
    setRunning(true)
  }

  const startCycles = () => {
    if (phase === 'done') return
    setPhase('inhale')
    setSecondsLeft(INHALE)
    setRunning(true)
  }

  const canGoNext = completedCycles >= TOTAL_CYCLES
  const showBottomRepeat = phase === 'done' || progress >= 0.92

  return (
    <BreatheShell>
      {!shouldReduceMotion ? (
        <div className="fixed inset-0 pointer-events-none z-10">
          <AnimatePresence>
            {particles.map((p) => {
              const inwardX = -Math.cos(p.angleRad) * p.travelPx
              const inwardY = -Math.sin(p.angleRad) * p.travelPx
              const tangentX = -Math.sin(p.angleRad)
              const tangentY = Math.cos(p.angleRad)
              // Inhale: particles move OUT from center to edge. Exhale: particles move IN toward center.
              const direction = phase === 'inhale' ? -1 : 1
              return (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, p.startOpacity, 0],
                    x: direction * inwardX + tangentX * p.driftPx,
                    y: direction * inwardY + tangentY * p.driftPx,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: p.durationMs / 1000, ease: 'easeOut' }}
                  onAnimationComplete={() => {
                    setParticles((prev) => prev.filter((q) => q.id !== p.id))
                  }}
                  style={{
                    position: 'absolute',
                    left: p.originX,
                    top: p.originY,
                    width: p.sizePx,
                    height: p.sizePx,
                    marginLeft: -p.sizePx / 2,
                    marginTop: -p.sizePx / 2,
                    borderRadius: 9999,
                    background: '#e1ff00',
                    boxShadow: '0 0 10px rgba(225, 255, 0, 0.22)',
                    willChange: 'transform, opacity',
                  }}
                />
              )
            })}
          </AnimatePresence>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto overflow-x-hidden safe-top safe-bottom">
        <div className="px-4 pt-[100px] pb-32 max-w-[351px] mx-auto flex flex-col gap-6">
          <FlowHeader
            backLabel={backLabel}
            onBack={onBack}
          />

          <div className="flex flex-col gap-2 text-center">
            <div className="typography-h2 text-[#e1ff00]">
              <h2>{title}</h2>
            </div>
            {subtitle ? <div className="typography-body text-[#8a8a8a]">{subtitle}</div> : null}
          </div>

        <div className="flex flex-col items-center justify-center pt-4 pb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-[#e1ff00]/10 blur-[80px] rounded-full scale-150" aria-hidden="true" />
            <div ref={circleRef} className="relative w-[280px] h-[280px]">
              <div
                className="absolute inset-0 rounded-full border border-[#e1ff00]/40"
                style={{
                  transform: `scale(${pulseScale})`,
                  transition: phaseDurationMs > 0 ? `transform ${phaseDurationMs}ms linear` : undefined,
                  boxShadow: '0 0 40px rgba(225, 255, 0, 0.2)',
                }}
                aria-hidden="true"
              >
                <div className="absolute inset-0 rounded-full border-2 border-[#e1ff00]" />

                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                  aria-hidden="true"
                >
                  <circle cx="50" cy="50" r={ring.r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                  <circle
                    cx="50"
                    cy="50"
                    r={ring.r}
                    fill="none"
                    stroke="#e1ff00"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={ring.circumference}
                    strokeDashoffset={ring.dashoffset}
                    style={{ transition: 'stroke-dashoffset 900ms linear' }}
                  />
                </svg>
              </div>

              <div className="absolute inset-0 rounded-full flex items-center justify-center">
                <div className="relative text-center space-y-2">
                  {!running && phase !== 'done' ? (
                    <button
                      type="button"
                      onClick={startCycles}
                      className="text-3xl font-semibold text-white hover:opacity-90 active:opacity-80"
                    >
                      {startLabel}
                    </button>
                  ) : (
                    <>
                      {phase !== 'done' ? (
                        <>
                          <span className="text-7xl font-light text-white tabular-nums">{bigNumber}</span>
                          <div className="text-[#e1ff00] text-sm font-bold tracking-[0.2em] uppercase">{phaseLabel}</div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={resetCycles}
                          className="text-3xl font-semibold text-white hover:opacity-90 active:opacity-80"
                        >
                          {repeatLabel}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {tipText ? (
          <div className="mt-8 text-center max-w-[300px]">
            <div className="typography-body text-[#8a8a8a]">
              {tipText}
            </div>
          </div>
        ) : null}
        </div>

        </div>
      </div>

      <FixedBottomCta
        secondaryLabel={showBottomRepeat ? repeatLabel : undefined}
        onSecondary={showBottomRepeat ? resetCycles : undefined}
        secondaryAnimate
        primaryLabel={nextLabel}
        onPrimary={onNext}
        primaryDisabled={!canGoNext}
      />
    </BreatheShell>
  )
}

