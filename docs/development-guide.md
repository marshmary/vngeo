# Development Guide — Vietnam Economic Zones (vngeo)

> Verified 2026-08-01. All app/npm commands run from the **repo root**. All Docker/Supabase commands run from **`supabase/`**.

## Prerequisites

| Requirement | Version | Source |
|---|---|---|
| Node.js | **20** (pinned) | `.nvmrc` — use `nvm use` / `fnm use` |
| Package manager | npm | ships with Node |
| Docker + Docker Compose | any recent | only required for the **local Supabase stack** |
| OpenSSL | any | only required by `supabase/setup-local-supabase.sh` |

## Environment setup (two files, kept strictly separate)

| File | Scope | Loaded by | Template |
|---|---|---|---|
| Root `.env.local` | Vite frontend — `VITE_*` only | Vite | `.env.local.example` |
| `supabase/.env` | Docker/local-Supabase secrets (`POSTGRES_PASSWORD`, `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY`, SMTP, Kong port, Studio creds…) | Docker Compose (run from `supabase/`) | `supabase/.env.example` |
| `playwright/.env` | E2E only (`TEST_ENV`, test creds, staging/production URLs) | shell/CI | `playwright/.env.example` |

**The frontend requires at minimum:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — validated at startup in `src/lib/supabase.ts` (throws immediately if missing). Optional Vite vars include map config, zone colors, storage limits, admin/feature flags, and i18n.

> **Never mix** Docker secrets into `.env.local`, and never add `VITE_*` vars to `supabase/.env`.

### Easiest path: the setup script wires both files

`supabase/setup-local-supabase.sh` generates the Docker secrets, builds the `ANON_KEY` / `SERVICE_ROLE_KEY` JWTs, writes `supabase/.env`, **and** writes the matching `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` into the root `.env.local`. One run wires the app to the local stack.

## Installation

```bash
npm install
```

## Running the app

### Option A — frontend against cloud Supabase

1. Copy `.env.local.example` → `.env.local` and set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` to your cloud project.
2. `npm run dev` → http://localhost:5173

### Option B — full local stack (frontend + local Supabase Docker)

```bash
cd supabase
bash setup-local-supabase.sh     # generates secrets, writes supabase/.env AND ../.env.local
docker compose up -d             # starts 10 services
cd ..
npm run dev
```

- **Studio dashboard:** http://localhost:3001 (user `supabase`, generated `DASHBOARD_PASSWORD`)
- **API/Kong:** http://localhost:8000
- **Seeded accounts:** `admin@vngeo.local` / `AdminPass123!` (role `admin`), `user@vngeo.local` / `UserPass123!`
- **Stop:** `cd supabase && docker compose down`
- **Full reset (wipes data):** `cd supabase && docker compose down -v`
- **Manual re-seed (idempotent):** `docker exec -i supabase-db psql -U supabase_admin -d postgres < supabase/supabase-volumes/db/seed/07-seed-content.sql`

> Docker Compose uses relative `./supabase-volumes/…` paths that resolve from `supabase/` — that's why these commands must run there.

## Build

```bash
npm run build      # tsc -b && vite build  →  dist/
npm run preview    # serve the production build locally
```

Production minification uses **Terser**, which drops `console.log` / `console.info` / `console.debug` and keeps `console.error` / `console.warn`. **TypeScript errors block the build** (`tsc -b` runs first).

## Linting & code quality

```bash
npm run lint       # eslint .  (flat config)
```

- ESLint 10 flat config (`eslint.config.js`), `typescript-eslint` recommended, `react-hooks` (rules-of-hooks error, exhaustive-deps warn), `react-refresh` (default exports for components, `allowConstantExport`).
- Several **react-hooks v7** stricter rules are deliberately `off` (tracked as separate code-quality work).

## Testing

### E2E — Playwright (the only tests that exist)

```bash
npm run test:e2e           # headless
npm run test:e2e:headed
npm run test:e2e:ui        # interactive runner
npm run test:e2e:debug
```

- Specs: `playwright/e2e/{authentication,homepage,quiz}.spec.ts`.
- Support: `playwright/support/{fixtures.ts, factories/*, helpers/auth-helpers.ts}` — `@faker-js/faker`-driven factories; reuse these instead of hand-rolling setup.
- **5 projects:** chromium, firefox, webkit, mobile-chrome (Pixel 5), mobile-safari (iPhone 13).
- **Environments** (`playwright/.env`, `TEST_ENV`): `local` (default, baseURL http://localhost:5173, config auto-starts `npm run dev`), `staging` (`STAGING_URL`), `production` (`PRODUCTION_URL`).
- Reporters: `html` (`playwright-report/`), `junit` (`test-results/results.xml`), `list`.

### Unit/component — Vitest (installed, not yet used)

Vitest + Testing Library are installed but **no tests exist and there is no `test` script**. When adding them:

1. Add `"test": "vitest"` to `package.json`.
2. Co-locate as `*.test.ts` / `*.test.tsx`.
3. Mock `@/lib/supabase` for service tests.

> Playwright is for browser-driven E2E only — not unit/component tests.

## Deployment — Netlify

Deploys from the **repo root**. `netlify.toml` config: `build = npm run build`, `publish = dist`, `functions = netlify/functions` (⚠️ that directory does not exist — no functions ship). Redirects (first match wins):

1. `/vietnam-map-data/*` → `/vietnam-map-data/:splat` (200) — serve static GeoJSON directly.
2. `/assets/*` → `/assets/:splat` (200) — serve static assets directly.
3. `/*` → `/index.html` (200) — SPA fallback.

**Build env vars are set in the Netlify dashboard, not `.env.local`** — Netlify injects `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc. at build time. `.env.local` is git-ignored and used only for local Vite dev. There is no `[build.environment]` block and **no `base`**.

## Common tasks

| Task | How |
|---|---|
| Apply schema to cloud | Paste `schemas/01_…05_*.sql` in order into the Supabase SQL Editor |
| Add a new quiz seed | Insert into `quizzes`/`quiz_questions`/`quiz_options` (see `schemas/03`) |
| Change default map center/zoom | `VIETNAM_MAP_CENTER` / `DEFAULT_ZOOM_LEVEL` in `src/utils/constants.ts` (or `VITE_*` overrides) |
| Edit translations | `src/locales/{en,vi}/translation.json` |
| Add an admin user | set `app_metadata.role = 'admin'` (client `setUserRole` writes `user_metadata` only) |
| Run analytics cleanup | call `cleanup_old_analytics()` via SQL (deletes rows > 1 year) |

## Conventions

- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:` …). **Never commit directly to `main`** — branch first.
- See `_bmad-output/project-context.md` for the full set of language/framework/testing rules (e.g. `import type`, no `enum`, `@/` alias, Zustand v5 double-call, i18n fallback `'vi'`).

---

## Related docs

- [Architecture](./architecture.md) — how the pieces fit.
- [Source Tree Analysis](./source-tree-analysis.md) — folder map.
- [Local Development (detailed)](./local-development.md) — deeper local-stack walkthrough.
