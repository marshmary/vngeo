/**
 * Authentication Helpers for E2E Tests
 *
 * Provides utilities for logging in users and managing auth state.
 */

import type { Page } from '@playwright/test';
import type { User } from '../factories/user-factory';
import { openMobileSidebarIfNeeded, closeMobileSidebarIfOpen } from './sidebar-helpers';

/**
 * Log in a user via the UI login flow.
 *
 * @param page - Playwright page object
 * @param user - User credentials (email and password)
 * @returns Promise that resolves when login is complete
 */
export async function loginUser(page: Page, user: Pick<User, 'email' | 'password'>): Promise<void> {
  await page.goto('/login');

  // Fill in login form
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);

  // Submit form
  await page.click('[data-testid="login-button"]');

  // Wait for navigation to dashboard or home
  await page.waitForURL('**/', { timeout: 10000 });
}

/**
 * Log in as an admin user via the UI.
 *
 * @param page - Playwright page object
 * @param adminUser - Admin user credentials
 */
export async function loginAdmin(page: Page, adminUser: Pick<User, 'email' | 'password'>): Promise<void> {
  await loginUser(page, adminUser);

  // Confirm the session has admin privileges. The app indicates admin status
  // via the user-menu "admin-dashboard-link" (there is no admin badge), so we
  // verify by loading /admin — which non-admins are redirected away from.
  await page.goto('/admin');
  const adminDashboard = page.getByTestId('admin-dashboard');
  await adminDashboard.waitFor({ state: 'visible', timeout: 10000 });
}

/**
 * Log out the current user.
 *
 * @param page - Playwright page object
 */
export async function logoutUser(page: Page): Promise<void> {
  // The user menu lives in the sidebar, which is off-canvas on mobile.
  await openMobileSidebarIfNeeded(page);
  // The sidebar is position:fixed; under parallel load Playwright's viewport-
  // containment actionability can flag the (genuinely visible) menu button as
  // "outside the viewport". Force-click since it is visible and reachable.
  await page.getByTestId('user-menu-button').click({ force: true });
  await page.getByTestId('logout-button').click({ force: true });

  // Wait for redirect to home or login
  await page.waitForURL('**/login', { timeout: 10000 });
}

/**
 * Set language preference (Vietnamese or English).
 *
 * @param page - Playwright page object
 * @param language - 'vi' or 'en'
 */
export async function setLanguage(page: Page, language: 'vi' | 'en'): Promise<void> {
  // The language selector lives in the sidebar, which is off-canvas on mobile.
  await openMobileSidebarIfNeeded(page);
  await page.click('[data-testid="language-selector"]');

  const languageOption = page.getByTestId(`language-option-${language}`);
  await languageOption.click();

  // Close the sidebar again on mobile so it can't overlay later assertions.
  await closeMobileSidebarIfOpen(page);

  // Wait for language change to take effect
  await page.waitForTimeout(500);
}
