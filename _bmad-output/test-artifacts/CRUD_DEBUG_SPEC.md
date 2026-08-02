# CRUD E2E Debug Spec — Write-Path Failures

> **Status:** ✅ RESOLVED (2026-08-02) — CRUD suite green on chromium: 12 passed / 1 intentionally skipped.
> Root causes of the remaining red after `be59719`: **cross-project interference** (each
> browser project's afterAll service-role sweep deleted *all* `[E2E-` rows, and the
> singleton `general_settings` row was written concurrently by 5 projects). Fix: CRUD
> runs are now scoped to chromium (`npm run test:e2e:crud` → `--project=chromium`) —
> write paths are browser-agnostic and cross-browser coverage stays in the read suite.
> The two mobile-only overlay findings (upload modal cut off / save button covered on
> small viewports) are **app responsive bugs** to fix in the app, not the suite.

> **Original status:** DRAFT — debugging plan for the CRUD suites committed in `9e9fe3d`.
> The CRUD **read/foundation** is solid; the **write-paths** are red against local
> Supabase. This spec routes each failure to a root cause and classifies it as
> **test-fix** (fix in-suite) or **app-bug/DB-config** (raise, mark `test.fixme`).
> Companion: `CRUD_TEST_SPEC.md` (same folder).

## 0. Current state (baseline)
- Read suite: **green** (168; CRUD skips cleanly when `TEST_RUN_CRUD_WRITE=0`).
- CRUD (`TEST_RUN_CRUD_WRITE=1`, 3 specs, chromium): **1 passed / 6 failed / 1 skipped / 5 did-not-run**.
- Local Supabase is up (`http://localhost:8000`), app's `.env.local` points at it, seeded
  users exist (`admin@vngeo.local`, `user@vngeo.local`). Service-role key wired for teardown.

## 1. Reproduce
```bash
# local Supabase must be up
TEST_RUN_CRUD_WRITE=1 npx playwright test --project=chromium \
  playwright/e2e/quiz-crud.spec.ts playwright/e2e/document-crud.spec.ts playwright/e2e/admin-settings-crud.spec.ts
```

## 2. Cross-cutting: capture the real Supabase error
The write failures currently surface only as timeouts/alerts. For each, capture the
**actual DB/storage error** before classifying:
- **Browser console:** `page.on('console', m => console.log(m.type(), m.text()))` and
  `page.on('pageerror', ...)` in a probe — the app's catch blocks do `console.error(...)`.
- **Network:** `page.on('response', r => { if (r.status() >= 400) console.log(r.url(), r.status()) })`
  — watch `.../rest/v1/quizzes`, `.../rest/v1/quiz_questions`, `.../storage/v1/object/documents/...`.
- **RLS probe (service-role, in-test):** after a failing write, read the row back with the
  `serviceRole` client to see whether it exists and what `created_by` / storage path it got.
- **RLS source of truth:** `supabase/supabase-volumes/db/init/02-quiz_schema.sql`,
  `05-storage-policies.sql`, seed `08-storage-policies.sql`.

## 3. Issue A — Quiz save fails (HIGHEST PRIORITY, cascades to 5 tests)
- **Failure:** `quiz-crud › "creates a quiz…"` at `saveQuizViaUI` → `waitForURL(/\/admin\?section=quiz$/)` 20s timeout. `QuizEditPage.handleSaveQuiz` → `QuizService.saveQuiz()` throws → `alert('Failed to save quiz')` → no navigation.
- **RLS in play** (`02-quiz_schema.sql`):
  - `quizzes` update policy = `"Users can update their own quizzes" USING (auth.uid() = created_by)`.
  - `quiz_questions` manage policy = `…FOR OWN quizzes`.
- **Top hypothesis:** the quiz **insert** (create flow) does not set `created_by = auth.uid()`,
  so the subsequent **update** (`updateQuizMetadata`) is blocked by RLS (`null ≠ uid`).
- **Investigate:**
  1. Capture the `console.error('Failed to save quiz', err)` text (likely `new row violates row-level security policy`).
  2. After build+save attempt, query `quizzes` for the `[E2E-quiz-…]` row via service-role → inspect `created_by`.
  3. Read the create path (`QuizManager` create → `QuizService.createQuiz`/RPC) to see if/how `created_by` is set.
- **Classify:**
  - `created_by` null/wrong on insert → **APP-BUG** (create doesn't stamp ownership). Raise; `test.fixme` the create/edit/delete trio.
  - `created_by` correct but update still blocked → **DB-config** (policy/seed). Raise.
  - Save throws for a different reason (e.g. question upsert shape) → test-data fix if the app is right.
- **Fix path (app):** stamp `created_by = auth.uid()` on insert (DB default `auth.uid()` or service sets it), or broaden the admin update policy.

## 4. Issue B — Document upload fails (3 tests)
- **Failure:** `document-crud › "uploads a PDF…"` — after `setInputFiles` + submit, the upload modal never closes (`document-upload-input` `toHaveCount(0)` times out) ⇒ the storage write did not succeed.
- **(Already fixed:** the hidden file-input `toBeVisible()` test-bug → `waitFor attached`.)
- **Top hypothesis:** Supabase **Storage** bucket upload policy blocks the authenticated admin,
  or the upload target path is rejected.
- **Investigate:**
  1. `page.on('response', …)` → capture status of `POST …/storage/v1/object/documents/<path>`.
  2. Read storage policies: `05-storage-policies.sql`, seed `08-storage-policies.sql` — is there an INSERT/upload policy for `authenticated` on bucket `documents`?
  3. Confirm the object key (the helper uploads under a `[E2E-…].pdf` name) is acceptable to the bucket.
- **Classify:**
  - Missing/wrong storage upload policy → **DB-config/app-bug**. Raise; `test.fixme` upload+delete.
  - Upload succeeds but list-refresh assertion races → test-fix (wait for the card testid).
- **Note:** no `documents` DB table exists (storage-only); cleanup removes storage objects.

## 5. Issue C — Settings feedback URL (minor; 2/3 pass)
- **Failure:** `admin-settings-crud › "saves a valid feedback URL…"` — save succeeds (toast appears) but `/feedback` iframe `src` does **not** reflect it. The video-URL test (same flow) passes.
- **Top hypothesis:** `FeedbackPage` caches `getFeedbackFormUrl()` (loads once, not refetched on the in-test navigation), or asserts against the wrong field/URL.
- **Investigate:** read `FeedbackPage` — does it refetch on mount? Compare saved value (service-role read of `general_settings.feedback_form_url`) vs the iframe `src`. Check for a stale closure / cache.
- **Classify:** stale-cache/not-refetched → **APP-BUG** (raise) OR test-fix (reload before asserting) depending on intended behavior.

## 6. Execution plan (recommended: parallel debug agents)
Run **3 agents, one per spec** (quiz / document / settings), each: capture the real error
(§2) → classify per §3–5 → apply test-fixes → for app-bugs, add `test.fixme` with a
reference and list the item. Teardown safety-net (`cleanupE2EEntities`) already guards residue.

- Ownership stays disjoint: each agent edits only its `*-crud.spec.ts` + `*-crud-helpers.ts`
  (+ additive testids in its own component). Shared files (`fixtures.ts`, `cleanup.ts`) are read-only.
- Agents MUST run their spec to a real pass/skip before reporting (no "authored-only").

## 7. Acceptance
- CRUD suite green against local Supabase (writes pass), **or**
- genuine app-bugs raised as separate fix items with the corresponding tests `test.fixme`'d,
  and the read baseline remains 168 green.
