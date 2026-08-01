---
project_name: 'vngeo'
user_name: 'marshmary'
date: '2026-08-01'
sections_completed:
  ['technology_stack', 'repository_structure', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'dont_miss_rules']
status: 'complete'
rule_count: 62
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

> **Source of truth:** `package.json`, `tsconfig.app.json`, `vite.config.ts`, and the live repo tree. The repo was **reorganized on 2026-08-01** — the app was promoted to the repo root and the Docker/Supabase stack moved into `supabase/`. Treat `README.md` and `docs/architecture/tech-stack.md` as **stale** (they still describe the old layout and old versions); verify against this file or the live tree instead.

---

## Technology Stack & Versions

- **React 19.1** + **TypeScript 5.8** (strict mode, `erasableSyntaxOnly`, `verbatimModuleSyntax`)
- **Vite 8.1** + `@vitejs/plugin-react` 6 — `@/` maps to `./src/` (alias via `__dirname` in `vite.config.ts`, mirrored in tsconfig)
- **Node 20** (pinned in `.nvmrc`)
- **React Router 8.2** — import from **`'react-router'`**, NOT `'react-router-dom'` (the `-dom` package is gone; all source imports the unified `react-router`)
- **Zustand 5.0** — v5 double-call API: `create<T>()(middleware(...))`
- **Supabase JS 2.58** — client at `@/lib/supabase.ts`, env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **React Leaflet 5.0** + **Leaflet 1.9** — CSS imported in `@/index.css`
- **Tailwind CSS 3.4** — **v3** config format (`module.exports` in `tailwind.config.js`), NOT v4 CSS-based config
- **Headless UI (`@headlessui/react`) 2.2** — accessible component primitives (used, e.g. `UserProfileDropdown`)
- **Framer Motion 12** — interactive animations (hover/tap/fade)
- **React Hook Form 7.63** — form management
- **i18next 25.5** + `react-i18next` 15.7 + browser-languagedetector 8.2 — fallback language is `'vi'` (Vietnamese), NOT `'en'`
- **FontAwesome v7** — `@fortawesome/react-fontawesome` 3 + `free-solid-svg-icons` 7 + `free-regular-svg-icons` 7
- **clsx 2.1** — installed but **imported nowhere**; use template literals for conditional classes
- **Vitest 4.1** + Testing Library (react 16, jest-dom 6, user-event 14) — installed, **no unit/component tests exist yet, no `test` script**
- **Playwright 1.48** — E2E tests **exist** (`playwright/e2e/*.spec.ts` + `playwright/support/`); `@faker-js/faker` 9 powers test factories
- **ESLint 10** (flat config) + `typescript-eslint` 8.65 + `eslint-plugin-react-hooks` **7** + `react-refresh` 0.5
- **Terser** production minify — drops `console.log`/`info`/`debug`, keeps `error`/`warn`

## Repository Layout (post-reorganization)

The app lives at the **repo root** — there is **no `vietnam-economic-zones/` directory**.

```
vngeo/                         # repo root = app root
├── index.html, package.json, vite.config.ts, tsconfig*.json
├── eslint.config.js, tailwind.config.js, postcss.config.js
├── netlify.toml, .nvmrc, .env.local.example   # VITE_* frontend template
├── playwright.config.ts
├── src/                       # app source (@/ alias)
│   ├── components/{admin,auth,common,debug,guide,map/ZoneLayer,zone}
│   ├── pages, services, stores, types, utils, hooks
│   ├── lib, i18n, locales/{en,vi}, assets
├── public/vietnam-map-data/   # static GeoJSON map data
├── schemas/                   # SQL schemas (settings, quiz, analytics)
├── netlify/functions/         # serverless functions (health.ts)
├── playwright/                # E2E: e2e/*.spec.ts + support/{fixtures,factories,helpers}
├── supabase/                  # ENTIRE local-Supabase/Docker stack lives here
│   ├── docker-compose.yml, setup-local-supabase.sh, .env.example
│   └── supabase-volumes/{db,seed,kong}
├── docs/, design/, scripts/
├── _bmad-output/              # committed (planning/implementation/test artifacts)
└── .claude/, _bmad/, .zcode/, .github/chatmodes/   # AI tooling (unchanged)
```

- **All app/npm commands run from the repo root** (`npm run dev`, `npm run build`, etc.).
- **All Docker/Supabase commands run from `supabase/`** (`cd supabase && bash setup-local-supabase.sh && docker compose up -d`). `docker-compose.yml` uses relative `./supabase-volumes/...` paths that resolve from `supabase/` — do not edit them.
- **Two env files, kept strictly separate:** root `.env.local` = Vite frontend (`VITE_*` only); `supabase/.env` = Docker/local-Supabase secrets (`POSTGRES_PASSWORD`, `JWT_SECRET`, `ANON_KEY`…). Docker auto-loads `supabase/.env`; Vite reads root `.env.local`. Templates: root `.env.local.example`, `supabase/.env.example`. E2E test env lives in `playwright/.env.example`.
- **Netlify deploys from repo root** — `netlify.toml` has **no `base`**; `publish = "dist"`, `functions = "netlify/functions"`, plus SPA + map-data + assets redirects. Build env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are set in the Netlify dashboard, not read from `.env.local`.

## Critical Implementation Rules

### Language-Specific Rules

- **TypeScript strict mode** — `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, and `noUncheckedSideEffectImports` all enabled
- **`verbatimModuleSyntax: true`** — MUST use `import type { X }` for type-only imports; bare `import { X }` fails for types
- **`erasableSyntaxOnly: true`** — no `enum`, no `namespace`, no constructor parameter properties; use `const` objects or union types instead
- **`moduleResolution: "bundler"` + `allowImportingTsExtensions`** — modern resolution; target ES2022
- **Path alias `@/`** — mandatory for cross-directory imports; relative imports only for same-directory siblings
- **Default exports** for React components; **named exports** for stores, services, utilities
- **Import order**: React/lib → `@/` internals → relative files → CSS
- **Error handling pattern**: `error instanceof Error ? error.message : 'Fallback string'`
- **Async store actions**: wrap in try/catch, always set `isLoading: false` in finally or both branches

### Framework-Specific Rules

- **Components**: `const X: React.FC<XProps> = ({ ... }) => {}` with props interface above, default export at bottom
- **Zustand stores**: separate `State`/`Actions` interfaces → `type Store = State & Actions` → `create<Store>()(persist(...))` with `partialize` for localStorage (exclude `isLoading`, `error`, large arrays)
- **Never call Supabase directly in components** — route all queries through `@/services/` static classes (location: `src/services/`, NOT `src/lib/services/` as the stale README claims)
- **Services**: static class methods (e.g. `AuthService.signIn()`), throw on error; caching at service level when needed
- **Routing**: import hooks/components from **`'react-router'`** (`BrowserRouter`, `Routes`, `Route`, `useNavigate`, `useLocation`, `useParams`, `useSearchParams`, `Navigate`)
- **i18n**: use `t('key')` for static UI strings; use `language === 'vi' ? x : y` for data-driven bilingual content; **fallback is `'vi'`**, NOT `'en'`
- **Protected routes**: wrap with `<AdminRoute>` or `<ProtectedRoute>` component
- **Styling**: Tailwind utility classes only; brand tokens defined in `tailwind.config.js` (`vietnam-red`, `mekong-blue`, `zone-1`…`zone-6`, fonts `primary`/Inter, `heading`/Plus Jakarta Sans); `@apply` in `@/index.css` for reusable patterns; inline styles only for dynamic values Tailwind can't handle
- **Animations**: Framer Motion for interactive animations; Headless UI for accessible primitives
- **Icons**: FontAwesome via `@fortawesome/react-fontawesome` — no other icon libraries
- **Auth is async-initialized**: `initializeAuth()` (exported from `@/stores/authStore`) must be called on app load; stores subscribe to Supabase auth state changes

### Testing Rules

- **E2E tests live in `playwright/e2e/*.spec.ts`** — run via `npm run test:e2e` (also `:ui`, `:debug`, `:headed`). `playwright.config.ts` auto-starts `npm run dev` for the `local` env.
- **E2E environments**: `TEST_ENV=local|staging|production` (default `local`, baseURL `http://localhost:5173`). Projects: chromium, firefox, webkit, mobile-chrome, mobile-safari.
- **E2E support code**: `playwright/support/` — `fixtures.ts`, `factories/` (user/quiz/document, faker-driven), `helpers/`. Reuse these; do not hand-roll auth/data setup in specs.
- **Unit/component tests**: Vitest + Testing Library are installed but **no tests exist yet and there is no `test` script**. When adding them: add `"test": "vitest"` to package.json, co-locate as `.test.ts`/`.test.tsx`, mock `@/lib/supabase` for service tests.
- **E2E vs unit**: Playwright is for browser-driven E2E only — NOT for unit/component tests.

### Code Quality & Style Rules

- **ESLint flat config** (`eslint.config.js`) with typescript-eslint recommended, react-hooks (rules-of-hooks error, exhaustive-deps warn), react-refresh (default exports only for components, `allowConstantExport`)
- **react-hooks v7 stricter rules are deliberately disabled** (`set-state-in-effect`, `immutability`, `static-components`, `preserve-manual-memoization`, `use-memo`, etc. are `off`) — tracked as separate code-quality work; do not expect code to satisfy them
- **File naming**: components/pages = PascalCase, services/stores/utils = camelCase, types = kebab-case + `.types.ts` suffix
- **Constants**: UPPER_SNAKE_CASE (`VIETNAM_MAP_CENTER`, `DEFAULT_ZOOM_LEVEL`)
- **Store hooks**: `useXxxStore` naming pattern
- **One component/service per file**
- **No comments by default** — code should be self-documenting through naming (services do use JSDoc on methods)
- **Conditional classNames**: use template literals, not clsx
- **Lint**: `npm run lint` runs ESLint on the project; `npm run build` runs `tsc -b && vite build` — **TS errors block the build**

### Development Workflow Rules

- **Branch**: `main` is the primary branch — **never commit directly to main**
- **New features/fixes**: always checkout a new branch before starting work
- **Commit messages**: conventional commits format — `feat:`, `fix:`, `chore:`, `docs:`, etc.
- **Node version**: use Node 20 (`.nvmrc`); `npm` is the package manager
- **No CI/CD pipeline** is configured in-repo (Netlify deploy previews are the build gate)

### Critical Don't-Miss Rules

- **NEVER commit to main directly** — always create a feature/fix branch first
- **NEVER import from `'react-router-dom'`** — it's `react-router` v8 now; the `-dom` package is gone
- **NEVER call `supabase` directly in components** — always go through `@/services/` classes
- **NEVER use `enum`** — `erasableSyntaxOnly` forbids it; use `const` objects or union types
- **NEVER import types without `import type`** — `verbatimModuleSyntax` will break the build
- **NEVER use Tailwind v4 syntax** — this project uses v3 config format (`module.exports = {...}`)
- **NEVER use clsx** — installed but unused; use template literals for conditional classNames
- **NEVER hardcode English as fallback** — i18next fallback is `'vi'` (Vietnamese)
- **NEVER put all Zustand state in `persist`** — always use `partialize` to exclude loading/error states and large arrays
- **NEVER run docker from the repo root** — the Supabase stack lives in `supabase/`; run `docker compose` from there
- **NEVER mix env files** — Vite reads root `.env.local` (`VITE_*`); Docker reads `supabase/.env` (secrets). Do not add docker secrets to `.env.local`
- **NEVER trust the README's structure section or `docs/architecture/tech-stack.md`** — both predate the reorg and list the old layout/versions; use this file or the live tree
- **Supabase env vars are validated at startup** — missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` throws immediately from `@/lib/supabase.ts`
- **Zone data is static** — loaded from `VIETNAM_ECONOMIC_ZONES` in `@/utils/constants.ts`, NOT from Supabase
- **Map data is static** — GeoJSON loaded from `/public/vietnam-map-data/`, NOT from Supabase
- **Services live in `src/services/`** (e.g. `authService.ts`, `quizService.ts`, `documentService.ts`, `analyticsService.ts`, `settingsService.ts`, `documentsPageService.ts`, `gadmService.ts`) — not `src/lib/services/`

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack or repo layout changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-08-01
