# E2E Test Suite — Status & Progress Log

> Living status document for the Playwright E2E suite. Latest update: **2026-08-02**.

## Current state (2026-08-02)

| Suite | Command | Status |
|---|---|---|
| Read suite — **chromium** | `npm run test:e2e -- --project=chromium` | ✅ **168 passed** / 14 skipped (intentional skips) |
| CRUD write suite — **chromium** | `npm run test:e2e:crud` | ✅ **12 passed** / 1 skipped (intentional) |
| Read suite — firefox / webkit | `npm run test:e2e` | ⚠️ Mostly green; occasional warm-up flakes recovered by retry |
| Read suite — **mobile-chrome / mobile-safari** | `npm run test:e2e` | ❌ ~30+ pre-existing failures (mobile viewport never validated) — **fix in progress** |

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

- **Mobile read-suite hardening (test-side):** add `data-testid` for the mobile hamburger button, add a `openMobileSidebarIfNeeded()` helper, update sidebar-dependent flows (logout, admin user-menu, language switching, homepage/map mobile interactions). Validate on mobile-chrome, then mobile-safari.

## History

- **2026-08-01** — Framework scaffolded (Playwright, fixtures, factories, helpers) via `bmad-testarch-framework`. 10 read specs authored via `bmad-qa-generate-e2e-tests`; brought to chromium-green in `1792b09` (168 tests).
- **2026-08-02** — CRUD write-path suites added (`9e9fe3d`), debugged per `CRUD_DEBUG_SPEC.md`; write paths green on chromium. Mobile hardening started.
