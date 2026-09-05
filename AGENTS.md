# AGENTS.md — Working Rules for AI Agents

vngeo is an interactive educational web app for learning about Vietnam's economic zones
(React 19 + TypeScript 5.8 + Vite 8 SPA, Supabase backend, Tailwind 3, Playwright E2E).
This file tells agents how to work here without breaking things. Deeper references are
listed at the bottom — read them before non-trivial work.

## Non-negotiable workflow rules

1. **Always checkout a new branch before doing anything.** Never commit directly to `main`.
2. **Conventional commits** — `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
   PRs to `main` are the merge path (merge commits are the repo precedent).
3. **Node 20** (`.nvmrc`), npm as package manager.
4. **All app/npm commands run from the repo root.** All Docker/Supabase commands run from
   `supabase/` — its `docker-compose.yml` uses relative paths that only resolve from there.
5. **Styling changes and behavior changes are separate concerns.** Don't mix them in one
   commit unless the task explicitly asks for both.
6. When a doc and the live tree disagree, trust the tree, then the newer doc. Some files in
   `docs/architecture/` (e.g. `tech-stack.md`) predate the 2026-08-01 repo reorg and are stale.

## Commands

```bash
npm run dev            # Vite dev server → http://localhost:5173
npm run build          # tsc -b && vite build — TS errors block the build
npm run lint           # eslint .
npm run test:e2e -- --project=chromium   # fastest E2E gate (5 projects exist)
npm run supabase:reseed                  # wipe + restart local Supabase (Docker)

# Local Supabase stack (from supabase/ only):
cd supabase && bash setup-local-supabase.sh && docker compose up -d
```

- Known lint debt: repo-wide `npm run lint` reports ~51 errors, **all in `playwright/**`**,
  pre-existing on `main`. `src/` must lint clean — don't add new errors anywhere, and don't
  "fix" playwright lint errors as a side effect.
- E2E against the local stack needs: Docker stack up, root `.env.local` pointing at
  `http://localhost:8000`, and `playwright/.env` with test credentials (see
  `playwright/.env.example`, `_bmad-output/test-artifacts/e2e-suite-status.md`).

## Repo layout (repo root = app root)

```
src/                  # app source; '@/' alias → ./src
  components/         # by domain: admin, auth, common, guide, map, zone + ui/ primitives
  pages/  services/  stores/  types/  lib/  hooks/  utils/  i18n/  locales/{en,vi}
playwright/           # E2E: e2e/*.spec.ts + support/{fixtures, factories, helpers}
supabase/             # entire local-Supabase/Docker stack (run docker from here)
schemas/              # SQL schemas — applied to cloud via Supabase SQL Editor, in order
public/vietnam-map-data/   # static GeoJSON (map data is static, NOT from Supabase)
docs/                 # project documentation (index at docs/index.md)
_bmad-output/         # planning/implementation/test artifacts (committed)
```

## Critical code rules (violating any of these breaks the build or runtime)

- **`react-router` v8** — import from `'react-router'`, never `'react-router-dom'` (package is gone).
- **`import type { X }`** for all type-only imports — `verbatimModuleSyntax` fails the build otherwise.
- **No `enum`, no `namespace`, no constructor parameter properties** — `erasableSyntaxOnly`; use
  `const` objects or union types.
- **Components never call the Supabase client directly** — all backend access goes through
  static-method service classes in `src/services/` (e.g. `AuthService.signIn()`).
- **`clsx`** is used in the `src/components/ui/` primitives for conditional classes; elsewhere the
  codebase uses template literals — follow the pattern of the file you're in.
- **i18n fallback is `'vi'`** — every user-visible string goes through `t('key')` and exists in
  both `src/locales/en/` and `src/locales/vi/`. Never hardcode English-only UI text.
- **Zustand v5 double-call API** — `create<T>()(persist(...))`; always `partialize` localStorage
  persistence to exclude `isLoading`, `error`, and large arrays.
- **Tailwind v3 config format** (`module.exports` in `tailwind.config.js`) — never v4 CSS config.
- **Env files are strictly separate** — root `.env.local` = Vite `VITE_*` vars only;
  `supabase/.env` = Docker secrets only; `playwright/.env` = E2E only. Never mix.
- TypeScript strict mode with `noUnusedLocals`/`noUnusedParameters` — dead code fails the build.
- Default exports for components; named exports for stores/services/utils. `@/` alias for
  cross-directory imports. One component/service per file. File naming: components PascalCase,
  services/stores camelCase, types kebab-case `.types.ts`.

## Design system (source of truth: `DESIGN.md`)

Token chain flows one way: `DESIGN.md → tailwind.config.js + :root vars → src/components/ui/ primitives → pages`.

- **Use semantic tokens, not raw palette utilities**: `bg-brand`, `bg-brand-subtle`,
  `text-foreground`, `text-muted-foreground`, `bg-card`, `bg-muted`, `border-border`,
  `bg-success-soft text-success-strong`, etc. Do not introduce raw `indigo-600`-style classes
  or hex colors in `src/**` classNames.
- **Build UI from the primitives in `src/components/ui/`** — `Button` (variant/size props),
  `Card`, `Input`, `Textarea`, `Select`, `Badge` (tone), `Spinner`, `Pagination`. They spread
  `{...props}` onto the root element, so `data-testid`, `aria-*`, `disabled`, `type` forward
  automatically.
- **Radius by role**: cards/modals → `rounded-card` (12), buttons/inputs → `rounded-button`/`rounded-input` (8),
  badges/pills → `rounded-full`. Never `rounded-2xl`/`rounded-3xl`.
- **One gradient only** (logo/hero/active nav). Status colors (success/warning/danger/info) are
  for state, never decoration.
- **Exempt from tokens (do not "tidy")**: map zone data colors in `src/utils/constants.ts` and
  `src/utils/zoneProvinces.ts`, Leaflet DOM in `src/components/map/**`, and the feedback
  `<iframe>` (keep `frameBorder="0" marginHeight="0" marginWidth="0"` and its Google Forms src).
- **Surviving e2e holdouts — keep these exact classes verbatim** (tests assert/locate by them):
  active/selected `bg-indigo-600` on admin tabs, DocumentsPage "All" filter and active page
  buttons (and `<Pagination>` internals); document card root `bg-white rounded-xl shadow-md`;
  category badge `bg-indigo-50 text-indigo-600`; file-extension/size spans `text-gray-500`;
  DocumentsPage info box `bg-blue-50`; quiz option selected marker class `selected`.

## Playwright E2E contract

The suite in `playwright/e2e/*.spec.ts` is the acceptance gate. **Never edit `playwright/**`
(tests, helpers, config) without asking the user first.** When touching UI, preserve:

- `data-testid` values, static or dynamic (`quiz-row-{id}`, `zone-button-{id}`, …) — same element.
- Visible button/link/heading text (English **and** Vietnamese) — tests click by text.
- `aria-label`s, `aria-valuenow`, live regions.
- Element tags tests depend on: download = `<a>` with both `href` and `download`; card titles
  inside cards = `<h3>`; the quiz editor = a real `<form>`; disabled buttons = real
  `<button disabled>`; spinners keep literal `animate-spin`.
- Routing paths and query params (`?section=quiz|settings|files`, `/admin/quiz/{id}/edit`).
- Sibling order in indexed lists (`question-row-{i}`, `quiz-row-{id}`).

Reuse `playwright/support/` fixtures and faker-driven factories; don't hand-roll auth/data setup.

## Definition of done

Before reporting work complete, run and pass: `npm run lint` (src clean), `npm run build`,
and for anything behavioral, the chromium E2E suite. Record what you ran and the results in
your summary; if a check is red and unfixable in-bounds, say so explicitly instead of hiding it.

## Where to look next

- `docs/index.md` — documentation index (note which docs are marked stale).
- `docs/development-guide.md` — setup, env vars, commands, testing, deployment.
- `docs/local-development.md` — full local Supabase walkthrough.
- `docs/architecture.md`, `docs/data-models.md`, `docs/api-contracts.md` — how the pieces fit.
- `_bmad-output/project-context.md` — the exhaustive agent rulebook (62 rules) this file condenses.
- `_bmad-output/test-artifacts/e2e-suite-status.md` — how to run E2E + current baselines.
