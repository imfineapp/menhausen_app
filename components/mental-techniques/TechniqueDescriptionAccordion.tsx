// ========================================================================================
// КОМПОНЕНТ: Аккордеон с описанием техники
// ========================================================================================

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface TechniqueDescriptionAccordionProps {
  technique: {
    accordionItems: Array<{
      title: string;
      content: string;
    }>;
    tips: Array<string>;
  };
}

/**
 * Аккордеон с подробным описанием техники
 */
export function TechniqueDescriptionAccordion({ technique }: TechniqueDescriptionAccordionProps) {
  return (
    <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
      <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
      
      <Accordion type="single" collapsible className="w-full">
        {technique.accordionItems.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-none">
            <AccordionTrigger className="text-[#e1ff00] text-lg font-semibold hover:no-underline py-2">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <p className="text-[#cfcfcf] text-sm leading-relaxed">
                {item.content}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
        
        {/* Советы */}
        {technique.tips.length > 0 && (
          <AccordionItem value="tips" className="border-none">
            <AccordionTrigger className="text-[#e1ff00] text-lg font-semibold hover:no-underline py-2">
              Советы
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="flex flex-col gap-2">
                {technique.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-[#e1ff00] mt-2 flex-shrink-0" />
                    <p className="text-[#cfcfcf] text-sm">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
