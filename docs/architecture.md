# Architecture - Vietnam Economic Zones

> Generated: 2026-05-16 | Scan Level: Exhaustive

## Executive Summary

Vietnam Economic Zones is an educational single-page web application targeting high school students. It provides an interactive map of Vietnam's six economic zones with zone details, document management, quiz functionality, and analytics. Built with React 19, TypeScript, and Supabase as a backend-as-a-service.

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | React | ^19.1.1 | UI framework |
| Language | TypeScript | ~5.8.3 | Type-safe development |
| Build Tool | Vite | ^4.5.0 | Dev server + bundler |
| Minifier | Terser | ^5.44.0 | Production minification + console stripping |
| Styling | Tailwind CSS | ^3.4.17 | Utility-first CSS |
| Animation | Framer Motion | ^12.23.16 | UI animations |
| State Management | Zustand | ^5.0.8 | Client state with persistence |
| Routing | React Router DOM | ^7.9.1 | Client-side routing |
| Maps | React Leaflet + Leaflet | ^5.0.0 / ^1.9.4 | Interactive map |
| Forms | React Hook Form | ^7.63.0 | Form validation |
| i18n | i18next + react-i18next | ^25.5.2 / ^15.7.3 | Vietnamese/English |
| Icons | Font Awesome + React | ^7.1.0 / ^3.1.0 | Icon library |
| UI Primitives | Headless UI | ^2.2.8 | Accessible components |
| Backend | Supabase | ^2.58.0 | Auth, Database, Storage |
| Class Utilities | clsx | ^2.1.1 | Conditional classes |
| Testing | Vitest + Testing Library | ^3.2.4 / ^16.3.0 | Unit/component tests |
| Deployment | Netlify | — | Hosting + SPA |

## Architecture Pattern

**Component-based SPA with Service Layer:**

```
Pages (route-level)
  └── Components (UI)
        ├── Stores (Zustand - client state)
        ├── Hooks (business logic)
        └── Services (API communication)
              └── Supabase (backend)
```

### Dependency Rules
- Pages → Components, Stores, Services, Hooks
- Components → Stores, Services, Types
- Services → Supabase client, Types
- Stores → Services, Types
- Hooks → Services, Stores
- **Services must NOT import stores** (unidirectional)

## State Management

### Zustand Stores

| Store | File | Purpose | Persisted Fields |
|-------|------|---------|-----------------|
| `useAuthStore` | `stores/authStore.ts` | Auth state + actions | user, session, isAdmin |
| `useMapStore` | `stores/mapStore.ts` | Map state, zone selection | mapCenter, zoomLevel, selectedZone |
| `useUIStore` | `stores/uiStore.ts` | UI modals, theme, language | language, isDarkMode, isHighContrast |

All stores use `zustand/persist` middleware with selective persistence via `partialize`.

## Routing

| Route | Page | Guard |
|-------|------|-------|
| `/` | HomePage | None |
| `/login` | LoginPage | None |
| `/documents` | DocumentsPage | None |
| `/quizzes` | QuizListPage | None |
| `/quiz/:quizId` | QuizPage | None |
| `/map-drawing` | MapDrawingPage | None |
| `/feedback` | FeedbackPage | None |
| `/admin` | AdminPage | AdminRoute |
| `/admin/quiz/:quizId/edit` | QuizEditPage | AdminRoute |

## Service Layer

Seven service classes, all using static methods:

| Service | Purpose | Error Handling |
|---------|---------|---------------|
| `AuthService` | Supabase auth wrapper | Throws to caller |
| `AnalyticsService` | Page visit tracking + queries | Returns null/empty/false |
| `QuizService` | Quiz CRUD with caching | Throws to caller |
| `QuizDraftService` | localStorage quiz drafts | Fire-and-forget |
| `DocumentService` | Supabase storage operations | Throws to caller |
| `DocumentsPageService` | Document listing with cache | Returns empty arrays |
| `SettingsService` | Key-value settings CRUD | Returns null/false |
| `GADMService` | GeoJSON zone boundary generation | Singleton pattern |

### Caching Strategy
- **QuizService:** In-memory Map per quiz + list cache, 5-min TTL
- **DocumentsPageService:** In-memory cache with request deduplication, 5-min TTL
- **GADMService:** Lazy-loaded singleton with spin-wait for concurrent access

## Data Architecture

### Supabase Database (5 tables)
- `general_settings` — Key-value app settings
- `quizzes` — Quiz metadata with status workflow (draft → published → archived)
- `quiz_questions` — Questions with order and multiple-answer support
- `quiz_options` — Answer options with correct flag
- `page_visits` — Analytics tracking with session management

### Supabase Storage
- Bucket: `documents` (private, 50MB max)
- Admin role check: `user_metadata.role = 'admin'` or `app_metadata.role = 'admin'`

### Static Data
- Zone definitions in `src/utils/constants.ts` (6 zones with economic data)
- Zone-province mapping in `src/utils/zoneProvinces.ts` (63 provinces → 6 zones)
- GADM GeoJSON in `public/vietnam-map-data/` (province boundaries)

## Map Architecture

- **Primary:** `InteractiveMapContainer` — Loads GADM province data, groups by zone, renders as GeoJSON layers
- **Features:** Zone hover highlighting, click-to-zoom, legend sidebar, island labels (Paracel, Spratly)
- **Tiles:** OpenStreetMap (with dark theme spec proposed for CARTO dark tiles)
- **Data flow:** GADM GeoJSON → GADMService.generateZoneGeoJSON() → React-Leaflet GeoJSON layer

## Internationalization

- Two languages: Vietnamese (vi, default), English (en)
- Detection: localStorage → navigator → htmlTag
- Translation files: `src/locales/{vi,en}/translation.json`
- Key groups: map, zones, admin, quizList, mapDrawing, notifications, industries

## Security

- Supabase RLS on all tables
- Admin role checked via JWT user_metadata
- File upload validation (size + type whitelist)
- Production console stripping via Terser
- Auth state persisted in localStorage via Zustand

## Performance Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| Initial bundle | < 500KB gzipped |
