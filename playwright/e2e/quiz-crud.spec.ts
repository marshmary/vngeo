// =============================================================================
// quiz-crud.spec.ts — Quiz create / edit / delete (CRUD_TEST_SPEC §4.1)
// =============================================================================
// End-to-end coverage of the admin quiz *write path* through the real UI
// against a real (local) Supabase backend:
//   1. create quiz (+ 1 question / 2 options / 1 correct) -> listed
//   2. edit metadata (title/description/difficulty/status) -> persisted
//   3. question CRUD (add/edit/remove/reorder) -> persisted
//   4. delete quiz -> row gone + /quiz/<id> shows not-found
//   5. drafts & auto-save -> localStorage draft + restore-on-reload
//   6. validation negatives (empty title, no correct option, <2 options guard)
//
// GATING (CRUD_TEST_SPEC §6): every test skips cleanly unless BOTH
// `TEST_RUN_CRUD_WRITE=1` and admin credentials are present. The suite is
// serial so its afterAll safety-net sweep can't race a sibling worker's
// in-flight quiz.
//
// TEARDOWN: each test creates AND deletes its own data (full round-trip). The
// afterAll service-role sweep (cleanupE2EEntities — deletes any title tagged
// `[E2E-%`) is a hard-gate safety net for tests that crash mid-flow.
//
// STATUS: pending validation against local Supabase (the suite is authored +
// statically type-checked only; it is not executed in the authoring env).
// =============================================================================

import { test, expect, createServiceRoleClient } from '../support/fixtures';
import { loginAdmin } from '../support/helpers/auth-helpers';
import { cleanupE2EEntities } from '../support/helpers/cleanup';
import {
  // UI-drive helpers
  buildQuizViaUI,
  addQuestionViaUI,
  editQuestionViaUI,
  saveQuizViaUI,
  deleteQuizFromList,
  openQuizEditor,
  quizRowByTitle,
  questionRows,
  makeQuizTitle,
  draftKey,
  // testid anchors (single source of truth in quiz-crud-helpers.ts)
  CREATE_QUIZ_BUTTON,
  NEW_QUIZ_DESCRIPTION_INPUT,
  SUBMIT_CREATE_QUIZ_BUTTON,
  CANCEL_CREATE_QUIZ_BUTTON,
  QUIZ_TITLE_INPUT,
  QUIZ_DESCRIPTION_INPUT,
  QUIZ_DIFFICULTY_SELECT,
  QUIZ_STATUS_SELECT,
  SAVE_QUIZ_BUTTON,
  ADD_QUESTION_BUTTON,
  QUESTION_TEXT_INPUT,
  OPTION_TEXT_INPUT,
  CORRECT_OPTION_RADIO,
  DELETE_OPTION_BUTTON,
  SAVE_QUESTION_BUTTON,
  REMOVE_QUESTION_BUTTON,
  MOVE_QUESTION_UP_BUTTON,
  quizStatusTestId,
  DRAFT_PROMPT,
  LOAD_DRAFT_BUTTON,
} from '../support/crud/quiz-crud-helpers';

// ---------------------------------------------------------------------------
// Credential gate — admin login is required for every quiz write. Mirrors the
// hasAdminCredentials() pattern used across the admin/quiz-edit specs.
// ---------------------------------------------------------------------------
const hasAdminCredentials = (): boolean =>
  !!process.env.TEST_ADMIN_EMAIL && !!process.env.TEST_ADMIN_PASSWORD;

const adminCredentials = (): { email: string; password: string } => ({
  email: process.env.TEST_ADMIN_EMAIL!,
  password: process.env.TEST_ADMIN_PASSWORD!,
});

// Serial so this file's afterAll sweep cannot race a sibling worker's quiz.
test.describe.serial('Quiz CRUD (write-path)', () => {
  test.beforeEach(async ({ page, crudWriteEnabled }) => {
    test.skip(
      !crudWriteEnabled || !hasAdminCredentials(),
      'CRUD write tests disabled (set TEST_RUN_CRUD_WRITE=1 and TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD)'
    );
    await loginAdmin(page, adminCredentials());
  });

  // Safety net: hard-delete any [E2E- tagged quizzes left by a test that died
  // before its own delete. Questions/options cascade. No-op when nothing
  // matches; never throws.
  test.afterAll(async () => {
    const client = createServiceRoleClient();
    if (!client) return; // teardown disabled (no service-role key) — nothing to do.
    const result = await cleanupE2EEntities(client);
    if (result.errors.length > 0) {
      // eslint-disable-next-line no-console
      console.log('[quiz-crud] afterAll cleanup reported errors:', result.errors);
    }
  });

  // ---------------------------------------------------------------- 1. create
  test('creates a quiz with one question and lists it', async ({ page }) => {
    const title = makeQuizTitle('Smoke Quiz');
    const { quizId } = await buildQuizViaUI(page, {
      title,
      description: '[E2E] smoke quiz description',
      difficulty: 'easy',
    });

    // One question, two options, option 0 correct.
    await addQuestionViaUI(page, 0, {
      text: '[E2E] What is the capital of Vietnam?',
      options: ['Hanoi', 'Ho Chi Minh City'],
      correctIndex: 0,
    });

    await saveQuizViaUI(page);

    // Listed in the manager with the E2E title and default draft status
    // (createQuiz inserts status='draft'). Status badge text is locale-aware,
    // so match both Vietnamese and English labels.
    await expect(quizRowByTitle(page, title)).toBeVisible();
    await expect(page.getByTestId(quizStatusTestId(quizId))).toHaveText(/nháp|draft/i);

    // Full round-trip cleanup: delete proves the delete path too.
    await deleteQuizFromList(page, quizId);
  });

  // ---------------------------------------------------------------- 2. metadata
  test('persists edited metadata (title/description/difficulty/status)', async ({ page }) => {
    const title = makeQuizTitle('Edit Meta');
    const { quizId } = await buildQuizViaUI(page, {
      title,
      description: '[E2E] original description',
      difficulty: 'easy',
    });

    // buildQuizViaUI lands on the editor for the new quiz.
    const updatedTitle = makeQuizTitle('Edit Meta UPDATED');
    await page.getByTestId(QUIZ_TITLE_INPUT).fill(updatedTitle);
    await page.getByTestId(QUIZ_DESCRIPTION_INPUT).fill('[E2E] updated description');
    await page.getByTestId(QUIZ_DIFFICULTY_SELECT).selectOption('hard');
    await page.getByTestId(QUIZ_STATUS_SELECT).selectOption('published');

    await saveQuizViaUI(page);

    // Reopen and assert the persisted values. Select assertions are value-
    // based (option value, not visible label) so they are locale-independent.
    await openQuizEditor(page, quizId);
    await expect(page.getByTestId(QUIZ_TITLE_INPUT)).toHaveValue(updatedTitle);
    await expect(page.getByTestId(QUIZ_DESCRIPTION_INPUT)).toHaveValue('[E2E] updated description');
    await expect(page.getByTestId(QUIZ_DIFFICULTY_SELECT)).toHaveValue('hard');
    await expect(page.getByTestId(QUIZ_STATUS_SELECT)).toHaveValue('published');

    await deleteQuizFromList(page, quizId);
  });

  // ---------------------------------------------------------------- 3. questions
  test('adds, edits, removes, and reorders questions', async ({ page }) => {
    const title = makeQuizTitle('Question CRUD');
    const { quizId } = await buildQuizViaUI(page, {
      title,
      description: '[E2E] question crud',
      difficulty: 'medium',
    });

    // Three questions.
    await addQuestionViaUI(page, 0, {
      text: '[E2E] Q1',
      options: ['Q1-A', 'Q1-B'],
      correctIndex: 0,
    });
    await addQuestionViaUI(page, 1, {
      text: '[E2E] Q2',
      options: ['Q2-A', 'Q2-B'],
      correctIndex: 1,
    });
    await addQuestionViaUI(page, 2, {
      text: '[E2E] Q3',
      options: ['Q3-A', 'Q3-B'],
      correctIndex: 0,
    });

    // Edit question at index 1: replace text + options + the correct answer.
    await editQuestionViaUI(page, 1, {
      text: '[E2E] Q2 EDITED',
      options: ['Q2-A-ed', 'Q2-B-ed'],
      correctIndex: 0,
    });

    // Remove question at index 0 (Q1). The array reflows to
    // [Q2edited, Q3] at indices [0, 1].
    await page.getByTestId(REMOVE_QUESTION_BUTTON(0)).click();
    await expect(questionRows(page)).toHaveCount(2);

    // Reorder: move the last question (index 1 = Q3) up to position 0.
    await page.getByTestId(MOVE_QUESTION_UP_BUTTON(1)).click();

    await saveQuizViaUI(page);

    // Reopen and verify the persisted set AND order (questions load sorted by
    // order_index ASC, which handleMoveQuestion rewrites).
    await openQuizEditor(page, quizId);
    const rows = questionRows(page);
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText('[E2E] Q3');
    await expect(rows.nth(1)).toContainText('[E2E] Q2 EDITED');

    await deleteQuizFromList(page, quizId);
  });

  // ---------------------------------------------------------------- 4. delete
  test('deletes a quiz: row gone and /quiz/<id> shows not-found', async ({ page }) => {
    const title = makeQuizTitle('Delete Me');
    const { quizId } = await buildQuizViaUI(page, {
      title,
      description: '[E2E] delete target',
      difficulty: 'easy',
    });

    // Delete via the manager list (helper asserts the row disappears).
    await deleteQuizFromList(page, quizId);

    // The public quiz page can no longer resolve the row -> QuizService throws
    // -> QuizPage renders its error card. Match both locales.
    await page.goto(`/quiz/${quizId}`);
    await expect(
      page.getByText(/Failed to load quiz|Không thể tải bài kiểm tra/)
    ).toBeVisible();
    // The success-path UI must NOT render.
    await expect(page.getByTestId('quiz-page')).toHaveCount(0);
  });

  // ---------------------------------------------------------------- 5. drafts
  test('auto-saves an unsaved draft to localStorage and restores it on reload', async ({ page }) => {
    const title = makeQuizTitle('Draft');
    const { quizId } = await buildQuizViaUI(page, {
      title,
      description: '[E2E] draft autosave',
      difficulty: 'easy',
    });

    // Make an unsaved edit -> sets hasUnsavedChanges -> QuizDraftService writes
    // a debounced (2s) draft to localStorage.
    const draftTitle = makeQuizTitle('Draft UNSAVED');
    await page.getByTestId(QUIZ_TITLE_INPUT).fill(draftTitle);

    // Auto-save debounce is 2s (QuizDraftService.AUTO_SAVE_DEBOUNCE); give it
    // room to flush, then confirm a draft was persisted for this quiz.
    await page.waitForTimeout(2500);
    const key = draftKey(quizId);
    const hasDraft = await page.evaluate(
      (k) => localStorage.getItem(k) !== null,
      key
    );
    expect(hasDraft).toBeTruthy();

    // Reload: the draft-restore prompt should appear.
    await page.reload();
    await expect(page.getByTestId(DRAFT_PROMPT)).toBeVisible();

    // Restore the draft; the unsaved title should reappear in the input.
    await page.getByTestId(LOAD_DRAFT_BUTTON).click();
    await expect(page.getByTestId(QUIZ_TITLE_INPUT)).toHaveValue(draftTitle);

    await deleteQuizFromList(page, quizId);
  });

  // ---------------------------------------------------------------- 6. validation
  test('blocks invalid input: empty title, no correct option, <2 options guard', async ({ page }) => {
    // (a) Create form: an empty title keeps the submit button disabled (the
    //     button is disabled unless both title and description are non-empty).
    await page.goto('/admin?section=quiz');
    await page.getByTestId(CREATE_QUIZ_BUTTON).click();
    await page.getByTestId(NEW_QUIZ_DESCRIPTION_INPUT).fill('[E2E] no title');
    await expect(page.getByTestId(SUBMIT_CREATE_QUIZ_BUTTON)).toBeDisabled();
    // Cancel so no quiz is created from this form.
    await page.getByTestId(CANCEL_CREATE_QUIZ_BUTTON).click();

    // (b) Editor validation. Build a quiz and add one VALID question so the
    //     quiz-level save's "questions.length === 0" guard is satisfied.
    const title = makeQuizTitle('Validation');
    const { quizId } = await buildQuizViaUI(page, {
      title,
      description: '[E2E] validation',
      difficulty: 'easy',
    });
    await addQuestionViaUI(page, 0, {
      text: '[E2E] Valid Q',
      options: ['A', 'B'],
      correctIndex: 0,
    });

    // Empty title disables the quiz-level save.
    await page.getByTestId(QUIZ_TITLE_INPUT).fill('');
    await expect(page.getByTestId(SAVE_QUIZ_BUTTON)).toBeDisabled();
    await page.getByTestId(QUIZ_TITLE_INPUT).fill(title);
    await expect(page.getByTestId(SAVE_QUIZ_BUTTON)).toBeEnabled();

    // Add a second question WITHOUT a correct option -> the per-question save
    // is disabled (its guard requires text + >=2 options + a correct option).
    await page.getByTestId(ADD_QUESTION_BUTTON).click();
    await page.getByTestId(QUESTION_TEXT_INPUT(1)).fill('[E2E] No correct Q');
    await page.getByTestId(OPTION_TEXT_INPUT(1, 0)).fill('A1');
    await page.getByTestId(OPTION_TEXT_INPUT(1, 1)).fill('A2');
    await expect(page.getByTestId(SAVE_QUESTION_BUTTON(1))).toBeDisabled();
    // Marking a correct option enables it.
    await page.getByTestId(CORRECT_OPTION_RADIO(1, 0)).check();
    await expect(page.getByTestId(SAVE_QUESTION_BUTTON(1))).toBeEnabled();

    // <2 options guard: with exactly two options the delete-option buttons are
    // disabled (handleDeleteOption is disabled at currentOptions.length <= 2).
    await expect(page.getByTestId(DELETE_OPTION_BUTTON(1, 0))).toBeDisabled();
    await expect(page.getByTestId(DELETE_OPTION_BUTTON(1, 1))).toBeDisabled();

    await deleteQuizFromList(page, quizId);
  });
});
