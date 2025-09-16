import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

/**
 * Адаптивное модальное окно с информацией о чекине
 */
export function InfoModal({ isOpen, onClose, title, content }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="bg-[#2d2b2b] rounded-xl p-6 sm:p-8 max-w-[90vw] sm:max-w-[500px] w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок с кнопкой закрытия */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="typography-h2 text-[#e1ff00] text-left">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[#696969] hover:text-[#e1ff00] transition-colors duration-200 p-1"
            aria-label="Закрыть модальное окно"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
        
        {/* Контент */}
        <div className="typography-body text-[#ffffff] text-left leading-relaxed whitespace-pre-line">
          {content}
        </div>
        
        {/* Кнопка закрытия */}
        <div className="mt-6 sm:mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#e1ff00] text-[#2d2b2b] px-6 py-3 rounded-xl typography-button hover:bg-[#d1ef00] transition-colors duration-200 min-h-[44px] min-w-[44px]"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
