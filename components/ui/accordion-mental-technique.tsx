// ========================================================================================
// КОМПОНЕНТ: Аккордеон для ментальных техник
// ========================================================================================

import React, { useState } from 'react';

interface AccordionItem {
  title: string;
  content: string;
}

interface MentalTechniqueAccordionProps {
  items: AccordionItem[];
  className?: string;
}

/**
 * Аккордеон для отображения дополнительной информации о ментальных техниках
 */
export function MentalTechniqueAccordion({ items, className = '' }: MentalTechniqueAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="border border-[#212121] rounded-lg overflow-hidden">
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-4 py-3 text-left bg-[rgba(217,217,217,0.04)] hover:bg-[rgba(217,217,217,0.08)] transition-colors duration-200 flex items-center justify-between"
            aria-expanded={openItems.has(index)}
          >
            <span className="text-[#e1ff00] font-semibold text-sm">
              {item.title}
            </span>
            <svg
              className={`w-5 h-5 text-[#e1ff00] transition-transform duration-200 ${
                openItems.has(index) ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          
          {openItems.has(index) && (
            <div className="px-4 py-3 bg-[rgba(217,217,217,0.02)] border-t border-[#212121]">
              <p className="text-[#cfcfcf] text-sm leading-relaxed">
                {item.content}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


