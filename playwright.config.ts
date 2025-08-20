import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Menhausen Telegram Mini App
 * 
 * This configuration supports:
 * - Telegram WebApp specific testing (primary target)
 * - Mobile viewport optimized for Mini Apps
 * - User story E2E testing
 * - Telegram WebApp API compatibility testing
 * - CI/CD compatibility: Uses Chromium in CI, WebKit locally
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  

  
  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'], // Add console output for test progress
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:5173',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on first retry */
    video: 'retain-on-failure',
    
    /* Telegram WebApp user agent for compatibility testing */
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1 TelegramWebView/7.0',
    

  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project for authentication and test data
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Telegram WebApp specific testing (primary target for Mini Apps)
    {
      name: 'Telegram WebApp',
      use: {
        // Use Chromium in CI for better compatibility, WebKit locally
        ...(process.env.CI ? devices['Desktop Chrome'] : devices['iPhone 12']),
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1 TelegramWebView/7.0',
        extraHTTPHeaders: {
          'X-Telegram-Bot-Api': '1',
        },
        // Mental health app specific settings
        colorScheme: 'light',
        locale: 'en-US',
        
        // CI-specific launch options
        ...(process.env.CI && {
          launchOptions: {
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--disable-gpu'
            ],
            headless: true,
          },
        }),
      },
      dependencies: ['setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !!process.env.CI, // Reuse existing server in CI
    timeout: 120 * 1000,
  },

  /* Global test configuration */
  timeout: process.env.CI ? 30 * 1000 : 30 * 1000, // Longer timeout in CI
  expect: {
    timeout: process.env.CI ? 10 * 1000 : 30 * 1000, // Longer expect timeout in CI
    toHaveScreenshot: {
      // Allow small differences for cross-browser compatibility
      threshold: 0.2,
      maxDiffPixels: 100,
    },
    toMatchSnapshot: {
      threshold: 0.2,
    },
  },

  /* Test output directories */
  outputDir: 'test-results/',
  
  /* Global setup and teardown */
  // globalSetup: './tests/config/global-setup.ts',
  // globalTeardown: './tests/config/global-teardown.ts',
});
