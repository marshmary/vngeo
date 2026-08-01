# Project Documentation Index

> Generated: 2026-05-16 | Vietnam Economic Zones (vngeo)

## Project Overview

- **Type:** Monolith SPA
- **Primary Language:** TypeScript
- **Architecture:** Component-based SPA with Supabase BaaS
- **Framework:** React 19 + Vite 4
- **Backend:** Supabase (Auth, Database, Storage)

## Quick Reference

- **Tech Stack:** React 19, TypeScript 5.8, Vite 4, Supabase 2.58, Zustand 5, Tailwind CSS 3, React Leaflet 5, i18next 25
- **Entry Point:** `vietnam-economic-zones/src/main.tsx`
- **Architecture Pattern:** Service Layer SPA with Zustand stores
- **Source Root:** `vietnam-economic-zones/src/`

## Generated Documentation

- [Project Overview](./project-overview.md)
- [Architecture](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [API Contracts](./api-contracts-main.md)
- [Data Models](./data-models-main.md)
- [Component Inventory](./component-inventory-main.md)
- [Development Guide](./development-guide-main.md)

## Existing Documentation

- [Architecture - Tech Stack](../docs/architecture/tech-stack.md) - Original tech stack specification
- [Architecture - Coding Standards](../docs/architecture/coding-standards.md) - Development rules and conventions
- [Architecture - Source Tree](../docs/architecture/source-tree.md) - Original source tree specification
- [Architecture - Analytics Dashboard](../docs/architecture/analytics-dashboard-approach.md) - Analytics dashboard proposal
- [Architecture - Console Log Removal](../docs/architecture/console-log-removal.md) - Production console stripping config
- [UI Architecture](../docs/ui-architecture.md) - Original frontend architecture document
- [Development Blueprint](../docs/development-blueprint.md) - Phase-by-phase development guide
- [Brainstorming Results](../docs/brainstorming-session-results.md) - Original product ideation
- [UI Modernization Spec](../docs/design/vietnam-economic-zones-ui-modernization-spec.md) - Dark theme design spec
- [Supabase Setup](../docs/setup/SUPABASE_SETUP.md) - Supabase storage + RLS setup guide
- [Setup Guide](../docs/setup/setup.md) - Environment prerequisites
- [Start Development](../docs/setup/start-development.md) - Quick-start with starter code
- [Schema README](../vietnam-economic-zones/schemas/README.md) - SQL schema documentation
- [Project README](../vietnam-economic-zones/README.md) - Default Vite README

## Getting Started

```bash
cd vietnam-economic-zones
npm install
cp .env.example .env
# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
npm run dev
```

## Key Routes

| Route | Page | Auth |
|-------|------|------|
| `/` | Interactive map + zone sidebar | Public |
| `/documents` | Document browser | Public |
| `/quizzes` | Quiz listing | Public |
| `/quiz/:id` | Quiz taking | Public |
| `/map-drawing` | Drawing tutorial | Public |
| `/feedback` | Feedback form | Public |
| `/admin` | Admin dashboard | Admin |
| `/admin/quiz/:id/edit` | Quiz editor | Admin |

## Supabase Tables

`general_settings` | `quizzes` | `quiz_questions` | `quiz_options` | `page_visits`

## Stores

`useAuthStore` | `useMapStore` | `useUIStore`
