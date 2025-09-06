// Импортируем необходимые хуки и компоненты
import { useState } from 'react';
import { useLanguage, useTranslation, Language } from './LanguageContext';

/**
 * Адаптивная кнопка выбора языка
 */
interface LanguageOptionButtonProps {
  language: Language;
  isSelected: boolean;
  onSelect: (lang: Language) => void;
  label: string;
  nativeLabel: string;
}

function LanguageOptionButton({ language, isSelected, onSelect, label, nativeLabel }: LanguageOptionButtonProps) {
  return (
    <button
      onClick={() => onSelect(language)}
      className={`w-full p-4 sm:p-5 rounded-xl border transition-all duration-200 min-h-[44px] min-w-[44px] active:scale-[0.98] ${
        isSelected 
          ? 'bg-[#e1ff00] border-[#e1ff00] text-[#2d2b2b]' 
          : 'bg-[rgba(217,217,217,0.04)] border-[#212121] text-[#ffffff] hover:bg-[rgba(217,217,217,0.08)]'
      }`}
      data-name={`Language option ${language}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <div className={`font-sans text-responsive-lg text-left ${
            isSelected ? 'text-[#2d2b2b]' : 'text-[#ffffff]'
          }`}>
            <p className="block leading-[1.5]">{label}</p>
          </div>
          <div className={`font-sans text-responsive-base text-left ${
            isSelected ? 'text-[#2d2b2b]' : 'text-[#cfcfcf]'
          }`}>
            <p className="block leading-[1.5]">{nativeLabel}</p>
          </div>
        </div>
        
        {/* Индикатор выбора */}
        <div className={`size-6 rounded-full border-2 flex items-center justify-center ${
          isSelected 
            ? 'border-[#2d2b2b] bg-[#2d2b2b]' 
            : 'border-[#cfcfcf]'
        }`}>
          {isSelected && (
            <div className="size-3 rounded-full bg-[#e1ff00]" />
          )}
        </div>
      </div>
    </button>
  );
}

/**
 * Адаптивные кнопки действий
 */
interface ActionButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel: string;
  confirmLabel: string;
}

function ActionButtons({ onCancel, onConfirm, cancelLabel, confirmLabel }: ActionButtonsProps) {
  return (
    <div className="flex gap-3 w-full" data-name="Action buttons">
      {/* Кнопка отмены */}
      <button
        onClick={onCancel}
        className="flex-1 bg-[rgba(217,217,217,0.04)] border border-[#212121] text-[#ffffff] rounded-xl py-3 sm:py-4 px-4 hover:bg-[rgba(217,217,217,0.08)] active:scale-[0.98] transition-all duration-200 min-h-[44px] min-w-[44px]"
        data-name="Cancel button"
      >
        <div className="font-sans text-responsive-lg text-center">
          <p className="block leading-[1.5]">{cancelLabel}</p>
        </div>
      </button>
      
      {/* Кнопка подтверждения */}
      <button
        onClick={onConfirm}
        className="flex-1 bg-[#e1ff00] text-[#2d2b2b] rounded-xl py-3 sm:py-4 px-4 hover:bg-[#d4f200] active:scale-[0.98] transition-all duration-200 min-h-[44px] min-w-[44px]"
        data-name="Confirm button"
      >
        <div className="font-sans text-responsive-lg text-center">
          <p className="block leading-[1.5]">{confirmLabel}</p>
        </div>
      </button>
    </div>
  );
}

/**
 * Адаптивное модальное окно для выбора языка приложения
 * Полностью адаптивное с поддержкой всех устройств и min-h-[44px] min-w-[44px] элементами
 */
export function LanguageModal() {
  const { language, setLanguage, isLanguageModalOpen, closeLanguageModal } = useLanguage();
  const { t } = useTranslation();

  // Локальное состояние для выбранного языка (до подтверждения)
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  /**
   * Обработчик подтверждения выбора языка
   */
  const handleConfirm = () => {
    setLanguage(selectedLanguage);
    closeLanguageModal();
    
    // Показываем уведомление об изменении языка
    console.log('Language changed to:', selectedLanguage);
  };

  /**
   * Обработчик отмены выбора языка
   */
  const handleCancel = () => {
    setSelectedLanguage(language); // Возвращаем к текущему языку
    closeLanguageModal();
  };

  /**
   * Обработчик клика по фону для закрытия модального окна
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <>
      {isLanguageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.9)] bg-opacity-40 p-4 safe-top safe-bottom"
          data-name="Language Modal Backdrop"
          onClick={handleBackdropClick}
        >
          <div
            className="bg-[#111111] rounded-2xl w-full max-w-[320px] sm:max-w-[360px] md:max-w-[400px] relative p-6 sm:p-8 shadow-2xl border border-[#212121]"
            data-name="Language Modal Content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок */}
            <div className="flex flex-col gap-2 mb-6 sm:mb-8" data-name="Modal header">
              <div className="font-heading text-responsive-3xl text-[#e1ff00] text-center">
                <h2 className="block leading-[0.8]">{t('change_language_title')}</h2>
              </div>
              <div className="font-sans text-responsive-base text-[#cfcfcf] text-center">
                <p className="block leading-[1.5]">{t('change_language_description')}</p>
              </div>
            </div>

            {/* Опции языков */}
            <div className="flex flex-col gap-3 mb-6 sm:mb-8" data-name="Language options">
              <LanguageOptionButton
                language="en"
                isSelected={selectedLanguage === 'en'}
                onSelect={setSelectedLanguage}
                label={t('english')}
                nativeLabel="English"
              />
              
              <LanguageOptionButton
                language="ru"
                isSelected={selectedLanguage === 'ru'}
                onSelect={setSelectedLanguage}
                label={t('russian')}
                nativeLabel="Русский"
              />
            </div>

            {/* Кнопки действий */}
            <ActionButtons
              onCancel={handleCancel}
              onConfirm={handleConfirm}
              cancelLabel={t('cancel')}
              confirmLabel={t('confirm')}
            />
          </div>
        </div>
      )}
    </>
  );
}