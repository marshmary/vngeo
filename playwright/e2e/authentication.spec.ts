import { test, expect } from '../support/fixtures';
import { loginUser, loginAdmin, logoutUser } from '../support/helpers/auth-helpers';
import { createUser, createAdminUser } from '../support/factories/user-factory';

/**
 * Authentication E2E Tests
 *
 * Tests for login, logout, and protected routes.
 */

test.describe('Authentication', () => {
  test.describe('Login Flow', () => {
    test('should log in with valid credentials', async ({ page }) => {
      const user = createUser();

      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', user.email);
      await page.fill('[data-testid="password-input"]', user.password);
      await page.click('[data-testid="login-button"]');

      // Should redirect to home or dashboard
      await expect(page).toHaveURL('**/');
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'invalid@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');

      // Should show error message
      await expect(page.getByTestId('login-error')).toBeVisible();
      await expect(page.getByText(/Invalid credentials/i)).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/login');

      // Try to submit without filling fields
      await page.click('[data-testid="login-button"]');

      // Should show validation errors
      await expect(page.getByTestId('email-error')).toBeVisible();
      await expect(page.getByTestId('password-error')).toBeVisible();
    });
  });

  test.describe('Logout Flow', () => {
    test('should log out successfully', async ({ page }) => {
      const user = createUser();

      // First log in
      await loginUser(page, user);

      // Then log out
      await logoutUser(page);

      // Should redirect to login page
      await expect(page).toHaveURL('**/login');

      // User menu should not be visible
      await expect(page.getByTestId('user-menu-button')).not.toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access admin page without authentication
      await page.goto('/admin');

      // Should redirect to login
      await expect(page).toHaveURL('**/login');
    });

    test('should allow access to protected routes after login', async ({ page }) => {
      const user = createUser();

      // Log in first
      await loginUser(page, user);

      // Try to access a protected route
      await page.goto('/documents');

      // Should load successfully
      await expect(page.getByTestId('documents-page')).toBeVisible();
    });
  });

  test.describe('Admin Access', () => {
    test('should allow admin users to access admin pages', async ({ page }) => {
      const admin = createAdminUser();

      await loginAdmin(page, admin);

      // Navigate to admin page
      await page.goto('/admin');

      // Should load admin dashboard
      await expect(page.getByTestId('admin-dashboard')).toBeVisible();
      await expect(page.getByTestId('admin-badge')).toBeVisible();
    });

    test('should deny admin access to regular users', async ({ page }) => {
      const regularUser = createUser({ role: 'user' });

      await loginUser(page, regularUser);

      // Try to access admin page
      await page.goto('/admin');

      // Should show access denied or redirect
      await expect(page.getByTestId('access-denied') || page.getByTestId('login-error')).toBeVisible();
    });
  });
});
