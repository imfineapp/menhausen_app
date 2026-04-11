import React, { useCallback, useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { goBack } from '@/src/stores/navigation.store'
import { clearBackButtonOverride, setBackButtonOverride } from '@/src/stores/back-button-override.store'
import { breathe46Messages } from '@/src/i18n/messages/breathe46'
import { BreatheScreenTransition } from '@/components/breathe4-6/ui/BreatheScreenTransition'
import { Breathing46 } from '@/components/breathe4-6/steps/Breathing46'

export function Breathe46Screen() {
  const t = useStore(breathe46Messages)

  const onBack = useCallback(() => {
    goBack()
  }, [])

  useEffect(() => {
    setBackButtonOverride({ isVisible: true, onBack })
    return () => {
      clearBackButtonOverride()
    }
  }, [onBack])

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
      />
    </BreatheScreenTransition>
  )
}