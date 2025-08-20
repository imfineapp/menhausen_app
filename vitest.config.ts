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
