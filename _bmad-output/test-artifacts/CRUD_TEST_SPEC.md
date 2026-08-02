# E2E Test Spec — Create / Modify / Delete (CRUD) Flows

> **Status:** DRAFT — plan for the write-path test suite. The current suite covers
> only read/navigation/structure (168 passing). This spec defines the missing
> mutation coverage: the highest-value business flows where regressions hurt most.
>
> **Companion to:** `playwright/README.md` and `_bmad-output/implementation-artifacts/tests/e2e-test-coverage-summary.md`.

---

## 1. Goal

Cover every **create / update / delete** operation a user (mostly admin) can perform,
end-to-end through the real UI, against a real Supabase backend — so future changes
to forms, services, or RLS policies can't silently break the write paths.

## 2. Scope — entities & flows

| Entity | Create | Update | Delete | Primary component(s) |
|---|---|---|---|---|
| **Quiz** (admin) | ✅ | ✅ (title/desc/difficulty/status, questions, drafts, auto-save) | ✅ | `QuizManager`, `QuizEditPage`, `QuizListPage` |
| **Quiz question** (admin) | ✅ add | ✅ edit text/options/correct, reorder | ✅ remove | `QuizEditPage` |
| **Document** (admin) | ✅ upload | (metadata via re-upload) | ✅ | Admin file manager, `DocumentsPage` |
| **Settings** (admin) | — | ✅ save video URL + feedback URL (with validation) | — | `AdminPage` settings tab |
| **User account** | ✅ signup | (profile — out of scope v1) | — | `LoginPage` sign-up mode |
| **Quiz attempt** (student) | ✅ submit answers → score | — | — | `QuizPage` results |

## 3. Prerequisites & strategy

### 3.1 Auth
All admin CRUD tests gate on `TEST_ADMIN_EMAIL` (same `hasAdminCredentials()` pattern
as `admin.spec.ts`) and log in via the fixed `loginAdmin()` helper. Signup tests use
a throwaway address. Student submit-test uses `TEST_USER_EMAIL`.

### 3.2 Data isolation & teardown (critical — do NOT pollute the DB)
Every created entity is **uniquely tagged** so it's identifiable and cleanable:

- Naming convention: `title = [E2E-<ISO timestamp>-<run-id>] <name>` (e.g. quiz title).
- **Primary strategy — full round-trip in-test:** create → verify → delete within the
  same test (proves delete too, and leaves no residue).
- **Safety net — `afterEach`/`afterAll` cleanup** via a Supabase **service-role** client
  (env `SUPABASE_SERVICE_ROLE_KEY`, test-only) that deletes every row matching
  `[E2E-` in the relevant tables. This catches tests that crashed mid-flow.
- Documents: upload to a dedicated test path prefix (`documents/__e2e__/...`) and delete
  from storage + DB row in cleanup.

> **Open question for owner:** run CRUD tests against the **dev/production Supabase**
> (with cleanup) or stand up a **disposable local Supabase** (`supabase start`) for CI?
> Recommendation: gate behind a `TEST_RUN_CRUD_WRITE` flag (default off) so the green
> read-suite never depends on write access; enable explicitly for release/nightly runs.

### 3.3 Testids to add (additive only — no behavior change)
Before implementing, add stable `data-testid` anchors to the write UI (mirrors the
approach already used app-wide):

```
QuizManager:   create-quiz-button, quiz-row-<id>, quiz-edit-button-<id>, quiz-delete-button-<id>,
               quiz-status-<id>, confirm-delete-button, cancel-delete-button
QuizEditPage:  quiz-title-input, quiz-description-input, quiz-difficulty-select,
               quiz-status-select, add-question-button, question-row-<n>,
               question-text-input-<n>, add-option-button-<n>, option-text-input-<n>-<m>,
               correct-option-radio-<n>-<m>, remove-question-button-<n>, save-quiz-button,
               draft-indicator, unsaved-changes-indicator
Documents:     document-upload-input, document-upload-button, document-delete-button-<id>,
               document-category-select
Settings:      video-url-input, feedback-url-input, settings-save-button,
               settings-validation-error, settings-saved-toast
Signup:        signup-toggle, signup-email-input, signup-password-input,
               signup-confirm-password-input, signup-submit-button
```

## 4. Test suites

### 4.1 `quiz-crud.spec.ts` — Quiz create / edit / delete
Prerequisite: admin login + `TEST_RUN_CRUD_WRITE`.

1. **Create quiz**
   - Open admin → quiz tab → click `create-quiz-button`.
   - Fill `quiz-title-input` = `[E2E-…] Smoke Quiz`, description, difficulty = easy,
     status = draft.
   - Add 1 question with 2 options, mark option 1 correct.
   - Click `save-quiz-button` → assert success toast / redirect to edit page.
   - Assert the quiz appears in `QuizManager` list (`quiz-row-*` with the E2E title).
   - **Cleanup:** delete it (see test 4).
2. **Edit quiz metadata**
   - Create a quiz (as above), open `quiz-edit-button`.
   - Change title, description, difficulty, status (draft→published).
   - Save → reopen → assert persisted values match.
   - Cleanup: delete.
3. **Question CRUD**
   - Create quiz, open edit. Add 3 questions; edit question 2's text + correct option;
     remove question 1; reorder (if UI supports) → assert order.
   - Save → reopen → assert question set matches.
   - Cleanup: delete quiz.
4. **Delete quiz**
   - Create a quiz. Click `quiz-delete-button-<id>` → confirm `confirm-delete-button`.
   - Assert the row is gone from the list and `/quiz/<id>` shows the not-found error.
5. **Drafts & auto-save** (if implemented)
   - Edit a quiz, type unsaved changes → assert `unsaved-changes-indicator` / draft saved
     to localStorage; reload → assert draft-prompt offers to restore.
6. **Validation** (negative paths)
   - Save with empty title → assert validation error, no create.
   - Save question with <2 options or no correct option → assert error.

### 4.2 `document-crud.spec.ts` — Upload / delete
1. **Upload document**
   - Admin file manager → `document-upload-input` set a small fixture PDF
     (`playwright/support/fixtures/sample.pdf`) → select category → upload.
   - Assert file appears in `DocumentsPage` list with correct name/category.
2. **Delete document**
   - Delete an uploaded (E2E) doc → assert removed from list.
3. **Validation** — reject oversize / wrong type (per `VITE_ALLOWED_FILE_TYPES`,
   `VITE_MAX_DOCUMENT_SIZE`).

### 4.3 `admin-settings-crud.spec.ts` — Save settings
1. **Save valid feedback URL** → enter valid Google Form URL → save → assert
   `settings-saved-toast`; verify `/feedback` embeds the new URL.
2. **Save valid video URL** → YouTube embed URL → save → assert `MapDrawingPage` shows it.
3. **Validation** — invalid URL → assert `settings-validation-error`, no save.

### 4.4 `signup.spec.ts` — Account creation
1. **Signup happy path** — toggle to sign-up mode, fill email/password/confirm,
   submit → assert redirect to home + authenticated state (user menu visible).
   - Use `[e2e-signup-…]@example.com` throwaway; teardown via service-role delete.
2. **Validation** — mismatched passwords / weak password / duplicate email → assert errors.

### 4.5 `quiz-attempt.spec.ts` — Submit answers (student write)
1. Login as `TEST_USER_EMAIL`, open a known published quiz, answer all questions,
   submit → assert score display + results screen.
2. Validation: cannot submit before answering all questions (if enforced).

## 5. Shared support additions

- `playwright/support/fixtures/sample.pdf` — small binary fixture for upload tests.
- `playwright/support/helpers/cleanup.ts` — `cleanupE2EEntities(serviceRoleClient)`
  deleting `[E2E-`-tagged rows (quizzes, questions, documents) + storage objects.
- `playwright/support/fixtures.ts` — extend with `crudWriteEnabled` flag +
  `serviceRole` fixture (from `SUPABASE_SERVICE_ROLE_KEY`).
- `quiz-factory.ts` — add `buildQuizViaUI(page, overrides)` that drives the create form
  and returns the created quiz id, used across quiz tests.

## 6. Run modes

| Mode | Env | Suites run |
|---|---|---|
| **Default (read-only, green baseline)** | none extra | all current specs (168) |
| **Auth** | `TEST_USER_*`, `TEST_ADMIN_*` | + gated read tests |
| **Write (CRUD)** | `TEST_RUN_CRUD_WRITE=1` + `SUPABASE_SERVICE_ROLE_KEY` | + `*-crud.spec.ts`, `signup.spec.ts` |

`npm run test:e2e` → default. `TEST_RUN_CRUD_WRITE=1 npm run test:e2e` → adds write suites.

## 7. Out of scope (v1)
- Bulk operations, real-time collab, performance/load, visual regression, a11y audit.
- User profile edit, password reset flow (can follow).
- Map-drawing page upload (admin-only, separate concern).

## 8. Risks / decisions needed from owner
1. **Target DB:** live dev Supabase (with cleanup) vs disposable local Supabase?
2. **Service-role key:** OK to require `SUPABASE_SERVICE_ROLE_KEY` for teardown?
3. **Test data residue:** acceptable risk if a test crashes before cleanup, or enforce
   the `afterAll` safety-net as a hard gate?
4. **Signup tests** create real auth users — OK against dev Supabase, or skip in CI?
