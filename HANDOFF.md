# HANDOFF — UI Restructure Continuation

> **How to use this file:** this is a self-contained, model-agnostic handoff. In a fresh session,
> point the agent at this file and say: *"Read HANDOFF.md and execute the next goal."*
> Goals are ordered; do not skip ahead. Everything needed to act is in this file or in the
> authoritative docs listed below. Update this file (snapshot + goal statuses) as you complete work.

---

## Snapshot (2026-09-05)

- **Branch:** `feature/ui-restructure`, 1 commit ahead of `main` (`de2809f` — "feat: re-structure the UI design", 2026-08-02). Working tree clean. **Branch not pushed** (no upstream).
- **Done and committed:** the full DESIGN.md styling migration — Phases 0–3 in one commit:
  design tokens in `tailwind.config.js`, primitives in `src/components/ui/` (Button, Card, Input,
  Textarea, Select, Badge, Spinner, Pagination), ~40 pages/components migrated to tokens/primitives.
- **Phase 3 spec** (`_bmad-output/implementation-artifacts/spec-phase-3-documents-page-migration.md`):
  all execution tasks checked, **status: `done`** (closed 2026-09-05 with fresh verification — see the
  spec's "Verification Results" block), review loop iteration 0. Review artifact exists:
  `_bmad-output/implementation-artifacts/review/phase-3-documents-page-diff.txt`.
- **Older plan (Epics 1–3: dependency audit, local Supabase, cloud keep-alive): fully done**
  per `_bmad-output/implementation-artifacts/sprint-status.yaml` (2026-07-30). Not part of this handoff.
- **E2E baseline:** 2026-08-02 read suite chromium 168 passed / 14 skipped; CRUD suite chromium
  12 passed / 1 skipped. **Re-verified 2026-09-05** (Goal 1): chromium read suite 168/14 clean on
  confirmation run (run 1 had 1 recovered warm-up flake in a map-load timing test). CRUD not re-run.
- **Lint (2026-09-05):** `src/` is clean, but repo-wide `npm run lint` (`eslint .`) reports 51 errors /
  5 warnings — **all in `playwright/**`**, pre-existing on `main` (identical eslint ^10.8.0 /
  react-hooks ^7.1.1 pins; commit `de2809f` touched zero playwright files). Not fixable under the
  styling-only / never-edit-playwright guardrails. Relevant context for Goal 3.

### Authoritative docs — read before acting
1. `MIGRATION-CONTRACT.md` (repo root) — token swap map, 8 preservation rules, 7 holdouts. **The law.**
2. `DESIGN.md` (repo root) — the design system the tokens implement.
3. `_bmad-output/implementation-artifacts/spec-phase-3-documents-page-migration.md` — intent, boundaries, acceptance criteria.
4. `_bmad-output/test-artifacts/e2e-suite-status.md` — how to run e2e, prerequisites, baselines.

### Residual raw-palette classes (verified 2026-09-05 — all legitimate)
Grep `(bg|text|border|ring)-(indigo|gray|...)-NNN` across `src/` hits only:
- `DocumentsPage.tsx` — contract holdouts: active filter/page `bg-indigo-600` (×2), card root
  `bg-white rounded-xl shadow-md` (+ `border-gray-100` on same card), folder badge
  `text-indigo-600 bg-indigo-50`, extension + size spans `text-gray-500`, info box `bg-blue-50`.
- `AdminPage.tsx` (×4), `QuizListPage.tsx` (×1), `ui/Pagination.tsx` (×3) — active-state `bg-indigo-600` holdouts.
- `ConfirmationModal.tsx`, `LoadingSpinner.tsx`, `ui/Pagination.tsx` — declared **read-only / already migrated** in the contract; their raw classes are out of scope by contract.

No other raw utilities remain in `src/` (map components and zone-data constants are excluded by contract).

- **Docs plan:** the documentation follow-up for this restructure lives at
  `_bmad-output/planning-artifacts/docs-update-plan.md` (Doc-Goals 1–4). Execute it the same way as this
  file's goals — *"Read docs-update-plan.md and execute the next Doc-Goal."* Doc-Goals 2–4 gate on
  Goals 2–4 below; Doc-Goal 1 is ungated and already in progress on this branch.

---

## Goal 1 — Close out the Phase 3 review  ✅ DONE 2026-09-05

**Objective:** move the Phase 3 spec from `in-review` to `done` with fresh verification evidence.
**Outcome:** lint `src/` clean (repo-wide playwright/** lint debt documented above and in the spec's
Verification Results — deviation recorded, no in-boundary fix exists); build green; chromium read suite
168 passed / 14 skipped (confirmation run, baseline-exact, zero test edits); acceptance grep matches the
residual inventory exactly; spec → `done` with Verification Results block; `e2e-suite-status.md`
"Current state" table refreshed; committed as `docs: close phase 3 review`.

1. Run, in order, and record results:
   - `npm run lint` — expect clean.
   - `npm run build` — expect tsc + vite success.
   - Local Supabase up: `cd supabase && docker compose up -d`; root `.env.local` must point at
     `http://localhost:8000`; `playwright/.env` must hold `TEST_ADMIN_*` / `TEST_USER_*` /
     `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`.
   - `npm run test:e2e -- --project=chromium` — expect 168 passed / 14 skipped, zero test edits.
2. Re-check the acceptance grep (pattern above) — result must match the residual inventory in this file.
3. If anything is red: fix within contract boundaries (styling only; never edit `playwright/**`),
   re-run, and increment `review_loop_iteration` in the spec frontmatter.
4. If green: set spec `status: done`, append a short Verification Results block to the spec
   (commands + numbers + date), and update the "Current state" table in `e2e-suite-status.md`.
5. Commit doc updates on this branch (`docs: close phase 3 review` or similar).

**Done when:** lint/build/e2e green, spec says `done`, results recorded, committed.

## Goal 2 — Land the branch on main  ⚠️ requires explicit user go-ahead

**Objective:** get `feature/ui-restructure` merged.

1. `git push -u origin feature/ui-restructure`.
2. Open a PR to `main` via `gh` (repo: `git@github.com:marshmary/vngeo.git`; PRs #1–#4 are the precedent
   for title style). Summarize: DESIGN.md system, ui primitives, Phases 0–3 migration, e2e-verified.
3. Merge after user approval (squash or merge — match repo history; prior merges look like merge commits).

**Done when:** commit(s) are on `main` locally and on origin, and the feature branch is cleaned up per user preference.

## Goal 3 — Phase 4: lint gate against raw color utilities (deferred follow-up)

**Objective (from `DESIGN.md` line 184):** a lint check that blocks raw color utilities / hex from returning.

1. Add an ESLint rule (custom `no-restricted-syntax` on JSX className, or a regex-based rule) that
   rejects raw palette utilities (`(bg|text|border|ring|from|to|hover:…)-(indigo|gray|slate|red|blue|green|purple|orange|yellow)-NNN`)
   and raw hex colors in `src/**` className strings.
2. Maintain an explicit allowlist matching the contract holdouts + read-only files:
   `AdminPage.tsx`, `QuizListPage.tsx`, `DocumentsPage.tsx`, `ui/Pagination.tsx`,
   `ConfirmationModal.tsx`, `LoadingSpinner.tsx`; exclude `src/components/map/**`,
   `src/utils/constants.ts`, `src/utils/zoneProvinces.ts` entirely.
3. Wire it into `npm run lint`; existing codebase must pass with only allowlisted exceptions.
4. Run `npm run lint && npm run build`; e2e not required for a lint-only change but a chromium read
   run is cheap insurance if Goal 1's stack is still up.

**Done when:** `npm run lint` fails on a deliberately-injected `bg-red-500`, passes on current code, allowlist documented in `MIGRATION-CONTRACT.md` (append a Phase 4 section).

## Goal 4 — Post-merge bookkeeping

1. Add the UI restructure to `_bmad-output/implementation-artifacts/sprint-status.yaml` (e.g. epic-4
   entry, stories phase-0-3 done, phase-4 status) or record it in whatever tracking shape the user prefers.
2. Optionally run a retrospective (`/bmad-retrospective`) — the epics 1–3 retros were marked optional and skipped.
3. Refresh `docs/index.md` if it references files added/removed by the restructure.

**Done when:** tracking files reflect reality; user accepts.

## Goal 5 — Backlog (optional, non-blocking)

From `_bmad-output/implementation-artifacts/deferred-work.md` (Epic 2 smoke test, 2026-07-30):
- Realtime `DB_ENC_KEY` wrong size — setup script generates base64-48; realtime v2.33.9 needs a 16-byte
  AES-128 key, so the container restart-loops. Fix: generate a separate 16-byte `DB_ENC_KEY` in the setup script.
- Studio healthcheck cosmetic "unhealthy" (responds 307 on :3001, functionally fine) — tune the healthcheck.
- Authenticated-user storage upload returns 403 (storage-api tenant/claim scoping on top of bucket RLS);
  admin flows use service_role so non-blocking today.

Pick up only if the user asks; each needs the local Supabase stack running.

---

## Guardrails (apply to every goal)

- **Styling only.** No behavior, routing, state, or text changes outside what a goal explicitly says.
- **Never edit `playwright/**`** (tests, helpers, config) without asking the user first.
- **Never touch** the contract's read-only set: `src/components/map/**`, `src/utils/constants.ts`,
  `src/utils/zoneProvinces.ts`, `tailwind.config.js`, `src/index.css`, `DESIGN.md`, `src/components/ui/*`,
  `ConfirmationModal.tsx`, `LoadingSpinner.tsx`, `Pagination.tsx` — except Goal 3's documented allowlist work.
- Preserve all e2e contract elements: `data-testid`s, visible text, `aria-label`s, element tags
  (`<a download>`, `<h3>`, `<form>`, `<button disabled>`), route shapes, `animate-spin`, sibling order.
- Environment: Windows + Git Bash; npm scripts from repo root; e2e needs local Supabase docker stack + `playwright/.env`.
