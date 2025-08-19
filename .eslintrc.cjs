module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', 'imports/**/*'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    'react-refresh/only-export-components': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    // Allow any type for flexibility in development
    '@typescript-eslint/no-explicit-any': 'off',
    // Allow empty interfaces for extending
    '@typescript-eslint/no-empty-interface': 'off',
    // Allow non-null assertion for cases where we know the value is not null
    '@typescript-eslint/no-non-null-assertion': 'off',
    // Allow empty functions
    '@typescript-eslint/no-empty-function': 'off',
    // Allow require statements
    '@typescript-eslint/no-var-requires': 'off',
  },
}
