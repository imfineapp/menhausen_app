module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      url: ['http://localhost:4173/'],
      startServerCommand: 'npm run build && npm run preview -- --port 4173',
      startServerReadyPattern: 'Local:',
      settings: {
        chromeFlags: '--no-sandbox',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
      },
    },
  },
}
