import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/config/setup.ts'],
    include: [
      'tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'tests/e2e/**',
      '**/*.config.*',
    ],
    coverage: {
      provider: 'v8',
      all: false,
      include: [
        'src/stores/achievements.store.ts',
        'src/stores/points.store.ts',
        'src/stores/checkin.store.ts',
        'src/stores/actions/achievement-display.actions.ts',
        'services/achievementChecker.ts',
        'services/achievementDisplayService.ts',
        'src/domain/achievements.domain.ts',
        'src/domain/pointsHistory.domain.ts',
        'src/domain/mentalLevel.domain.ts',
        'utils/PointsManager.ts',
        'utils/articlesAccess.ts',
        'utils/pointsLevels.ts',
        'utils/supabaseSync/rewardService.ts',
        'utils/achievementsMetadata.ts',
      ],
      exclude: ['components/ui/**', '**/*.d.ts', 'data/**', 'tests/**'],
      reporter: ['text', 'lcov'],
      thresholds: {
        global: {
          statements: 80,
          branches: 75,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': new URL('./', import.meta.url).pathname,
      '@/components': new URL('./components/', import.meta.url).pathname,
      '@/utils': new URL('./utils/', import.meta.url).pathname,
      '@/types': new URL('./types/', import.meta.url).pathname,
      '@/data': new URL('./data/', import.meta.url).pathname,
    },
  },
});
