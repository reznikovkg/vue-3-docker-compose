import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import vue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import globals from 'globals';

const tsFiles = ['**/*.{ts,mts,cts,tsx}'];

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: config.files ?? tsFiles,
  })),
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  eslintConfigPrettier,
]);
