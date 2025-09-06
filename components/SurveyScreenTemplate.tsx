// ========================================================================================
// УНИВЕРСАЛЬНЫЙ КОМПОНЕНТ ЭКРАНА ОПРОСА
// ========================================================================================

import { useState, useEffect } from 'react';
import { useSurveyScreen, useUIText } from './ContentContext';
import { BottomFixedButton } from './BottomFixedButton';
import { SurveyContent } from '../types/content';
import { Light } from './ProfileLayoutComponents';
import { MiniStripeLogo } from './ProfileLayoutComponents';

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
  onBack: _onBack, 
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

    // Отправляем данные опроса в аналитику через глобальный объект
    if (window.TwaAnalytics) {
      // Подготовка данных для аналитики
      const analyticsData: Record<string, any> = {
        screen_id: screenId,
        question_type: surveyData.screen.questionType,
        timestamp: new Date().toISOString()
      };
      
      // Добавляем ответы в зависимости от типа вопроса
      if (surveyData.screen.questionType === 'text-input') {
        analyticsData.answer_text = textInput.trim();
      } else {
        // Преобразуем выбранные варианты в строковое представление для аналитики
        analyticsData.selected_options = answers;
        analyticsData.option_count = answers.length;
        
        // Добавляем текстовое представление выбранных опций
        if (localizedScreen.options) {
          const selectedTexts = answers.map(id => {
            const option = localizedScreen.options?.find(opt => opt.id === id);
            return option?.text || id;
          });
          analyticsData.selected_texts = selectedTexts;
        }
      }
      
      window.TwaAnalytics.trackEvent('survey_answer', analyticsData);
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
                <span className="typography-body">{option.text}</span>
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
          <p className="typography-caption text-[#999999]">{localizedScreen.helpText}</p>
        )}
        <div className="text-right typography-small text-[#666666]">
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
      {/* Световые эффекты */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Заголовок и подзаголовок */}
            <div className="text-center mb-8">
              <h1 className="typography-h1 text-white mb-4">
                {localizedScreen.title}
              </h1>
              {localizedScreen.subtitle && (
                <p className="typography-body text-[#d4d4d4]">
                  {localizedScreen.subtitle}
                </p>
              )}
            </div>

            {/* Ошибка валидации */}
            {showError && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-xl">
                <p className="typography-caption text-red-400 text-center">
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
                <p className="typography-caption text-[#999999] text-center">
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