# vngeo - Vietnam Economic Zones

An interactive educational web application for learning about Vietnam's economic zones through maps, quizzes, and analytics.

## Quick Start

### Using Cloud Supabase (Production)

```bash
npm install
npm run dev
```

### Using Local Supabase (Development)

For local development with a full Supabase instance (all Docker/Supabase commands run from `supabase/`):

```bash
# Generate local Supabase credentials (writes supabase/.env + ../.env.local)
cd supabase
bash setup-local-supabase.sh

# Start local Supabase services
docker compose up -d
cd ..

# Install dependencies and start the app (from repo root)
npm install
npm run dev
```

See [docs/local-development.md](./docs/local-development.md) for detailed local setup instructions.

## Features

- **Interactive Map**: Explore Vietnam's economic zones with detailed information
- **Quiz System**: Test knowledge with customizable quizzes
- **Document Management**: Upload and manage educational documents
- **Analytics Dashboard**: Track page visits and user engagement
- **Bilingual Interface**: Vietnamese and English language support
- **Dark Mode & High Contrast**: Accessibility features for educational use

## Technology Stack

- **Frontend**: React 19.1, TypeScript 5.8, Vite 8.1 (Node 20)
- **Routing**: React Router 8 (`react-router`)
- **Styling**: Tailwind CSS 3.4, Framer Motion, Headless UI
- **State**: Zustand 5.0
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Internationalization**: i18next (Vietnamese fallback)
- **Testing**: Playwright (E2E); Vitest + Testing Library available for unit/component tests

## Project Structure

```
vngeo/                          # repo root = app root
├── index.html, package.json, vite.config.ts, tsconfig*.json
├── eslint.config.js, tailwind.config.js, postcss.config.js
├── netlify.toml, .nvmrc, .env.local.example    # VITE_* frontend template
├── playwright.config.ts
├── src/                        # app source (@/ alias → ./src)
│   ├── components/             # React components by domain
│   │   └── admin, auth, common, debug, guide, map, zone
│   ├── pages/                  # Page components
│   ├── services/               # Service layer (static methods)
│   ├── stores/                 # Zustand state stores
│   ├── types/                  # TypeScript type definitions
│   ├── lib/                    # Supabase client and utilities
│   ├── hooks, utils, i18n, locales, assets
├── public/vietnam-map-data/    # Static GeoJSON map data
├── schemas/                    # SQL schemas (settings, quiz, analytics)
├── playwright/                 # E2E tests: e2e/*.spec.ts + support/
├── supabase/                   # Local Supabase / Docker stack
│   ├── docker-compose.yml, setup-local-supabase.sh, .env.example
│   └── supabase-volumes/       # db, seed, kong data
├── docs/                       # Project documentation
├── scripts/                    # Utility scripts
└── _bmad-output/               # BMad planning/implementation artifacts
```

## Available Scripts

```bash
npm run dev            # Start development server
npm run build          # Build for production (tsc -b && vite build)
npm run preview        # Preview production build
npm run lint           # Run ESLint
npm run test:e2e       # Run Playwright E2E tests
npm run test:e2e:ui    # Run E2E tests in interactive UI mode
npm run test:e2e:headed # Run E2E tests in a visible browser
```

## Documentation

- [Local Development Setup](./docs/local-development.md) - Complete guide for local Supabase development
- [Integration Guide](./docs/local-development-integration-guide.md) - How the app integrates with local Supabase
- [Project Overview](./docs/project-overview.md) - High-level project documentation
- [Architecture](./docs/architecture.md) - System architecture and design decisions

## Local Development

The project supports local development with a full Supabase instance running in Docker. All Supabase/Docker commands run from `supabase/`:

1. **Setup**: From `supabase/`, run `bash setup-local-supabase.sh` to generate credentials (writes `supabase/.env` for Docker and `../.env.local` for the Vite app)
2. **Start**: From `supabase/`, run `docker compose up -d` to start all services
3. **Develop**: From the repo root, run `npm run dev`. The app automatically connects to `http://localhost:8000`
4. **Studio**: Access the Supabase dashboard at `http://localhost:3001`

See [docs/local-development.md](./docs/local-development.md) for complete instructions.

## Environment Variables

The project keeps frontend and Docker secrets in separate files:

- **Frontend (Vite)** — root [`.env.local.example`](./.env.local.example): all `VITE_*` variables (Supabase URL/key, map config, feature flags). Copy to `.env.local` at the repo root, or let `setup-local-supabase.sh` generate it.
- **Local Supabase (Docker)** — [`supabase/.env.example`](./supabase/.env.example): Docker/local-Supabase secrets (`POSTGRES_PASSWORD`, `JWT_SECRET`, `ANON_KEY`…). Docker Compose auto-loads `supabase/.env`; generated by `setup-local-supabase.sh`.
- **E2E tests** — `playwright/.env.example`: Playwright test configuration (kept separate from app config).

For **cloud Supabase**, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in root `.env.local`.

## Service Layer

All backend interactions go through service classes in `src/services/`:
- `AuthService` - Authentication (sign up, sign in, sign out)
- `QuizService` - Quiz CRUD operations
- `QuizDraftService` - Quiz draft management
- `DocumentService` - File upload/download
- `AnalyticsService` - Page visit tracking and analytics
- `SettingsService` - General app settings
- `DocumentsPageService` - Document page logic

> Components must never call the Supabase client directly — always go through these service classes.

## Deployment

The application is deployed on Netlify from the repo root. `netlify.toml` configures the build (`npm run build` → `dist/`) and SPA redirects; build-time env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are set in the Netlify dashboard. The backend runs on Supabase cloud.

## License

[Your License Here]
