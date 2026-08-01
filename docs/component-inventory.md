# Component Inventory — Vietnam Economic Zones (vngeo)

> Verified 2026-08-01 against `src/components/**` and `src/pages/**`.

## Routing

Routing uses **`react-router` v8** (imported from `'react-router'`, **not** `react-router-dom`). Routes are declared flat in `AppContent` (`src/App.tsx`); there is no `<Outlet>` layout route. Global chrome: `<Sidebar>` renders on every route except `/login`; `<Notification>` renders on every route. Body scroll is locked only on `/` (the map page).

Only `<AdminRoute>` is wired in. `<ProtectedRoute>` exists but is **unused** (see [Dead / legacy code](#dead--legacy-code)).

| Route | Page (`src/pages/`) | Auth | Notes |
|---|---|---|---|
| `/login` | `LoginPage` | Public | React Hook Form + Framer Motion; `useAuthStore` signIn/signUp |
| `/` | `HomePage` | Public | `InteractiveMapContainer` + `FirstTimeGuide`; inlines zone-detail panel |
| `/documents` | `DocumentsPage` | Public | `DocumentsPageService`; folder filter + pagination |
| `/admin` | `AdminPage` | **Admin** (`<AdminRoute>`) | Tab host (analytics/settings/files/quiz), mirrored via `?section=` |
| `/quizzes` | `QuizListPage` | Public | `QuizService.getPublishedQuizzes`; difficulty filter + pagination |
| `/quiz/:quizId` | `QuizPage` | Public (admin gating inside) | timer + single/multi-answer + results |
| `/map-drawing` | `MapDrawingPage` | Public | `SettingsService.getMapDrawingVideoUrl` (iframe) |
| `/feedback` | `FeedbackPage` | Public | `SettingsService.getFeedbackFormUrl` (Google Form iframe) |
| `/admin/quiz/:quizId/edit` | `QuizEditPage` | **Admin** (`<AdminRoute>`) | `QuizService` + `QuizDraftService` autosave |

No 404 / catch-all route. Future routes (`/zones/:zoneId`, `/zones/:zoneId/documents`, `/zones/:zoneId/qa`) are stubbed in an `App.tsx` comment but not implemented.

---

## Components by category

### `admin/` — admin dashboard internals (feature-specific)

| Component | Purpose | Key props | Notes |
|---|---|---|---|
| `AnalyticsDashboard` | Analytics tab host; fetches own data, refreshes every 5 min | — | composes `LoadingSpinner`, `StatsCard`, `HourlyVisitsChart`, `TopPagesTable`, `DeviceBreakdownChart` |
| `StatsCard` | KPI tile | `title`, `value`, `subtitle`, `icon`, `color`, `isNumeric?` | inline SVG icons; reusable but admin-scoped |
| `HourlyVisitsChart` | Bar chart — 24h visits | `data: HourlyVisitData[]` | presentational |
| `DeviceBreakdownChart` | Progress-bar device breakdown | `data: DeviceBreakdown[]` | presentational |
| `TopPagesTable` | Table — most-visited pages | `pages: MostVisitedPage[]` | presentational |
| `FileManager` | File manager (search, breadcrumb, grid/list, stats) | — | `DocumentService`, `useAuthStore`; composes `FileCard` + `FileUpload` |
| `FileCard` | File/folder card | `file`, `viewMode`, `onDelete`, `onFolderClick?` | imports `FileItem` from `FileManager` |
| `FileUpload` | Modal — drag-drop upload + create folder | `onUpload`, `onCreateFolder`, `onClose`, `currentPath` | `DocumentService` size validation |
| `QuizManager` | Admin quiz list + create form | — | `useNavigate`, `QuizService`, `ConfirmationModal` |
| `GeneralSettings` | Settings form (video URL, feedback URL) | — | `SettingsService`, `useUIStore`, `LoadingSpinner` |

### `auth/` — guards & menu

| Component | Purpose | Notes |
|---|---|---|
| `AdminRoute` | Route guard — admin only | `useAuthStore`; redirects `/login` if no user, `/` if not admin; `LoadingSpinner` |
| `ProtectedRoute` | Route guard — any logged-in user | **UNUSED** (not imported anywhere) |
| `UserProfileDropdown` | Profile/avatar dropdown | **Headless UI** (`Menu`/`Transition`) + **FontAwesome** + `createPortal`; reads all three stores |

### `common/` — reusable primitives + global chrome

| Component | Purpose | Notes |
|---|---|---|
| `LoadingSpinner` | Spinner | `size?`, `message?`, `className?` — leaf primitive |
| `ConfirmationModal` | Confirm dialog | `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `confirmText?`, `cancelText?`, `type?` — plain (no Headless UI / Framer) |
| `Notification` | Global toast | **Framer Motion** (`motion`/`AnimatePresence`); reads `useUIStore`; mounted once in `App.tsx` |
| `Sidebar` | Left sidebar nav (global layout chrome) | **FontAwesome**; embeds `UserProfileDropdown`; `data-guide` anchors for onboarding |
| `NavBar` | Top nav bar | **Not mounted** — `App.tsx` uses `Sidebar`; legacy/unused |

### `debug/`

| Component | Purpose |
|---|---|
| `ProvinceDebugger` | Debug overlay — province/zone coverage checks; mounted only inside legacy `VietnamMap` |

### `guide/`

| Component | Purpose |
|---|---|
| `FirstTimeGuide` | Onboarding overlay (13 steps, Vi/En); `localStorage 'vn-economic-zones-guide-completed'`; targets `[data-guide="…"]` anchors; mounted in `HomePage` |

### `map/` — Leaflet map layer

| Component | Purpose | Notes |
|---|---|---|
| `InteractiveMapContainer` | **Active** primary map — GADM GeoJSON zones, controls, legend, tooltip | react-leaflet; defines internal `MapEventHandler`, `MapControls`, `ZoneTooltip`; `data-guide` anchors; embeds `ParacelIslandsLabel`, `SpratlyIslandsLabel` |
| `VietnamMap` (`MapContainer.tsx`) | **Legacy/unused** map variant — zone Markers + Popups | embeds `ProvinceDebugger`; not mounted |
| `ZoneLayer` | Country outline + zone polygons (loads `gadm41_VNM_0.json` + `gadmService.generateZoneGeoJSON`) | used only by legacy `VietnamMap` |
| `ParacelIslandsLabel` / `SpratlyIslandsLabel` | Leaflet `divIcon` text labels (Hoàng Sa / Trường Sa) | hardcode hex `#1e40af` (= `mekong-blue`) |

### `zone/`

| Component | Purpose |
|---|---|
| `ZoneCard` | Zone summary card (population/GDP/industries) — **Framer Motion** `whileHover`/`whileTap`; likely presentational/legacy (HomePage inlines its own detail panel) |

---

## Library usage across components

| Library | Where |
|---|---|
| **Framer Motion** | `Notification`, `ZoneCard`, `LoginPage` |
| **Headless UI** | `UserProfileDropdown` (only) |
| **FontAwesome** | `Sidebar`, `NavBar`, `UserProfileDropdown` |
| **react-leaflet + leaflet** | all of `map/` |
| **React Hook Form** | `LoginPage` (only) |
| **react-i18next** | admin pages, `HomePage`, `QuizManager`, `ZoneCard` |
| **react-router v8** (`'react-router'`) | routing throughout |

**Store hooks used:** `useAuthStore`, `useMapStore`, `useUIStore`.

---

## Design tokens — ⚠️ defined but unused

`tailwind.config.js` defines brand and zone tokens, but **no component consumes the Tailwind utility classes** for them:

- **Brand colors:** `vietnam-red #da020e`, `vietnam-yellow #ffcd00`, `mekong-blue #1e40af`, `rice-green #16a34a`, `mountain-gray #6b7280`
- **Zone palette:** `zone-1 #ef4444` (North Mountain), `zone-2 #f97316` (Red River Delta), `zone-3 #eab308` (North Central Coast), `zone-4 #22c55e` (South Central Coast), `zone-5 #3b82f6` (Central Highlands), `zone-6 #8b5cf6` (Mekong River Delta)
- **Fonts:** `primary` = Inter, `heading` = Plus Jakarta Sans

A grep for the token class names returns hits only in `utils/constants.ts` / `utils/zoneProvinces.ts`, where `'zone-1'`…`'zone-6'` are **string IDs**, not classes. `font-primary`/`font-heading` are likewise unused — fonts are declared as CSS variables `--font-primary` / `--font-heading` in `src/index.css`.

**How colors actually reach the UI:** the hex values live as data on `VIETNAM_ECONOMIC_ZONES[].color` in `src/utils/constants.ts` and are applied via inline `style` (`backgroundColor`, `borderLeftColor`) in `ZoneCard`, `InteractiveMapContainer` (legend + GeoJSON style), `HomePage`, and legacy `VietnamMap`. `mekong-blue`'s value is hardcoded as a hex literal in the islands labels. Components otherwise use Tailwind's **default palette** (`indigo-600`, `blue-600`, `green-600`, `purple-600`, `red-600`, `gray-*` …).

> Treat the brand/zone token set as **latent** — either deliberately adopt it or remove it to avoid drift.

## Dead / legacy code

| Symbol | Status |
|---|---|
| `ProtectedRoute` | Defined, never imported |
| `NavBar` | Replaced by `Sidebar`; not mounted |
| `map/MapContainer.tsx` (`VietnamMap`) + `map/ZoneLayer` | Replaced by `InteractiveMapContainer`'s inline GeoJSON; not mounted |
| `ProvinceDebugger` | Only used by legacy `VietnamMap` |
| `ZoneCard` | HomePage inlines its own detail panel |

> **`data-guide="…"` anchors** on `Sidebar` and `InteractiveMapContainer` are a soft contract consumed by `FirstTimeGuide` — preserve them when refactoring.

---

## Related docs

- [Architecture](./architecture.md) — component-layer patterns in context.
- [Source Tree Analysis](./source-tree-analysis.md) — where everything lives.
