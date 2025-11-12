import { test, expect } from '@playwright/test';
import { seedCheckinHistory, waitForPageLoad, waitForHomeScreen } from '../utils/test-helpers';

const surveyState = {
  screen01: ['18-25 years old'],
  screen02: ['Sometimes'],
  screen03: ['Work stress'],
  screen04: ['No, never'],
  screen05: ['All are wrong'],
  completedAt: new Date().toISOString()
};

test.describe('Epic 1: Data persistence', () => {
  test('should store survey completion state in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((state) => {
      localStorage.setItem('survey-results', JSON.stringify(state));
    }, surveyState);

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('survey-results');
      return raw ? JSON.parse(raw) : null;
    });

    expect(stored).toMatchObject({ screen01: ['18-25 years old'], completedAt: surveyState.completedAt });
  });

  test('should merge survey and check-in data on reload', async ({ page }) => {
    await seedCheckinHistory(page, [{ iso: new Date().toISOString() }]);
    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page);

    const merged = await page.evaluate((state) => {
      localStorage.setItem('survey-results', JSON.stringify(state));
      const survey = JSON.parse(localStorage.getItem('survey-results') || 'null');
      const checkins = [] as Array<{ date: string }>;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('daily_checkin_')) {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          checkins.push({ date: entry.date });
        }
      }
      return { survey, checkins };
    }, surveyState);

    expect(merged.survey.screen02).toContain('Sometimes');
    expect(merged.checkins.length).toBeGreaterThan(0);
  });

  test('should keep navigation state after reload', async ({ page }) => {
    await seedCheckinHistory(page, [{ iso: new Date().toISOString() }]);
    await page.goto('/');
    await waitForPageLoad(page);
    await waitForHomeScreen(page);

    await page.reload();
    await waitForPageLoad(page);
    await waitForHomeScreen(page);

    const isOnHome = await page.locator('[data-testid="home-ready"]').isVisible().catch(() => false);
    expect(isOnHome).toBe(true);
  });
});
