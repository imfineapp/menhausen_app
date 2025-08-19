import { test, expect } from '@playwright/test';

/**
 * Epic 1: Enhanced Data Persistence & API Integration E2E Tests
 * 
 * This test suite covers:
 * - User Story 1.1: Robust Data Recovery
 * - User Story 1.2: API Service Layer Foundation
 */

test.describe('Epic 1: Enhanced Data Persistence & API Integration', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to app and wait for it to load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Clear any existing data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('User Story 1.1: Robust Data Recovery', () => {
    
    test('should persist survey results immediately after each screen completion', async ({ page }) => {
      // Start the survey
      await page.getByRole('button', { name: /start survey|begin/i }).click();
      
      // Complete first survey screen
      await expect(page.getByText('Survey Question 1')).toBeVisible();
      await page.getByText('Option 1').click();
      await page.getByRole('button', { name: /next|continue/i }).click();
      
      // Verify data is persisted after first screen
      const surveyData1 = await page.evaluate(() => {
        const data = localStorage.getItem('menhausen_survey_results');
        return data ? JSON.parse(data) : null;
      });
      expect(surveyData1).toBeTruthy();
      expect(surveyData1.data.screen01).toContain('Option 1');
      
      // Complete second survey screen
      await expect(page.getByText('Survey Question 2')).toBeVisible();
      await page.getByText('Option 2').click();
      await page.getByRole('button', { name: /next|continue/i }).click();
      
      // Verify data is updated after second screen
      const surveyData2 = await page.evaluate(() => {
        const data = localStorage.getItem('menhausen_survey_results');
        return data ? JSON.parse(data) : null;
      });
      expect(surveyData2.data.screen02).toContain('Option 2');
      
      // Verify checksum and version are present
      expect(surveyData2.checksum).toBeTruthy();
      expect(surveyData2.version).toBe(2);
    });

    test('should recover partial survey progress after interruption', async ({ page }) => {
      // Start survey and complete first two screens
      await page.getByRole('button', { name: /start survey|begin/i }).click();
      
      await page.getByText('Option 1').click();
      await page.getByRole('button', { name: /next|continue/i }).click();
      
      await page.getByText('Option 2').click();
      await page.getByRole('button', { name: /next|continue/i }).click();
      
      // Simulate app interruption by refreshing page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Navigate back to survey
      await page.getByRole('button', { name: /continue survey|resume/i }).click();
      
      // Verify we're on the correct screen (screen 3)
      await expect(page.getByText('Survey Question 3')).toBeVisible();
      
      // Verify previous answers are preserved
      const recoveredData = await page.evaluate(() => {
        const data = localStorage.getItem('menhausen_survey_results');
        return data ? JSON.parse(data) : null;
      });
      
      expect(recoveredData.data.screen01).toContain('Option 1');
      expect(recoveredData.data.screen02).toContain('Option 2');
    });

    test('should validate and prevent corrupted state', async ({ page }) => {
      // Inject corrupted data into localStorage
      await page.evaluate(() => {
        localStorage.setItem('menhausen_survey_results', 'corrupted-data');
      });
      
      // Navigate to survey
      await page.getByRole('button', { name: /start survey|begin/i }).click();
      
      // App should detect corruption and start fresh
      await expect(page.getByText('Survey Question 1')).toBeVisible();
      
      // Verify corrupted data was cleared
      const cleanData = await page.evaluate(() => {
        const data = localStorage.getItem('menhausen_survey_results');
        return data;
      });
      
      expect(cleanData).toBeNull();
    });

    test('should handle data format migration from v1 to v2', async ({ page }) => {
      // Inject v1 format data
      await page.evaluate(() => {
        const v1Data = {
          version: 1,
          data: {
            screen01: ['old_option'],
            completedAt: new Date().toISOString(),
          },
          checksum: 'old_checksum'
        };
        localStorage.setItem('menhausen_survey_results', JSON.stringify(v1Data));
      });
      
      // Access the app to trigger migration
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check if data was migrated to v2
      const migratedData = await page.evaluate(() => {
        const data = localStorage.getItem('menhausen_survey_results');
        return data ? JSON.parse(data) : null;
      });
      
      expect(migratedData.version).toBe(2);
      expect(migratedData.data.screen01).toContain('old_option');
      expect(migratedData.data.migratedAt).toBeTruthy();
    });

    test('should display user-friendly error messages for storage failures', async ({ page }) => {
      // Mock localStorage to throw errors
      await page.addInitScript(() => {
        Storage.prototype.setItem = function() {
          throw new Error('Storage quota exceeded');
        };
      });
      
      // Try to start survey
      await page.getByRole('button', { name: /start survey|begin/i }).click();
      await page.getByText('Option 1').click();
      await page.getByRole('button', { name: /next|continue/i }).click();
      
      // Verify user-friendly error message is displayed
      await expect(page.getByText(/storage.*full|unable to save/i)).toBeVisible();
      await expect(page.getByText(/please try again|contact support/i)).toBeVisible();
    });
  });

  test.describe('User Story 1.2: API Service Layer Foundation', () => {
    
    test.beforeEach(async ({ page }) => {
      // Mock API endpoints
      await page.route('**/api/surveys', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { id: 'survey-123' } })
        });
      });
      
      await page.route('**/api/exercises/completion', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { id: 'exercise-123' } })
        });
      });
    });

    test('should handle survey submission with API sync', async ({ page }) => {
      let apiRequest: any = null;
      
      // Capture API request
      page.on('request', request => {
        if (request.url().includes('/api/surveys')) {
          apiRequest = request;
        }
      });
      
      // Complete full survey
      await page.getByRole('button', { name: /start survey|begin/i }).click();
      
      // Complete all survey screens
      for (let i = 1; i <= 5; i++) {
        await page.getByText(`Option ${i}`).click();
        await page.getByRole('button', { name: /next|continue|submit/i }).click();
      }
      
      // Wait for API call
      await page.waitForTimeout(1000);
      
      // Verify API was called
      expect(apiRequest).toBeTruthy();
      expect(apiRequest.method()).toBe('POST');
      
      // Verify request contains survey data
      const requestBody = JSON.parse(apiRequest.postData());
      expect(requestBody.screen01).toBeTruthy();
      expect(requestBody.completedAt).toBeTruthy();
    });

    test('should track exercise completion with timestamps', async ({ page }) => {
      let apiRequest: any = null;
      
      // Capture API request
      page.on('request', request => {
        if (request.url().includes('/api/exercises/completion')) {
          apiRequest = request;
        }
      });
      
      // Navigate to exercises
      await page.getByRole('button', { name: /exercises|themes/i }).click();
      await page.getByText('Self-Compassion').click();
      await page.getByText('Card 1').click();
      
      // Complete exercise
      await page.getByText('Answer 1').click();
      await page.getByText('Answer 2').click();
      await page.getByRole('button', { name: /submit|complete/i }).click();
      
      // Rate the exercise
      await page.getByRole('button', { name: '4' }).click();
      await page.getByRole('button', { name: /save|continue/i }).click();
      
      // Wait for API call
      await page.waitForTimeout(1000);
      
      // Verify API was called with timestamp
      expect(apiRequest).toBeTruthy();
      const requestBody = JSON.parse(apiRequest.postData());
      expect(requestBody.completedAt).toBeTruthy();
      expect(requestBody.rating).toBe(4);
      expect(new Date(requestBody.completedAt).getTime()).toBeCloseTo(Date.now(), -3);
    });

    test('should queue failed API calls for retry when offline', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);
      
      // Complete survey
      await page.getByRole('button', { name: /start survey|begin/i }).click();
      
      for (let i = 1; i <= 5; i++) {
        await page.getByText(`Option ${i}`).click();
        await page.getByRole('button', { name: /next|continue|submit/i }).click();
      }
      
      // Verify data is queued
      const queueData = await page.evaluate(() => {
        const queue = localStorage.getItem('menhausen_api_queue');
        return queue ? JSON.parse(queue) : [];
      });
      
      expect(queueData.length).toBeGreaterThan(0);
      expect(queueData[0].type).toBe('survey');
      
      // Go back online
      await page.context().setOffline(false);
      
      // Wait for retry mechanism
      await page.waitForTimeout(2000);
      
      // Verify queue is processed
      const processedQueue = await page.evaluate(() => {
        const queue = localStorage.getItem('menhausen_api_queue');
        return queue ? JSON.parse(queue) : [];
      });
      
      expect(processedQueue.length).toBe(0);
    });

    test('should resolve data synchronization conflicts', async ({ page }) => {
      // Create conflicting data scenarios
      await page.evaluate(() => {
        // Simulate local data
        const localData = {
          version: 2,
          data: { screen01: ['local_option'] },
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('menhausen_survey_results', JSON.stringify(localData));
      });
      
      // Mock API with different data
      await page.route('**/api/surveys', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              screen01: ['server_option'],
              updatedAt: new Date(Date.now() + 1000).toISOString(),
            }
          })
        });
      });
      
      // Trigger sync
      await page.getByRole('button', { name: /sync|refresh/i }).click();
      
      // Verify conflict resolution (server wins with newer timestamp)
      const resolvedData = await page.evaluate(() => {
        const data = localStorage.getItem('menhausen_survey_results');
        return data ? JSON.parse(data) : null;
      });
      
      expect(resolvedData.data.screen01).toContain('server_option');
    });

    test('should ensure privacy-compliant data transmission', async ({ page }) => {
      let apiRequest: any = null;
      
      // Capture API request
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          apiRequest = request;
        }
      });
      
      // Set user data with PII
      await page.evaluate(() => {
        localStorage.setItem('user_email', 'test@example.com');
        localStorage.setItem('user_phone', '+1234567890');
      });
      
      // Complete survey
      await page.getByRole('button', { name: /start survey|begin/i }).click();
      await page.getByText('Option 1').click();
      await page.getByRole('button', { name: /next|continue|submit/i }).click();
      
      // Wait for API call
      await page.waitForTimeout(1000);
      
      // Verify no PII in request
      const requestBody = apiRequest ? apiRequest.postData() : '';
      expect(requestBody).not.toContain('test@example.com');
      expect(requestBody).not.toContain('+1234567890');
      
      // Verify request uses HTTPS
      expect(apiRequest.url()).toMatch(/^https:/);
    });
  });

  test.describe('Integration: Data Persistence + API Sync', () => {
    
    test('should maintain data consistency across offline/online transitions', async ({ page }) => {
      // Start survey online
      await page.getByRole('button', { name: /start survey|begin/i }).click();
      await page.getByText('Option 1').click();
      await page.getByRole('button', { name: /next|continue/i }).click();
      
      // Go offline mid-survey
      await page.context().setOffline(true);
      
      await page.getByText('Option 2').click();
      await page.getByRole('button', { name: /next|continue/i }).click();
      
      // Complete survey offline
      await page.getByText('Option 3').click();
      await page.getByRole('button', { name: /next|continue/i }).click();
      
      // Go back online
      await page.context().setOffline(false);
      
      // Verify data sync occurs
      await page.waitForTimeout(2000);
      
      // Check sync status indicator
      await expect(page.getByText(/synced|up to date/i)).toBeVisible();
      
      // Verify data integrity
      const finalData = await page.evaluate(() => {
        const data = localStorage.getItem('menhausen_survey_results');
        return data ? JSON.parse(data) : null;
      });
      
      expect(finalData.data.screen01).toContain('Option 1');
      expect(finalData.data.screen02).toContain('Option 2');
      expect(finalData.data.screen03).toContain('Option 3');
    });
  });
});
