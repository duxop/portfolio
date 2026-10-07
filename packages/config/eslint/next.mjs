import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { repoRules } from './rules.mjs';

/**
 * Shared ESLint config for Next.js apps: `export { default } from '@portfolio/config/eslint/next';`
 * Built on Next's own configs instead of base.mjs, because both register the typescript-eslint plugin.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { files: ['**/*.{ts,tsx,mts,cts}'], rules: repoRules },
]);
