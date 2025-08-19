# Testing Guide - Menhausen App

## Quick Commands

### Unit Tests
```bash
npm run test           # Run all unit tests
npm run test:watch     # Run tests in watch mode  
npm run test:coverage  # Run with coverage report
npm run test:ui        # Open Vitest UI
```

### E2E Tests
```bash
npm run test:e2e              # Run all E2E tests
npm run test:e2e:headed       # Run with browser visible
npm run test:e2e:ui           # Open Playwright UI
npm run test:e2e:report       # View last HTML report
```

### Specific Test Examples
```bash
# Run specific test
npm run test:e2e -- -g "should complete basic navigation"

# Run with timeout
npm run test:e2e -- --timeout=10000

# Run single test file
npm run test:e2e tests/e2e/user-stories/epic1-data-persistence.spec.ts
```

## Test Reports

### Unit Tests
- **Coverage**: `coverage/index.html` 
- **Results**: Console output

### E2E Tests  
- **HTML Report**: `playwright-report/index.html`
- **Screenshots**: `test-results/` (on failures)
- **Videos**: `test-results/` (on failures)

## Current Status

### ✅ Passing Tests
- **Unit Tests**: 16/16 tests PASSING
- **E2E Tests**: 6/9 tests PASSING

### ❌ Known Issues
- 3 E2E tests failing due to browser security restrictions
- Tests correctly validate UI navigation flow
- All infrastructure working properly

## Configuration

### Playwright Settings
- **Reporter**: HTML (auto-save, no auto-open)
- **Timeout**: 5 seconds (optimized)
- **Browser**: Telegram WebApp focused
- **Viewport**: 390x844 (mobile optimized)

### Vitest Settings  
- **Environment**: jsdom
- **Coverage**: v8 provider
- **Global**: Test functions available globally
- **Setup**: Browser API mocks included
