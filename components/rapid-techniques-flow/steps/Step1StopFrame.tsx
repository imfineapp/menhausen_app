import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { FixedBottomCta } from '@/components/rapid-techniques-flow/ui/FixedBottomCta'
import { FlowHeader } from '@/components/rapid-techniques-flow/ui/FlowHeader'
import { RapidFlowShell } from '@/components/rapid-techniques-flow/ui/RapidFlowShell'
import { locale } from '@/src/i18n/setup'

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

type Particle = {
  id: string
  originX: number
  originY: number
  angleRad: number
  distancePx: number
  sizePx: number
  durationMs: number
  startOpacity: number
  driftPx: number
}

function ruPlural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n)
  const mod100 = abs % 100
  if (mod100 >= 11 && mod100 <= 14) return many
  const mod10 = abs % 10
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

export function Step1StopFrame(props: Step1StopFrameProps) {
  const { backLabel, nextLabel, onBack, onNext, onDoneChange, title, subtitle, progressText, initialDone } = props
  const currentLocale = useStore(locale)
  const DURATION_OPTIONS = useMemo(() => [10, 30, 60] as const, [])
  const [durationSec, setDurationSec] = useState<(typeof DURATION_OPTIONS)[number]>(10)
  const [state, setState] = useState<TimerState>(initialDone ? 'done' : 'idle')
  const [remaining, setRemaining] = useState<number>(initialDone ? 0 : durationSec)
  const startedAtRef = useRef<number | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const [particles, setParticles] = useState<Particle[]>([])
  const spawnTimeoutRef = useRef<number | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const done = state === 'done'
  const isRunning = state === 'running'

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

  useEffect(() => {
    if (shouldReduceMotion) return

    if (!isRunning) {
      // Stop emitting and clear existing particles when timer is not running.
      if (spawnTimeoutRef.current) window.clearTimeout(spawnTimeoutRef.current)
      spawnTimeoutRef.current = null
      setParticles([])
      return
    }

    let cancelled = false

    const scheduleNext = () => {
      if (cancelled) return
      // Slow + organic: random cadence.
      const nextInMs = 40 + Math.random() * 120
      spawnTimeoutRef.current = window.setTimeout(() => {
        if (cancelled) return

      const rect = buttonRef.current?.getBoundingClientRect?.()
      const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
      const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2

        const angleRad = Math.random() * Math.PI * 2
      const distancePx = 180 + Math.random() * 460
      const sizePx = 1 + Math.random() * 3.5
      const durationMs = 4200 + Math.random() * 3200
      const startOpacity = 0.10 + Math.random() * 0.22
      const driftPx = -8 + Math.random() * 16

        const p: Particle = {
          id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        originX,
        originY,
          angleRad,
          distancePx,
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
  }, [isRunning, shouldReduceMotion])

  const ringProgress = useMemo(() => {
    const total = durationSec
    const p = total > 0 ? (total - remaining) / total : 0
    return Math.max(0, Math.min(1, p))
  }, [durationSec, remaining])

  const ring = useMemo(() => {
    // SVG ring uses stroke-dashoffset for smooth animation.
    // Keep geometry stable; only offset changes.
    const r = 45
    const circumference = 2 * Math.PI * r
    const dashoffset = (1 - ringProgress) * circumference
    return { r, circumference, dashoffset }
  }, [ringProgress])

  const mainLabel = useMemo(() => {
    if (state === 'running') return String(remaining)
    // In idle and done states we show the selected cycle duration (in seconds).
    return String(durationSec)
  }, [durationSec, remaining, state])

  const unitLabel = useMemo(() => {
    const n = state === 'running' ? remaining : durationSec
    // We intentionally display everything in seconds (10/30/60),
    // even if the picker label says "1 минута".
    const unit = 'second'

    if (currentLocale === 'ru') {
      return ruPlural(n, 'секунда', 'секунды', 'секунд')
    }

    // en (fallback)
    return n === 1 ? 'second' : 'seconds'
  }, [currentLocale, durationSec, remaining, state])

  const start = () => {
    startedAtRef.current = Date.now()
    setRemaining(durationSec)
    setState('running')
  }

  const restart = () => {
    start()
  }

  return (
    <RapidFlowShell>
      {!shouldReduceMotion ? (
        <div className="fixed inset-0 pointer-events-none z-10">
          <AnimatePresence>
            {particles.map((p) => {
              const x = Math.cos(p.angleRad) * p.distancePx
              const y = Math.sin(p.angleRad) * p.distancePx
              return (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{ opacity: [0, p.startOpacity, 0], x: x + p.driftPx, y }}
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
        <div className="px-4 pt-[100px] pb-28 max-w-[351px] mx-auto flex flex-col gap-6">
          <FlowHeader
            backLabel={backLabel}
            onBack={onBack}
            right={progressText ? <div className="text-sm text-[#8a8a8a]">{progressText}</div> : undefined}
          />

          <div className="flex flex-col gap-2 text-center">
            <div className="typography-h2 text-[#e1ff00]">
              <h2>{title}</h2>
            </div>
            <div className="typography-body text-[#8a8a8a]">
              Стоп‑кадр — это короткая пауза, чтобы прервать «автопилот» и вернуть внимание в текущий момент.
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative">
              <div className="absolute -inset-8 bg-[#e1ff00]/10 blur-3xl rounded-full" aria-hidden="true" />
              <div className="relative w-[260px] h-[260px] rounded-full flex items-center justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                  aria-hidden="true"
                >
                  <circle cx="50" cy="50" r={ring.r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    r={ring.r}
                    fill="none"
                    stroke="#e1ff00"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={ring.circumference}
                    strokeDashoffset={ring.dashoffset}
                    style={{ transition: 'stroke-dashoffset 900ms linear' }}
                  />
                </svg>

                <div className="w-[240px] h-[240px] rounded-full bg-[#111111] flex items-center justify-center">
                  <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => {
                      if (state === 'idle') start()
                      else if (state === 'running') restart()
                      else restart()
                    }}
                    className="w-[184px] h-[184px] rounded-full bg-[#e1ff00] text-[#111111] flex flex-col items-center justify-center active:scale-95 transition-transform shadow-[0_0_50px_rgba(225,255,0,0.15)]"
                  >
                    <span className="relative h-[56px] flex items-center justify-center">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={mainLabel}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="text-5xl font-bold tracking-tight tabular-nums inline-block w-[3ch] text-center"
                        >
                          {mainLabel}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    {unitLabel ? <span className="text-xs uppercase font-bold tracking-[0.2em] mt-2">{unitLabel}</span> : null}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2">
              {DURATION_OPTIONS.map((sec) => {
                const active = sec === durationSec
                return (
                  <button
                    key={sec}
                    type="button"
                    disabled={isRunning}
                    onClick={() => {
                      if (isRunning) return
                      setDurationSec(sec)
                      if (state === 'idle') setRemaining(sec)
                    }}
                    className={[
                      'text-sm px-5 py-2.5 rounded-full border border-white/5 transition-colors',
                      active ? 'bg-[#e1ff00] text-[#111111]' : 'bg-[rgba(217,217,217,0.04)] text-[#8a8a8a]',
                      isRunning ? 'opacity-60 cursor-not-allowed' : 'hover:border-white/10',
                    ].join(' ')}
                  >
                    {sec === 60 ? '1 минута' : `${sec} сек`}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <FixedBottomCta primaryLabel={nextLabel} onPrimary={onNext} primaryDisabled={!done} />
    </RapidFlowShell>
  )
}

