# Documentation Update Plan — UI Restructure Follow-Through

> Created 2026-09-05 · updated 2026-09-05 (goal format + git workflow) · branch `feature/ui-restructure`
> Driven by commit `de2809f` ("feat: re-structure the UI design", 2026-08-02). Companion to `HANDOFF.md` (Goals 2–4).
>
> **How to run this plan:** exactly like `HANDOFF.md` — in a fresh session, point the agent at this file
> and say: *"Read docs-update-plan.md and execute the next Doc-Goal."* Doc-Goals are ordered; do not skip
> ahead. Doc-Goals 2–4 are gated on their parent HANDOFF goal. Update checkboxes and goal statuses as you
> complete work. All HANDOFF Guardrails apply to every Doc-Goal.

---

## What changed in the app

The UI restructure landed the DESIGN.md design system in one commit:

- **Design tokens** in `tailwind.config.js` (`brand`, `accent`, semantic surface/text/border/status colors) — the single source of truth is root `DESIGN.md`.
- **New primitive library** `src/components/ui/` — `Button`, `Card`, `Input`, `Textarea`, `Select`, `Badge`, `Spinner`, `Pagination`, exported via `index.ts`.
- **~40 pages/components migrated** from raw Tailwind color utilities (`bg-indigo-600`, `text-gray-700`…) to semantic tokens/primitives; `src/index.css` slimmed.
- **New root contracts:** `DESIGN.md` (visual identity) and `MIGRATION-CONTRACT.md` (migration rules, token swap map, holdouts).
- Remaining app work before "done": HANDOFF Goal 2 (merge to main), Goal 3 (Phase 4 lint gate), Goal 4 (bookkeeping).

Docs below are stale because they were last verified **2026-08-01 or earlier** — before the restructure.

---

## Git workflow & commit conventions

### Branch model

| Phase | Where | Branch |
|---|---|---|
| Doc-Goal 1 (Wave 1) | On the feature branch, before the PR | `feature/ui-restructure` |
| Doc-Goal 2 (Wave 2) | Committed on the feature branch **before merging**, so `main` lands consistent (overrides HANDOFF Goal 4.3's "post-merge" timing) | `feature/ui-restructure` |
| Doc-Goal 3 (Wave 3) | Rides HANDOFF Goal 3's work; same commit or follow-up commit on that branch | branch used for Goal 3 |
| Doc-Goal 4 (Wave 4) | Post-merge bookkeeping on a fresh branch off `main` | `chore/post-merge-docs` |

Branch naming per `docs/architecture/coding-standards.md` §Git Workflow Standards: `feature/*`, `bugfix/*`, `chore/*` — never bare `fix`/`update`. Only `chore/*` (or a user-directed direct commit) applies to this plan.

### Commit message format

Conventional Commits with optional scope, imperative mood, lowercase type (stated in coding-standards; matches history: `feat`, `fix`, `docs`, `chore`, `test(e2e)`):

```bash
# ✅ CORRECT — pattern for this plan
docs(component-inventory): add ui primitives and design-token notes
docs(architecture): replace stale "tokens unused" claims with token model
docs: archive ui-architecture.md, supersede modernization spec
docs(index): add design-system section, re-tag legacy entries
docs(readme): fix styling line and doc links for design system
chore(sprint-status): record ui restructure as epic-4
docs(standards): add raw-color lint gate rule

# ❌ INCORRECT
updated docs
fixed stuff
Update component-inventory.md
```

Rules: type is one of `feat|fix|docs|chore|test|refactor`; scope = the doc or area (`docs(index)`, `docs(standards)`, `chore(sprint-status)`); subject ≤ ~72 chars, imperative ("add", not "added"); one logical unit per commit — do **not** mix doc updates with code changes; the only code-adjacent exception is Doc-Goal 3, where the lint rule and its doc updates may share a branch but get separate commits (`feat(lint): ...` for the rule, `docs(standards): ...` for the docs).

### Merge & PR conventions

- **Merge method: squash.** ⚠️ HANDOFF.md Goal 2 says "prior merges look like merge commits" — the git history says otherwise: `git log --merges` is empty and every PR landing carries the `(#N)` suffix (e.g. `feat: add analytic section for admin user (#1)`), which is GitHub's squash-merge signature. Use **squash merge** to match actual history, and fix that one line in HANDOFF.md while executing Doc-Goal 2.
- **PR flow (per HANDOFF Goal 2):** `git push -u origin feature/ui-restructure` → open PR to `main` via `gh` (repo `git@github.com:marshmary/vngeo.git`), title in conventional-commit style matching the squashed change (precedent: PRs #1–#4, e.g. `feat: re-structure the UI design`). PR body summarizes: DESIGN.md system, ui primitives, Phases 0–3 migration, e2e-verified, plus "docs updated in-PR" per Doc-Goal 1–2.
- **PR requirements** (coding-standards §Pull Request Requirements): all tests passing, code review approved, no console.log, **documentation updated** (this plan satisfies that clause), performance impact assessed.
- **Never commit:** `node_modules/`, `playwright-report/`, `test-results/`, `dist/`, `tmp/`, `.env*` files. Keep generated review diffs (`_bmad-output/**/review/*.txt`) out of doc commits unless a goal explicitly says otherwise.
- **Environment:** Windows + Git Bash; commit from repo root; verify `git status` is clean of stray artifacts before each commit.

---

## Doc-Goal 1 — Wave 1: on `feature/ui-restructure`, include in the PR ✅ no gate

**Objective:** make the branch's docs describe the code the branch already contains, so the merge PR is self-consistent.

- [ ] **`docs/component-inventory.md`** — Highest priority. Header says "Verified 2026-08-01" but predates the restructure by one day. Add the `ui/` primitive section (props, variants, tones), update per-component notes for the ~40 migrated files, note DESIGN.md as the styling source of truth, and list the contract holdouts (`AdminPage`, `QuizListPage`, `DocumentsPage`, `ConfirmationModal`, `LoadingSpinner`, `ui/Pagination` raw classes).
- [ ] **`docs/architecture.md`** — Fix now-false claims: "~24 components" (add `ui/`), "**Brand/zone Tailwind tokens are defined but unused** — colors reach the UI via inline styles" (line ~104) and the "Colors via data, not tokens" invariant (line ~139). Replace with the token/primitive model; reference DESIGN.md + MIGRATION-CONTRACT.md.
- [ ] **`docs/source-tree-analysis.md`** — Add `src/components/ui/` to the annotated folder map.
- [ ] **`docs/ui-architecture.md`** — Move to `docs/.archive/` (recommended; the 2025 Winston doc describes React 18 / router v6 / Headless UI 1.7 — `docs/architecture.md` + DESIGN.md are canonical now). Alternative: rewrite as the frontend-architecture companion to DESIGN.md.
- [ ] **`docs/design/vietnam-economic-zones-ui-modernization-spec.md`** — Prepend "Superseded by `/DESIGN.md` (2026-08-02)" banner; keep the file (historical rationale).
- [ ] Append a pointer line to `HANDOFF.md` snapshot: docs plan lives at `_bmad-output/planning-artifacts/docs-update-plan.md`; Doc-Goals 2–4 gate on Goals 2–4.

**Commits:** one per doc, `docs(scope): ...` (e.g. `docs(component-inventory): add ui primitives and design-token notes`); the ui-architecture archive + spec banner may share one `docs: archive ui-architecture.md, supersede modernization spec` commit. These commits belong on `feature/ui-restructure` and ship in the same PR as the code (see Branch model table).

**Done when:** all boxes checked, commits on `feature/ui-restructure`, `git status` clean, no `playwright/**` or read-only-set files touched.

## Doc-Goal 2 — Wave 2: rides HANDOFF Goal 2 (merge) ⚠️ gated on user go-ahead to merge

**Objective:** landing docs so `main` is consistent the moment the squash-merge completes.

- [ ] **`README.md`** — Verify/refresh the styling line (line 47 still says "Headless UI" — confirm against `package.json`), folder map, and doc links; point to DESIGN.md for visual identity.
- [ ] **`docs/index.md`** — Full refresh (satisfies HANDOFF Goal 4.3 early): add Design System section (DESIGN.md, MIGRATION-CONTRACT.md, `src/components/ui/`), re-tag legacy entries per Doc-Goal 1 dispositions, refresh "Generated Documentation" dates, drop the stale README warning once fixed.
- [ ] Correct the HANDOFF.md Goal 2 merge-method line (merge commits → squash), per the evidence above.

**Commits:** `docs(readme): fix styling line and doc links for design system`; `docs(index): add design-system section, re-tag legacy entries`; `docs(handoff): correct merge method to squash`. Then proceed with HANDOFF Goal 2's push/PR/merge steps.

**Done when:** boxes checked, commits on the branch before the merge, `main` post-merge shows consistent docs.

## Doc-Goal 3 — Wave 3: rides HANDOFF Goal 3 (Phase 4 lint gate)

**Objective:** document the lint gate the same commit-series that introduces it.

- [ ] **`docs/architecture/coding-standards.md`** — Add the styling rule: semantic tokens + `ui/` primitives only; raw color utilities/hex in `src/**` className strings are lint-blocked except the documented allowlist. Point to MIGRATION-CONTRACT.md's Phase 4 section.
- [ ] **`docs/development-guide.md`** — Add the lint gate to commands/CI; add a short "styling a new component" workflow (pick token from DESIGN.md → prefer `ui/` primitive → never raw palette utility).
- [ ] **`MIGRATION-CONTRACT.md`** — Append the Phase 4 allowlist section (part of Goal 3 itself).
- [ ] **`HANDOFF.md`** — Update snapshot + goal statuses as Goal 3 closes (the file's own instruction).

**Commits:** on Goal 3's branch, separate from the lint-rule commit: `docs(standards): add raw-color lint gate rule`; `docs(guide): add lint gate and styling workflow`; `docs(contract): append phase-4 allowlist`.

**Done when:** boxes checked, doc commits present, `npm run lint && npm run build` still green.

## Doc-Goal 4 — Wave 4: rides HANDOFF Goal 4 (post-merge bookkeeping)

**Objective:** tracking and generated context reflect post-merge reality.

- [ ] Branch: `chore/post-merge-docs` off updated `main`.
- [ ] **`_bmad-output/implementation-artifacts/sprint-status.yaml`** — Record the UI restructure (e.g. epic-4: phase-0–3 stories done, phase-4 status). Commit: `chore(sprint-status): record ui restructure as epic-4`.
- [ ] **`_bmad-output/project-context.md`** — Regenerate against post-merge `main` (`bmad-generate-project-context`). Commit: `docs(context): regenerate project context post-restructure`.
- [ ] **`docs/project-scan-report.json`** + generated doc set (`project-overview.md`, refresh pass over `architecture.md`) — Regenerate via full rescan (`bmad-document-project`) if numbers are referenced anywhere; otherwise fold into Doc-Goal 1 edits and update scan dates.
- [ ] **Optional:** retrospective for the UI-restructure epic (`bmad-retrospective`); epics 1–3 retros were skipped as optional.

**Done when:** tracking files reflect reality on `main`; user accepts.

---

## Explicitly out of scope (historical / unaffected)

`docs/brainstorming-session-results.md`, `docs/development-blueprint.md` (historical build log), `docs/architecture/console-log-removal.md`, `docs/architecture/analytics-dashboard-approach.md`, all `docs/setup/*`, `docs/local-development*.md`, `docs/supabase-*.md`, `schemas/*` — untouched by the styling restructure; no changes needed beyond index link hygiene.

## Suggested execution order

1. Doc-Goal 1 now (fresh session: *"Read docs-update-plan.md and execute the next Doc-Goal"*) → Doc-Goal 2 immediately before the HANDOFF Goal 2 merge → Doc-Goal 3 with Goal 3 → Doc-Goal 4 with Goal 4.
2. Run each doc update in a **fresh context window** with the relevant source pinned (DESIGN.md / MIGRATION-CONTRACT.md / `git show de2809f`).
3. Guardrails from HANDOFF.md apply everywhere: docs-only changes, never edit `playwright/**`, never touch the contract's read-only set (`src/components/map/**`, `src/utils/constants.ts`, `src/utils/zoneProvinces.ts`, `tailwind.config.js`, `src/index.css`, `DESIGN.md`, `src/components/ui/*`, `ConfirmationModal.tsx`, `LoadingSpinner.tsx`, `Pagination.tsx`) — except Goal 3's documented allowlist work.
