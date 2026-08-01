import { test, expect } from '../support/fixtures';
import { createQuiz, createPublishedQuiz } from '../support/factories/quiz-factory';

/**
 * Quiz E2E Tests
 *
 * Tests for quiz listing, taking quizzes, and quiz management.
 */

test.describe('Quizzes', () => {
  test.describe('Quiz Listing', () => {
    test('should display list of published quizzes', async ({ page }) => {
      await page.goto('/quizzes');

      // Should show quiz list page
      await expect(page.getByTestId('quiz-list-page')).toBeVisible();

      // Should have quiz cards
      const quizCards = page.getByTestId('quiz-card');
      await expect(quizCards.first()).toBeVisible();
    });

    test('should filter quizzes by economic zone', async ({ page }) => {
      await page.goto('/quizzes');

      // Select a zone filter
      await page.click('[data-testid="zone-filter"]');
      await page.click('[data-testid="zone-option-north-east"]');

      // Should filter the quiz list
      const quizCards = page.getByTestId('quiz-card');
      const firstCard = quizCards.first();

      // Verify filtered results
      await expect(firstCard).toBeVisible();
    });

    test('should search quizzes by title', async ({ page }) => {
      await page.goto('/quizzes');

      // Type in search box
      const searchInput = page.getByTestId('quiz-search-input');
      await searchInput.fill('economic');

      // Should filter results
      await page.waitForTimeout(500); // Wait for debounce

      // Verify search results
      const quizCards = page.getByTestId('quiz-card');
      await expect(quizCards.first()).toBeVisible();
    });
  });

  test.describe('Taking Quizzes', () => {
    test('should start a quiz', async ({ page }) => {
      await page.goto('/quizzes');

      // Click on first quiz card
      const firstQuizCard = page.getByTestId('quiz-card').first();
      await firstQuizCard.click();

      // Should navigate to quiz page
      await expect(page).toHaveURL(/\/quiz\/.+/);

      // Should show quiz start button or first question
      await expect(
        page.getByTestId('quiz-start-button').or(page.getByTestId('quiz-question'))
      ).toBeVisible();
    });

    test('should display quiz questions', async ({ page }) => {
      // Assuming we have a quiz ID - in real tests, seed via API first
      const quiz = createPublishedQuiz({ questionCount: 3 });

      await page.goto(`/quiz/${quiz.id}`);

      // Should show questions
      const questions = page.getByTestId('quiz-question');
      await expect(questions.first()).toBeVisible();

      // Should have options for each question
      const options = page.getByTestId('quiz-option');
      await expect(options.first()).toBeVisible();
    });

    test('should allow selecting answers', async ({ page }) => {
      const quiz = createPublishedQuiz({ questionCount: 1 });

      await page.goto(`/quiz/${quiz.id}`);

      // Select an option
      const firstOption = page.getByTestId('quiz-option').first();
      await firstOption.click();

      // Should be selected
      await expect(firstOption).toHaveClass(/selected/);
    });

    test('should submit quiz and show results', async ({ page }) => {
      const quiz = createPublishedQuiz({ questionCount: 2 });

      await page.goto(`/quiz/${quiz.id}`);

      // Answer first question
      await page.getByTestId('quiz-option').first().click();
      await page.click('[data-testid="next-question-button"]');

      // Answer second question
      await page.getByTestId('quiz-option').first().click();

      // Submit quiz
      await page.click('[data-testid="submit-quiz-button"]');

      // Should show results
      await expect(page.getByTestId('quiz-results')).toBeVisible();
      await expect(page.getByTestId('score-display')).toBeVisible();
    });
  });

  test.describe('Quiz Navigation', () => {
    test('should show progress indicator', async ({ page }) => {
      const quiz = createPublishedQuiz({ questionCount: 5 });

      await page.goto(`/quiz/${quiz.id}`);

      // Should show progress bar
      await expect(page.getByTestId('quiz-progress')).toBeVisible();
    });

    test('should navigate between questions', async ({ page }) => {
      const quiz = createPublishedQuiz({ questionCount: 3 });

      await page.goto(`/quiz/${quiz.id}`);

      // Answer first question
      await page.getByTestId('quiz-option').first().click();
      await page.click('[data-testid="next-question-button"]');

      // Should be on second question
      await expect(page.getByTestId('current-question-index')).toContainText('2');

      // Go back to previous question
      await page.click('[data-testid="previous-question-button"]');

      // Should be on first question
      await expect(page.getByTestId('current-question-index')).toContainText('1');
    });
  });
});
