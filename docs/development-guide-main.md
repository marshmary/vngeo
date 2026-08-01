# Development Guide - Vietnam Economic Zones

> Generated: 2026-05-16 | Scan Level: Exhaustive

## Prerequisites

- **Node.js** (LTS recommended)
- **npm** (comes with Node.js)
- **Supabase account** with project created
- **Netlify account** (for deployment)

## Initial Setup

```bash
cd vietnam-economic-zones
npm install
cp .env.example .env
```

Configure `.env` with Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (Vite) |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Build Process

1. `tsc -b` — TypeScript type checking
2. `vite build` — Bundle with Terser minification
3. Output to `dist/` directory

## Environment Variables

### Required
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | (required) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | (required) |

### Map Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_VIETNAM_MAP_CENTER_LAT` | Map center latitude | 16.0471 |
| `VITE_VIETNAM_MAP_CENTER_LNG` | Map center longitude | 108.2068 |
| `VITE_DEFAULT_ZOOM_LEVEL` | Default zoom | 6 |
| `VITE_MAX_ZOOM_LEVEL` | Maximum zoom | 18 |
| `VITE_MIN_ZOOM_LEVEL` | Minimum zoom | 5 |

### Zone Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ECONOMIC_ZONES_COUNT` | Number of zones | 6 |
| `VITE_ZONE_COLORS` | Comma-separated hex colors | ef4444,f97316,... |

### Storage
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_MAX_DOCUMENT_SIZE` | Max upload size (bytes) | 5242880 (5MB) |
| `VITE_ALLOWED_FILE_TYPES` | Allowed extensions | pdf,doc,docx,... |
| `VITE_SUPABASE_STORAGE_BUCKET` | Storage bucket name | documents |
| `VITE_SUPABASE_MAX_FILE_SIZE` | Supabase max size | 52428800 (50MB) |

### Features
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ADMIN_ENABLED` | Enable admin features | true |
| `VITE_FEATURE_DARK_MODE` | Dark mode toggle | true |
| `VITE_FEATURE_HIGH_CONTRAST` | High contrast toggle | true |
| `VITE_FEATURE_EXPORT_DATA` | Export feature | true |

### Content
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_CONTENT_LANGUAGE` | Available languages | vi,en |
| `VITE_DEFAULT_LANGUAGE` | Default language | vi |

## Database Setup

Execute SQL files in `schemas/` in numbered order:
1. `01_general_settings.sql` — Settings table
2. `02_quiz_complete_schema.sql` — Quiz tables + RLS
3. `03_quiz_sample_data.sql` — Sample data
4. `04_analytics_tracking.sql` — Analytics tables + functions
5. `05_quiz_403_error_fix.sql` — RLS fix (if needed)

### Setting Admin Users

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

## Project Conventions

### Import Alias
`@/` maps to `./src/` (absolute imports).

### Import Order
1. External libraries
2. Internal stores, services, types
3. Components
4. Relative imports
5. CSS

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Stores: `camelCaseStore.ts`
- Types: `camelCase.types.ts`
- Services: `camelCaseService.ts`

### Component Template
1. State hooks
2. Store hooks
3. Custom hooks
4. Event handlers
5. Effects
6. Early returns (loading/error)
7. Render

### Key Rules
- TypeScript first (all interfaces required)
- Functional components only
- Zustand for cross-component state
- Custom hooks for business logic
- File size limits: components 200 LOC, hooks 100, stores 150, services 300
- Console.log stripped in production (use console.error/warn for persistent logging)

## Testing

- Framework: Vitest + React Testing Library
- Coverage target: 80%
- Test wrapper: `BrowserRouter` wrapping
- Use `userEvent.setup()` for interactions
- Pattern: Arrange-Act-Assert

## Deployment (Netlify)

Configured in `netlify.toml`:
- **Base:** `vietnam-economic-zones`
- **Build command:** `npm run build`
- **Publish:** `dist`
- **SPA fallback:** All routes redirect to `index.html`
- **Static assets:** `/vietnam-map-data/*` and `/assets/*` served directly
