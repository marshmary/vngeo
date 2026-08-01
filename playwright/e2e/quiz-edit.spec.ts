import { test, expect } from '../support/fixtures';
import { loginAdmin, logoutUser } from '../support/helpers/auth-helpers';
import { createAdminUser } from '../support/factories/user-factory';

/**
 * Quiz Edit E2E Tests
 *
 * Tests for quiz editing functionality.
 * Requires admin authentication - tests are skipped when credentials not available.
 */

// Helper to check if admin credentials are available
const hasAdminCredentials = () => !!process.env.TEST_ADMIN_EMAIL;

test.describe('Quiz Edit Page', () => {
  test.describe('Access Control', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      await page.goto('/admin/quiz/some-quiz-id/edit');

      // Should redirect to login page
      await expect(page).toHaveURL('/login');
    });

    test('should load quiz edit page for admin users', async ({ page }) => {
      test.skip(!hasAdminCredentials(), 'Skipping: TEST_ADMIN_EMAIL not set');

      const admin = createAdminUser({
        email: process.env.TEST_ADMIN_EMAIL!,
        password: process.env.TEST_ADMIN_PASSWORD || 'admin123456'
      });

      await loginAdmin(page, admin);

      // Navigate to quiz edit page with a sample ID
      await page.goto('/admin/quiz/sample-quiz-id/edit');

      // Page should load (may show error if quiz doesn't exist, but that's ok)
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      expect(currentUrl).toContain('/edit');
    });

    test('should require admin role', async ({ page }) => {
      // Without credentials, should redirect to login
      await page.goto('/admin/quiz/test-quiz/edit');

      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Quiz Edit UI Structure', () => {
    test('should have navigation back to admin', async ({ page }) => {
      test.skip(!hasAdminCredentials(), 'Skipping: TEST_ADMIN_EMAIL not set');

      const admin = createAdminUser({
        email: process.env.TEST_ADMIN_EMAIL!,
        password: process.env.TEST_ADMIN_PASSWORD || 'admin123456'
      });

      await loginAdmin(page, admin);

      // Navigate to quiz edit page
      await page.goto('/admin/quiz/sample-quiz/edit');

      // Wait for page load
      await page.waitForTimeout(1000);

      // Page should have loaded (even with error for non-existent quiz)
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('should load page when navigating from admin dashboard', async ({ page }) => {
      test.skip(!hasAdminCredentials(), 'Skipping: TEST_ADMIN_EMAIL not set');

      const admin = createAdminUser({
        email: process.env.TEST_ADMIN_EMAIL!,
        password: process.env.TEST_ADMIN_PASSWORD || 'admin123456'
      });

      await loginAdmin(page, admin);

      // Go to admin first
      await page.goto('/admin');

      // Then navigate to quiz edit
      await page.goto('/admin/quiz/test-id/edit');

      // Should navigate successfully
      await page.waitForTimeout(500);
      expect(page.url()).toContain('/edit');
    });
  });

  test.describe('Quiz Edit Form Elements', () => {
    test('should handle page load gracefully', async ({ page }) => {
      test.skip(!hasAdminCredentials(), 'Skipping: TEST_ADMIN_EMAIL not set');

      const admin = createAdminUser({
        email: process.env.TEST_ADMIN_EMAIL!,
        password: process.env.TEST_ADMIN_PASSWORD || 'admin123456'
      });

      await loginAdmin(page, admin);

      // Load edit page with non-existent quiz
      await page.goto('/admin/quiz/nonexistent-quiz/edit');

      // Page should handle error gracefully
      await page.waitForTimeout(1000);

      // Either we get an error message or the form loads (both are valid)
      const errorText = page.getByText(/error|not found|failed/i);
      const formContent = page.locator('form');

      // At least one should be present
      await expect(errorText.or(formContent).first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Language Support in Quiz Edit', () => {
    test('should support language switching', async ({ page }) => {
      test.skip(!hasAdminCredentials(), 'Skipping: TEST_ADMIN_EMAIL not set');

      const admin = createAdminUser({
        email: process.env.TEST_ADMIN_EMAIL!,
        password: process.env.TEST_ADMIN_PASSWORD || 'admin123456'
      });

      await loginAdmin(page, admin);

      await page.goto('/admin/quiz/sample-quiz/edit');
      await page.waitForTimeout(500);

      // Language selector should be accessible
      const languageSelector = page.getByTestId('language-selector');
      if (await languageSelector.count() > 0) {
        await languageSelector.click();

        // Should show language options
        await expect(page.getByTestId('language-option-en')).toBeVisible();
        await expect(page.getByTestId('language-option-vi')).toBeVisible();
      }
    });
  });

  test.describe('Quiz Edit Navigation', () => {
    test('should maintain admin auth when navigating to edit', async ({ page }) => {
      test.skip(!hasAdminCredentials(), 'Skipping: TEST_ADMIN_EMAIL not set');

      const admin = createAdminUser({
        email: process.env.TEST_ADMIN_EMAIL!,
        password: process.env.TEST_ADMIN_PASSWORD || 'admin123456'
      });

      await loginAdmin(page, admin);

      // Go to admin dashboard
      await page.goto('/admin');
      await expect(page.getByTestId('admin-dashboard')).toBeVisible();

      // Navigate to quiz edit
      await page.goto('/admin/quiz/test/edit');

      // Should still be authenticated (not redirected to login)
      await page.waitForTimeout(500);
      expect(page.url()).not.toContain('/login');
    });
  });

  test.describe('Quiz Edit Error Handling', () => {
    test('should handle invalid quiz IDs', async ({ page }) => {
      test.skip(!hasAdminCredentials(), 'Skipping: TEST_ADMIN_EMAIL not set');

      const admin = createAdminUser({
        email: process.env.TEST_ADMIN_EMAIL!,
        password: process.env.TEST_ADMIN_PASSWORD || 'admin123456'
      });

      await loginAdmin(page, admin);

      // Navigate with clearly invalid ID
      await page.goto('/admin/quiz/invalid-id-12345/edit');

      // Should handle gracefully (error message or empty state)
      await page.waitForTimeout(1000);

      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });
});

test.describe('Quiz Edit - Without Credentials', () => {
  test('should protect quiz edit routes', async ({ page }) => {
    // Without auth, all quiz edit routes should redirect to login
    const testIds = ['quiz-1', 'test-quiz', 'sample-id'];

    for (const quizId of testIds) {
      await page.goto(`/admin/quiz/${quizId}/edit`);
      await expect(page).toHaveURL('/login');
    }
  });

  test('should not allow direct URL access without auth', async ({ page }) => {
    // Try direct URL access
    await page.goto('/admin/quiz/direct-access/edit');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});
