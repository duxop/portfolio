---
id: 0001
title: Monorepo on pnpm workspaces and Turborepo
status: accepted
date: 2026-10-03
needed-by: M0
reversibility: costly
decided-by: shivam
---

## Context

The site has two deployables, the web app (`apps/web`) and the API (`apps/api`, ADR 0002), which share one request schema (`packages/contracts`, PRD FR-10) and one set of TypeScript, ESLint and Prettier rules (`packages/config`). The brief (§6) names crusher's layout. This records why that layout is used here.

## Options

### Option 1: pnpm workspaces and Turborepo, laid out like crusher

- **Pros:** one clone, one lockfile, one PR for a change that spans web, API and schema. Shared packages are linked with `workspace:*` instead of being published. Turborepo runs `lint`, `typecheck`, `build` and `test` across packages in dependency order, with caching. It is the layout already learned in `../crusher`. Vercel builds only the projects a commit affects when workspace dependencies are declared ([Vercel: Using Monorepos](https://vercel.com/docs/monorepos), "Skipping unaffected projects").
- **Cons:** more config files up front (`pnpm-workspace.yaml`, `turbo.json`, per-package `package.json`). Workspace linking and task graphs are new concepts to learn in M0.
- **Cost to reverse:** costly. Every package's scripts and imports assume the workspace.

### Option 2: pnpm workspaces without Turborepo

- **Pros:** one less tool; `pnpm -r run <task>` runs a script in every package.
- **Cons:** no task caching and no dependency-ordered pipeline, so ordering such as "build contracts before typechecking the API" has to be scripted by hand.
- **Cost to reverse:** easy. Turborepo can be added later.

### Option 3: two repositories, with the schema published as a package

- **Pros:** each repo is simple on its own.
- **Cons:** a schema change needs a publish and two PRs; versions drift; a private registry or a public package is needed.
- **Cost to reverse:** costly.

## Recommendation

Option 1. Option 2 is lighter and would work for two apps. Option 1 wins because it matches crusher's layout, which is what this project is practising, and because the task graph earns its keep as soon as `contracts` must build before the apps.

## Decision

Option 1, as set in the brief (§6) and the setup decisions of 2026-10-03.

## Consequences

- M0 sets up `pnpm-workspace.yaml`, `turbo.json` and the `@portfolio/*` packages before any feature work.
- Every package declares its workspace dependencies in its own `package.json`, both for Turborepo's graph and for Vercel's skipping of unaffected projects.
- Environment variables that builds read must be listed in `turbo.json` (strict env mode), including `VERCEL_RELATED_PROJECTS` (ARCHITECTURE §6).

## Revisit when

After M2, if the Turborepo cache has saved nothing measurable and its config has caused more failures than it prevented. Then drop it for `pnpm -r` (Option 2).
