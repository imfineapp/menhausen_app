import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { CheckinDetailsScreen } from '../../components/CheckinDetailsScreen';
import { ThemeCardManager } from '../../utils/ThemeCardManager';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock content context
vi.mock('../../components/ContentContext', () => ({
  useContent: () => ({
    content: {
      ui: {
        cards: {
          final: {
            why: 'Why?'
          }
        },
        navigation: {
          continue: 'Continue'
        }
      }
    },
    getLocalizedText: (text: string) => text,
    getCard: (cardId: string) => ({
      id: cardId,
      title: 'Test Card',
      questions: [
        { text: 'Question 1' },
        { text: 'Question 2' }
      ],
      finalMessage: {
        message: 'Test message',
        practiceTask: 'Test task',
        whyExplanation: 'Test explanation'
      }
    })
  })
}));

// Mock components
vi.mock('../../components/BottomFixedButton', () => ({
  BottomFixedButton: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick} data-testid="continue-button">
      {children}
    </button>
  )
}));

vi.mock('../../components/ProfileLayoutComponents', () => ({
  MiniStripeLogo: () => <div data-testid="mini-logo">Logo</div>
}));

describe('CheckinDetailsScreen - Answer Display', () => {
  const mockProps = {
    onBack: vi.fn(),
    checkinId: 'test-checkin',
    cardTitle: 'Test Card',
    checkinDate: '2024-01-01'
  };

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    ThemeCardManager.clearAllProgress();
  });

  it('should display "No answer provided yet" when no answers are saved', () => {
    render(<CheckinDetailsScreen {...mockProps} />);

    // Should show default message for both questions
    const noAnswerElements = screen.getAllByText('No answer provided yet.');
    expect(noAnswerElements).toHaveLength(2);
  });

  it('should display saved answers when available', () => {
    // Save some answers
    ThemeCardManager.saveQuestionAnswer('card-1', 'question-1', 'My answer to question 1');
    ThemeCardManager.saveQuestionAnswer('card-1', 'question-2', 'My answer to question 2');

    render(<CheckinDetailsScreen {...mockProps} />);

    // Should show the saved answers
    expect(screen.getByText('My answer to question 1')).toBeInTheDocument();
    expect(screen.getByText('My answer to question 2')).toBeInTheDocument();
  });

  it('should display partial answers correctly', () => {
    // Save only one answer
    ThemeCardManager.saveQuestionAnswer('card-1', 'question-1', 'Only first question answered');

    render(<CheckinDetailsScreen {...mockProps} />);

    // Should show the saved answer and default for the second
    expect(screen.getByText('Only first question answered')).toBeInTheDocument();
    expect(screen.getByText('No answer provided yet.')).toBeInTheDocument();
  });

  it('should handle completed card with answers', () => {
    // Save answers and mark card as completed
    ThemeCardManager.saveQuestionAnswer('card-1', 'question-1', 'Completed answer 1');
    ThemeCardManager.saveQuestionAnswer('card-1', 'question-2', 'Completed answer 2');
    ThemeCardManager.markCardCompleted('card-1', ['question-1', 'question-2'], 5);

    render(<CheckinDetailsScreen {...mockProps} />);

    // Should show the completed answers
    expect(screen.getByText('Completed answer 1')).toBeInTheDocument();
    expect(screen.getByText('Completed answer 2')).toBeInTheDocument();
  });
});
