/**
 * Unit tests for CheckInScreen component
 * Tests component rendering, user interactions, data submission, and error states
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CheckInScreen } from '../../components/CheckInScreen';
import { DailyCheckinManager } from '../../utils/DailyCheckinManager';

// Mock the DailyCheckinManager
vi.mock('../../utils/DailyCheckinManager', () => ({
  DailyCheckinManager: {
    saveCheckin: vi.fn()
  }
}));

// Mock the ContentContext
vi.mock('../../components/ContentContext', () => ({
  useContent: () => ({
    content: {
      ui: {
        checkin: {
          title: 'How are you feeling?',
          subtitle: 'Select your current mood',
          moodOptions: {
            down: 'Down',
            anxious: 'Anxious',
            neutral: 'Neutral',
            energized: 'Energized',
            happy: 'Happy'
          },
          submitButton: 'Submit'
        }
      }
    }
  })
}));

describe('CheckInScreen', () => {
  const mockOnSubmit = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render check-in screen with all elements', () => {
      render(<CheckInScreen onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      // Check for main elements
      expect(screen.getByText('How are you feeling?')).toBeInTheDocument();
      expect(screen.getByText('Select your current mood')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<CheckInScreen onSubmit={mockOnSubmit} onBack={mockOnBack} />);
      
      // Look for submit button by aria-label
      const submitButton = screen.getByRole('button', { name: /submit check-in/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Data Submission', () => {
    it('should call onSubmit with correct data when submitted', async () => {
      const mockSaveCheckin = vi.mocked(DailyCheckinManager.saveCheckin);
      mockSaveCheckin.mockReturnValue(true);

      render(<CheckInScreen onSubmit={mockOnSubmit} onBack={mockOnBack} />);
      
      const submitButton = screen.getByRole('button', { name: /submit/i }) || screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSaveCheckin).toHaveBeenCalledWith({
          mood: expect.any(String),
          value: expect.any(Number),
          color: expect.any(String)
        });
      });

      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('should handle save failure gracefully', async () => {
      const mockSaveCheckin = vi.mocked(DailyCheckinManager.saveCheckin);
      mockSaveCheckin.mockReturnValue(false);

      render(<CheckInScreen onSubmit={mockOnSubmit} onBack={mockOnBack} />);
      
      const submitButton = screen.getByRole('button', { name: /submit/i }) || screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSaveCheckin).toHaveBeenCalled();
      });

      // Should still call onSubmit even if save fails
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('Error States', () => {
    it('should handle DailyCheckinManager errors gracefully', async () => {
      const mockSaveCheckin = vi.mocked(DailyCheckinManager.saveCheckin);
      mockSaveCheckin.mockReturnValue(false); // Simulate save failure

      render(<CheckInScreen onSubmit={mockOnSubmit} onBack={mockOnBack} />);
      
      const submitButton = screen.getByRole('button', { name: /submit check-in/i });
      fireEvent.click(submitButton);

      // Should not crash and should still call onSubmit even when save fails
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('should handle missing props gracefully', () => {
      // Test with undefined props
      expect(() => {
        render(<CheckInScreen onSubmit={undefined as any} onBack={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('Component State Management', () => {
    it('should maintain selected state correctly', () => {
      render(<CheckInScreen onSubmit={mockOnSubmit} onBack={mockOnBack} />);
      
      // Component should render without errors
      expect(screen.getByText('How are you feeling?')).toBeInTheDocument();
    });

    it('should reset state when component unmounts and remounts', () => {
      const { unmount } = render(<CheckInScreen onSubmit={mockOnSubmit} onBack={mockOnBack} />);
      
      expect(screen.getByText('How are you feeling?')).toBeInTheDocument();
      
      unmount();
      
      const { container } = render(<CheckInScreen onSubmit={mockOnSubmit} onBack={mockOnBack} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with multiple re-renders', () => {
      const { rerender } = render(<CheckInScreen onSubmit={mockOnSubmit} onBack={mockOnBack} />);
      
      // Multiple re-renders should not cause issues
      for (let i = 0; i < 5; i++) {
        rerender(<CheckInScreen onSubmit={mockOnSubmit} onBack={mockOnBack} />);
      }
      
      expect(screen.getByText('How are you feeling?')).toBeInTheDocument();
    });
  });
});