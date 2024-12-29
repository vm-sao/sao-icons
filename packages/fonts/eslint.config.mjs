const baseConfig = require('../../eslint.config.cjs');

module.exports = [
  ...baseConfig,
  {
    files: ["*.js", "*.jsx"],
    rules: {}
  },
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}'],
        },
      ],
    },
    languageOptions: {
      parser: require('jsonc-eslint-parser'),
    },
  },
];
