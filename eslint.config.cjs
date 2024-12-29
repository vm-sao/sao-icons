const nx = require('@nx/eslint-plugin');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': 0,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: ['plugin:@nx/typescript', 'plugin:prettier/recommended'],
    rules: {},
  },
  {
    files: ['*.js', '*.jsx'],
    extends: ['plugin:@nx/javascript'],
    rules: {},
  },
  {
    files: ['*.json'],
    parser: 'jsonc-eslint-parser',
    rules: {
      '@nx/dependency-checks': 'warn',
    },
  },
];
