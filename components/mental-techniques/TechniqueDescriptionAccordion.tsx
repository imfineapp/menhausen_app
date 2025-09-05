// ========================================================================================
// КОМПОНЕНТ: Аккордеон с описанием техники
// ========================================================================================

import React from 'react';
import { useContent } from '../ContentContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface TechniqueDescriptionAccordionProps {
  technique: {
    description: {
      mechanics: { en: string };
      whyItWorks: { en: string };
      tips: { en: string }[];
    };
  };
}

/**
 * Аккордеон с подробным описанием техники
 */
export function TechniqueDescriptionAccordion({ technique }: TechniqueDescriptionAccordionProps) {
  const { getLocalizedText } = useContent();

  return (
    <div className="bg-[rgba(217,217,217,0.04)] rounded-xl p-4 relative">
      <div className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl" />
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="description" className="border-none">
          <AccordionTrigger className="text-[#e1ff00] text-lg font-semibold hover:no-underline py-2">
            О технике
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="flex flex-col gap-6">
              {/* Механика техники */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[#e1ff00] text-base font-semibold">Как это работает</h4>
                <p className="text-[#cfcfcf] text-sm leading-relaxed">
                  {getLocalizedText(technique.description.mechanics)}
                </p>
              </div>

              {/* Почему это работает */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[#e1ff00] text-base font-semibold">Почему это работает</h4>
                <p className="text-[#cfcfcf] text-sm leading-relaxed">
                  {getLocalizedText(technique.description.whyItWorks)}
                </p>
              </div>

              {/* Советы */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[#e1ff00] text-base font-semibold">Советы</h4>
                <div className="flex flex-col gap-2">
                  {technique.description.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="size-2 rounded-full bg-[#e1ff00] mt-2 flex-shrink-0" />
                      <p className="text-[#cfcfcf] text-sm">
                        {getLocalizedText(tip)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
