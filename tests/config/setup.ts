/**
 * Vitest Setup File
 * 
 * This file runs before each test and sets up:
 * - Testing Library utilities
 * - Custom matchers
 * - Global mocks
 * - Test environment configuration
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Setup global mocks
beforeEach(() => {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock,
    writable: true,
  });

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock fetch for API testing
  global.fetch = vi.fn();

  // Mock crypto.randomUUID for ID generation
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
    },
    writable: true,
  });

  // Mock navigator.onLine for offline/online testing
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
  });

  // Mock Telegram WebApp API
  Object.defineProperty(window, 'Telegram', {
    value: {
      WebApp: {
        ready: vi.fn(),
        expand: vi.fn(),
        close: vi.fn(),
        MainButton: {
          text: '',
          color: '#2481cc',
          textColor: '#ffffff',
          isVisible: false,
          isActive: true,
          setText: vi.fn(),
          onClick: vi.fn(),
          show: vi.fn(),
          hide: vi.fn(),
        },
        BackButton: {
          isVisible: false,
          onClick: vi.fn(),
          show: vi.fn(),
          hide: vi.fn(),
        },
        HapticFeedback: {
          impactOccurred: vi.fn(),
          notificationOccurred: vi.fn(),
          selectionChanged: vi.fn(),
        },
        initData: '',
        initDataUnsafe: {},
        version: '6.0',
        platform: 'ios',
        colorScheme: 'light',
        themeParams: {
          link_color: '#2481cc',
          button_color: '#2481cc',
          button_text_color: '#ffffff',
          secondary_bg_color: '#f1f1f1',
          hint_color: '#999999',
          bg_color: '#ffffff',
          text_color: '#000000',
        },
        isExpanded: true,
        viewportHeight: 844,
        viewportStableHeight: 800,
        headerColor: '#ffffff',
        backgroundColor: '#ffffff',
        isClosingConfirmationEnabled: false,
        sendData: vi.fn(),
        switchInlineQuery: vi.fn(),
        openLink: vi.fn(),
        openTelegramLink: vi.fn(),
        openInvoice: vi.fn(),
        showPopup: vi.fn(),
        showAlert: vi.fn(),
        showConfirm: vi.fn(),
        showScanQrPopup: vi.fn(),
        closeScanQrPopup: vi.fn(),
        readTextFromClipboard: vi.fn(),
        requestWriteAccess: vi.fn(),
        requestContact: vi.fn(),
      },
    },
    writable: true,
  });
});

// Custom test utilities
export const createMockSurveyResults = () => ({
  screen01: ['option1'],
  screen02: ['option2'],
  screen03: ['option3'],
  screen04: ['option4'],
  screen05: ['option5'],
  completedAt: new Date().toISOString(),
  userId: 'test-user-id',
});

export const createMockExerciseCompletion = () => ({
  cardId: 'test-card-id',
  answers: {
    question1: 'test answer 1',
    question2: 'test answer 2',
  },
  rating: 4,
  completedAt: new Date().toISOString(),
  completionCount: 1,
});

export const createMockUserPreferences = () => ({
  language: 'en',
  theme: 'light',
  notifications: true,
  analytics: false,
});

export const createMockProgressData = () => ({
  completedSurveys: 1,
  completedExercises: 5,
  lastActivity: new Date().toISOString(),
  achievements: ['first_survey', 'first_exercise'],
});

// Test data factory
export const TestDataFactory = {
  surveyResults: createMockSurveyResults,
  exerciseCompletion: createMockExerciseCompletion,
  userPreferences: createMockUserPreferences,
  progressData: createMockProgressData,
};

// Mock API responses
export const mockApiResponses = {
  success: { success: true, data: null },
  error: { success: false, error: 'Test error message', statusCode: 500 },
  surveySubmission: { success: true, data: { id: 'survey-123' } },
  exerciseSubmission: { success: true, data: { id: 'exercise-123' } },
};

// Console spy for testing console outputs
export const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
};
