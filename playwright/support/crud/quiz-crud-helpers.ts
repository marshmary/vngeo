// =============================================================================
// quiz-crud-helpers.ts — private UI-drive helpers for the Quiz CRUD spec
// (CRUD_TEST_SPEC §4.1).
// =============================================================================
// OWNERSHIP: this file is private to `quiz-crud.spec.ts`. It contains the
// UI-drive helpers that create a quiz through the real admin UI, add/edit/save
// questions, save the whole quiz, delete it from the list, plus a few shared
// locators and the per-run title tagger.
//
// Why drive the UI instead of seeding via the service-role client:
//   The whole point of the CRUD suite (CRUD_TEST_SPEC §1) is to prove the
//   *write path through the real UI* against a real Supabase backend. Seeding
//   via the service-role client would bypass the form, the validation, the
//   QuizService mapping, and RLS — exactly the regressions we want to catch.
//
// data-testid anchors used here live in:
//   - src/components/admin/QuizManager.tsx  (create form + list rows + modals)
//   - src/pages/QuizEditPage.tsx            (metadata form + question editor)
// =============================================================================

import { expect, type Page, type Locator } from '@playwright/test';

// -----------------------------------------------------------------------------
// data-testid anchors (single source of truth — keeps the spec readable and
// makes renames a one-line change). Exported so the spec asserts against the
// same strings the helpers drive.
// ----------------------------------------------------------------------------

// QuizManager — create form
export const CREATE_QUIZ_BUTTON = 'create-quiz-button';
export const NEW_QUIZ_TITLE_INPUT = 'new-quiz-title-input';
export const NEW_QUIZ_DESCRIPTION_INPUT = 'new-quiz-description-input';
export const NEW_QUIZ_DIFFICULTY_SELECT = 'new-quiz-difficulty-select';
export const SUBMIT_CREATE_QUIZ_BUTTON = 'submit-create-quiz-button';
export const CANCEL_CREATE_QUIZ_BUTTON = 'cancel-create-quiz-button';
export const CONFIRM_CREATE_BUTTON = 'confirm-create-button';

// QuizManager — list rows + delete modal
export const CONFIRM_DELETE_BUTTON = 'confirm-delete-button';

// QuizEditPage — metadata form + quiz-level save
export const QUIZ_TITLE_INPUT = 'quiz-title-input';
export const QUIZ_DESCRIPTION_INPUT = 'quiz-description-input';
export const QUIZ_DIFFICULTY_SELECT = 'quiz-difficulty-select';
export const QUIZ_STATUS_SELECT = 'quiz-status-select';
export const SAVE_QUIZ_BUTTON = 'save-quiz-button';

// QuizEditPage — draft-restore prompt
export const DRAFT_PROMPT = 'draft-prompt';
export const LOAD_DRAFT_BUTTON = 'load-draft-button';
export const DISCARD_DRAFT_BUTTON = 'discard-draft-button';

// Indexed testid builders (question/option positions are 0-based array indices).
export const QUIZ_ROW = (id: string) => `quiz-row-${id}`;
export const QUIZ_DELETE_BUTTON = (id: string) => `quiz-delete-button-${id}`;
export const quizStatusTestId = (id: string) => `quiz-status-${id}`;

export const QUESTION_ROW = (index: number) => `question-row-${index}`;
export const QUESTION_TEXT_INPUT = (index: number) => `question-text-input-${index}`;
export const OPTION_TEXT_INPUT = (index: number, opt: number) =>
  `option-text-input-${index}-${opt}`;
export const CORRECT_OPTION_RADIO = (index: number, opt: number) =>
  `correct-option-radio-${index}-${opt}`;
export const ADD_QUESTION_BUTTON = 'add-question-button';
export const ADD_OPTION_BUTTON = (index: number) => `add-option-button-${index}`;
export const DELETE_OPTION_BUTTON = (index: number, opt: number) =>
  `delete-option-button-${index}-${opt}`;
export const SAVE_QUESTION_BUTTON = (index: number) => `save-question-button-${index}`;
export const EDIT_QUESTION_BUTTON = (index: number) => `edit-question-button-${index}`;
export const CANCEL_QUESTION_EDIT_BUTTON = (index: number) =>
  `cancel-question-edit-button-${index}`;
export const MOVE_QUESTION_UP_BUTTON = (index: number) =>
  `move-question-up-button-${index}`;
export const MOVE_QUESTION_DOWN_BUTTON = (index: number) =>
  `move-question-down-button-${index}`;
export const REMOVE_QUESTION_BUTTON = (index: number) =>
  `remove-question-button-${index}`;

/** localStorage draft key used by QuizDraftService (mirror src/services/quizService.ts). */
export const draftKey = (quizId: string) => `quiz_draft_${quizId}`;

// -----------------------------------------------------------------------------
// Per-run title tagger
// ----------------------------------------------------------------------------
// Every created quiz title starts with `[E2E-quiz-<token>]` so the service-role
// teardown in afterAll (cleanupE2EEntities — deletes any title LIKE '[E2E-%')
// can find and remove them. The token is high-entropy so parallel workers never
// collide on a title (which would also break the per-row text assertions).

let titleCounter = 0;
const runToken = (): string =>
  `${Date.now()}-${process.pid ?? 'np'}-${titleCounter++}`;

/**
 * Build an E2E-tagged quiz title unique to this run.
 * @param label - human-readable hint appended after the tag for log readability.
 */
export function makeQuizTitle(label: string): string {
  return `[E2E-quiz-${runToken()}] ${label}`;
}

// -----------------------------------------------------------------------------
// Shared locators
// ----------------------------------------------------------------------------

/** Locator for the quiz-row in the manager list whose text contains `title`. */
export function quizRowByTitle(page: Page, title: string): Locator {
  return page.locator('[data-testid^="quiz-row-"]').filter({ hasText: title });
}

/** Locator over every rendered question row on the edit page (view OR edit mode). */
export function questionRows(page: Page): Locator {
  return page.locator('[data-testid^="question-row-"]');
}

// -----------------------------------------------------------------------------
// Navigation helpers
// ----------------------------------------------------------------------------

/**
 * Open the admin Quiz Manager (the list + create form). `loginAdmin` must have
 * already established the admin session. Uses `?section=quiz` (read by
 * AdminPage on mount) so we don't depend on locale-sensitive tab labels.
 */
export async function openQuizManager(page: Page): Promise<void> {
  await page.goto('/admin?section=quiz');
  // Wait for the manager to mount (create button is always present once loaded).
  await page.getByTestId(CREATE_QUIZ_BUTTON).waitFor({ state: 'visible', timeout: 15000 });
}

/**
 * Open the quiz editor for a specific quiz id. Asserts the editor (save button)
 * is mounted before returning. If a leftover draft-restore prompt is present it
 * is discarded so it cannot cover the form (each test runs in a fresh context,
 * so this is purely defensive).
 */
export async function openQuizEditor(page: Page, quizId: string): Promise<void> {
  await page.goto(`/admin/quiz/${quizId}/edit`);
  // Dismiss a draft-restore prompt defensively (should not happen in a fresh
  // context, but a prompt would overlay the form and break assertions).
  const discard = page.getByTestId(DISCARD_DRAFT_BUTTON);
  if (await discard.isVisible({ timeout: 1000 }).catch(() => false)) {
    await discard.click();
  }
  await page.getByTestId(SAVE_QUIZ_BUTTON).waitFor({ state: 'visible', timeout: 15000 });
}

// -----------------------------------------------------------------------------
// Create flow
// ----------------------------------------------------------------------------

export interface CreateQuizOptions {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CreatedQuiz {
  /** The new quiz's DB id, parsed from the editor URL. */
  quizId: string;
  title: string;
}

/**
 * Drive the "Create Quiz" form end-to-end:
 *   open manager -> create button -> fill title/description/difficulty ->
 *   submit -> confirm modal -> (QuizService.createQuiz inserts the row) ->
 *   the app navigates to /admin/quiz/<id>/edit.
 *
 * Returns the created quiz id (parsed from the resulting URL). The quiz exists
 * in the DB after this returns (createQuiz inserts immediately); saving
 * questions/metadata is a separate step via {@link saveQuizViaUI}.
 */
export async function buildQuizViaUI(
  page: Page,
  opts: CreateQuizOptions
): Promise<CreatedQuiz> {
  await openQuizManager(page);

  await page.getByTestId(CREATE_QUIZ_BUTTON).click();
  await page.getByTestId(NEW_QUIZ_TITLE_INPUT).fill(opts.title);
  await page.getByTestId(NEW_QUIZ_DESCRIPTION_INPUT).fill(opts.description);
  await page.getByTestId(NEW_QUIZ_DIFFICULTY_SELECT).selectOption(opts.difficulty);

  // The form's "Create" button only opens a confirmation modal.
  await page.getByTestId(SUBMIT_CREATE_QUIZ_BUTTON).click();
  // The confirmation modal's confirm button performs the actual insert.
  await page.getByTestId(CONFIRM_CREATE_BUTTON).click();

  // On success the app routes to the editor for the new quiz.
  await page.waitForURL(/\/admin\/quiz\/[^/]+\/edit$/, { timeout: 15000 });

  const match = page.url().match(/\/admin\/quiz\/([^/]+)\/edit$/);
  if (!match) {
    throw new Error(`buildQuizViaUI: could not parse quizId from ${page.url()}`);
  }
  return { quizId: match[1], title: opts.title };
}

// -----------------------------------------------------------------------------
// Question editor flow
// ----------------------------------------------------------------------------

export interface QuestionInput {
  text: string;
  /** Option texts — must have at least 2 (the UI guards on this). */
  options: string[];
  /** Index into `options` of the correct answer. */
  correctIndex: number;
}

/**
 * Add a question at `index` (the position the new question will occupy in the
 * list) and commit it via the per-question Save button.
 *
 * Clicking "Add Question" appends a question and immediately enters edit mode
 * for it, so the indexed inputs (question-text-input-<index>, etc.) become
 * available. We fill them, mark the correct option, and save the question.
 */
export async function addQuestionViaUI(
  page: Page,
  index: number,
  q: QuestionInput
): Promise<void> {
  await page.getByTestId(ADD_QUESTION_BUTTON).click();

  await page.getByTestId(QUESTION_TEXT_INPUT(index)).fill(q.text);
  for (let i = 0; i < q.options.length; i++) {
    await page.getByTestId(OPTION_TEXT_INPUT(index, i)).fill(q.options[i]);
  }
  await page.getByTestId(CORRECT_OPTION_RADIO(index, q.correctIndex)).check();

  // Web-first: the save-question button is disabled until the question is
  // valid (text + >=2 options + a correct option); auto-retries until enabled.
  await expect(page.getByTestId(SAVE_QUESTION_BUTTON(index))).toBeEnabled({
    timeout: 10000,
  });
  await page.getByTestId(SAVE_QUESTION_BUTTON(index)).click();

  // After save, edit mode exits -> the question-row renders in view mode.
  await expect(page.getByTestId(QUESTION_ROW(index))).toContainText(q.text);
}

/**
 * Open an existing question at `index` for editing, replace its text/options/
 * correct answer, and commit via the per-question Save button.
 */
export async function editQuestionViaUI(
  page: Page,
  index: number,
  q: QuestionInput
): Promise<void> {
  await page.getByTestId(EDIT_QUESTION_BUTTON(index)).click();

  await page.getByTestId(QUESTION_TEXT_INPUT(index)).fill(q.text);
  for (let i = 0; i < q.options.length; i++) {
    await page.getByTestId(OPTION_TEXT_INPUT(index, i)).fill(q.options[i]);
  }
  // Single-answer mode (the default) unchecks the other options on check.
  await page.getByTestId(CORRECT_OPTION_RADIO(index, q.correctIndex)).check();

  await expect(page.getByTestId(SAVE_QUESTION_BUTTON(index))).toBeEnabled({
    timeout: 10000,
  });
  await page.getByTestId(SAVE_QUESTION_BUTTON(index)).click();

  await expect(page.getByTestId(QUESTION_ROW(index))).toContainText(q.text);
}

/**
 * Click the quiz-level Save button and wait for the success round-trip.
 *
 * handleSaveQuiz fires `window.alert('Quiz saved successfully!')` on success
 * and then routes to /admin?section=quiz. We register a one-shot dialog
 * handler so the alert never blocks the navigation, then wait for the manager
 * URL to confirm persistence completed.
 */
export async function saveQuizViaUI(page: Page): Promise<void> {
  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });

  // The quiz-level save button is disabled when the title is empty or there
  // are no questions; callers ensure both before invoking.
  await expect(page.getByTestId(SAVE_QUIZ_BUTTON)).toBeEnabled({ timeout: 10000 });
  await page.getByTestId(SAVE_QUIZ_BUTTON).click();

  // On success the app routes back to the quiz manager.
  await page.waitForURL(/\/admin\?section=quiz$/, { timeout: 20000 });
}

// -----------------------------------------------------------------------------
// Delete flow
// ----------------------------------------------------------------------------

/**
 * Delete a quiz from the manager list via the UI and assert its row disappears.
 * The caller's data is fully removed by this round-trip; the suite's afterAll
 * service-role sweep is only a safety net for tests that crashed before this.
 */
export async function deleteQuizFromList(
  page: Page,
  quizId: string
): Promise<void> {
  await openQuizManager(page);

  await page.getByTestId(QUIZ_DELETE_BUTTON(quizId)).click();
  await page.getByTestId(CONFIRM_DELETE_BUTTON).click();

  // The row is removed from React state on success; web-first retry to 0.
  await expect(page.getByTestId(QUIZ_ROW(quizId))).toHaveCount(0, {
    timeout: 15000,
  });
}
