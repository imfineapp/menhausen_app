import React, { useEffect, useMemo, useState } from 'react'
import { useStore } from '@nanostores/react'
import { openPage, redirectPage } from '@nanostores/router'

import { $router } from '@/src/stores/router.store'
import { goBack } from '@/src/stores/navigation.store'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AnalyticsEvent, capture } from '@/utils/analytics/posthog'
import { rapidTechniquesFlowMessages } from '@/src/i18n/messages/rapidTechniquesFlow'

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
import { Step5PostCycleAssessment } from '@/components/rapid-techniques-flow/steps/Step5PostCycleAssessment'
import { Step6ResultsSummary } from '@/components/rapid-techniques-flow/steps/Step6ResultsSummary'
import { Step7WrapUp } from '@/components/rapid-techniques-flow/steps/Step7WrapUp'

const TECHNIQUE_ID = 'rapid_techniques_v1'

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
}) {
  const { title, subtitle, value, onChange, onNext, nextLabel, backLabel, heroImageSrc, heroEyebrow, heroTitle, onBack } = props
  return (
    <div className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden safe-top safe-bottom">
      <div className="px-4 pt-[84px] pb-6 max-w-[351px] mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack ?? goBack} type="button">
            {backLabel}
          </Button>
          <div />
        </div>

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
              {heroEyebrow ? (
                <div className="text-[#e1ff00] uppercase tracking-widest text-[9px] font-bold mb-1">{heroEyebrow}</div>
              ) : null}
              {heroTitle ? <div className="text-3xl font-bold leading-tight tracking-tight text-white">{heroTitle}</div> : null}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <div className="typography-h2 text-[#e1ff00]">
            <h2>{title}</h2>
          </div>
          <div className="typography-body text-[#8a8a8a]">{subtitle}</div>
        </div>

      <div className="flex items-center justify-between text-sm text-[#8a8a8a]">
        <div>0</div>
        <div className="text-[#e1ff00] font-medium">{value}</div>
        <div>10</div>
      </div>
      <Slider
        min={0}
        max={10}
        step={1}
        value={[value]}
        onValueChange={(vals) => onChange(Math.max(0, Math.min(10, vals?.[0] ?? 0)))}
      />

        <Button onClick={onNext} type="button">
          {nextLabel}
        </Button>
      </div>
    </div>
  )
}

export function RapidTechniquesFlowScreen() {
  const routerPage = useStore($router)
  const t = useStore(rapidTechniquesFlowMessages)
  const routeStepRaw = (routerPage?.params as any)?.step as string | undefined
  const routeStep = useMemo(() => parseRouteStep(routeStepRaw), [routeStepRaw])

  const [resumeOpen, setResumeOpen] = useState(false)
  const [resumeStep, setResumeStep] = useState<number | null>(null)

  const effectiveStep = useMemo(() => {
    const d = getRapidTechniquesDraft()
    if (!d) return 0
    const maxAllowed = clampStep(d.step ?? 0)
    return Math.min(routeStep, maxAllowed)
  }, [routeStep])

  const [stressBeforeUi, setStressBeforeUi] = useState(5)
  const [stressAfterUi, setStressAfterUi] = useState(5)
  const [_stepDone, setStepDone] = useState<boolean>(false)

  useEffect(() => {
    // Hydrate draft and show resume choice when entering flow from Home (step=0 deep link).
    if (routerPage?.route !== 'rapidTechniquesFlow') return

    const d = getRapidTechniquesDraft()
    if (!d) {
      // No draft: allow only step 0.
      if (routeStep !== 0) {
        redirectPage($router, 'rapidTechniquesFlow', { step: '0' })
      }
      return
    }

    // Existing draft: entering at step 0 should offer resume if unfinished.
    if (!d.completedAt && routeStep === 0 && d.step > 0) {
      setResumeStep(d.step)
      setResumeOpen(true)
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
      capture(AnalyticsEvent.RAPID_FLOW_STARTED, { techniqueId: TECHNIQUE_ID, startedAt: created.draft.startedAt })
    }
    return created.draft
  }

  const onContinue = () => {
    const d = ensureDraftAndStart()
    setResumeOpen(false)
    goToStep(d.step)
  }

  const onRestart = () => {
    clearRapidTechniquesDraft()
    ensureDraftAndStart()
    setResumeOpen(false)
    goToStep(0)
  }

  const onBack = () => {
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
  }

  if (routerPage?.route !== 'rapidTechniquesFlow') return null

  if (effectiveStep === 0) {
    return (
      <>
        <StressStep
          backLabel={t.back}
          onBack={onBack}
          heroImageSrc="/assets/rapid-techniques-flow/hero-waves.jpg"
          heroEyebrow="Rapid Techniques Series"
          heroTitle="Какой стресс сейчас?"
          title={t.stressBeforeTitle}
          subtitle={t.stressBeforeSubtitle}
          value={stressBeforeUi}
          onChange={setStressBeforeUi}
          onNext={() => {
            const d = ensureDraftAndStart()
            const next = 1
            saveRapidTechniquesDraft({ ...d, step: next, stressBefore: stressBeforeUi })
            goToStep(next)
          }}
          nextLabel={t.start}
        />

        <AlertDialog open={resumeOpen} onOpenChange={setResumeOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.resumeTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {typeof resumeStep === 'number'
                  ? String(t.resumeDescription).replace('{step}', String(resumeStep))
                  : t.resumeDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={onRestart}>{t.resumeRestart}</AlertDialogCancel>
              <AlertDialogAction onClick={onContinue}>{t.resumeContinue}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  if (effectiveStep >= 1 && effectiveStep <= 7) {
    const progress = String(t.stepXof7).replace('{step}', String(effectiveStep))

    const draft = getRapidTechniquesDraft()

    if (effectiveStep === 1) {
      return (
        <Step1StopFrame
          backLabel={t.back}
          nextLabel={t.next}
          onBack={onBack}
          onNext={() => {
            const d = ensureDraftAndStart()
            saveRapidTechniquesDraft({ ...d, stopFrameDone: true })
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
    }

    if (effectiveStep === 2) {
      return (
        <Step2Breathing46
          backLabel={t.back}
          nextLabel={t.next}
          onBack={onBack}
          onNext={() => {
            const d = ensureDraftAndStart()
            saveRapidTechniquesDraft({ ...d, breathing46CompletedCycles: 3 })
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
    }

    if (effectiveStep === 3) {
      return (
        <Step3Grounding54321
          backLabel={t.back}
          nextLabel={t.next}
          onBack={onBack}
          onNext={() => {
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
    }

    if (effectiveStep === 4) {
      return (
        <Step4BrainDump
          backLabel={t.back}
          nextLabel={t.next}
          onBack={onBack}
          onNext={() => {
            capture(AnalyticsEvent.RAPID_FLOW_STEP_COMPLETED, { techniqueId: TECHNIQUE_ID, step: 4 })
            goToStep(5)
          }}
          title={t.steps.brainDumpTitle}
          subtitle={t.steps.brainDumpSubtitle}
          progressText={progress}
          initialValues={{ now: draft?.brainDumpNow, oneStep: draft?.brainDumpOneStep, wait: draft?.brainDumpWait }}
          onChange={(v) => {
            const d = ensureDraftAndStart()
            saveRapidTechniquesDraft({
              ...d,
              brainDumpNow: v.now,
              brainDumpOneStep: v.oneStep,
              brainDumpWait: v.wait,
              step: Math.max(d.step, 4),
            })
            setStepDone(true)
          }}
        />
      )
    }

    if (effectiveStep === 5) {
      return (
        <Step5PostCycleAssessment
          backLabel={t.back}
          nextLabel={t.next}
          onBack={onBack}
          onNext={() => {
            capture(AnalyticsEvent.RAPID_FLOW_STEP_COMPLETED, { techniqueId: TECHNIQUE_ID, step: 5 })
            goToStep(6)
          }}
          title={t.steps.postCycleTitle}
          subtitle={t.steps.postCycleSubtitle}
          progressText={progress}
          initialStress={draft?.postCycleStress ?? 5}
          onStressChange={(v) => {
            const d = ensureDraftAndStart()
            saveRapidTechniquesDraft({ ...d, postCycleStress: v, step: Math.max(d.step, 5) })
            setStepDone(true)
          }}
        />
      )
    }

    if (effectiveStep === 6) {
      return (
        <Step6ResultsSummary
          backLabel={t.back}
          nextLabel={t.next}
          onBack={onBack}
          onNext={() => {
            capture(AnalyticsEvent.RAPID_FLOW_STEP_COMPLETED, { techniqueId: TECHNIQUE_ID, step: 6 })
            goToStep(7)
          }}
          title={t.steps.summaryTitle}
          subtitle={t.steps.summarySubtitle}
          progressText={progress}
          stressBefore={typeof draft?.stressBefore === 'number' ? draft.stressBefore : null}
          stressAfter={null}
        />
      )
    }

    return (
      <Step7WrapUp
        backLabel={t.back}
        nextLabel={t.next}
        onBack={onBack}
        onNext={() => {
          capture(AnalyticsEvent.RAPID_FLOW_STEP_COMPLETED, { techniqueId: TECHNIQUE_ID, step: 7 })
          const d = ensureDraftAndStart()
          saveRapidTechniquesDraft({ ...d, step: 8 })
          goToStep(8)
        }}
        title={t.finish}
        subtitle=""
        progressText={progress}
      />
    )
  }

  // step 8
  return (
    <StressStep
      backLabel={t.back}
      onBack={onBack}
      title={t.stressAfterTitle}
      subtitle={t.stressAfterSubtitle}
      value={stressAfterUi}
      onChange={setStressAfterUi}
      onNext={() => {
        const d = ensureDraftAndStart()
        const done = completeRapidTechniquesFlow({
          ...d,
          step: 8,
          stressAfter: stressAfterUi,
        })
        if (done) {
          capture(AnalyticsEvent.RAPID_FLOW_COMPLETED, {
            techniqueId: TECHNIQUE_ID,
            stress_before: done.stressBefore,
            stress_after: done.stressAfter,
            durationMs: done.durationMs,
          })
          clearRapidTechniquesDraft()
        }
        goBack()
      }}
      nextLabel={t.finish}
    />
  )
}

