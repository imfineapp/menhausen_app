// ========================================================================================
// УНИВЕРСАЛЬНЫЙ КОМПОНЕНТ ЭКРАНА ВОПРОСА ПСИХОЛОГИЧЕСКОГО ТЕСТА
// ========================================================================================

import { useState, useEffect } from 'react';
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { Light } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';
import { LikertScaleAnswer } from '../types/psychologicalTest';

interface PsychologicalTestQuestionScreenProps {
  questionNumber: number; // 1-30
  onNext: (answer: LikertScaleAnswer) => void;
  initialAnswer?: LikertScaleAnswer | null;
}

/**
 * Универсальный компонент для экрана вопроса психологического теста
 * Показывает один вопрос с 5 вариантами ответа по шкале Лайкерта (0-4)
 */
export function PsychologicalTestQuestionScreen({ 
  questionNumber, 
  onNext,
  initialAnswer = null
}: PsychologicalTestQuestionScreenProps) {
  const { content } = useContent();
  const testContent = content.psychologicalTest;
  const [selectedAnswer, setSelectedAnswer] = useState<LikertScaleAnswer | null>(initialAnswer);

  // Сбрасываем выбор при переходе к новому вопросу
  // Это необходимо, так как React может переиспользовать компонент при навигации
  useEffect(() => {
    setSelectedAnswer(initialAnswer);
  }, [questionNumber, initialAnswer]);

  if (!testContent) {
    return (
      <div className="w-full h-screen bg-[#111111] flex items-center justify-center">
        <p className="text-white">Error loading test content</p>
      </div>
    );
  }

  // Получаем вопрос по номеру (вопросы нумеруются с 1)
  const question = testContent.questions.find(q => q.order === questionNumber);
  
  if (!question) {
    return (
      <div className="w-full h-screen bg-[#111111] flex items-center justify-center">
        <p className="text-white">Question not found</p>
      </div>
    );
  }

  const progress = (questionNumber / 30) * 100;
  const canContinue = selectedAnswer !== null;

  // Варианты ответа по шкале Лайкерта (0-4)
  const answerOptions: Array<{ value: LikertScaleAnswer; label: string }> = [
    { value: 0, label: testContent.likertScale['0'] },
    { value: 1, label: testContent.likertScale['1'] },
    { value: 2, label: testContent.likertScale['2'] },
    { value: 3, label: testContent.likertScale['3'] },
    { value: 4, label: testContent.likertScale['4'] }
  ];

  const handleContinue = () => {
    if (selectedAnswer !== null) {
      onNext(selectedAnswer);
    }
  };

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
            
            {/* Прогресс-бар */}
            <div className="mb-8">
              <div className="w-full h-1 bg-[#3a3a3a] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#e1ff00] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Текст вопроса */}
            <div className="text-center mb-8">
              <h1 className="typography-h1 text-white mb-4">
                {question.text}
              </h1>
            </div>

            {/* Варианты ответа */}
            <div className="space-y-3">
              {answerOptions.map((option) => {
                const isSelected = selectedAnswer === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedAnswer(option.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left min-h-[44px] min-w-[44px] ${
                      isSelected 
                        ? 'border-[#e1ff00] bg-[#e1ff00]/10 text-white' 
                        : 'border-[#3a3a3a] bg-[#2a2a2a] text-[#d4d4d4] hover:border-[#4a4a4a] hover:bg-[#333333]'
                    }`}
                    data-name="Test answer option"
                    data-value={option.value}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 flex-shrink-0 self-center ${
                        isSelected 
                          ? 'border-[#e1ff00] bg-[#e1ff00]' 
                          : 'border-[#666666]'
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-black" />
                        )}
                      </div>
                      <span className="typography-body leading-relaxed">{option.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <BottomFixedButton
        onClick={handleContinue}
        disabled={!canContinue}
        className={!canContinue ? 'opacity-50 cursor-not-allowed' : ''}
        dataName="Next button"
        ariaLabel="Next"
      >
        {content.ui.navigation.next}
      </BottomFixedButton>
    </div>
  );
}

