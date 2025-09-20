// Tests the new smart navigation system based on user progress

import { test, expect } from '@playwright/test';

test.describe('Smart Navigation', () => {
  test.beforeEach(async ({ page: _page }) => {
    // Note: localStorage manipulation causes SecurityError in test environment
    // Tests focus on observable behavior without localStorage setup
  });

  test('should route new users to survey (smart navigation)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // With smart navigation, new users go directly to survey
    await expect(page.getByText('What challenges are you facing right now?')).toBeVisible();
    await expect(page.getByText('Select all that apply. This helps us personalize your experience.')).toBeVisible();
  });

  test('should show survey screen with proper layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should show survey screen with proper layout
    await expect(page.getByText('What challenges are you facing right now?')).toBeVisible();
    await expect(page.getByText('Select all that apply. This helps us personalize your experience.')).toBeVisible();
    await expect(page.locator('[data-name="Survey option"]').first()).toBeVisible();
  });

  test('should show survey options and continue button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should show survey options
    await expect(page.locator('[data-name="Survey option"]').first()).toBeVisible();
    
    // Should show continue button (initially disabled)
    await expect(page.locator('[data-name="Next button"]')).toBeVisible();
    await expect(page.locator('[data-name="Next button"]')).toBeDisabled();
  });

  test('should allow survey option selection', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should be able to select survey options
    const firstOption = page.locator('[data-name="Survey option"]').first();
    await expect(firstOption).toBeVisible();
    
    // Click first option
    await firstOption.click();
    
    // Continue button should become enabled
    await expect(page.locator('[data-name="Next button"]')).toBeEnabled();
  });

  test('should show survey options with proper styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should show survey options with proper styling
    const options = page.locator('[data-name="Survey option"]');
    await expect(options.first()).toBeVisible();
    
    // Check that options have proper styling (updated to match actual classes)
    const firstOption = options.first();
    await expect(firstOption).toHaveClass(/bg-\[#2a2a2a\]/);
  });

  test('should handle survey option interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should handle survey option interactions
    const options = page.locator('[data-name="Survey option"]');
    const firstOption = options.first();
    
    // Click first option
    await firstOption.click();
    
    // Option should be selected (visual feedback - updated to match actual classes)
    await expect(firstOption).toHaveClass(/bg-\[#e1ff00\]\/10/);
  });

  test('should load app gracefully with smart navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should load the app gracefully with smart navigation
    await expect(page.getByText('What challenges are you facing right now?')).toBeVisible();
    await expect(page.locator('[data-name="Survey option"]').first()).toBeVisible();
  });

  test('should show all survey options', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should show all expected survey options
    const expectedOptions = [
      'I struggle with anxiety',
      'I have trouble managing stress',
      'My mood feels unstable',
      'I have relationship difficulties',
      'I lack motivation or purpose',
      'I have sleep problems'
    ];

    for (const optionText of expectedOptions) {
      await expect(page.getByText(optionText)).toBeVisible();
    }
  });

  test('should enable continue button after selection', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Initially continue button should be disabled
    const continueButton = page.locator('[data-name="Next button"]');
    await expect(continueButton).toBeDisabled();

    // Select an option
    await page.locator('[data-name="Survey option"]').first().click();

    // Continue button should now be enabled
    await expect(continueButton).toBeEnabled();
  });
});