---
id: 0005
title: Pin TypeScript 6.0 across the repo
status: accepted
date: 2026-10-03
needed-by: M0
reversibility: easy
decided-by: shivam
---

## Context

On 2026-10-03 the newest TypeScript on npm is 7.0.2 (released 2026-07-08), the native compiler, and the newest 6.x is 6.0.3. The tools:

- **typescript-eslint** (latest 8.71.0) supports "`>=4.8.4 <6.1.0`" ([dependency versions](https://typescript-eslint.io/users/dependency-versions)). TypeScript 7 is outside that range.
- **Next.js 16.3** supports TypeScript 7 through the `tsc` CLI, because "TypeScript 7 does not currently provide the JavaScript compiler API" ([Next.js: TypeScript](https://nextjs.org/docs/app/api-reference/config/typescript), 16.3.8).

The type-aware ESLint config in `packages/config` (M0) depends on typescript-eslint.

## Options

### Option 1: TypeScript 6.0.3 everywhere

- **Pros:** every tool in the stack supports it. One compiler, so the editor, `tsc`, ESLint and `next build` agree.
- **Cons:** misses TypeScript 7's speed. Irrelevant at this size.
- **Cost to reverse:** easy. Bump one version once the tools catch up.

### Option 2: TypeScript 7 everywhere

- **Pros:** the newest compiler.
- **Cons:** typescript-eslint is outside its supported range. Its packages keep an open peer dependency "to allow for experimentation", and an unsupported version makes the parser log a warning. That means lint failures or warnings nobody can act on, in a project where lint is a CI gate.
- **Cost to reverse:** easy.

### Option 3: TypeScript 7 for `tsc`, TypeScript 6 for ESLint

- **Pros:** fast type checks, and lint still works.
- **Cons:** two compilers can disagree, and the cause of an error stops being obvious. That is too much moving machinery for a learning project.
- **Cost to reverse:** easy.

## Recommendation

Option 1. It's the only option every tool in the stack supports today.

## Decision

Option 1, as recommended (2026-10-03).

## Consequences

- The root `package.json` pins `typescript` at 6.0.3. A package that needs TypeScript itself (`apps/web`, for `next build`) declares the same exact version, so pnpm links the one copy.
- The "Using TypeScript 7" section of the Next.js docs does not apply.
- `CLAUDE.md`'s "latest stable versions" rule has this one exception.

## Revisit when

typescript-eslint's supported range includes 7.x.
