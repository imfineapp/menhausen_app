import React, { useMemo } from 'react'
import { useStore } from '@nanostores/react'

import { useContent } from '@/components/ContentContext'
import { mentalTechniquesMessages } from '@/src/i18n/messages/mentalTechniques'

type Props = {
  onOpenTechnique: (techniqueId: string) => void
}

const TECHNIQUE_IDS: string[] = [
  'breathing-4-7-8',
  'breathing-square',
  'grounding-5-4-3-2-1',
  'grounding-anchor',
]

function TechniqueIcon({ techniqueId }: { techniqueId: string }) {
  // Моно-иконки (без “пёстрости”), в рамках текущей палитры.
  // Не используем emoji по умолчанию — можно заменить на lucide при желании.
  const common = 'w-5 h-5 text-[#e1ff00]'
  if (techniqueId.startsWith('breathing')) {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3c2.5 2.2 4 5 4 8a6 6 0 1 1-12 0c0-3 1.5-5.8 4-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 15v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 13c2.5-2.8 5.5-4.2 8-4.2S17.5 10.2 20 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 16c1.8-1.8 3.8-2.7 6-2.7s4.2.9 6 2.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 20h0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function TechniqueCard({
  title,
  subtitle,
  duration,
  techniqueId,
  onClick,
}: {
  title: string
  subtitle: string
  duration: string
  techniqueId: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative w-full rounded-xl bg-[rgba(217,217,217,0.04)] hover:bg-[rgba(217,217,217,0.08)] active:scale-[0.98] transition-all duration-200 min-h-[44px] min-w-[44px]"
      data-name="Mental technique card"
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-xl border border-[#212121]" />
      <div className="relative p-4 flex flex-col gap-2 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="typography-h2 text-[#e1ff00]">
              <h3 className="block truncate">{title}</h3>
            </div>
            <div className="typography-caption text-[#cfcfcf]">
              <p className="block line-clamp-2">{subtitle}</p>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            <TechniqueIcon techniqueId={techniqueId} />
            <span className="typography-caption bg-[#e1ff00] text-[#2d2b2b] px-2 py-1 rounded-lg whitespace-nowrap">
              {duration}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

export function MentalTechniquesBlock({ onOpenTechnique }: Props) {
  const { getMentalTechnique, getMentalTechniquesMenu } = useContent()
  const msgs = useStore(mentalTechniquesMessages)
  const menu = getMentalTechniquesMenu()

  const techniques = useMemo(() => {
    return TECHNIQUE_IDS.map((id) => getMentalTechnique(id)).filter(Boolean) as any[]
  }, [getMentalTechnique])

  if (techniques.length === 0) return null

  return (
    <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
      <div className="flex flex-col gap-1 w-full">
        <div className="typography-h2 text-[#e1ff00] text-left w-full">
          <h2 className="block">{menu.title || msgs.squareBreathingDescription}</h2>
        </div>
        <div className="typography-body text-[#8a8a8a] text-left w-full">
          <p className="block">{menu.subtitle || ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 w-full">
        {techniques.map((t) => (
          <TechniqueCard
            key={t.id}
            title={t.title}
            subtitle={t.subtitle}
            duration={t.duration}
            techniqueId={t.id}
            onClick={() => onOpenTechnique(t.id)}
          />
        ))}
      </div>
    </div>
  )
}

