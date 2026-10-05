---
id: 0009
title: Pin ESLint 9 across the repo
status: accepted
date: 2026-10-05
needed-by: M0
reversibility: easy
decided-by: shivam
---

## Context

Ticket #5 pinned ESLint 10.12.0 and `@eslint/js` 10.0.1 in `@portfolio/config`. Ticket #6 brought in `eslint-config-next` 16.3.8, the lint config Next.js generates. It depends on plugins whose latest releases (checked on npm, 2026-10-05) stop at ESLint 9:

- `eslint-plugin-react` 7.37.5: peer `eslint` "^3 || … || ^8 || ^9.7"
- `eslint-plugin-import` 2.32.0: peer "… || ^8 || ^9"
- `eslint-plugin-jsx-a11y` 6.10.2: peer "… || ^8 || ^9"

`create-next-app` itself wrote `"eslint": "^9"`, which resolved to 9.39.5, the release npm tags as `maintenance`.

## Options

### Option 1: ESLint 9.39.5 everywhere

- **Pros:** one ESLint version in the repo, so the shared config and Next's config load into the same ESLint. Every plugin in the stack supports it. typescript-eslint 8.71.0 supports "^8.57.0 || ^9.0.0 || ^10.0.0".
- **Cons:** one major behind the latest. ESLint 10's new features aren't available.
- **Cost to reverse:** easy. Bump the versions once the plugins catch up.

### Option 2: ESLint 10 for the API and contracts, ESLint 9 for the web app

- **Pros:** the newest ESLint wherever Next's plugins aren't involved.
- **Cons:** two ESLint majors and two shared configs to maintain. A rule or option that differs between majors behaves differently from package to package.
- **Cost to reverse:** easy.

## Recommendation

Option 1. Supporting two ESLint majors buys nothing at this size.

## Decision

Option 1, as recommended (2026-10-05).

## Consequences

- `@portfolio/config` pins `eslint` 9.39.5 and `@eslint/js` 9.39.5. `apps/web` pins `eslint` 9.39.5.
- `CLAUDE.md`'s "latest stable versions" rule has a third pinned exception.

## Revisit when

`eslint-plugin-react`, `eslint-plugin-import` and `eslint-plugin-jsx-a11y` all list ESLint 10 in their peer dependencies.
