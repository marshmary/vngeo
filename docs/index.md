# Project Documentation Index

> Vietnam Economic Zones (vngeo) · Regenerated 2026-08-01 (full rescan, post-reorganization)

## Project Overview

- **Type:** Monolith (single cohesive web app)
- **Primary Language:** TypeScript 5.8 (strict)
- **Architecture:** Component-based SPA with a service layer + Supabase BaaS
- **Framework:** React 19 + Vite 8
- **Backend:** Supabase (Postgres 15, Auth, Storage, RPCs) — no custom REST backend

> The repo was reorganized on 2026-08-01: the app is at the **repo root** (no `vietnam-economic-zones/` directory); the local-Supabase/Docker stack is under `supabase/`. The `README.md` and `docs/architecture/tech-stack.md` predate the reorg and are **stale** — verify against the live tree or `_bmad-output/project-context.md`.

## Quick Reference

- **Tech Stack:** React 19, TypeScript 5.8, Vite 8, Supabase 2.58, Zustand 5, Tailwind 3, react-leaflet 5, i18next 25 (fallback `'vi'`), Playwright 1.48
- **Entry Point:** `index.html` → `src/main.tsx` → `src/App.tsx`
- **Source Root:** `src/` (`@/` alias)
- **Architecture Pattern:** Component SPA → service layer (`src/services/`) → Supabase BaaS

## Generated Documentation

- [Project Overview](./project-overview.md) — purpose, tech stack, quick start
- [Architecture](./architecture.md) — layers, data, state, deployment, testing
- [Source Tree Analysis](./source-tree-analysis.md) — annotated folder map
- [Data Models](./data-models.md) — tables, RLS, RPCs, storage, seeds
- [API Contracts](./api-contracts.md) — service-layer surface + RPC catalog
- [Component Inventory](./component-inventory.md) — components, routes, design tokens
- [Development Guide](./development-guide.md) — setup, env, commands, testing, deployment
- [Project Scan Report](./project-scan-report.json) — machine-readable scan that fed the above docs

## Existing Documentation

### Setup & local development
- [Local Development (detailed)](./local-development.md) — full local-stack walkthrough
- [Local Development Integration Guide](./local-development-integration-guide.md)
- [Supabase Setup](./setup/SUPABASE_SETUP.md) — storage + RLS setup
- [Setup Guide](./setup/setup.md) — environment prerequisites
- [Start Development](./setup/start-development.md)

### Operations
- [Supabase Keep-Alive Guide](./supabase-keep-alive-guide.md)
- [Supabase Reactivation Verification](./supabase-reactivation-verification.md)

### Design & product
- [UI Architecture](./ui-architecture.md) — frontend architecture (pre-reorg)
- [Development Blueprint](./development-blueprint.md) — phase-by-phase build guide
- [Brainstorming Results](./brainstorming-session-results.md) — original product ideation
- [UI Modernization Spec](./design/vietnam-economic-zones-ui-modernization-spec.md) — dark theme design spec
- [Analytics Dashboard Approach](./architecture/analytics-dashboard-approach.md)
- [Coding Standards](./architecture/coding-standards.md)
- [Console Log Removal](./architecture/console-log-removal.md)
- [Tech Stack (legacy)](./architecture/tech-stack.md) — ⚠️ stale, pre-reorg versions
- [Source Tree (legacy)](./architecture/source-tree.md) — ⚠️ stale, pre-reorg layout

### Schema notes
- [Schema Quick Start](../schemas/QUICK_START.md)
- [Quiz 403 Error Fix](../schemas/QUIZ_403_ERROR_FIX.md)
- [Schema README](../schemas/README.md)

## Getting Started

```bash
npm install
# Option A — cloud Supabase: copy .env.local.example → .env.local, set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
# Option B — local stack:     cd supabase && bash setup-local-supabase.sh && docker compose up -d
npm run dev      # http://localhost:5173
```

Node 20 required (`.nvmrc`). All app/npm commands run from the repo root; all docker commands run from `supabase/`.

## Key Routes

| Route | Page | Auth |
|---|---|---|
| `/` | Interactive map + zone sidebar | Public |
| `/documents` | Document browser | Public |
| `/quizzes` | Quiz listing | Public |
| `/quiz/:quizId` | Quiz taking | Public |
| `/map-drawing` | Drawing tutorial | Public |
| `/feedback` | Feedback form | Public |
| `/admin` | Admin dashboard | Admin |
| `/admin/quiz/:quizId/edit` | Quiz editor | Admin |

## Supabase Tables

`general_settings` · `quizzes` · `quiz_questions` · `quiz_options` · `page_visits` — all RLS-enabled. Plus the `documents` Storage bucket.

## Stores

`useAuthStore` · `useMapStore` · `useUIStore` (Zustand v5, persisted via `partialize`)
