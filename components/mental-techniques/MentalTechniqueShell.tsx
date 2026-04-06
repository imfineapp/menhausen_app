import React from 'react'
import { MiniStripeLogo } from '@/components/ProfileLayoutComponents'
import { MentalTechniqueAccordion } from '@/components/ui/accordion-mental-technique'

type AccordionItem = { title: string; content: string }

export type MentalTechniqueShellProps = {
  title: string
  subtitle?: string
  metaChip?: string
  children: React.ReactNode
  accordionTitle?: string
  accordionItems?: AccordionItem[]
}

export function MentalTechniqueShell({
  title,
  subtitle,
  metaChip,
  children,
  accordionTitle,
  accordionItems,
}: MentalTechniqueShellProps) {
  const hasAccordion = (accordionItems?.length ?? 0) > 0

  return (
    <div className="bg-[#111111] relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden safe-top safe-bottom">
      <MiniStripeLogo />

      <div className="flex flex-col gap-6 px-4 pt-[100px] pb-8 max-w-md mx-auto">
        <div className="text-center">
          <h1 className="typography-h1 text-[#e1ff00] mb-2">{title}</h1>
          {subtitle ? (
            <p className="typography-body text-[#cfcfcf]">{subtitle}</p>
          ) : null}
          {metaChip ? (
            <div className="mt-3">
              <span className="bg-[#e1ff00] text-[#2d2b2b] px-3 py-1 rounded-lg typography-caption">
                {metaChip}
              </span>
            </div>
          ) : null}
        </div>

        {children}

        {hasAccordion ? (
          <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
            <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
            <div className="flex flex-col gap-4">
              {accordionTitle ? (
                <h3 className="typography-h3 text-[#e1ff00]">{accordionTitle}</h3>
              ) : null}
              <MentalTechniqueAccordion items={accordionItems!} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

