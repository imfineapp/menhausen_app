// Утилиты для расчета результатов психологического теста

import { 
  PsychologicalTestScores, 
  PsychologicalTestPercentages, 
  PsychologicalTestTopic,
  LikertScaleAnswer 
} from '../types/psychologicalTest';

/**
 * Максимальный балл по каждой теме (5 вопросов × 4 балла максимум)
 */
const MAX_SCORE_PER_TOPIC = 20;

/**
 * Маппинг вопросов к темам (порядок вопросов: 1-5 стресс, 6-10 тревога, 11-15 отношения, 16-20 самооценка, 21-25 гнев, 26-30 депрессия)
 */
const QUESTION_TO_TOPIC_MAP: Record<number, PsychologicalTestTopic> = {
  // Стресс (1-5)
  1: 'stress',
  2: 'stress',
  3: 'stress',
  4: 'stress',
  5: 'stress',
  // Тревога (6-10)
  6: 'anxiety',
  7: 'anxiety',
  8: 'anxiety',
  9: 'anxiety',
  10: 'anxiety',
  // Отношения (11-15)
  11: 'relationships',
  12: 'relationships',
  13: 'relationships',
  14: 'relationships',
  15: 'relationships',
  // Самооценка (16-20)
  16: 'self-esteem',
  17: 'self-esteem',
  18: 'self-esteem',
  19: 'self-esteem',
  20: 'self-esteem',
  // Гнев (21-25)
  21: 'anger',
  22: 'anger',
  23: 'anger',
  24: 'anger',
  25: 'anger',
  // Депрессия (26-30)
  26: 'depression',
  27: 'depression',
  28: 'depression',
  29: 'depression',
  30: 'depression'
};

/**
 * Рассчитывает баллы по каждой теме на основе ответов
 * @param answers - массив ответов (0-4) для 30 вопросов в порядке от 1 до 30
 * @returns объект с баллами по каждой теме (0-20)
 */
export function calculateTestScores(answers: LikertScaleAnswer[]): PsychologicalTestScores {
  if (answers.length !== 30) {
    throw new Error(`Expected 30 answers, got ${answers.length}`);
  }

  const scores: PsychologicalTestScores = {
    stress: 0,
    anxiety: 0,
    relationships: 0,
    selfEsteem: 0,
    anger: 0,
    depression: 0
  };

  // Суммируем баллы по каждой теме
  answers.forEach((answer, index) => {
    const questionNumber = index + 1; // Вопросы нумеруются с 1
    const topic = QUESTION_TO_TOPIC_MAP[questionNumber];
    
    if (!topic) {
      console.warn(`No topic mapping found for question ${questionNumber}`);
      return;
    }

    // Добавляем балл к соответствующей теме
    switch (topic) {
      case 'stress':
        scores.stress += answer;
        break;
      case 'anxiety':
        scores.anxiety += answer;
        break;
      case 'relationships':
        scores.relationships += answer;
        break;
      case 'self-esteem':
        scores.selfEsteem += answer;
        break;
      case 'anger':
        scores.anger += answer;
        break;
      case 'depression':
        scores.depression += answer;
        break;
    }
  });

  return scores;
}

/**
 * Нормализует баллы в проценты (0-100)
 * @param scores - баллы по каждой теме (0-20)
 * @returns проценты по каждой теме (0-100)
 */
export function normalizeToPercentages(scores: PsychologicalTestScores): PsychologicalTestPercentages {
  return {
    stress: Math.round((scores.stress / MAX_SCORE_PER_TOPIC) * 100),
    anxiety: Math.round((scores.anxiety / MAX_SCORE_PER_TOPIC) * 100),
    relationships: Math.round((scores.relationships / MAX_SCORE_PER_TOPIC) * 100),
    selfEsteem: Math.round((scores.selfEsteem / MAX_SCORE_PER_TOPIC) * 100),
    anger: Math.round((scores.anger / MAX_SCORE_PER_TOPIC) * 100),
    depression: Math.round((scores.depression / MAX_SCORE_PER_TOPIC) * 100)
  };
}

/**
 * Рассчитывает полные результаты теста (баллы и проценты)
 * @param answers - массив ответов (0-4) для 30 вопросов
 * @returns объект с баллами и процентами по каждой теме
 */
export function calculateTestResults(answers: LikertScaleAnswer[]): {
  scores: PsychologicalTestScores;
  percentages: PsychologicalTestPercentages;
} {
  const scores = calculateTestScores(answers);
  const percentages = normalizeToPercentages(scores);
  
  return {
    scores,
    percentages
  };
}

