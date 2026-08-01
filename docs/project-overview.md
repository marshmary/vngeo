# Project Overview — Vietnam Economic Zones (vngeo)

> Verified 2026-08-01.

## Purpose

An interactive web application that maps Vietnam's six economic zones on a Leaflet map and surrounds it with supporting features: a zone detail panel, a documents browser (Supabase Storage), a quiz system, a map-drawing tutorial, a feedback form, page-visit analytics, and an admin dashboard.

## Executive Summary

vngeo is a **single-page React 19 + TypeScript app** backed by **Supabase** (Postgres, Auth, Storage, RPCs). It ships **no custom REST backend** — all backend access flows through a static service layer in `src/services/`. Global UI state lives in three **Zustand** stores. It is deployed as a static bundle to **Netlify**.

> The repository was **reorganized on 2026-08-01**: the application was promoted to the **repo root** (there is no `vietnam-economic-zones/` subdirectory), and the entire local-Supabase/Docker stack was moved under `supabase/`. Treat the `README.md` and `docs/architecture/tech-stack.md` as stale; verify against the live tree or `_bmad-output/project-context.md`.

## Tech Stack

| | |
|---|---|
| **Language** | TypeScript 5.8 (strict) |
| **Framework** | React 19 |
| **Build** | Vite 8 (`@/` → `./src`, Terser) |
| **Routing** | react-router 8 (`'react-router'`) |
| **State** | Zustand 5 (persist + partialize) |
| **Backend** | Supabase 2.58 (Postgres 15, Auth, Storage, RPCs) |
| **Maps** | react-leaflet 5 / leaflet 1.9 (GADM GeoJSON) |
| **Styling** | Tailwind CSS 3 |
| **i18n** | i18next 25 (fallback `'vi'`) |
| **E2E tests** | Playwright 1.48 |

## Architecture Classification

- **Type:** Monolith (single cohesive web app)
- **Parts:** 1 — web, at repo root
- **Pattern:** Component-based SPA with a service layer + BaaS backend
- **Source root:** `src/` (`@/` alias)
- **Entry point:** `index.html` → `src/main.tsx` → `src/App.tsx`

## Repository Structure

```
vngeo/                 # repo root = app root
├── src/               # app source (components, pages, services, stores, types, utils, hooks, lib, i18n, locales)
├── public/vietnam-map-data/   # static GADM GeoJSON
├── schemas/           # SQL (numbered, run in Supabase SQL Editor)
├── playwright/        # E2E specs + support (factories, fixtures, helpers)
├── supabase/          # local Docker stack (run docker from here)
├── docs/              # this documentation
├── netlify.toml, vite.config.ts, tsconfig*.json, tailwind.config.js, eslint.config.js
└── package.json
```

## Key Routes

| Route | Page | Auth |
|---|---|---|
| `/` | Interactive map + zone detail | Public |
| `/documents` | Document browser | Public |
| `/quizzes`, `/quiz/:quizId` | Quiz list / quiz taking | Public |
| `/map-drawing`, `/feedback` | Tutorial / feedback form | Public |
| `/admin`, `/admin/quiz/:quizId/edit` | Admin dashboard / quiz editor | Admin |

## Supabase Tables

`general_settings` · `quizzes` · `quiz_questions` · `quiz_options` · `page_visits` — all with RLS enabled. Plus the `documents` Storage bucket.

## Documentation Map

- **[Architecture](./architecture.md)** — how the layers fit together
- **[Source Tree Analysis](./source-tree-analysis.md)** — annotated folder map
- **[Data Models](./data-models.md)** — tables, RLS, RPCs, storage
- **[API Contracts](./api-contracts.md)** — service-layer surface
- **[Component Inventory](./component-inventory.md)** — components, routes, tokens
- **[Development Guide](./development-guide.md)** — setup, testing, deployment
- **[Index](./index.md)** — master entry point

## Quick Start

```bash
npm install
# Option A: cloud Supabase — copy .env.local.example → .env.local, set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
# Option B: local stack    — cd supabase && bash setup-local-supabase.sh && docker compose up -d
npm run dev
```

Node 20 required (`.nvmrc`).
