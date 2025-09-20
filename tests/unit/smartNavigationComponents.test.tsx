// Unit tests for Smart Navigation UI Components
// Tests ProgressIndicators, RecommendationCards, and QuickActions components

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgressIndicators } from '../../components/ProgressIndicators';
import { RecommendationCards } from '../../components/RecommendationCards';
import { QuickActions } from '../../components/QuickActions';
import { ProgressIndicator, Recommendation, QuickAction } from '../../types/userState';

describe('ProgressIndicators', () => {
  const mockIndicators: ProgressIndicator[] = [
    {
      title: 'Survey Completion',
      progress: 80,
      status: 'in-progress',
      icon: '📋',
      description: 'Complete your mental health assessment'
    },
    {
      title: 'Check-in Streak',
      progress: 100,
      status: 'completed',
      icon: '🔥',
      description: '7 days in a row!'
    },
    {
      title: 'Exercise Progress',
      progress: 0,
      status: 'not-started',
      icon: '🧘',
      description: 'Try your first mental health exercise'
    }
  ];

  it('should render progress indicators correctly', () => {
    render(<ProgressIndicators indicators={mockIndicators} />);

    expect(screen.getByText('Your Progress')).toBeInTheDocument();
    expect(screen.getByText('Survey Completion')).toBeInTheDocument();
    expect(screen.getByText('Check-in Streak')).toBeInTheDocument();
    expect(screen.getByText('Exercise Progress')).toBeInTheDocument();
  });

  it('should display progress percentages', () => {
    render(<ProgressIndicators indicators={mockIndicators} />);

    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should display descriptions', () => {
    render(<ProgressIndicators indicators={mockIndicators} />);

    expect(screen.getByText('Complete your mental health assessment')).toBeInTheDocument();
    expect(screen.getByText('7 days in a row!')).toBeInTheDocument();
    expect(screen.getByText('Try your first mental health exercise')).toBeInTheDocument();
  });

  it('should render nothing when no indicators provided', () => {
    const { container } = render(<ProgressIndicators indicators={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should display icons', () => {
    render(<ProgressIndicators indicators={mockIndicators} />);

    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('🧘')).toBeInTheDocument();
  });
});

describe('RecommendationCards', () => {
  const mockRecommendations: Recommendation[] = [
    {
      type: 'action',
      title: 'Complete Your Assessment',
      description: 'Finish your mental health survey to get personalized recommendations',
      action: 'Continue Survey',
      priority: 'high',
      icon: '📋',
      visible: true
    },
    {
      type: 'motivation',
      title: 'Great Progress!',
      description: 'You\'ve completed 3 exercises this week',
      action: 'View Progress',
      priority: 'medium',
      icon: '🎉',
      visible: true
    },
    {
      type: 'feature',
      title: 'New Exercise Available',
      description: 'Try the 4-7-8 breathing technique',
      action: 'Try Now',
      priority: 'low',
      icon: '🫁',
      visible: false
    }
  ];

  const mockOnRecommendationAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render visible recommendations only', () => {
    render(
      <RecommendationCards 
        recommendations={mockRecommendations}
        onRecommendationAction={mockOnRecommendationAction}
      />
    );

    expect(screen.getByText('Recommended for You')).toBeInTheDocument();
    expect(screen.getByText('Complete Your Assessment')).toBeInTheDocument();
    expect(screen.getByText('Great Progress!')).toBeInTheDocument();
    expect(screen.queryByText('New Exercise Available')).not.toBeInTheDocument();
  });

  it('should display priority badges', () => {
    render(
      <RecommendationCards 
        recommendations={mockRecommendations}
        onRecommendationAction={mockOnRecommendationAction}
      />
    );

    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('should call onRecommendationAction when action button is clicked', () => {
    render(
      <RecommendationCards 
        recommendations={mockRecommendations}
        onRecommendationAction={mockOnRecommendationAction}
      />
    );

    const continueButton = screen.getByText('Continue Survey');
    fireEvent.click(continueButton);

    expect(mockOnRecommendationAction).toHaveBeenCalledWith(mockRecommendations[0]);
  });

  it('should display descriptions and icons', () => {
    render(
      <RecommendationCards 
        recommendations={mockRecommendations}
        onRecommendationAction={mockOnRecommendationAction}
      />
    );

    expect(screen.getByText('Finish your mental health survey to get personalized recommendations')).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  it('should render nothing when no visible recommendations', () => {
    const hiddenRecommendations = mockRecommendations.map(rec => ({ ...rec, visible: false }));
    
    const { container } = render(
      <RecommendationCards 
        recommendations={hiddenRecommendations}
        onRecommendationAction={mockOnRecommendationAction}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });
});

describe('QuickActions', () => {
  const mockActions: QuickAction[] = [
    {
      id: 'checkin',
      title: 'Check-in',
      description: 'How are you feeling?',
      icon: '💭',
      color: 'bg-blue-500',
      action: vi.fn(),
      visible: true
    },
    {
      id: 'survey',
      title: 'Continue Survey',
      description: 'Complete your assessment',
      icon: '📋',
      color: 'bg-green-500',
      action: vi.fn(),
      visible: true
    },
    {
      id: 'exercise',
      title: 'Try Exercise',
      description: 'Mental health techniques',
      icon: '🧘',
      color: 'bg-purple-500',
      action: vi.fn(),
      visible: false
    },
    {
      id: 'profile',
      title: 'View Profile',
      description: 'Your progress & settings',
      icon: '👤',
      color: 'bg-gray-500',
      action: vi.fn(),
      visible: true
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render visible quick actions only', () => {
    render(<QuickActions actions={mockActions} />);

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Check-in')).toBeInTheDocument();
    expect(screen.getByText('Continue Survey')).toBeInTheDocument();
    expect(screen.getByText('View Profile')).toBeInTheDocument();
    expect(screen.queryByText('Try Exercise')).not.toBeInTheDocument();
  });

  it('should call action function when button is clicked', () => {
    render(<QuickActions actions={mockActions} />);

    const checkinButton = screen.getByText('Check-in');
    fireEvent.click(checkinButton);

    expect(mockActions[0].action).toHaveBeenCalled();
  });

  it('should display descriptions and icons', () => {
    render(<QuickActions actions={mockActions} />);

    expect(screen.getByText('How are you feeling?')).toBeInTheDocument();
    expect(screen.getByText('Complete your assessment')).toBeInTheDocument();
    expect(screen.getByText('Your progress & settings')).toBeInTheDocument();
    expect(screen.getByText('💭')).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('should render nothing when no visible actions', () => {
    const hiddenActions = mockActions.map(action => ({ ...action, visible: false }));
    
    const { container } = render(<QuickActions actions={hiddenActions} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render in grid layout', () => {
    const { container } = render(<QuickActions actions={mockActions} />);
    
    const gridContainer = container.querySelector('.grid.grid-cols-2');
    expect(gridContainer).toBeInTheDocument();
  });
});
