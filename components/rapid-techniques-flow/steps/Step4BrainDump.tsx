import React, { useEffect, useMemo, useRef, useState } from 'react'

import { FlowHeader } from '@/components/rapid-techniques-flow/ui/FlowHeader'
import { RapidFlowShell } from '@/components/rapid-techniques-flow/ui/RapidFlowShell'
import { FixedBottomCta } from '@/components/rapid-techniques-flow/ui/FixedBottomCta'

export type Step4BrainDumpMode = 'readyToWrite' | 'hardToWrite'
export type Step4BrainDumpSubStep = 'mode' | 'dump' | 'gentle' | 'sort' | 'result'

export type Step4BrainDumpValues = {
  mode?: Step4BrainDumpMode
  subStep?: Step4BrainDumpSubStep
  timerSec?: number
  now: string
  gentleState?: string
  gentleSource?: string
  gentleNote?: string
  oneStep: string
  wait: string
  noControl?: string
}

export type Step4BrainDumpProps = {
  backLabel: string
  nextLabel: string
  onBack: () => void
  onNext: () => void
  title: string
  subtitle?: string
  progressText?: string
  initialValues?: Partial<Step4BrainDumpValues>
  onChange?: (v: Step4BrainDumpValues) => void
  uiText: {
    eyebrow: string
    helperLine: string

    modeTitle: string
    modeSubtitle: string
    modeReadyLabel: string
    modeHardLabel: string
    modeContinueLabel: string

    timerLabel: string
    timerOption3: string
    timerOption5: string
    timerOption10: string
    timerStartLabel: string
    timerDoneLabel: string
    timerSkipLabel: string
    stuckHint: string

    promptChips: string[]

    gentleStateLabel: string
    gentleSourceLabel: string
    gentleOptionalNoteLabel: string
    gentleOptionalNotePlaceholder: string
    gentleContinueLabel: string
    gentleStates: { id: string; label: string }[]
    gentleSources: { id: string; label: string }[]

    sortTitle: string
    sortSubtitle: string
    sortNowLabel: string
    sortNowPlaceholder: string
    sortOneStepLabel: string
    sortOneStepPlaceholder: string
    sortWaitLabel: string
    sortWaitPlaceholder: string
    sortNoControlLabel: string
    sortNoControlPlaceholder: string
    sortBuildResultLabel: string

    resultTitle: string
    resultEditLabel: string
  }
}

export function Step4BrainDump(props: Step4BrainDumpProps) {
  const { backLabel, nextLabel, onBack, onNext, title, subtitle, progressText, initialValues, onChange, uiText } = props

  const [mode, setMode] = useState<Step4BrainDumpMode | undefined>(initialValues?.mode)
  const [subStep, setSubStep] = useState<Step4BrainDumpSubStep>(initialValues?.subStep ?? 'mode')

  const [timerSec, setTimerSec] = useState<number>(initialValues?.timerSec ?? 3 * 60)
  const [timerRunning, setTimerRunning] = useState<boolean>(false)
  const [timerLeft, setTimerLeft] = useState<number>(timerSec)
  const intervalRef = useRef<number | null>(null)

  const [now, setNow] = useState(initialValues?.now ?? '')
  const [gentleState, setGentleState] = useState<string>(initialValues?.gentleState ?? '')
  const [gentleSource, setGentleSource] = useState<string>(initialValues?.gentleSource ?? '')
  const [gentleNote, setGentleNote] = useState<string>(initialValues?.gentleNote ?? '')

  const [oneStep, setOneStep] = useState(initialValues?.oneStep ?? '')
  const [wait, setWait] = useState(initialValues?.wait ?? '')
  const [noControl, setNoControl] = useState(initialValues?.noControl ?? '')

  const hasAnyCapture = useMemo(() => {
    return (
      now.trim().length > 0 ||
      gentleState.trim().length > 0 ||
      gentleSource.trim().length > 0 ||
      gentleNote.trim().length > 0
    )
  }, [gentleNote, gentleSource, gentleState, now])

  const ensureCaptureDraft = () => {
    if (now.trim().length > 0) return
    if (gentleState.trim().length === 0 && gentleSource.trim().length === 0 && gentleNote.trim().length === 0) return
    const parts: string[] = []
    if (gentleState.trim().length > 0) parts.push(`Сейчас я чувствую: ${gentleState}.`)
    if (gentleSource.trim().length > 0) parts.push(`Больше всего напрягает: ${gentleSource}.`)
    if (gentleNote.trim().length > 0) parts.push(gentleNote.trim())
    setNow(parts.join(' '))
  }

  useEffect(() => {
    onChange?.({
      mode,
      subStep,
      timerSec,
      now,
      gentleState,
      gentleSource,
      gentleNote,
      oneStep,
      wait,
      noControl,
    })
  }, [gentleNote, gentleSource, gentleState, mode, noControl, now, onChange, oneStep, subStep, timerSec, wait])

  useEffect(() => {
    if (!timerRunning) return

    if (intervalRef.current) window.clearInterval(intervalRef.current)
    intervalRef.current = window.setInterval(() => {
      setTimerLeft((s) => Math.max(0, s - 1))
    }, 1000)

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [timerRunning])

  useEffect(() => {
    if (!timerRunning) return
    if (timerLeft > 0) return
    setTimerRunning(false)
  }, [timerLeft, timerRunning])

  useEffect(() => {
    if (timerRunning) return
    setTimerLeft(timerSec)
  }, [timerRunning, timerSec])

  useEffect(() => {
    // If we have any previous content, skip the initial "mode" screen on resume.
    if (subStep !== 'mode') return
    const shouldAutoAdvance = hasAnyCapture || oneStep.trim().length > 0 || wait.trim().length > 0 || noControl.trim().length > 0
    if (!shouldAutoAdvance) return
    setSubStep('sort')
  }, [hasAnyCapture, noControl, oneStep, subStep, wait])

  const goBackInternal = () => {
    if (subStep === 'result') return setSubStep('sort')
    if (subStep === 'sort') return setSubStep(mode === 'hardToWrite' ? 'gentle' : 'dump')
    if (subStep === 'dump' || subStep === 'gentle') return setSubStep('mode')
    return onBack()
  }

  const goNextFromMode = () => {
    if (!mode) return
    setSubStep(mode === 'hardToWrite' ? 'gentle' : 'dump')
  }

  const chipBase =
    'text-sm px-5 py-2.5 rounded-full border border-white/5 transition-colors active:scale-[0.99] duration-200'

  const cardBase =
    'rounded-2xl p-4 flex items-center gap-4 border bg-[rgba(217,217,217,0.04)] border-white/5 hover:border-white/10 active:scale-[0.99] transition-transform'

  return (
    <RapidFlowShell>
      <div className="flex-1 overflow-y-auto overflow-x-hidden safe-top safe-bottom">
        <div className="px-4 pt-[100px] pb-32 max-w-[351px] mx-auto flex flex-col gap-6">
          <FlowHeader
            backLabel={backLabel}
            onBack={goBackInternal}
            right={progressText ? <div className="text-sm text-[#8a8a8a]">{progressText}</div> : undefined}
          />

          <div className="flex flex-col gap-2">
            <div className="typography-h2 text-[#e1ff00]">
              <h2>{title}</h2>
            </div>
            {subtitle ? <div className="typography-body text-[#8a8a8a]">{subtitle}</div> : null}
            <div className="typography-body text-[#8a8a8a]">{uiText.helperLine}</div>
          </div>

          {subStep === 'mode' ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="text-white font-bold text-lg">{uiText.modeTitle}</div>
                <div className="typography-body text-[#8a8a8a]">{uiText.modeSubtitle}</div>
              </div>

              <button
                type="button"
                onClick={() => setMode('readyToWrite')}
                aria-pressed={mode === 'readyToWrite'}
                className={[cardBase, mode === 'readyToWrite' ? 'border-[#e1ff00]/30 bg-[rgba(217,217,217,0.06)]' : ''].join(
                  ' ',
                )}
              >
                <div className={['w-10 h-10 rounded-xl flex items-center justify-center', mode === 'readyToWrite' ? 'bg-[#e1ff00] text-[#111111]' : 'bg-[#e1ff00]/10 text-[#e1ff00]'].join(' ')}>
                  <span className="text-lg font-bold">A</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-bold">{uiText.modeReadyLabel}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('hardToWrite')}
                aria-pressed={mode === 'hardToWrite'}
                className={[cardBase, mode === 'hardToWrite' ? 'border-[#e1ff00]/30 bg-[rgba(217,217,217,0.06)]' : ''].join(
                  ' ',
                )}
              >
                <div className={['w-10 h-10 rounded-xl flex items-center justify-center', mode === 'hardToWrite' ? 'bg-[#e1ff00] text-[#111111]' : 'bg-[#e1ff00]/10 text-[#e1ff00]'].join(' ')}>
                  <span className="text-lg font-bold">B</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-bold">{uiText.modeHardLabel}</div>
                </div>
              </button>
            </div>
          ) : null}

          {subStep === 'dump' ? (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold tracking-widest uppercase text-white/50">{uiText.timerLabel}</div>
                <div className="text-sm font-bold text-[#e1ff00] tabular-nums">
                  {timerRunning ? `${Math.floor(timerLeft / 60)}:${String(timerLeft % 60).padStart(2, '0')}` : `${Math.floor(timerSec / 60)}:00`}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { sec: 3 * 60, label: uiText.timerOption3 },
                  { sec: 5 * 60, label: uiText.timerOption5 },
                  { sec: 10 * 60, label: uiText.timerOption10 },
                ].map((opt) => {
                  const active = opt.sec === timerSec
                  return (
                    <button
                      key={opt.sec}
                      type="button"
                      disabled={timerRunning}
                      onClick={() => {
                        if (timerRunning) return
                        setTimerSec(opt.sec)
                      }}
                      className={[chipBase, active ? 'bg-[#e1ff00] text-[#111111]' : 'bg-[rgba(217,217,217,0.04)] text-[#8a8a8a]', timerRunning ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-white/10'].join(' ')}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {uiText.promptChips.slice(0, 6).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      const next = now.trim().length === 0 ? `${chip} ` : `${now.trimEnd()}\n${chip} `
                      setNow(next)
                    }}
                    className={[chipBase, 'bg-[rgba(217,217,217,0.04)] text-white/80 hover:border-white/10 cursor-pointer'].join(' ')}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="group">
                <label className="block text-white/50 text-xs font-bold tracking-widest uppercase mb-3">
                  {uiText.sortNowLabel}
                </label>
                <div className="border-l-2 border-[#e1ff00] bg-white/5 p-4">
                  <textarea
                    value={now}
                    onChange={(e) => setNow(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white placeholder-white/20 resize-none text-lg p-0 leading-relaxed"
                    placeholder={uiText.sortNowPlaceholder}
                    rows={8}
                  />
                </div>
              </div>

              <div className="typography-body text-[#8a8a8a]">{uiText.stuckHint}</div>
            </div>
          ) : null}

          {subStep === 'gentle' ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="text-white font-bold text-lg">{uiText.gentleStateLabel}</div>
                <div className="flex flex-wrap gap-2">
                  {uiText.gentleStates.map((s) => {
                    const active = s.id === gentleState
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setGentleState(active ? '' : s.id)}
                        className={[
                          chipBase,
                          active ? 'bg-[#e1ff00] text-[#111111]' : 'bg-[rgba(217,217,217,0.04)] text-[#8a8a8a] hover:border-white/10',
                        ].join(' ')}
                      >
                        {s.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-white font-bold text-lg">{uiText.gentleSourceLabel}</div>
                <div className="flex flex-wrap gap-2">
                  {uiText.gentleSources.map((s) => {
                    const active = s.id === gentleSource
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setGentleSource(active ? '' : s.id)}
                        className={[
                          chipBase,
                          active ? 'bg-[#e1ff00] text-[#111111]' : 'bg-[rgba(217,217,217,0.04)] text-[#8a8a8a] hover:border-white/10',
                        ].join(' ')}
                      >
                        {s.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="group">
                <label className="block text-white/50 text-xs font-bold tracking-widest uppercase mb-3">
                  {uiText.gentleOptionalNoteLabel}
                </label>
                <div className="border-l border-white/20 bg-white/5 p-4 focus-within:border-[#e1ff00] transition-colors">
                  <input
                    value={gentleNote}
                    onChange={(e) => setGentleNote(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white placeholder-white/20 text-lg p-0"
                    placeholder={uiText.gentleOptionalNotePlaceholder}
                    type="text"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {subStep === 'sort' ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="text-white font-bold text-lg">{uiText.sortTitle}</div>
                <div className="typography-body text-[#8a8a8a]">{uiText.sortSubtitle}</div>
              </div>

              <div className="group">
                <label className="block text-white/50 text-xs font-bold tracking-widest uppercase mb-3">{uiText.sortNowLabel}</label>
                <div className="border-l border-white/20 bg-white/5 p-4 focus-within:border-[#e1ff00] transition-colors">
                  <textarea
                    value={now}
                    onChange={(e) => setNow(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white placeholder-white/20 resize-none text-lg p-0 leading-relaxed"
                    placeholder={uiText.sortNowPlaceholder}
                    rows={4}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-white/50 text-xs font-bold tracking-widest uppercase mb-3">{uiText.sortOneStepLabel}</label>
                <div className="border-l border-white/20 bg-white/5 p-4 focus-within:border-[#e1ff00] transition-colors">
                  <input
                    value={oneStep}
                    onChange={(e) => setOneStep(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white placeholder-white/20 text-lg p-0"
                    placeholder={uiText.sortOneStepPlaceholder}
                    type="text"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-white/50 text-xs font-bold tracking-widest uppercase mb-3">{uiText.sortWaitLabel}</label>
                <div className="border-l border-white/20 bg-white/5 p-4 focus-within:border-[#e1ff00] transition-colors">
                  <input
                    value={wait}
                    onChange={(e) => setWait(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white placeholder-white/20 text-lg p-0"
                    placeholder={uiText.sortWaitPlaceholder}
                    type="text"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-white/50 text-xs font-bold tracking-widest uppercase mb-3">{uiText.sortNoControlLabel}</label>
                <div className="border-l border-white/20 bg-white/5 p-4 focus-within:border-[#e1ff00] transition-colors">
                  <input
                    value={noControl}
                    onChange={(e) => setNoControl(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white placeholder-white/20 text-lg p-0"
                    placeholder={uiText.sortNoControlPlaceholder}
                    type="text"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {subStep === 'result' ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between">
                <div className="typography-h2 text-[#e1ff00]">
                  <h2>{uiText.resultTitle}</h2>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="rounded-2xl p-4 border border-white/5 bg-[rgba(217,217,217,0.04)]">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#8a8a8a] mb-1">{uiText.sortOneStepLabel}</div>
                  <div className="text-white font-bold">{oneStep.trim().length > 0 ? oneStep : '—'}</div>
                </div>

                <div className="rounded-2xl p-4 border border-white/5 bg-[rgba(217,217,217,0.04)]">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#8a8a8a] mb-1">{uiText.sortWaitLabel}</div>
                  <div className="text-white font-bold">{wait.trim().length > 0 ? wait : '—'}</div>
                </div>

                <div className="rounded-2xl p-4 border border-white/5 bg-[rgba(217,217,217,0.04)]">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#8a8a8a] mb-1">{uiText.sortNoControlLabel}</div>
                  <div className="text-white font-bold">{noControl.trim().length > 0 ? noControl : '—'}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {subStep === 'mode' ? (
        <FixedBottomCta primaryLabel={uiText.modeContinueLabel} onPrimary={goNextFromMode} primaryDisabled={!mode} />
      ) : null}

      {subStep === 'dump' ? (
        <FixedBottomCta
          secondaryLabel={uiText.timerSkipLabel}
          onSecondary={() => {
            setTimerRunning(false)
            setTimerLeft(timerSec)
            setSubStep('sort')
          }}
          primaryLabel={timerRunning ? uiText.timerDoneLabel : uiText.timerStartLabel}
          onPrimary={() => {
            if (!timerRunning) {
              setTimerLeft(timerSec)
              setTimerRunning(true)
              return
            }
            setTimerRunning(false)
            setSubStep('sort')
          }}
          primaryDisabled={false}
        />
      ) : null}

      {subStep === 'gentle' ? (
        <FixedBottomCta
          primaryLabel={uiText.gentleContinueLabel}
          onPrimary={() => {
            ensureCaptureDraft()
            setSubStep('sort')
          }}
          primaryDisabled={!hasAnyCapture}
        />
      ) : null}

      {subStep === 'sort' ? (
        <FixedBottomCta
          primaryLabel={uiText.sortBuildResultLabel}
          onPrimary={() => {
            ensureCaptureDraft()
            setSubStep('result')
          }}
          primaryDisabled={!hasAnyCapture && oneStep.trim().length === 0 && wait.trim().length === 0 && noControl.trim().length === 0}
        />
      ) : null}

      {subStep === 'result' ? (
        <FixedBottomCta
          secondaryLabel={uiText.resultEditLabel}
          onSecondary={() => setSubStep('sort')}
          primaryLabel={nextLabel}
          onPrimary={onNext}
          primaryDisabled={false}
        />
      ) : null}
    </RapidFlowShell>
  )
}

