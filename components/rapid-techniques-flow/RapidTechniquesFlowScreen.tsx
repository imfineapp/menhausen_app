import React, { useCallback, useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { goBack } from '@/src/stores/navigation.store'
import { clearBackButtonOverride, setBackButtonOverride } from '@/src/stores/back-button-override.store'
import { rapidTechniquesFlowMessages } from '@/src/i18n/messages/rapidTechniquesFlow'
import { RapidFlowScreenTransition } from '@/components/rapid-techniques-flow/ui/RapidFlowScreenTransition'
import { Step2Breathing46 } from '@/components/rapid-techniques-flow/steps/Step2Breathing46'

export function RapidTechniquesFlowScreen() {
  const t = useStore(rapidTechniquesFlowMessages)

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
    <RapidFlowScreenTransition stepKey={0}>
      <Step2Breathing46
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
        onCompletedCyclesChange={() => {}}
      />
    </RapidFlowScreenTransition>
  )
}