// ========================================================================================
// ЭКРАН РЕЗУЛЬТАТОВ ПСИХОЛОГИЧЕСКОГО ТЕСТА
// ========================================================================================

import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { Light } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';
import { PsychologicalTestPercentages } from '../types/psychologicalTest';

interface PsychologicalTestResultsScreenProps {
  percentages: PsychologicalTestPercentages;
  onNext: () => void;
}

/**
 * Экран результатов психологического теста
 * Показывает результаты по каждой теме в процентах
 */
export function PsychologicalTestResultsScreen({ 
  percentages, 
  onNext 
}: PsychologicalTestResultsScreenProps) {
  const { content } = useContent();
  const testContent = content.psychologicalTest;

  if (!testContent) {
    return (
      <div className="w-full h-screen bg-[#111111] flex items-center justify-center">
        <p className="text-white">Error loading test content</p>
      </div>
    );
  }

  // Формируем список результатов по темам
  const results = [
    { topic: 'stress', percentage: percentages.stress, label: testContent.topics.stress },
    { topic: 'anxiety', percentage: percentages.anxiety, label: testContent.topics.anxiety },
    { topic: 'relationships', percentage: percentages.relationships, label: testContent.topics.relationships },
    { topic: 'self-esteem', percentage: percentages.selfEsteem, label: testContent.topics['self-esteem'] },
    { topic: 'anger', percentage: percentages.anger, label: testContent.topics.anger },
    { topic: 'depression', percentage: percentages.depression, label: testContent.topics.depression }
  ];

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
            
            {/* Заголовок */}
            <div className="text-center mb-8">
              <h1 className="typography-h1 text-white mb-4">
                {testContent.results.title}
              </h1>
              <p className="typography-body text-[#d4d4d4]">
                {testContent.results.subtitle}
              </p>
            </div>

            {/* Результаты по темам */}
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.topic}
                  className="p-4 rounded-xl border-2 border-[#3a3a3a] bg-[#2a2a2a]"
                >
                  <div className="flex justify-between items-center">
                    <span className="typography-body text-[#d4d4d4]">
                      {result.label}
                    </span>
                    <span className="typography-h2 text-[#e1ff00]">
                      {result.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <BottomFixedButton
        onClick={onNext}
        dataName="Next button"
        ariaLabel="Next"
      >
        {testContent.results.buttonText}
      </BottomFixedButton>
    </div>
  );
}

