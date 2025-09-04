// ========================================================================================
// УНИВЕРСАЛЬНЫЙ КОМПОНЕНТ ЭКРАНА ОПРОСА
// ========================================================================================

import { useState, useEffect } from 'react';
import { useSurveyScreen, useUIText } from './ContentContext';
import { BottomFixedButton } from './BottomFixedButton';
import { SurveyContent } from '../types/content';

interface SurveyScreenTemplateProps {
  screenId: keyof SurveyContent;
  onNext: (selectedAnswers: string[]) => void;
  onBack: () => void;
  initialSelections?: string[];
}

/**
 * Универсальный компонент для экранов опроса с адаптивным дизайном
 * Поддерживает single-choice, multiple-choice и text-input типы вопросов
 */
export function SurveyScreenTemplate({ 
  screenId, 
  onNext, 
  onBack, 
  initialSelections = [] 
}: SurveyScreenTemplateProps) {
  // =====================================================================================
  // ХУКИ И СОСТОЯНИЕ
  // =====================================================================================
  const surveyData = useSurveyScreen(screenId);
  const uiText = useUIText();
  
  const [selectedOptions, setSelectedOptions] = useState<string[]>(initialSelections);
  const [textInput, setTextInput] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);

  // =====================================================================================
  // ЭФФЕКТЫ
  // =====================================================================================
  
  // Сброс ошибки при изменении выбора
  useEffect(() => {
    if (showError && (selectedOptions.length > 0 || textInput.trim())) {
      setShowError(false);
    }
  }, [selectedOptions, textInput, showError]);

  // =====================================================================================
  // ОБРАБОТЧИКИ СОБЫТИЙ
  // =====================================================================================

  /**
   * Обработка выбора опции
   */
  const handleOptionSelect = (optionId: string) => {
    if (!surveyData?.screen) return;

    if (surveyData.screen.questionType === 'single-choice') {
      // Одиночный выбор - заменить текущий выбор
      setSelectedOptions([optionId]);
    } else if (surveyData.screen.questionType === 'multiple-choice') {
      // Множественный выбор - добавить/убрать опцию
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  /**
   * Обработка продолжения
   */
  const handleContinue = () => {
    if (!surveyData?.screen) return;

    let answers: string[] = [];

    if (surveyData.screen.questionType === 'text-input') {
      if (!textInput.trim()) {
        setShowError(true);
        return;
      }
      answers = [textInput.trim()];
    } else {
      if (selectedOptions.length === 0) {
        setShowError(true);
        return;
      }
      answers = selectedOptions;
    }

    onNext(answers);
  };



  // =====================================================================================
  // ПРОВЕРКИ И ПОДГОТОВКА ДАННЫХ
  // =====================================================================================

  if (!surveyData) {
    return (
      <div className="w-full h-screen bg-[#111111] flex items-center justify-center">
        <p className="text-white">Error loading survey screen</p>
      </div>
    );
  }

  const { screen, localizedScreen } = surveyData;

  const canContinue = surveyData.screen.questionType === 'text-input' 
    ? textInput.trim().length > 0
    : selectedOptions.length > 0;

  // =====================================================================================
  // РЕНДЕРИНГ КОМПОНЕНТОВ
  // =====================================================================================

  /**
   * Рендеринг опций выбора с обновленной нейтральной серой цветовой схемой
   */
  const renderOptions = () => {
    if (!localizedScreen.options) return null;

    return (
      <div className="space-y-3">
        {localizedScreen.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          
          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`w-full min-h-[56px] px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left min-h-[44px] min-w-[44px] ${
                isSelected 
                  ? 'border-[#e1ff00] bg-[#e1ff00]/10 text-white' 
                  : 'border-[#3a3a3a] bg-[#2a2a2a] text-[#d4d4d4] hover:border-[#4a4a4a] hover:bg-[#333333]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                  isSelected 
                    ? 'border-[#e1ff00] bg-[#e1ff00]' 
                    : 'border-[#666666]'
                }`}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-black" />
                  )}
                </div>
                <span className="text-responsive-base">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  /**
   * Рендеринг текстового ввода с обновленной цветовой схемой
   */
  const renderTextInput = () => {
    if (screen.questionType !== 'text-input') return null;

    return (
      <div className="space-y-3">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={localizedScreen.placeholder || 'Type your answer here...'}
          className="w-full min-h-[120px] px-4 py-3 rounded-xl border-2 border-[#3a3a3a] bg-[#2a2a2a] text-white placeholder-[#888888] resize-none focus:border-[#e1ff00] focus:outline-none transition-colors duration-200"
          maxLength={500}
        />
        {localizedScreen.helpText && (
          <p className="text-sm text-[#999999]">{localizedScreen.helpText}</p>
        )}
        <div className="text-right text-xs text-[#666666]">
          {textInput.length}/500
        </div>
      </div>
    );
  };

  // =====================================================================================
  // ОСНОВНОЙ РЕНДЕР
  // =====================================================================================

  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden bg-[#111111] flex flex-col">
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[40px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Заголовок и подзаголовок */}
            <div className="text-center mb-8">
              <h1 className="font-heading font-normal text-white text-responsive-3xl mb-4 leading-[0.8]">
                {localizedScreen.title}
              </h1>
              {localizedScreen.subtitle && (
                <p className="text-responsive-base text-[#d4d4d4]">
                  {localizedScreen.subtitle}
                </p>
              )}
            </div>

            {/* Ошибка валидации */}
            {showError && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-xl">
                <p className="text-red-400 text-sm text-center">
                  {uiText.survey.selectAtLeastOne}
                </p>
              </div>
            )}

            {/* Контент вопроса */}
            <div className="space-y-6">
              {screen.questionType === 'text-input' ? renderTextInput() : renderOptions()}
            </div>

            {/* Помощь и дополнительная информация */}
            {localizedScreen.helpText && screen.questionType !== 'text-input' && (
              <div className="mt-6 p-4 bg-[#2a2a2a] rounded-xl">
                <p className="text-sm text-[#999999] text-center">
                  {localizedScreen.helpText}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <BottomFixedButton
        onClick={handleContinue}
        disabled={!canContinue}
        className={!canContinue ? 'opacity-50 cursor-not-allowed' : ''}
      >
        {localizedScreen.buttonText}
      </BottomFixedButton>


    </div>
  );
}