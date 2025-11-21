// Типы для психологического теста Menhausen

/**
 * Темы психологического теста (6 направлений)
 */
export type PsychologicalTestTopic = 
  | 'stress' 
  | 'anxiety' 
  | 'relationships' 
  | 'self-esteem' 
  | 'anger' 
  | 'depression';

/**
 * Ответ по шкале Лайкерта (0-4)
 */
export type LikertScaleAnswer = 0 | 1 | 2 | 3 | 4;

/**
 * Структура вопроса психологического теста
 */
export interface PsychologicalTestQuestion {
  id: string; // "q1", "q2", etc.
  topic: PsychologicalTestTopic;
  text: string; // локализованный текст вопроса
  order: number; // 1-30
}

/**
 * Ответ пользователя на вопрос
 */
export interface PsychologicalTestAnswer {
  questionId: string;
  answer: LikertScaleAnswer;
}

/**
 * Баллы по каждой теме (0-20, так как 5 вопросов × максимум 4 балла)
 */
export interface PsychologicalTestScores {
  stress: number; // 0-20
  anxiety: number; // 0-20
  relationships: number; // 0-20
  selfEsteem: number; // 0-20
  anger: number; // 0-20
  depression: number; // 0-20
}

/**
 * Проценты по каждой теме (0-100)
 */
export interface PsychologicalTestPercentages {
  stress: number; // 0-100
  anxiety: number; // 0-100
  relationships: number; // 0-100
  selfEsteem: number; // 0-100
  anger: number; // 0-100
  depression: number; // 0-100
}

/**
 * Запись в истории прохождения теста
 */
export interface PsychologicalTestHistoryEntry {
  date: string; // ISO date
  scores: PsychologicalTestScores;
  percentages: PsychologicalTestPercentages;
}

/**
 * Полные результаты психологического теста
 */
export interface PsychologicalTestResults {
  lastCompletedAt: string; // ISO date
  scores: PsychologicalTestScores;
  percentages: PsychologicalTestPercentages;
  history: PsychologicalTestHistoryEntry[];
}

/**
 * Временные данные прохождения теста (для хранения во время прохождения)
 */
export interface PsychologicalTestSession {
  answers: PsychologicalTestAnswer[]; // массив ответов на 30 вопросов
  currentQuestionIndex: number; // текущий вопрос (0-29)
}

