# Project Overview - Vietnam Economic Zones

> Generated: 2026-05-16 | Scan Level: Exhaustive

## Project Name

Vietnam Economic Zones Explorer (vngeo)

## Purpose

An educational web application for high school students to explore Vietnam's six economic zones through an interactive map. Features zone information, document management, quiz functionality, analytics tracking, and admin tools.

## Tech Stack Summary

| Category | Technology |
|----------|-----------|
| Frontend | React 19 + TypeScript 5.8 |
| Build | Vite 4 + Terser |
| Styling | Tailwind CSS 3 + Framer Motion |
| State | Zustand (3 stores with persistence) |
| Routing | React Router DOM v7 |
| Maps | React Leaflet + Leaflet (OpenStreetMap) |
| Backend | Supabase (Auth, Database, Storage) |
| i18n | i18next (Vietnamese + English) |
| Testing | Vitest + React Testing Library |
| Deployment | Netlify |

## Architecture Type

Monolith — Single-page application (SPA) with Supabase backend-as-a-service.

## Repository Structure

- **Type:** Monolith
- **Source root:** `vietnam-economic-zones/src/`
- **Components:** 20+ React components across 7 categories
- **Pages:** 9 route-level pages
- **Services:** 7 service classes (all static methods)
- **Stores:** 3 Zustand stores
- **Types:** 5 TypeScript type definition files

## Key Features

1. **Interactive Map** — Leaflet-based map with 6 economic zones rendered as GeoJSON layers, hover/click interactions, zone legend, and island labels
2. **Zone Information** — Detailed zone cards with economic data (population, GDP, industries, area)
3. **Document Management** — Supabase Storage-based file manager with folder support, upload/download, admin-only delete
4. **Quiz System** — Full quiz CRUD for admins, timed quiz-taking with multiple-choice support, draft auto-save
5. **Analytics** — Page visit tracking, admin analytics dashboard with hourly/daily trends, device breakdown, top pages
6. **Admin Panel** — Tabbed admin interface (analytics, files, quizzes, settings)
7. **Internationalization** — Vietnamese (default) and English with automatic language detection
8. **First-time Guide** — 13-step onboarding tutorial for new users
9. **Feedback** — Embedded Google Form via configurable URL
10. **Map Drawing Tutorial** — Embedded YouTube video via configurable URL

## Database

5 Supabase tables: `general_settings`, `quizzes`, `quiz_questions`, `quiz_options`, `page_visits`
Plus SQL RPC functions for analytics aggregation.

## Deployment

Hosted on Netlify with SPA routing. Build: `tsc -b && vite build` in `vietnam-economic-zones/` directory.

## Getting Started

See [Development Guide](./development-guide-main.md) for full setup instructions.

Quick start:
```bash
cd vietnam-economic-zones
npm install
cp .env.example .env
# Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```
