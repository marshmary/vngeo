/**
 * Quiz Helpers for E2E Tests
 *
 * Utilities for quiz-related test operations including
 * taking quizzes, navigating questions, and submitting answers.
 */

import type { Page } from '@playwright/test';
import type { Quiz, QuizQuestion } from '../factories/quiz-factory';

/**
 * Navigate to quizzes list page and wait for load.
 */
export async function goToQuizzes(page: Page): Promise<void> {
  await page.goto('/quizzes');
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to a specific quiz page.
 */
export async function goToQuiz(page: Page, quizId: string): Promise<void> {
  await page.goto(`/quiz/${quizId}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Start a quiz by clicking the start button.
 */
export async function startQuiz(page: Page): Promise<void> {
  const startButton = page.getByTestId('quiz-start-button');
  await startButton.click();
  await page.waitForTimeout(500);
}

/**
 * Select an answer option for the current question.
 */
export async function selectAnswer(page: Page, optionIndex: number): Promise<void> {
  const options = page.getByTestId('quiz-option');
  const option = options.nth(optionIndex);
  await option.click();
}

/**
 * Navigate to next question.
 */
export async function goToNextQuestion(page: Page): Promise<void> {
  const nextButton = page.getByTestId('next-question-button');
  if (await nextButton.count() > 0) {
    await nextButton.click();
    await page.waitForTimeout(500);
  }
}

/**
 * Navigate to previous question.
 */
export async function goToPreviousQuestion(page: Page): Promise<void> {
  const prevButton = page.getByTestId('previous-question-button');
  if (await prevButton.count() > 0) {
    await prevButton.click();
    await page.waitForTimeout(500);
  }
}

/**
 * Submit the quiz.
 */
export async function submitQuiz(page: Page): Promise<void> {
  const submitButton = page.getByTestId('submit-quiz-button');
  await submitButton.click();
  await page.waitForTimeout(1000); // Wait for results to load
}

/**
 * Get current question index.
 */
export async function getCurrentQuestionIndex(page: Page): Promise<number> {
  const currentIndex = page.getByTestId('current-question-index');
  const text = await currentIndex.textContent();
  return text ? parseInt(text.trim()) : 1;
}

/**
 * Get total number of questions.
 */
export async function getTotalQuestions(page: Page): Promise<number> {
  const totalQuestions = page.getByTestId('total-questions');
  const text = await totalQuestions.textContent();
  return text ? parseInt(text.trim()) : 0;
}

/**
 * Get quiz score from results page.
 */
export async function getQuizScore(page: Page): Promise<number | null> {
  const scoreDisplay = page.getByTestId('score-display');
  if (await scoreDisplay.count() === 0) {
    return null;
  }

  const text = await scoreDisplay.textContent();
  const match = text?.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

/**
 * Filter quizzes by zone.
 */
export async function filterByZone(page: Page, zoneId: string): Promise<void> {
  const zoneFilter = page.getByTestId('zone-filter');
  await zoneFilter.click();

  const zoneOption = page.getByTestId(`zone-option-${zoneId}`);
  await zoneOption.click();
  await page.waitForTimeout(500);
}

/**
 * Search quizzes by keyword.
 */
export async function searchQuizzes(page: Page, keyword: string): Promise<void> {
  const searchInput = page.getByTestId('quiz-search-input');
  await searchInput.fill(keyword);
  await page.waitForTimeout(500); // Wait for debounce
}

/**
 * Count visible quiz cards.
 */
export async function countQuizCards(page: Page): Promise<number> {
  const cards = page.getByTestId('quiz-card');
  return await cards.count();
}

/**
 * Click on first quiz card to navigate to quiz.
 */
export async function clickFirstQuiz(page: Page): Promise<void> {
  const firstCard = page.getByTestId('quiz-card').first();
  await firstCard.click();
  await page.waitForTimeout(500);
}

/**
 * Check if quiz results are visible.
 */
export async function areResultsVisible(page: Page): Promise<boolean> {
  const results = page.getByTestId('quiz-results');
  return await results.count() > 0 && await results.first().isVisible();
}

/**
 * Get quiz progress percentage.
 */
export async function getQuizProgress(page: Page): Promise<number> {
  const progressBar = page.getByTestId('quiz-progress');
  if (await progressBar.count() === 0) {
    return 0;
  }

  // This would depend on the actual progress bar implementation
  // Could check aria-valuenow or width style
  const ariaValue = await progressBar.first().getAttribute('aria-valuenow');
  return ariaValue ? parseInt(ariaValue) : 0;
}

/**
 * Check if an option is selected.
 */
export async function isOptionSelected(page: Page, optionIndex: number): Promise<boolean> {
  const options = page.getByTestId('quiz-option');
  const option = options.nth(optionIndex);
  const className = await option.getAttribute('class');
  return className?.includes('selected') || false;
}

/**
 * Check if multiple answers are allowed for current question.
 */
export async function allowsMultipleAnswers(page: Page): Promise<boolean> {
  const multipleIndicator = page.getByTestId('multiple-answers-indicator');
  return await multipleIndicator.count() > 0;
}

/**
 * Get explanation text for current question.
 */
export async function getExplanation(page: Page): Promise<string | null> {
  const explanation = page.getByTestId('explanation-text');
  if (await explanation.count() === 0) {
    return null;
  }

  return await explanation.first().textContent() || null;
}

/**
 * Navigate to quiz edit page (admin only).
 */
export async function goToQuizEdit(page: Page, quizId: string): Promise<void> {
  await page.goto(`/admin/quiz/${quizId}/edit`);
  await page.waitForLoadState('networkidle');
}

/**
 * Click edit button on a quiz in admin panel.
 */
export async function clickEditQuiz(page: Page, quizId: string): Promise<void> {
  const editButton = page.getByTestId(`edit-quiz-${quizId}`);
  await editButton.click();
  await page.waitForTimeout(500);
}

/**
 * Click delete button on a quiz in admin panel.
 */
export async function clickDeleteQuiz(page: Page, quizId: string): Promise<void> {
  const deleteButton = page.getByTestId(`delete-quiz-${quizId}`);
  await deleteButton.click();
  await page.waitForTimeout(500);
}

/**
 * Confirm quiz deletion (if confirmation modal appears).
 */
export async function confirmDeleteQuiz(page: Page): Promise<void> {
  const confirmButton = page.locator('button').filter({ hasText: /confirm|delete|delete|yes|xóa|có/i });
  if (await confirmButton.count() > 0) {
    await confirmButton.first().click();
  }
}
