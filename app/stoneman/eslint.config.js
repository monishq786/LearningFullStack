const js = require('@eslint/js');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        sap: 'readonly',
        jQuery: 'readonly',
        require: 'readonly',
        module: 'readonly',
        setTimeout: 'readonly',
        $: 'readonly',
        fnGrowingFinishedHandler: 'readonly',
        resolve: 'readonly',
        reject: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      prettier: prettierPlugin, // Integrate Prettier into ESLint
      complexity: require('eslint-plugin-complexity'),
      sonarjs: require('eslint-plugin-sonarjs')
    },
    rules: {
      ...js.configs.recommended.rules, // ESLint recommended rules
      ...prettierConfig.rules,
      'prettier/prettier': 'error', // Show Prettier issues as ESLint errors
      'no-var': 'error', // Disallow the use of var
      'prefer-const': 'warn', // Suggest using const if a variable is never reassigned
      'no-unused-vars': 'warn', // Warn about unused variables
      eqeqeq: ['error', 'always'], // Require the use of === and !==
      'no-console': 'warn', // Warn on console statements
      'sonarjs/no-duplicate-string': 'warn', // Check for duplicate strings
      'sonarjs/no-collapsible-if': 'warn' // Check for collapsible if statements
    }
  }
];
