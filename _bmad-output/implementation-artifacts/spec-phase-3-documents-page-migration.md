---
title: 'Phase 3 styling migration — DocumentsPage + FileCard/FirstTimeGuide leftovers'
type: 'refactor'
created: '2026-08-02'
status: 'done'
review_loop_iteration: 0
baseline_commit: '490e7b99d5447042190e1680aaf66136c794678e'
context: ['{project-root}/MIGRATION-CONTRACT.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Phase 3 of the DESIGN.md styling migration is ~95% done, but `src/pages/DocumentsPage.tsx` is entirely unmigrated (raw indigo/gray/red/blue utilities, hand-rolled spinner and pagination), and `FileCard.tsx` / `FirstTimeGuide.tsx` carry small raw-class leftovers.

**Approach:** Apply the MIGRATION-CONTRACT.md token swap map and adopt shared primitives (`Spinner`, `Pagination`, `Button`) on exactly these three files, preserving every e2e-asserted class, testid, aria-label, tag, and visible text byte-for-byte. Styling only — zero behavior change.

## Boundaries & Constraints

**Always:**
- Follow MIGRATION-CONTRACT.md swap map + its 8 global preservation rules + its 7 holdouts verbatim.
- Keep these DocumentsPage classes EXACTLY: card root `bg-white rounded-xl shadow-md` (+`hover:shadow-lg`), folder badge `text-indigo-600 bg-indigo-50`, extension span `text-gray-500`, size span `text-xs text-gray-500`, active filter/page button `bg-indigo-600`, info box `bg-blue-50`.
- Keep literal `animate-spin` on every spinner; download stays `<a href download>`; card titles stay `<h3>`; `data-testid="documents-page"` / `"document-card"` / `data-document-id` unchanged.
- Filter buttons stay native `<button>` with conditional classes (QuizListPage precedent — Button primitive cannot emit raw `bg-indigo-600`).
- Pagination aria-labels stay the literal English `"Previous page"` / `"Next page"` (current page has no i18n for them; specs select by these strings).
- Map leftover shades per contract fallback: blue→info, red→danger, purple→brand, gray-400→faint-foreground, gray-500→muted-foreground.

**Ask First:**
- Any edit under `playwright/` (tests, helpers, config) — goal is zero test modification.
- Any behavior, routing, or text change discovered as seemingly necessary.

**Never:**
- Touch `src/components/map/**`, `src/utils/constants.ts`, `src/utils/zoneProvinces.ts`, `tailwind.config.js`, `src/index.css`, `DESIGN.md`, `src/components/ui/*`, `ConfirmationModal.tsx`, `LoadingSpinner.tsx` (read-only per contract).
- Swap holdout classes to tokens, convert the download `<a>` to `<Button>`, or reorder mapped document cards.
- Add Phase 4 (lint gate) — deferred follow-up, out of scope.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Docs load OK | folders from service | grid of cards, holdout classes intact | N/A |
| Loading | isLoading=true | `<Spinner>` renders `.animate-spin`; refresh icon keeps conditional `animate-spin` | N/A |
| Error | service throws | danger-token panel, Vietnamese/English text unchanged | error text from `err.message` fallback unchanged |
| Empty | 0 documents | muted-token empty state, same text | N/A |
| Pagination | >9 docs | `<Pagination>` renders; active page keeps `bg-indigo-600`; prev disabled on page 1 | component returns null when totalPages<=1 (same as today) |

</frozen-after-approval>

## Code Map

- `src/pages/DocumentsPage.tsx` — main migration target (349 lines, fully raw)
- `src/components/admin/FileCard.tsx` — 5 file-type icon colors (lines 18–44) + metadata row (line 176)
- `src/components/guide/FirstTimeGuide.tsx` — one `hover:text-gray-200` on gradient header (line 285)
- `src/pages/QuizListPage.tsx` — reference: migrated filter buttons + `<Spinner>` + `<Pagination>` usage
- `src/components/ui/{Button,Spinner,Pagination}.tsx` — primitives to adopt (read-only)
- `MIGRATION-CONTRACT.md` — swap map, preservation rules, holdouts
- `playwright/e2e/documents.spec.ts`, `playwright/support/helpers/document-helpers.ts` — class/aria/testid contract (read-only)
- `tailwind.config.js` — token names (read-only)

## Tasks & Acceptance

**Execution:**
- [x] `src/pages/DocumentsPage.tsx` — migrate per swap map: header/text neutrals to foreground tokens; Refresh button → `<Button>` (primary, keeps svg + conditional `animate-spin` + disabled); inactive filter buttons → `bg-sunken text-foreground hover:bg-border`; loading → `<Spinner className="h-12 w-12 mx-auto mb-4" />`; error panel → danger tokens; empty state → muted/sunken/faint tokens; card internals (icon box `bg-red-100`/`text-red-600` → `bg-danger-soft`/`text-danger`, title/desc → foreground tokens); download `<a>` → `bg-brand hover:bg-brand-hover rounded-button`; hand-rolled pagination block → `<Pagination currentPage totalPages onPageChange previousPageLabel="Previous page" nextPageLabel="Next page" />`; info box internals → info tokens keeping `bg-blue-50`; card-styled panels → `rounded-card` — the only unmigrated page; imports from `@/components/ui`
- [x] `src/components/admin/FileCard.tsx` — icon colors to `text-info`/`text-danger`/`text-brand`/`text-info`/`text-faint-foreground`; line 176 → `text-xs text-muted-foreground` — contract fallback rule; no test touches these (CRUD specs use data-testid only)
- [x] `src/components/guide/FirstTimeGuide.tsx` — `hover:text-gray-200` → `hover:text-white/80` — white-on-gradient has no token; keep affordance identical

**Acceptance Criteria:**
- Given the app running, when `/documents` renders in any state (loading/error/empty/list/paged), then every selector in `documents.spec.ts` and `document-helpers.ts` still matches (`.bg-white.rounded-xl.shadow-md`, `.bg-indigo-50.text-indigo-600`, `span.text-gray-500`, `span.text-xs.text-gray-500`, `.bg-blue-50`, `.animate-spin`, `button[aria-label="Previous|Next page"]`, `a[download]`, active `bg-indigo-600`).
- Given the migrated files, when grepped for raw palette classes, then only contract holdouts remain (`bg-indigo-600` active states, holdout classes) — no other `indigo-|gray-|red-|blue-|purple-` utilities.
- Given `npm run build` and `npm run lint`, when executed, then both pass clean.
- Given local Supabase up, when `npm run test:e2e -- --project=chromium` runs, then the read suite stays green (168 passed / 14 skipped baseline) with zero test edits.

## Spec Change Log

- 2026-09-05 — Review closed out with fresh verification (see Verification Results below); status `in-review` → `done`. One documented deviation: repo-wide `npm run lint` reports 51 errors / 5 warnings, **all confined to `playwright/**`** — pre-existing on `main` (identical eslint 10.8.0 + react-hooks 7.1.1 pins; commit `de2809f` touched zero playwright files), not fixable within contract boundaries (styling-only; `playwright/**` is ask-first/read-only). `src/` — the full blast radius of this migration — lints clean (exit 0). No fix-and-rerun cycle occurred, so `review_loop_iteration` stays 0.

## Design Notes

New `tailwind.config.js` redefines the radius scale to DESIGN.md values (sm 6/md 8/lg 12/xl 16), so surviving `rounded-lg` on inner icon boxes now resolves via the token scale — leave them; only swap role-aliased radii the contract names (cards/buttons/inputs). `<Pagination>` already encodes the full e2e contract (raw `bg-indigo-600` active page, caller aria-labels, null when ≤1 page) — do not re-implement.

## Verification

**Commands:**
- `npm run lint` — expected: no errors
- `npm run build` — expected: tsc + vite build succeed
- `npm run test:e2e -- --project=chromium` (prereq: `cd supabase && docker compose up -d`, root `.env.local` → `http://localhost:8000`) — expected: read suite green, no baseline regression

## Verification Results (2026-09-05)

**Environment:** Windows + Git Bash, branch `feature/ui-restructure` @ `de2809f`, clean tree.
Local Supabase up via `podman compose up -d` (docker-compatible engine; all containers healthy, Kong `GET :8000/auth/v1/health` → 200).
Root `.env.local` → `http://localhost:8000` ✔. `playwright/.env` holds `TEST_ADMIN_*`, `TEST_USER_*`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` ✔.

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | `src/` **clean** (`npx eslint src` exit 0). Repo-wide `eslint .`: 51 errors / 5 warnings — **all in `playwright/**`** (unused vars, react-hooks v7 flagging Playwright's `use()` fixtures, unused eslint-disable directives). Pre-existing on `main` (same eslint ^10.8.0 / react-hooks ^7.1.1 pins; `de2809f` touched zero playwright files); out of contract scope — no fix attempted. |
| Build | `npm run build` | ✅ tsc + vite succeed (built in 16.8s; pre-existing >500 kB chunk-size warnings only) |
| E2E read suite | `npm run test:e2e -- --project=chromium` | ✅ Run 1: 167 passed / 1 flaky / 14 skipped in 2.8m — `map-interactions.spec.ts:337` map-load timing assertion (<5s) failed cold at 6.4s, passed on retry. Run 2 (confirmation): **168 passed / 14 skipped / 0 flaky** in 3.3m, exit 0 — exact match to the 2026-08-02 baseline. Zero test edits. |
| Acceptance grep | raw palette utilities across `src/**/*.{ts,tsx}` | ✅ Matches the handoff residual inventory **exactly**, nothing extra: DocumentsPage holdouts (`bg-indigo-600` ×2, `border-gray-100`, `text-indigo-600 bg-indigo-50`, `text-gray-500` ×2, `bg-blue-50`); active-state `bg-indigo-600` in `AdminPage.tsx` ×4, `QuizListPage.tsx` ×1, `ui/Pagination.tsx` ×3; read-only `ConfirmationModal.tsx` / `LoadingSpinner.tsx` raw classes. |

**Verdict:** green within contract boundaries → status `done`.
