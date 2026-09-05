# E2E Test Suite — Status & Progress Log

> Living status document for the Playwright E2E suite. Latest update: **2026-09-05**.

## ⚙️ How to run — locally, after each full dev flow

**Convention: there is intentionally NO CI gate right now.** After every complete
development flow, run the e2e suite **locally** against the local Supabase stack.

Prerequisites: local Supabase up (`cd supabase && docker compose up -d`, or
`npm run supabase:reseed` to reset + reseed), app `.env.local` pointing at
`http://localhost:8000`, and `playwright/.env` populated (TEST_ADMIN_*, TEST_USER_*,
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TEST_RUN_CRUD_WRITE).

```bash
npm run test:e2e:full     # read suite then CRUD write suite (chromium) — the default full check
# or individually:
npm run test:e2e          # read baseline (CRUD skips) — chromium by default
npm run test:e2e:crud     # CRUD write suite (chromium, forces TEST_RUN_CRUD_WRITE=1)
```

Mobile / cross-browser (optional): `npx playwright test --project=mobile-chrome`
(webkit / mobile-safari also available). See "Current state" below.

## Current state (2026-09-05)

| Suite | Command | Status |
|---|---|---|
| Read suite — **chromium** | `npm run test:e2e -- --project=chromium` | ✅ **168 passed** / 14 skipped (intentional skips) — re-verified 2026-09-05 on `feature/ui-restructure` (run 1: 1 map-load warm-up flake recovered by retry; confirmation run clean) |
| CRUD write suite — **chromium** | `npm run test:e2e:crud` | ✅ **12 passed** / 1 skipped (intentional) — last verified 2026-08-02; not re-run 2026-09-05 |
| Read suite — firefox / webkit | `npm run test:e2e` | ⚠️ Mostly green; occasional warm-up flakes recovered by retry (last checked 2026-08-02) |
| Read suite — **mobile-chrome / mobile-safari** | `npm run test:e2e` | ❌ ~30+ pre-existing failures (mobile viewport never validated) — **fix in progress** (last checked 2026-08-02) |

Prerequisite for any local run: local Supabase stack up (`cd supabase && podman compose up -d`; seeded users `admin@vngeo.local` / `user@vngeo.local` exist). App `.env.local` must point at `http://localhost:8000`.

## Changes made 2026-08-02

1. **`package.json` → `test:e2e:crud` now passes `--project=chromium`.**
   Root cause of CRUD red in multi-browser runs: cross-project interference. Every browser project's `afterAll` service-role sweep deletes *all* `[E2E-` rows (including other projects' in-flight quizzes), and the 5 projects concurrently write the singleton `general_settings` row. Write paths are browser-agnostic, so CRUD runs chromium-only; cross-browser coverage stays in the read suite.
2. **`playwright.config.ts` → `retries: process.env.CI ? 2 : 1`** (was 0 locally).
   Absorbs cold Vite dev-server warm-up flakes (first-hit transforms under parallel load). Flaky-then-passing tests still surface as "flaky" in reports.
3. **`CRUD_DEBUG_SPEC.md` → marked RESOLVED** with root-cause summary.

## Verified root causes (2026-08-02 investigation)

- **Admin/auth read-suite failures (last red run):** cold Vite dev server under full parallel load — login flows and first renders exceeded timeouts. Pass instantly when warm; covered by retry: 1.
- **CRUD quiz/settings failures across browsers:** cross-project interference (above), *not* app bugs. Chromium-only CRUD run: all green, including quiz save/reorder, settings feedback URL embed.
- **Mobile read-suite failures (~30+):** test-bug — specs click sidebar-resident controls (`user-menu-button`, `language-selector`) that live inside the off-canvas mobile sidebar (`-translate-x-full` below the `lg` breakpoint) without opening the hamburger menu first. Never validated on mobile (commit `1792b09` was explicitly "chromium-green").

## Known app bugs found by the suite (to fix in app, not tests)

1. **FileUpload modal unusable on small viewports** — modal content is cut off horizontally and the submit button is overlapped by the modal header/dropzone (mobile-chrome evidence: `test-results/document-crud-…-mobile-chrome/test-failed-1.png`). Users on phones cannot complete an upload.
2. **Settings save button coverable on small viewports** — an overlay (toast) can intercept taps on `settings-save-button` on mobile widths.

## In progress

- Nothing active. Mobile hardening is complete (mobile-chrome 162/0, mobile-safari 161/0; see commit `5f267c4`).
- **CI gate intentionally OFF.** A GitHub Actions e2e workflow was scaffolded via `bmad-testarch-ci`, then removed per project decision — e2e runs locally after each full dev flow (see "⚙️ How to run" above). Re-add when CI gating is wanted.

## History

- **2026-09-05** — Phase 3 close-out re-verification on `feature/ui-restructure` @ `de2809f` (local Supabase via `podman compose`): chromium read suite green — run 1: 167 passed / 1 flaky (cold map-load timing assertion, recovered by retry) / 14 skipped; confirmation run: 168 passed / 14 skipped, exact baseline match. Zero test edits. See `_bmad-output/implementation-artifacts/spec-phase-3-documents-page-migration.md` → Verification Results.
- **2026-08-01** — Framework scaffolded (Playwright, fixtures, factories, helpers) via `bmad-testarch-framework`. 10 read specs authored via `bmad-qa-generate-e2e-tests`; brought to chromium-green in `1792b09` (168 tests).
- **2026-08-02** — CRUD write-path suites added (`9e9fe3d`), debugged per `CRUD_DEBUG_SPEC.md`; write paths green on chromium. Mobile hardening started.
- **2026-08-02 (later)** — Mobile suite green (mobile-chrome 162/0, mobile-safari 161/0; commit `5f267c4`). CI workflow scaffolded via `bmad-testarch-ci` then removed — e2e runs locally after each full dev flow; CI not required for now.
