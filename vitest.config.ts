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
        'src/stores/**/*.{ts,tsx,js,jsx}',
        'src/domain/**/*.{ts,tsx,js,jsx}',
        'src/effects/**/*.{ts,tsx,js,jsx}',
        'components/**/*.{ts,tsx,js,jsx}',
      ],
      exclude: ['components/ui/**', '**/*.d.ts', 'data/**', 'tests/**'],
      reporter: ['text', 'lcov'],
      thresholds: {
        global: {
          statements: 40,
          branches: 35,
          functions: 40,
          lines: 40,
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
