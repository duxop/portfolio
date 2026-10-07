import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import { repoRules } from './rules.mjs';

/** Shared ESLint config. A package uses it with `export { default } from '@portfolio/config/eslint';` */
export default defineConfig([
  globalIgnores(['**/dist/', '**/.next/']),
  {
    files: ['**/*.{js,mjs,ts}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: repoRules,
  },
]);
