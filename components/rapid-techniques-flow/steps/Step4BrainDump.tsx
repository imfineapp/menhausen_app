import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

export type Step4BrainDumpValues = {
  now: string
  oneStep: string
  wait: string
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
}

export function Step4BrainDump(props: Step4BrainDumpProps) {
  const { backLabel, nextLabel, onBack, onNext, title, subtitle, progressText, initialValues, onChange } = props
  const [now, setNow] = useState(initialValues?.now ?? '')
  const [oneStep, setOneStep] = useState(initialValues?.oneStep ?? '')
  const [wait, setWait] = useState(initialValues?.wait ?? '')

  useEffect(() => {
    onChange?.({ now, oneStep, wait })
  }, [now, oneStep, wait, onChange])

  return (
    <div className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden safe-top safe-bottom">
      <div className="px-4 pt-[84px] pb-24 max-w-[351px] mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} type="button">
            {backLabel}
          </Button>
          {progressText ? <div className="text-sm text-[#8a8a8a]">{progressText}</div> : <div />}
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold tracking-[0.2em] uppercase text-[#e1ff00]">Focus Ritual</div>
          <div className="typography-h2 text-[#e1ff00]">
            <h2>{title}</h2>
          </div>
          {subtitle ? <div className="typography-body text-[#8a8a8a]">{subtitle}</div> : null}
        </div>

        <div className="flex flex-col gap-6">
          <div className="group">
            <label className="block text-white/50 text-xs font-bold tracking-widest uppercase mb-3">Сейчас в голове:</label>
            <div className="border-l-2 border-[#e1ff00] bg-white/5 p-4">
              <textarea
                value={now}
                onChange={(e) => setNow(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white placeholder-white/20 resize-none text-lg p-0"
                placeholder="Поток сознания..."
                rows={3}
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-white/50 text-xs font-bold tracking-widest uppercase mb-3">Один шаг сейчас:</label>
            <div className="border-l border-white/20 bg-white/5 p-4 focus-within:border-[#e1ff00] transition-colors">
              <input
                value={oneStep}
                onChange={(e) => setOneStep(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white placeholder-white/20 text-lg p-0"
                placeholder="Самое простое действие"
                type="text"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-white/50 text-xs font-bold tracking-widest uppercase mb-3">Это подождёт:</label>
            <div className="border-l border-white/20 bg-white/5 p-4 focus-within:border-[#e1ff00] transition-colors">
              <input
                value={wait}
                onChange={(e) => setWait(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white placeholder-white/20 text-lg p-0"
                placeholder="Не приоритет на сегодня"
                type="text"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 pb-8 bg-gradient-to-t from-[#111111] via-[#111111]/90 to-transparent">
        <div className="max-w-[351px] mx-auto">
          <Button type="button" onClick={onNext} className="w-full tracking-widest uppercase">
            {nextLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

