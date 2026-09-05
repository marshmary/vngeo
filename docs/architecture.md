# Architecture — Vietnam Economic Zones (vngeo)

> Verified 2026-08-01 (post-reorganization); styling claims re-verified 2026-09-05 against the UI restructure (`de2809f`, 2026-08-02). The app lives at the repo root; the local-Supabase/Docker stack lives under `supabase/`.

## Executive Summary

vngeo is a **single-page React application** that presents Vietnam's economic zones on an interactive Leaflet map, with supporting quiz, document-browsing, analytics, and admin features. It uses **Supabase as a Backend-as-a-Service** (Postgres + Auth + Storage + RPCs) and ships **no custom REST backend**. All backend access is funneled through a static **service layer** in `src/services/`, and global UI state is held in three **Zustand** stores. The app is deployed as a static bundle to **Netlify**.

The repository was reorganized on 2026-08-01: the application was promoted to the **repo root** (no `vietnam-economic-zones/` subdirectory), and the entire local-Supabase/Docker stack was consolidated under `supabase/`.

## Technology Stack

| Category | Technology | Version | Notes |
|---|---|---|---|
| Language | TypeScript | ~5.8.3 | strict, `verbatimModuleSyntax`, `erasableSyntaxOnly` (no `enum`/`namespace`) |
| UI framework | React | ^19.1.1 | |
| Build tool | Vite | ^8.1.5 | `@vitejs/plugin-react` 6; `@/` → `./src`; Terser minify (drops console.log/info/debug) |
| Routing | react-router | ^8.2.0 | import from `'react-router'` (not `-dom`) |
| State | Zustand | ^5.0.8 | v5 double-call; `persist` + `partialize` |
| Backend (BaaS) | Supabase JS | ^2.58.0 | Postgres 15, Auth, Storage, RPCs |
| Maps | react-leaflet / leaflet | ^5.0.0 / ^1.9.4 | GADM GeoJSON |
| Styling | Tailwind CSS | ^3.4.17 | v3 `module.exports` config; semantic design tokens per `DESIGN.md` (brand/accent/neutrals/status, radius/shadow/type aliases) |
| In-house UI kit | `src/components/ui` | added 2026-08-02 | `Button`, `Card`, `Input`/`Textarea`/`Select`, `Badge`, `Spinner`, `Pagination`; token-driven, props fully forwarded (e2e-safe) |
| UI primitives | Headless UI | ^2.2.8 | `UserProfileDropdown` only |
| Animation | Framer Motion | ^12.23.16 | |
| Forms | React Hook Form | ^7.63.0 | `LoginPage` |
| i18n | i18next / react-i18next | ^25.5.2 / ^15.7.3 | fallback `'vi'` |
| Icons | FontAwesome v7 | ^3.1.0 / ^7.1.0 | |
| Linting | ESLint (flat) + typescript-eslint | ^10 / ^8.65 | react-hooks, react-refresh |
| E2E testing | Playwright | ^1.48.0 | 5 projects |
| Unit testing | Vitest + Testing Library | ^4.1.10 | **installed, no tests/scripts yet** |
| Node | | 20 | `.nvmrc` |

## Architecture Pattern

**Component-based SPA with a service-layer + BaaS backend.**

```
┌─────────────────────────────────────────────────────────────┐
│  React UI (src/pages, src/components)                        │
│    └─ reads/writes global state via Zustand hooks            │
└───────────────────────────┬─────────────────────────────────┘
                            │ NEVER call supabase directly
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Service Layer (src/services) — static classes                │
│    AuthService · QuizService · DocumentService ·              │
│    DocumentsPageService · SettingsService · AnalyticsService  │
│    + GADMService (instance, static-fetch)                     │
└───────────────────────────┬─────────────────────────────────┘
                            │ supabase-js
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase (BaaS): Postgres (5 tables, RLS, 3 RPCs) ·         │
│  Auth (GoTrue) · Storage (documents bucket)                  │
└─────────────────────────────────────────────────────────────┘
```

- **Components** use `React.FC<P>` with a props interface above and a default export at the bottom.
- **Services** are static classes with methods that throw on error (except `SettingsService` / `AnalyticsService`, which return nullish); caching lives at the service layer.
- **The `@/` alias** is mandatory for cross-directory imports; relative imports only for same-directory siblings.
- **Zone/map data is static** — loaded from `VIETNAM_ECONOMIC_ZONES` (`src/utils/constants.ts`) and GADM GeoJSON (`/public/vietnam-map-data/`), **not** from Supabase.

## Data Architecture

Five Postgres tables, **RLS enabled on all**:

- `general_settings` — key/value app settings (e.g. `map_drawing_video_url`, `feedback_form_url`).
- `quizzes` → `quiz_questions` → `quiz_options` (cascade-delete hierarchy; `created_by → auth.users`).
- `page_visits` — analytics events (immutable via RLS; `user_id → auth.users` on delete set null).

Plus the `analytics_summary_view` and 5 helper functions (3 invoked by RPC: `get_hourly_visits_24h`, `get_most_visited_pages`, `get_visits_by_date_range`). A `documents` **Storage bucket** holds uploaded files. No migration framework — schema is applied via numbered SQL files (`schemas/`) or the Docker init set.

→ Full schema, RLS, and seed details: [data-models.md](./data-models.md).

## API Design

There is no REST API. The contract surface is the **service layer**:

- **Auth** (`AuthService`): signIn/signUp/signOut/getSession/getUser/onAuthStateChange/updateUser/checkIsAdmin/setUserRole.
- **Quiz** (`QuizService`): CRUD over `quizzes`/`quiz_questions`/`quiz_options` (5-min cache); plus `QuizDraftService` (localStorage autosave).
- **Documents** (`DocumentService`, `DocumentsPageService`): Storage list/upload/remove/download/move on the `documents` bucket.
- **Settings** (`SettingsService`): key/value get/upsert over `general_settings`.
- **Analytics** (`AnalyticsService`): insert page visits + RPCs + aggregated reads.
- **Map** (`GADMService`): static fetch of GeoJSON.

Every DB/storage service awaits `supabase.auth.getSession()` before reads (private `ensureAuthReady()`) to dodge the cold-load RLS race — except analytics *writes*, which stay ungated so anonymous visitors are tracked.

→ Full method/operation/RPC catalog: [api-contracts.md](./api-contracts.md).

## State Management

Three persisted Zustand v5 stores (double-call pattern, `localStorage` backend):

| Store | Persisted (`partialize`) | Excluded | Highlights |
|---|---|---|---|
| `useAuthStore` | `user`, `session`, `isAdmin` | `isLoading`, `error` | `initializeAuth()` runs on app load; subscribes to auth-state changes; `isLoading` starts `true` |
| `useMapStore` | `mapCenter`, `zoomLevel`, `selectedZone` | `zones`, `isLoading`, `error` | `loadZones()` loads static zone catalog; `getZoneById` selector |
| `useUIStore` | `language`, `isDarkMode`, `isHighContrast` | modals, global loading, notification, mobile menu | syncs i18n bidirectionally; toast auto-hides after 5s |

No stores use `finally` inside actions; auth actions rethrow, map swallows. Auth types live in `src/types/auth.types.ts`; UI types are inline.

## Component Overview

32 components across `ui/`, `admin/`, `auth/`, `common/`, `debug/`, `guide/`, `map/`, `zone/` plus 9 pages. Global chrome is `<Sidebar>` (+ `<Notification>`); the active map is `InteractiveMapContainer`. Notable dead/legacy code: unused `ProtectedRoute`, unused `NavBar`, legacy `MapContainer`/`ZoneLayer`/`ProvinceDebugger`. **Styling flows through semantic design tokens and the `ui/` primitives** — `DESIGN.md` (repo root) is the source of truth, `AGENTS.md` lists the styling rules and raw-class e2e holdouts; zone/map colors remain inline-style data from `constants.ts` (map components are token-exempt).

→ Full inventory + route table: [component-inventory.md](./component-inventory.md).

## Source Tree

The app is at the **repo root** (`src/`, `public/`, `schemas/`, `playwright/`); the Docker stack is under `supabase/`; `netlify.toml`, all configs, and entry points (`index.html` → `src/main.tsx` → `src/App.tsx`) are at the root.

→ Full annotated tree: [source-tree-analysis.md](./source-tree-analysis.md).

## Development Workflow

- **Node 20**, npm. All app commands from repo root; all docker commands from `supabase/`.
- **Two env files** (never mixed): root `.env.local` (`VITE_*`) + `supabase/.env` (Docker secrets). `supabase/setup-local-supabase.sh` writes both.
- Conventional commits; **never commit to `main`** — branch first. No in-repo CI (Netlify deploy previews are the build gate).

→ Full setup: [development-guide.md](./development-guide.md).

## Deployment Architecture

**Netlify** static deploy from repo root: `npm run build` → `publish = dist`. Redirects serve `/vietnam-map-data/*` and `/assets/*` directly, then SPA-fallback everything else to `/index.html`. Build env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, …) are set in the **Netlify dashboard**, not `.env.local`. `netlify.toml` declares `functions = netlify/functions` but that directory does not exist — no functions ship. The local Supabase stack (10 Docker services behind Kong on :8000, Studio on :3001) is a development mirror of the cloud project, not a production target.

## Testing Strategy

- **E2E (Playwright)** — the only tests present. 3 specs (authentication, homepage, quiz) × 5 browser/device projects; faker-driven factories + auth helpers; `local`/`staging`/`production` envs (the `local` webServer auto-starts `npm run dev`).
- **Unit/component (Vitest)** — installed but unwired (no `test` script, no tests). When added: co-locate `*.test.ts(x)`, mock `@/lib/supabase`.

## Key Architectural Decisions & Gotchas

- **No direct Supabase calls in components** — always through `src/services/`.
- **Auth is async-initialized** — `initializeAuth()` must run on app load; `useAuthStore` starts `isLoading: true`.
- **i18n fallback is `'vi'`** (Vietnamese), not `'en'`.
- **`react-router` v8**, not `react-router-dom`.
- **Tailwind v3** config format; `erasableSyntaxOnly` forbids `enum`/`namespace`; `verbatimModuleSyntax` requires `import type`.
- **`clsx`** is the conditional-class helper in the `src/components/ui/` primitives (adopted 2026-08-02; prefer it over template literals in new primitives).
- **Styling via semantic tokens, not raw palette utilities** — pages consume `bg-brand` / `text-foreground` / `rounded-card`-style tokens or `ui/` primitives; the only raw colors left are the e2e-asserted holdouts (listed in `AGENTS.md`) and the data-driven zone palette in `constants.ts`.
- **`DESIGN.md` is the styling source of truth** — change the visual identity there first, then mirror in `tailwind.config.js`.

---

## Related docs

- [Project Overview](./project-overview.md) · [Source Tree](./source-tree-analysis.md) · [Data Models](./data-models.md) · [API Contracts](./api-contracts.md) · [Component Inventory](./component-inventory.md) · [Development Guide](./development-guide.md)
