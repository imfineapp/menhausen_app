import React, { useCallback, useEffect, useState } from 'react'
import { useStore } from '@nanostores/react'
import { goBack } from '@/src/stores/navigation.store'
import { clearBackButtonOverride, setBackButtonOverride } from '@/src/stores/back-button-override.store'
import { breathe46Messages } from '@/src/i18n/messages/breathe46'
import { BreatheScreenTransition } from '@/components/breathe4-6/ui/BreatheScreenTransition'
import { Breathing46 } from '@/components/breathe4-6/steps/Breathing46'
import { capture, AnalyticsEvent } from '@/utils/analytics/posthog'
import { earnPoints, refreshPoints } from '@/src/stores/points.store'
import { RewardEventType } from '@/utils/supabaseSync/rewardService'

export function Breathe46Screen() {
  const t = useStore(breathe46Messages)
  const [startTime] = useState(() => Date.now())
  const [completed, setCompleted] = useState(false)

  const onBack = useCallback(() => {
    if (!completed) {
      capture(AnalyticsEvent.BREATHING_46_DROPPED, {
        droppedAt: Math.floor((Date.now() - startTime) / 1000),
      })
    }
    goBack()
  }, [completed, startTime])

  useEffect(() => {
    capture(AnalyticsEvent.BREATHING_46_STARTED)
    setBackButtonOverride({ isVisible: true, onBack })
    return () => {
      clearBackButtonOverride()
    }
  }, [onBack])

  const handleCompleted = useCallback(async () => {
    if (completed) return
    setCompleted(true)

    const durationSeconds = Math.floor((Date.now() - startTime) / 1000)
    capture(AnalyticsEvent.BREATHING_46_COMPLETED, {
      cyclesCompleted: 3,
      durationSeconds,
    })

    try {
      await earnPoints(15, {
        eventType: RewardEventType.BREATHING_46_COMPLETED,
        referenceId: `breathing_${Date.now()}`,
        note: 'Breathing 4-6 completed',
        payload: {
          cyclesCompleted: 3,
          durationSeconds,
        },
      })
      refreshPoints()
    } catch (err) {
      console.error('[Breathing46] Reward error:', err)
    }
  }, [completed, startTime])

  return (
    <BreatheScreenTransition stepKey={0}>
      <Breathing46
        backLabel={t.back}
        nextLabel={t.finish}
        onBack={onBack}
        onNext={() => {
          goBack()
        }}
        title={t.steps.breathing46Title}
        subtitle={t.steps.breathing46Subtitle}
        startLabel={t.start}
        repeatLabel={t.repeat}
        phaseLabels={{
          inhale: t.inhale,
          exhale: t.exhale,
          done: t.ready,
        }}
        tipText={t.tip}
        initialCompletedCycles={0}
        onComplete={handleCompleted}
      />
    </BreatheScreenTransition>
  )
}