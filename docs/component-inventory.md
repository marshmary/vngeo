# Component Inventory — Vietnam Economic Zones (vngeo)

> Verified 2026-08-01 against `src/components/**` and `src/pages/**`; the `ui/` and [Design tokens](#design-tokens--active-2026-08-02) sections re-verified 2026-09-05 against the UI restructure (`de2809f`, 2026-08-02).

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

> All categories below were restyled on 2026-08-02 to consume semantic design tokens and/or the `ui/` primitives; component APIs and behavior were unchanged unless noted. The visual source of truth is [`/DESIGN.md`](../DESIGN.md); migration rules and raw-class holdouts live in [`/MIGRATION-CONTRACT.md`](../MIGRATION-CONTRACT.md).

### `ui/` — shared design-system primitives (added 2026-08-02)

Import from the barrel: `import { Button, Card } from '@/components/ui'`. Every primitive spreads `{...props}` onto its root element, so `data-testid`, `aria-*`, `disabled`, `ref`, and `type` forward automatically — this is how the Playwright e2e contract survived the migration.

| Primitive | Purpose | Key props / variants | Notes |
|---|---|---|---|
| `Button` | The single primary-action button | `variant`: `primary` \| `secondary` \| `outline` \| `ghost` \| `danger`; `size`: `sm` \| `md` \| `lg` | native `<button>` + `forwardRef`; `type` is **not** defaulted (callers pass it explicitly) |
| `Card` | Surface container | — | `bg-card border-border rounded-card shadow-card`; padding is the caller's choice |
| `Input` / `Textarea` / `Select` | Form fields with shared field treatment | native element attrs | all three live in `Input.tsx`, exported separately |
| `Badge` | Status / category pill | `tone`: `success` \| `warning` \| `danger` \| `info` \| `neutral` | tone carries meaning only — never decoration |
| `Spinner` | The single loading indicator | size via `className` (default `h-8 w-8`) | keeps `animate-spin` (e2e contract) |
| `Pagination` | Shared page control | `currentPage`, `totalPages`, `onPageChange`, `previousPageLabel`, `nextPageLabel`, `className?` | renders nothing when `totalPages <= 1`; prev/next are real `<button disabled>` carrying the caller's aria-labels; **active page keeps raw `bg-indigo-600`** — the class string is asserted by `documents.spec.ts` (contract holdout #1) |

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
| **clsx** | all `ui/` primitives (adopted 2026-08-02 for conditional classes) |
| **react-leaflet + leaflet** | all of `map/` |
| **React Hook Form** | `LoginPage` (only) |
| **react-i18next** | admin pages, `HomePage`, `QuizManager`, `ZoneCard` |
| **react-router v8** (`'react-router'`) | routing throughout |

**Store hooks used:** `useAuthStore`, `useMapStore`, `useUIStore`.

---

## Design tokens — active (2026-08-02)

`tailwind.config.js` `theme.extend` defines the semantic token set from [`/DESIGN.md`](../DESIGN.md) (the single source of truth — add new colors/radii there first, then mirror in the config), and components consume them as Tailwind utilities:

- **Brand:** `brand #4f46e5` (indigo-600) + `brand-hover`, `brand-foreground`, `brand-subtle`, `brand-ring`; gradient pair `accent-from #6366f1` → `accent-to #9333ea` (the **only** gradient in the system — logo/hero/active nav)
- **Neutrals (slate):** `background`, `card`, `muted`, `sunken`, `border`, `foreground`, `muted-foreground`, `faint-foreground`
- **Status:** `success` / `warning` / `danger` / `info`, each with `-soft` (tinted bg) and `-strong` (text on tint); `danger-foreground` for on-solid text
- **Radius aliases:** `rounded-card` (12px) · `rounded-button` (8px) · `rounded-input` (8px) · `rounded-modal` (12px)
- **Elevation:** `shadow-card`, `shadow-overlay` — two levels only
- **Type ramp:** `text-display`, `text-heading-1`…`text-heading-3`, paired with `font-heading` (Plus Jakarta Sans); body is `font-sans` (Inter) — both loaded via Google Fonts `<link>` in `index.html`

The pre-restructure latent tokens (`vietnam-red`, `vietnam-yellow`, `mekong-blue`, `rice-green`, `mountain-gray`, `zone-1…6`) were **removed** from the config in the restructure. Zone colors remain **data, not tokens**: hex values on `VIETNAM_ECONOMIC_ZONES[].color` in `src/utils/constants.ts`, applied via inline `style` in the map/zone components — `src/components/map/**` and `src/utils/constants.ts` are excluded from the styling migration by `MIGRATION-CONTRACT.md`, so the islands-label hex `#1e40af` stays as-is.

**Styling rule:** pages must consume these semantic tokens (`bg-brand`, `text-foreground`, `rounded-card`) or the `ui/` primitives — never raw default-palette utilities (`bg-indigo-600`). Known raw-class holdouts (per the contract, some e2e-asserted): `AdminPage.tsx` (×4), `QuizListPage.tsx` (×1), `ui/Pagination.tsx` (×3, active page), plus the contract's read-only files `ConfirmationModal.tsx` / `LoadingSpinner.tsx`. A Phase 4 lint gate (HANDOFF Goal 3) will enforce this mechanically.

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

- [DESIGN.md](../DESIGN.md) — visual identity source of truth (tokens, components, rules).
- [MIGRATION-CONTRACT.md](../MIGRATION-CONTRACT.md) — styling-migration rules, token swap map, holdouts.
- [Architecture](./architecture.md) — component-layer patterns in context.
- [Source Tree Analysis](./source-tree-analysis.md) — where everything lives.
