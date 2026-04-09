import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from '@nanostores/react'
import { openPage, redirectPage } from '@nanostores/router'

import { $router } from '@/src/stores/router.store'
import { goBack } from '@/src/stores/navigation.store'
import { clearBackButtonOverride, setBackButtonOverride } from '@/src/stores/back-button-override.store'
import { Slider } from '@/components/ui/slider'
import { Brain, Eye, Pause, Wind } from 'lucide-react'
import { AnalyticsEvent, capture } from '@/utils/analytics/posthog'
import { rapidTechniquesFlowMessages } from '@/src/i18n/messages/rapidTechniquesFlow'
import { FixedBottomCta } from '@/components/rapid-techniques-flow/ui/FixedBottomCta'
import { FlowHeader } from '@/components/rapid-techniques-flow/ui/FlowHeader'
import { RapidFlowShell } from '@/components/rapid-techniques-flow/ui/RapidFlowShell'
import { RapidFlowScreenTransition } from '@/components/rapid-techniques-flow/ui/RapidFlowScreenTransition'

import {
  clearRapidTechniquesDraft,
  ensureRapidTechniquesDraft,
  getRapidTechniquesDraft,
  saveRapidTechniquesDraft,
} from '@/utils/rapidTechniquesFlowStorage'
import { completeRapidTechniquesFlow } from '@/utils/rapidTechniquesFlowStorage'
import { Step1StopFrame } from '@/components/rapid-techniques-flow/steps/Step1StopFrame'
import { Step2Breathing46 } from '@/components/rapid-techniques-flow/steps/Step2Breathing46'
import { Step3Grounding54321 } from '@/components/rapid-techniques-flow/steps/Step3Grounding54321'
import { Step4BrainDump } from '@/components/rapid-techniques-flow/steps/Step4BrainDump'
import { Step6ResultsSummary } from '@/components/rapid-techniques-flow/steps/Step6ResultsSummary'

const TECHNIQUE_ID = 'rapid_techniques_v1'

type StressStatusMap = Record<number, string>

function clampStep(n: number): number {
  if (!Number.isFinite(n)) return 0
  if (n < 0) return 0
  if (n > 8) return 8
  return n
}

function parseRouteStep(raw?: string): number {
  const n = Number(raw)
  return clampStep(Number.isFinite(n) ? n : 0)
}

function StressStep(props: {
  backLabel: string
  onBack?: () => void
  title: string
  subtitle: string
  value: number
  onChange: (v: number) => void
  onNext: () => void
  nextLabel: string
  heroImageSrc?: string
  heroEyebrow?: string
  heroTitle?: string
  heroExplainer?: string
  showTitleBlock?: boolean
  valueLabel?: string
  statusText?: string
  minLabel?: string
  maxLabel?: string
  featureTiles?: { icon: React.ReactNode; text: string }[]
}) {
  const {
    title,
    subtitle,
    value,
    onChange,
    onNext,
    nextLabel,
    backLabel,
    heroImageSrc,
    heroEyebrow,
    heroTitle,
    heroExplainer,
    showTitleBlock = true,
    valueLabel,
    statusText,
    minLabel,
    maxLabel,
    featureTiles,
    onBack,
  } = props
  return (
    <RapidFlowShell>
      <div className="flex-1 overflow-y-auto overflow-x-hidden safe-top safe-bottom">
        <div className="px-4 pt-[100px] pb-28 max-w-[351px] mx-auto flex flex-col gap-6">
          <FlowHeader backLabel={backLabel} onBack={onBack ?? goBack} />

          {heroImageSrc ? (
            <div className="relative w-full h-[180px] rounded-xl overflow-hidden bg-[rgba(217,217,217,0.04)] border border-white/5">
              <img
                alt=""
                src={heroImageSrc}
                className="w-full h-full object-cover mix-blend-luminosity opacity-40"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                {heroTitle ? <div className="text-3xl font-bold leading-tight tracking-tight text-white">{heroTitle}</div> : null}
              </div>
            </div>
          ) : null}

          {heroExplainer ? <div className="typography-body text-[#8a8a8a]">{heroExplainer}</div> : null}

          {showTitleBlock ? (
            <div className="flex flex-col gap-2">
              {title ? (
                <div className="typography-h2 text-[#e1ff00]">
                  <h2>{title}</h2>
                </div>
              ) : null}
              {subtitle ? <div className="typography-body text-[#8a8a8a]">{subtitle}</div> : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-start">
              <div className="typography-h1 text-[#e1ff00] tabular-nums">
                <div className="font-bold tracking-tight">{value}</div>
              </div>
              {statusText ? <div className="typography-body text-[#8a8a8a] font-bold mt-1">{statusText}</div> : null}
            </div>

            <div className="px-1">
              <Slider
                min={0}
                max={10}
                step={1}
                value={[value]}
                onValueChange={(vals) => onChange(Math.max(0, Math.min(10, vals?.[0] ?? 0)))}
                className={[
                  // Make it look like Stitch: thin track, neon thumb, subtle glow.
                  '[&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-[#2a2a2a]',
                  '[&_[data-slot=slider-range]]:bg-[#e1ff00]',
                  '[&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:bg-[#e1ff00] [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-[#111111]',
                  '[&_[data-slot=slider-thumb]]:shadow-[0_0_12px_rgba(225,255,0,0.35)]',
                ].join(' ')}
              />
              <div className="flex justify-between mt-3">
                <div className="flex flex-col items-start">
                  <div className="typography-caption text-[#8a8a8a] font-bold">0</div>
                  {minLabel ? <div className="typography-caption text-white">{minLabel}</div> : null}
                </div>
                <div className="flex flex-col items-end">
                  <div className="typography-caption text-[#8a8a8a] font-bold">10</div>
                  {maxLabel ? <div className="typography-caption text-white">{maxLabel}</div> : null}
                </div>
              </div>
            </div>
          </div>

          {Array.isArray(featureTiles) && featureTiles.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 pt-1">
              {featureTiles.slice(0, 4).map((tile, idx) => (
                <div
                  key={idx}
                  className="bg-[rgba(217,217,217,0.04)] border border-white/5 p-4 rounded-xl flex flex-col justify-between min-h-32"
                >
                  <div className="text-[#e1ff00]">{tile.icon}</div>
                  <div className="typography-body text-[#8a8a8a] leading-tight">{tile.text}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <FixedBottomCta primaryLabel={nextLabel} onPrimary={onNext} />
    </RapidFlowShell>
  )
}

export function RapidTechniquesFlowScreen() {
  const routerPage = useStore($router)
  const t = useStore(rapidTechniquesFlowMessages)
  const routeStepRaw = (routerPage?.params as any)?.step as string | undefined
  const routeStep = useMemo(() => parseRouteStep(routeStepRaw), [routeStepRaw])

  const effectiveStep = useMemo(() => {
    const d = getRapidTechniquesDraft()
    if (!d) return 0
    const maxAllowed = clampStep(d.step ?? 0)
    return Math.min(routeStep, maxAllowed)
  }, [routeStep])

  const [stressBeforeUi, setStressBeforeUi] = useState(5)
  const [stressAfterUi, setStressAfterUi] = useState(5)
  const [_stepDone, setStepDone] = useState<boolean>(false)

  const stressStatusMap: StressStatusMap | null = useMemo(() => {
    const raw = (t as any)?.stressStatusByValue as Record<string, string> | undefined
    if (!raw) return null
    const next: StressStatusMap = {} as any
    for (let i = 0; i <= 10; i += 1) {
      const v = raw[String(i)]
      if (typeof v === 'string') next[i] = v
    }
    return next
  }, [t])

  useEffect(() => {
    // Hydrate draft when entering flow from Home (step=0 deep link).
    if (routerPage?.route !== 'rapidTechniquesFlow') return

    const d = getRapidTechniquesDraft()
    if (!d) {
      // No draft: allow only step 0.
      if (routeStep !== 0) {
        redirectPage($router, 'rapidTechniquesFlow', { step: '0' })
      }
      // Fresh entry: default to neutral baseline.
      setStressBeforeUi(5)
      return
    }

    // Existing unfinished draft: entering again should start from the beginning.
    if (!d.completedAt && routeStep === 0) {
      clearRapidTechniquesDraft()
      setStressBeforeUi(5)
    }
  }, [routerPage?.route, routeStep])

  useEffect(() => {
    // Guards: clamp invalid step; prevent skipping forward.
    if (routerPage?.route !== 'rapidTechniquesFlow') return

    const raw = (routerPage?.params as any)?.step
    const parsed = parseRouteStep(raw)
    if (String(parsed) !== String(raw)) {
      redirectPage($router, 'rapidTechniquesFlow', { step: String(parsed) })
      return
    }

    const d = getRapidTechniquesDraft()
    if (!d) {
      if (parsed !== 0) redirectPage($router, 'rapidTechniquesFlow', { step: '0' })
      return
    }
    const maxAllowed = clampStep(d.step ?? 0)
    if (parsed > maxAllowed) {
      redirectPage($router, 'rapidTechniquesFlow', { step: String(maxAllowed) })
    }
  }, [routerPage?.route, routerPage?.params])

  useEffect(() => {
    setStepDone(false)
    if (effectiveStep === 0) {
      const d = getRapidTechniquesDraft()
      if (typeof d?.stressBefore === 'number') setStressBeforeUi(d.stressBefore)
    }
    if (effectiveStep === 8) {
      const d = getRapidTechniquesDraft()
      if (typeof d?.stressAfter === 'number') setStressAfterUi(d.stressAfter)
    }
  }, [effectiveStep])

  const goToStep = (step: number) => {
    openPage($router, 'rapidTechniquesFlow', { step: String(clampStep(step)) })
  }

  const ensureDraftAndStart = () => {
    const created = ensureRapidTechniquesDraft(TECHNIQUE_ID)
    if (created.wasCreated) {
      setStressBeforeUi(5)
      setStressAfterUi(5)
      capture(AnalyticsEvent.RAPID_FLOW_STARTED, { techniqueId: TECHNIQUE_ID, startedAt: created.draft.startedAt })
    }
    return created.draft
  }

  const onBack = useCallback(() => {
    // Skipped steps 5–7 in the happy path: adjust back navigation.
    if (effectiveStep === 8) {
      goToStep(4)
      return
    }
    if (effectiveStep === 6) {
      goToStep(8)
      return
    }
    if (effectiveStep > 0) {
      goToStep(effectiveStep - 1)
      return
    }
    // Leaving the flow without completion: best-effort dropped signal.
    const d = getRapidTechniquesDraft()
    if (d && !d.completedAt) {
      capture(AnalyticsEvent.RAPID_FLOW_DROPPED, { techniqueId: TECHNIQUE_ID, step: effectiveStep, reason: 'back_to_previous' })
    }
    goBack()
  }, [effectiveStep])

  useEffect(() => {
    // Override global Telegram BackButton handler while inside the flow,
    // so "Back" moves between steps instead of exiting the flow.
    setBackButtonOverride({ isVisible: true, onBack })
    return () => {
      clearBackButtonOverride()
    }
  }, [onBack])

  if (routerPage?.route !== 'rapidTechniquesFlow') return null

  // Legacy / deep links: post-cycle screen removed (was duplicate stress rating).
  if (effectiveStep === 5) {
    redirectPage($router, 'rapidTechniquesFlow', { step: '8' })
    return null
  }
  // Old wrap-up before final stress; no longer used.
  if (effectiveStep === 7) {
    redirectPage($router, 'rapidTechniquesFlow', { step: '8' })
    return null
  }

  let flowContent: React.ReactNode

  if (effectiveStep === 0) {
    const status = stressStatusMap?.[stressBeforeUi] ?? ''
    flowContent = (
      <StressStep
        backLabel={t.back}
        onBack={onBack}
        heroImageSrc="/assets/rapid-techniques-flow/hero-waves.jpg"
        heroEyebrow={(t as any).heroEyebrow}
        heroTitle={(t as any).heroTitle}
        heroExplainer={[(t as any).heroExplainer, t.stressBeforeSubtitle].filter((x) => typeof x === 'string' && x.length > 0).join(' ')}
        showTitleBlock={false}
        title=""
        subtitle=""
        value={stressBeforeUi}
        onChange={setStressBeforeUi}
        valueLabel={(t as any).currentLevelLabel}
        statusText={status}
        minLabel={(t as any).stressMinLabel}
        maxLabel={(t as any).stressMaxLabel}
        featureTiles={
          [
            { icon: <Pause className="w-6 h-6" />, text: (t as any).startTiles?.stopFrame },
            { icon: <Wind className="w-6 h-6" />, text: (t as any).startTiles?.breathing46 },
            { icon: <Eye className="w-6 h-6" />, text: (t as any).startTiles?.grounding54321 },
            { icon: <Brain className="w-6 h-6" />, text: (t as any).startTiles?.brainDump },
          ].filter((x) => typeof x.text === 'string' && x.text.length > 0) as any
        }
        onNext={() => {
          const d = ensureDraftAndStart()
          const next = 1
          saveRapidTechniquesDraft({ ...d, step: next, stressBefore: stressBeforeUi })
          goToStep(next)
        }}
        nextLabel={t.start}
      />
    )
  } else if (effectiveStep >= 1 && effectiveStep <= 7) {
    const progress = String(t.stepXof7).replace('{step}', String(effectiveStep))
    const draft = getRapidTechniquesDraft()

    if (effectiveStep === 1) {
      flowContent = (
        <Step1StopFrame
          backLabel={t.back}
          nextLabel={t.next}
          onBack={onBack}
          onNext={() => {
            const d = ensureDraftAndStart()
            saveRapidTechniquesDraft({ ...d, stopFrameDone: true, step: Math.max(d.step, 2) })
            capture(AnalyticsEvent.RAPID_FLOW_STEP_COMPLETED, { techniqueId: TECHNIQUE_ID, step: 1, durationMs: 10_000 })
            goToStep(2)
          }}
          onDoneChange={setStepDone}
          title={t.steps.stopFrameTitle}
          subtitle={t.steps.stopFrameSubtitle}
          progressText={progress}
          initialDone={!!draft?.stopFrameDone}
        />
      )
    } else if (effectiveStep === 2) {
      flowContent = (
        <Step2Breathing46
          backLabel={t.back}
          nextLabel={t.next}
          onBack={onBack}
          onNext={() => {
            const d = ensureDraftAndStart()
            saveRapidTechniquesDraft({ ...d, breathing46CompletedCycles: 3, step: Math.max(d.step, 3) })
            capture(AnalyticsEvent.RAPID_FLOW_STEP_COMPLETED, { techniqueId: TECHNIQUE_ID, step: 2, cyclesCompleted: 3 })
            goToStep(3)
          }}
          title={t.steps.breathing46Title}
          subtitle={t.steps.breathing46Subtitle}
          progressText={progress}
          initialCompletedCycles={draft?.breathing46CompletedCycles ?? 0}
          onCompletedCyclesChange={(cycles) => {
            const d = ensureDraftAndStart()
            saveRapidTechniquesDraft({ ...d, breathing46CompletedCycles: cycles, step: Math.max(d.step, 2) })
            setStepDone(cycles >= 3)
          }}
        />
      )
    } else if (effectiveStep === 3) {
      flowContent = (
        <Step3Grounding54321
          backLabel={t.back}
          nextLabel={t.next}
          onBack={onBack}
          onNext={() => {
            const d = ensureDraftAndStart()
            saveRapidTechniquesDraft({ ...d, step: Math.max(d.step, 4) })
            capture(AnalyticsEvent.RAPID_FLOW_STEP_COMPLETED, { techniqueId: TECHNIQUE_ID, step: 3 })
            goToStep(4)
          }}
          title={t.steps.groundingTitle}
          subtitle={t.steps.groundingSubtitle}
          progressText={progress}
          initialCompletedCount={draft?.groundingCompletedCount ?? 0}
          onCompletedCountChange={(count) => {
            const d = ensureDraftAndStart()
            saveRapidTechniquesDraft({ ...d, groundingCompletedCount: count, step: Math.max(d.step, 3) })
            setStepDone(count >= 5)
          }}
        />
      )
    } else if (effectiveStep === 4) {
      flowContent = (
        <Step4BrainDump
          backLabel={t.back}
          nextLabel={t.next}
          onBack={onBack}
          onNext={() => {
            const d = ensureDraftAndStart()
            saveRapidTechniquesDraft({ ...d, step: Math.max(d.step, 8) })
            capture(AnalyticsEvent.RAPID_FLOW_STEP_COMPLETED, { techniqueId: TECHNIQUE_ID, step: 4 })
            goToStep(8)
          }}
          title={t.steps.brainDumpTitle}
          subtitle={t.steps.brainDumpSubtitle}
          progressText={progress}
          initialValues={{
            mode: draft?.brainDumpMode as any,
            subStep: draft?.brainDumpSubStep as any,
            timerSec: draft?.brainDumpTimerSec,
            now: draft?.brainDumpNow ?? '',
            gentleState: draft?.brainDumpGentleState ?? '',
            gentleSource: draft?.brainDumpGentleSource ?? '',
            gentleNote: draft?.brainDumpGentleNote ?? '',
            oneStep: draft?.brainDumpOneStep ?? '',
            wait: draft?.brainDumpWait ?? '',
            noControl: draft?.brainDumpNoControl ?? '',
          }}
          onChange={(v) => {
            const d = ensureDraftAndStart()
            saveRapidTechniquesDraft({
              ...d,
              brainDumpMode: v.mode,
              brainDumpSubStep: v.subStep,
              brainDumpTimerSec: v.timerSec,
              brainDumpNow: v.now,
              brainDumpGentleState: v.gentleState,
              brainDumpGentleSource: v.gentleSource,
              brainDumpGentleNote: v.gentleNote,
              brainDumpOneStep: v.oneStep,
              brainDumpWait: v.wait,
              brainDumpNoControl: v.noControl,
              step: Math.max(d.step, 4),
            })
            setStepDone(true)
          }}
          uiText={(t as any).brainDump}
        />
      )
    } else if (effectiveStep === 6) {
      const stressBefore = typeof draft?.stressBefore === 'number' ? draft.stressBefore : null
      const stressAfter = typeof draft?.stressAfter === 'number' ? draft.stressAfter : null
      flowContent = (
        <Step6ResultsSummary
          backLabel={t.back}
          nextLabel={t.next}
          onBack={onBack}
          onNext={() => {
            clearRapidTechniquesDraft()
            setStressBeforeUi(5)
            capture(AnalyticsEvent.RAPID_FLOW_STEP_COMPLETED, { techniqueId: TECHNIQUE_ID, step: 6 })
            goToStep(0)
          }}
          title={t.steps.summaryTitle}
          subtitle={t.steps.summarySubtitle}
          progressText={progress}
          stressBefore={stressBefore}
          stressAfter={stressAfter}
        />
      )
    } else {
      flowContent = null
    }
  } else {
    // step 8
    flowContent = (
      <StressStep
        backLabel={t.back}
        onBack={onBack}
        title={t.stressAfterTitle}
        subtitle={t.stressAfterSubtitle}
        value={stressAfterUi}
        onChange={setStressAfterUi}
        onNext={() => {
          const d = ensureDraftAndStart()
          saveRapidTechniquesDraft({ ...d, step: Math.max(d.step, 8), stressAfter: stressAfterUi })
          const done = completeRapidTechniquesFlow({ ...d, step: 8, stressAfter: stressAfterUi })
          if (done) {
            capture(AnalyticsEvent.RAPID_FLOW_COMPLETED, {
              techniqueId: TECHNIQUE_ID,
              stress_before: done.stressBefore,
              stress_after: done.stressAfter,
              durationMs: done.durationMs,
            })
          }
          goToStep(6)
        }}
        nextLabel={t.finish}
      />
    )
  }

  return <RapidFlowScreenTransition stepKey={effectiveStep}>{flowContent}</RapidFlowScreenTransition>
}

