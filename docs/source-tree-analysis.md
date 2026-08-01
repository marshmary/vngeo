# Source Tree Analysis — Vietnam Economic Zones (vngeo)

> Verified 2026-08-01. The repo was reorganized on 2026-08-01: **the app lives at the repo root** (there is no `vietnam-economic-zones/` directory), and the entire local-Supabase/Docker stack lives under `supabase/`. Ignore `node_modules`, `dist`, `.git`, and `supabase/supabase-volumes/`.

## Annotated tree

```
vngeo/                          # repo root = app root
├── index.html                  # Vite HTML entry → /src/main.tsx
├── package.json                # name: vngeo, type: module, scripts + deps
├── tsconfig.json               # project-ref root (→ app + node)
├── tsconfig.app.json           # strict app config, "@/*" → ./src/*
├── tsconfig.node.json          # build-tool config (vite.config.ts)
├── vite.config.ts              # plugin-react, '@' alias, terser (drops console.log/info/debug)
├── eslint.config.js            # flat config, typescript-eslint, react-hooks, react-refresh
├── tailwind.config.js          # v3 module.exports; brand + zone tokens; Inter / Plus Jakarta Sans
├── postcss.config.js           # tailwindcss + autoprefixer
├── netlify.toml                # publish=dist, functions=netlify/functions (⚠️ dir absent), SPA redirects
├── playwright.config.ts        # 5 projects, local/staging/production envs, auto-starts dev server
├── .nvmrc                      # 20
├── .env.local(.example)        # VITE_* (Vite frontend)
├── README.md, REORGANIZATION.md
│
├── public/
│   └── vietnam-map-data/       # static GeoJSON (GADM): gadm41_VNM_0.json (border), gadm41_VNM_1.json (provinces)
│
├── src/                        # app source — "@/" alias → ./src
│   ├── main.tsx                # React bootstrap (StrictMode → <App/>)
│   ├── App.tsx                 # BrowserRouter, initializeAuth() on mount, route table, <Sidebar/> + <Notification/>
│   ├── App.css, index.css      # global styles; Leaflet CSS + @font CSS vars
│   ├── assets/                 # react.svg
│   │
│   ├── components/             # React components (default exports)
│   │   ├── admin/              # AnalyticsDashboard, StatsCard, HourlyVisitsChart, DeviceBreakdownChart,
│   │   │                       # TopPagesTable, FileManager, FileCard, FileUpload, QuizManager, GeneralSettings
│   │   ├── auth/               # AdminRoute, ProtectedRoute (unused), UserProfileDropdown
│   │   ├── common/             # ConfirmationModal, LoadingSpinner, NavBar (unused), Notification, Sidebar
│   │   ├── debug/              # ProvinceDebugger (legacy)
│   │   ├── guide/              # FirstTimeGuide
│   │   ├── map/                # InteractiveMapContainer (active), MapContainer (legacy), ZoneLayer (legacy),
│   │   │                       # ParacelIslandsLabel, SpratlyIslandsLabel
│   │   └── zone/               # ZoneCard
│   │
│   ├── pages/                  # AdminPage, DocumentsPage, FeedbackPage, HomePage, LoginPage,
│   │                           # MapDrawingPage, QuizEditPage, QuizListPage, QuizPage
│   ├── services/               # static Supabase service classes (authService, quizService + QuizDraftService,
│   │                           # documentService, documentsPageService, settingsService, analyticsService) + gadmService (instance)
│   ├── stores/                 # Zustand v5: authStore, mapStore, uiStore (+ index barrel)
│   ├── types/                  # analytics, auth, quiz, settings, zone (.types.ts)
│   ├── utils/                  # constants (VIETNAM_ECONOMIC_ZONES, map center/zoom), zoneProvinces, index barrel
│   ├── hooks/                  # useAnalyticsTracking
│   ├── lib/                    # supabase.ts (client factory)
│   ├── i18n/index.ts           # i18next init (fallbackLng 'vi')
│   └── locales/{en,vi}/        # translation.json (single namespace each)
│
├── schemas/                    # human-reference SQL (run in Supabase SQL Editor, numbered)
│   ├── 01_general_settings.sql
│   ├── 02_quiz_complete_schema.sql
│   ├── 03_quiz_sample_data.sql
│   ├── 04_analytics_tracking.sql
│   ├── 05_quiz_403_error_fix.sql
│   └── QUICK_START.md, QUIZ_403_ERROR_FIX.md, README.md
│
├── playwright/                 # E2E (run from repo root via npm run test:e2e)
│   ├── e2e/                    # authentication.spec.ts, homepage.spec.ts, quiz.spec.ts
│   ├── support/                # fixtures.ts, factories/ (user/quiz/document, faker), helpers/auth-helpers.ts
│   ├── auth-sessions/          # storage state
│   └── .env.example            # TEST_ENV, test creds, staging/production URLs
│
├── supabase/                   # ⬅ entire local-Supabase/Docker stack (run docker from HERE)
│   ├── docker-compose.yml      # 10 services: db, auth, rest, realtime, storage, imgproxy, kong, studio, meta, seed
│   ├── setup-local-supabase.sh # generates secrets, writes supabase/.env AND ../.env.local
│   ├── .env(.example)          # Docker secrets (POSTGRES_PASSWORD, JWT_SECRET, ANON_KEY…)
│   └── supabase-volumes/       # bind mounts: db/{init,init-base,seed}, kong, seed, storage-seed (ignored)
│
├── netlify/                    # ⚠️ declared in netlify.toml but DOES NOT EXIST — no functions ship
│
├── docs/                       # generated + existing documentation (this folder)
├── design/                     # design assets (jpg/png)
├── scripts/                    # verify-supabase-cloud.sh
│
├── _bmad-output/               # committed BMad artifacts (planning, implementation, test) + project-context.md
├── _bmad/                      # BMad config (core, bmm, tea, custom, scripts)
└── .claude/, .zcode/, .github/chatmodes/   # AI tooling
```

## Critical folders

| Folder | Role |
|---|---|
| `src/` | Entire application (app-at-root after reorg). `@/` alias target. |
| `src/components/{admin,auth,common,debug,guide,map,zone}` | UI layer — see [component-inventory.md](./component-inventory.md). |
| `src/services/` | **The only place Supabase is called from** — static service classes. |
| `src/stores/` | Zustand v5 global state (`authStore`, `mapStore`, `uiStore`). |
| `schemas/` | Human-reference SQL (numbered, applied via SQL Editor). |
| `supabase/` | Local Docker stack — **docker commands run here, not at repo root**. |
| `public/vietnam-map-data/` | Static GADM GeoJSON served via the netlify redirect. |
| `playwright/` | E2E tests + support factories/fixtures/helpers. |

## Entry points

1. **`index.html`** — Vite HTML entry (`lang="en"`, title "Vietnam Economic Zones"), mounts `#root`, loads `/src/main.tsx`.
2. **`src/main.tsx`** — imports `./index.css`, then `./i18n` (i18next init), then `App`; renders `<App/>` in `<StrictMode>`.
3. **`src/App.tsx`** — `<BrowserRouter>`; calls `initializeAuth()` (from `@/stores/authStore`) on mount; declares the route table; renders `<Sidebar/>` (hidden on `/login`) and `<Notification/>`; calls `useAnalyticsTracking()`.

## Two-env-file discipline

| File | Scope | Loaded by |
|---|---|---|
| Root `.env.local` | Vite frontend — `VITE_*` only | Vite automatically |
| `supabase/.env` | Docker/local-Supabase secrets (`POSTGRES_PASSWORD`, `JWT_SECRET`, `ANON_KEY`…) | Docker Compose (from `supabase/`) |
| `playwright/.env` | E2E-only (`TEST_ENV`, test creds, staging/production URLs) | shell/CI |

`supabase/setup-local-supabase.sh` is the bridge: it generates `supabase/.env` **and** writes the matching `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` into the root `.env.local`, so a single setup run wires the app to the local stack. **Do not mix** Docker secrets into `.env.local`.

## Commands (run from repo root, except docker)

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Production build | `npm run build` (`tsc -b && vite build`) |
| Lint | `npm run lint` |
| Preview build | `npm run preview` |
| E2E | `npm run test:e2e` (`:ui`, `:debug`, `:headed` variants) |
| Local Supabase (up/down/reset) | `cd supabase && docker compose up -d` / `down` / `down -v` |

> No `test` (unit) script exists — Vitest is installed but unwired.

---

## Related docs

- [Development Guide](./development-guide.md) — full setup, testing, deployment.
- [Architecture](./architecture.md) — how the layers fit together.
