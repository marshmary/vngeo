# Source Tree Analysis - Vietnam Economic Zones

> Generated: 2026-05-16 | Scan Level: Exhaustive

## Repository Structure

```
vngeo/                              # Repository root
├── .claude/                        # Claude Code configuration
├── .github/
│   └── chatmodes/                  # GitHub Copilot chat modes
├── _bmad/                          # BMAD framework configuration
├── _bmad-output/                   # BMAD output artifacts
├── design/                         # Design mockup images
│   ├── f62c66f1faedb7401cbc0900990ddd67.jpg
│   └── gbYZAE8rO1.png
├── docs/                           # Project documentation (generated + existing)
├── netlify.toml                    # Netlify deployment config
├── vietnam-economic-zones/         # ★ Main application source
│   ├── public/
│   │   └── vietnam-map-data/       # Static GeoJSON boundary files
│   │       ├── gadm41_VNM_0.json   # Vietnam country outline
│   │       ├── gadm41_VNM_1.json   # Province boundaries (GADM)
│   │       └── zones-metadata.json # Zone metadata
│   ├── schemas/                    # SQL schema files (execution order)
│   │   ├── 01_general_settings.sql # Key-value settings table
│   │   ├── 02_quiz_complete_schema.sql  # Quiz tables + RLS
│   │   ├── 03_quiz_sample_data.sql # Sample quiz seed data
│   │   ├── 04_analytics_tracking.sql    # Page visits + functions
│   │   ├── 05_quiz_403_error_fix.sql    # RLS WITH CHECK fix
│   │   └── README.md              # Schema documentation
│   ├── src/                        # ★ Application source code
│   │   ├── main.tsx                # Entry point (createRoot)
│   │   ├── App.tsx                 # Root component + routing
│   │   ├── index.css               # Global styles + Tailwind
│   │   ├── assets/                 # Static assets
│   │   ├── components/             # React components
│   │   │   ├── admin/              # Admin panel components
│   │   │   │   ├── AnalyticsDashboard.tsx  # Analytics overview
│   │   │   │   ├── DeviceBreakdownChart.tsx
│   │   │   │   ├── FileCard.tsx
│   │   │   │   ├── FileManager.tsx         # Document manager
│   │   │   │   ├── FileUpload.tsx
│   │   │   │   ├── GeneralSettings.tsx      # Settings editor
│   │   │   │   ├── HourlyVisitsChart.tsx
│   │   │   │   ├── QuizManager.tsx          # Quiz CRUD
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   └── TopPagesTable.tsx
│   │   │   ├── auth/               # Authentication components
│   │   │   │   ├── AdminRoute.tsx          # Admin route guard
│   │   │   │   ├── ProtectedRoute.tsx      # Auth route guard
│   │   │   │   └── UserProfileDropdown.tsx # User menu
│   │   │   ├── common/             # Shared components
│   │   │   │   ├── ConfirmationModal.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── NavBar.tsx              # (Legacy, unused)
│   │   │   │   ├── Notification.tsx        # Global toast
│   │   │   │   └── Sidebar.tsx             # Primary navigation
│   │   │   ├── debug/              # Debug tools
│   │   │   │   └── ProvinceDebugger.tsx
│   │   │   ├── guide/              # Onboarding
│   │   │   │   └── FirstTimeGuide.tsx      # 13-step tutorial
│   │   │   ├── map/                # Map components
│   │   │   │   ├── InteractiveMapContainer.tsx  # ★ Main map
│   │   │   │   ├── MapContainer.tsx        # Legacy map
│   │   │   │   ├── ParacelIslandsLabel.tsx
│   │   │   │   ├── SpratlyIslandsLabel.tsx
│   │   │   │   └── ZoneLayer/              # GeoJSON rendering
│   │   │   │       └── index.tsx
│   │   │   └── zone/               # Zone display
│   │   │       └── ZoneCard.tsx
│   │   ├── hooks/                  # Custom hooks
│   │   │   └── useAnalyticsTracking.ts  # Auto page tracking
│   │   ├── i18n/                   # i18next setup
│   │   │   └── index.ts
│   │   ├── lib/                    # Library configuration
│   │   │   └── supabase.ts         # Supabase client
│   │   ├── locales/                # Translation files
│   │   │   ├── en/translation.json # English
│   │   │   └── vi/translation.json # Vietnamese
│   │   ├── pages/                  # Route pages
│   │   │   ├── AdminPage.tsx       # /admin (tabbed: analytics, files, quiz, settings)
│   │   │   ├── DocumentsPage.tsx   # /documents
│   │   │   ├── FeedbackPage.tsx    # /feedback
│   │   │   ├── HomePage.tsx        # / (main map page)
│   │   │   ├── LoginPage.tsx       # /login
│   │   │   ├── MapDrawingPage.tsx  # /map-drawing
│   │   │   ├── QuizEditPage.tsx    # /admin/quiz/:quizId/edit
│   │   │   ├── QuizListPage.tsx    # /quizzes
│   │   │   └── QuizPage.tsx        # /quiz/:quizId
│   │   ├── services/               # API/service layer
│   │   │   ├── analyticsService.ts # Analytics tracking + queries
│   │   │   ├── authService.ts      # Supabase auth wrapper
│   │   │   ├── documentService.ts  # Supabase storage operations
│   │   │   ├── documentsPageService.ts # Document listing + cache
│   │   │   ├── gadmService.ts      # GeoJSON/zone boundary loading
│   │   │   ├── quizService.ts      # Quiz CRUD + draft system
│   │   │   └── settingsService.ts  # Key-value settings CRUD
│   │   ├── stores/                 # Zustand state stores
│   │   │   ├── authStore.ts        # Auth state + actions
│   │   │   ├── mapStore.ts         # Map state (zones, selection)
│   │   │   ├── uiStore.ts          # UI state (modals, theme, language)
│   │   │   └── index.ts            # Barrel export
│   │   ├── types/                  # TypeScript type definitions
│   │   │   ├── analytics.types.ts
│   │   │   ├── auth.types.ts
│   │   │   ├── quiz.types.ts
│   │   │   ├── settings.types.ts
│   │   │   └── zone.types.ts
│   │   └── utils/                  # Utilities
│   │       ├── constants.ts        # Zone data, config constants
│   │       ├── zoneProvinces.ts    # Zone-to-province mapping
│   │       └── index.ts            # Barrel export
│   ├── .env.example                # Environment variable template
│   ├── eslint.config.js
│   ├── index.html                  # HTML entry point
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js          # Tailwind + custom theme
│   ├── tsconfig.json
│   ├── tsconfig.app.json           # App TS config (strict)
│   ├── tsconfig.node.json
│   └── vite.config.ts              # Vite config + Terser
└── .gitignore
```

## Entry Points

| Entry Point | File | Purpose |
|-------------|------|---------|
| App Entry | `src/main.tsx` | React root creation, imports i18n |
| Root Component | `src/App.tsx` | Router setup, auth init, sidebar layout |
| HTML Entry | `index.html` | Vite HTML shell |
| Build Config | `vite.config.ts` | Vite + React plugin + Terser |
| Deploy Config | `netlify.toml` | Netlify build + SPA redirects |

## Critical Folders

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `src/services/` | Backend communication layer | 7 service classes |
| `src/stores/` | Zustand state management | 3 stores (auth, map, ui) |
| `src/types/` | TypeScript type definitions | 5 type files |
| `src/components/map/` | Leaflet map integration | InteractiveMapContainer (primary) |
| `src/pages/` | Route-level components | 9 pages |
| `schemas/` | SQL schema definitions | 5 migration files |
| `public/vietnam-map-data/` | Static GeoJSON data | GADM boundary files |

## Import Alias

- `@/` → `./src/` (configured in both `vite.config.ts` and `tsconfig.app.json`)
