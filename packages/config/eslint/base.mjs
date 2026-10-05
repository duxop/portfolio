import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

/** Shared ESLint config. A package uses it with `export { default } from '@portfolio/config/eslint';` */
export default defineConfig([
  globalIgnores(['**/dist/', '**/.next/']),
  {
    files: ['**/*.{js,mjs,ts}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]);
