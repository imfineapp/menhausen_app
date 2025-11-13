import { test, expect } from '@playwright/test';

interface ProgressState {
  onboardingCompleted: boolean;
  surveyCompleted: boolean;
  psychologicalTestCompleted: boolean;
  firstCheckinDone: boolean;
}

type CheckinStatus = 'not_completed' | 'completed' | 'error';

const determineInitialScreen = (progress: ProgressState, checkinStatus: CheckinStatus): string => {
  if (!progress.onboardingCompleted) {
    return 'onboarding1';
  }

  if (!progress.surveyCompleted) {
    return 'survey01';
  }

  // После опроса идет психологический тест
  if (!progress.psychologicalTestCompleted) {
    return 'psychological-test-preambula';
  }

  if (checkinStatus === 'not_completed') {
    return 'checkin';
  }

  if (checkinStatus === 'completed') {
    return 'home';
  }

  return 'checkin';
};

test.describe('Smart Navigation logic', () => {
  test('routes new users to onboarding', () => {
    const next = determineInitialScreen(
      { onboardingCompleted: false, surveyCompleted: false, psychologicalTestCompleted: false, firstCheckinDone: false },
      'not_completed'
    );
    expect(next).toBe('onboarding1');
  });

  test('routes users with onboarding complete to survey', () => {
    const next = determineInitialScreen(
      { onboardingCompleted: true, surveyCompleted: false, psychologicalTestCompleted: false, firstCheckinDone: false },
      'not_completed'
    );
    expect(next).toBe('survey01');
  });

  test('routes users with survey complete to psychological test', () => {
    const next = determineInitialScreen(
      { onboardingCompleted: true, surveyCompleted: true, psychologicalTestCompleted: false, firstCheckinDone: false },
      'not_completed'
    );
    expect(next).toBe('psychological-test-preambula');
  });

  test('routes users with psychological test complete to check-in when needed', () => {
    const next = determineInitialScreen(
      { onboardingCompleted: true, surveyCompleted: true, psychologicalTestCompleted: true, firstCheckinDone: false },
      'not_completed'
    );
    expect(next).toBe('checkin');
  });

  test('routes users with completed check-in to home', () => {
    const next = determineInitialScreen(
      { onboardingCompleted: true, surveyCompleted: true, psychologicalTestCompleted: true, firstCheckinDone: true },
      'completed'
    );
    expect(next).toBe('home');
  });
});
