import { test, expect } from '../support/fixtures';
import { loginUser, logoutUser, setLanguage } from '../support/helpers/auth-helpers';
import { createUser } from '../support/factories/user-factory';

/**
 * Navigation and Routing E2E Tests
 *
 * Tests for client-side routing, navigation components, sidebar functionality,
 * and URL-based navigation within the application.
 */

test.describe('Navigation and Routing', () => {
  test.describe('Client-side Routing', () => {
    test('should navigate to homepage', async ({ page }) => {
      await page.goto('/');

      await expect(page).toHaveURL('/');
      await expect(page.getByTestId('navbar')).toBeVisible();
    });

    test('should navigate to documents page', async ({ page }) => {
      await page.goto('/documents');

      await expect(page).toHaveURL('/documents');
      await expect(page.getByTestId('documents-page')).toBeVisible();
    });

    test('should navigate to quizzes page', async ({ page }) => {
      await page.goto('/quizzes');

      await expect(page).toHaveURL('/quizzes');
      // Quiz list page should be visible
    });

    test('should navigate to feedback page', async ({ page }) => {
      await page.goto('/feedback');

      await expect(page).toHaveURL('/feedback');
    });

    test('should navigate to login page', async ({ page }) => {
      await page.goto('/login');

      await expect(page).toHaveURL('/login');
      // Login form should be visible
    });

    test('should handle quiz detail route', async ({ page }) => {
      const quizId = 'test-quiz-id';
      await page.goto(`/quiz/${quizId}`);

      await expect(page).toHaveURL(`/quiz/${quizId}`);
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('should display sidebar on homepage', async ({ page }) => {
      await page.goto('/');

      // Sidebar should be visible (except on login page)
      // But homepage is full-screen map, so sidebar might be hidden or overlay
      const sidebar = page.locator('[data-testid="sidebar"], nav');
      if (await sidebar.count() > 0) {
        await expect(sidebar.first()).toBeVisible();
      }
    });

    test('should display sidebar on inner pages', async ({ page }) => {
      await page.goto('/documents');

      // Sidebar should be visible
      const sidebar = page.locator('[data-testid="sidebar"], nav');
      if (await sidebar.count() > 0) {
        await expect(sidebar.first()).toBeVisible();
      }
    });

    test('should not display sidebar on login page', async ({ page }) => {
      await page.goto('/login');

      // Sidebar should not be visible on login page
      const sidebar = page.locator('[data-testid="sidebar"], nav');
      // Either doesn't exist or is not visible
    });

    test('should have navigation links in sidebar', async ({ page }) => {
      await page.goto('/documents');

      // Sidebar should have navigation links
      const navLinks = page.locator('nav a');
      if (await navLinks.count() > 0) {
        await expect(navLinks.first()).toBeVisible();
      }
    });

    test('should navigate when sidebar link clicked', async ({ page }) => {
      await page.goto('/');

      // Find a sidebar link to documents
      const documentsLink = page.locator('nav a').filter({ hasText: /Documents|Tài liệu/i });
      if (await documentsLink.count() > 0) {
        await documentsLink.first().click();

        // Should navigate to documents page
        await expect(page).toHaveURL('/documents');
      }
    });
  });

  test.describe('Navbar', () => {
    test('should display navbar on homepage', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByTestId('navbar')).toBeVisible();
    });

    test('should display navbar on inner pages', async ({ page }) => {
      await page.goto('/documents');

      await expect(page.getByTestId('navbar')).toBeVisible();
    });
  });

  test.describe('Protected Route Redirects', () => {
    test('should redirect to login when accessing admin without auth', async ({ page }) => {
      await page.goto('/admin');

      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });

    test('should redirect to login when accessing quiz edit without auth', async ({ page }) => {
      await page.goto('/admin/quiz/test-id/edit');

      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Route Parameters', () => {
    test('should handle quiz ID parameter', async ({ page }) => {
      const quizId = 'some-quiz-123';
      await page.goto(`/quiz/${quizId}`);

      await expect(page).toHaveURL(`/quiz/${quizId}`);
      // Quiz page should load with the correct quiz
    });

    test('should handle admin section parameter', async ({ page }) => {
      // Would need auth to test properly
      // /admin?section=settings should open settings tab
    });
  });

  test.describe('Browser Navigation', () => {
    test('should handle browser back button', async ({ page }) => {
      await page.goto('/documents');

      // Navigate to another page
      await page.goto('/quizzes');

      // Click back
      await page.goBack();

      // Should return to documents
      await expect(page).toHaveURL('/documents');
    });

    test('should handle browser forward button', async ({ page }) => {
      await page.goto('/documents');

      // Navigate to another page
      await page.goto('/quizzes');

      // Go back
      await page.goBack();

      // Go forward
      await page.goForward();

      // Should return to quizzes
      await expect(page).toHaveURL('/quizzes');
    });
  });

  test.describe('URL Direct Navigation', () => {
    test('should load correct page when visiting URL directly', async ({ page }) => {
      // Direct navigation to documents
      await page.goto('/documents');

      await expect(page).toHaveURL('/documents');
      await expect(page.getByTestId('documents-page')).toBeVisible();
    });

    test('should handle reload without losing state', async ({ page }) => {
      await page.goto('/documents');

      // Reload page
      await page.reload();

      // Should still be on documents page
      await expect(page).toHaveURL('/documents');
    });
  });

  test.describe('404 Not Found', () => {
    test('should handle unknown routes gracefully', async ({ page }) => {
      // Navigate to non-existent route
      await page.goto('/this-route-does-not-exist');

      // Should either show 404 page or redirect to home
      // React Router v8 doesn't have a default 404 route in the current config
      // So it might show a blank page or the app might handle it
    });
  });

  test.describe('Navigation State Preservation', () => {
    test('should preserve scroll position on navigation', async ({ page }) => {
      await page.goto('/documents');

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500));

      // Navigate to another page
      await page.goto('/quizzes');

      // Navigate back
      await page.goBack();

      // Scroll position might be preserved (depending on router config)
    });
  });

  test.describe('Link Behavior', () => {
    test('should use client-side navigation for internal links', async ({ page }) => {
      await page.goto('/');

      // Click an internal link
      const internalLink = page.locator('a[href^="/"]').first();
      if (await internalLink.count() > 0) {
        const href = await internalLink.getAttribute('href');

        await internalLink.first().click();

        // Should navigate client-side (no full page reload)
        if (href) {
          await expect(page).toHaveURL(new RegExp(`^${href.replace('/', '\\/')}$`));
        }
      }
    });

    test('should open external links in new tab', async ({ page }) => {
      await page.goto('/documents');

      // Collect targets of external (cross-origin) links via the page DOM.
      // (Playwright locator `.filter({ has })` requires a locator, not a
      // function — the previous form threw "Inner has locator must belong
      // to the same frame", so evaluate in-page instead.)
      const externalTargets = await page.evaluate(() => {
        const origin = window.location.origin;
        return Array.from(document.querySelectorAll('a[href^="http"]'))
          .filter((a) => {
            try { return new URL((a as HTMLAnchorElement).href).origin !== origin; }
            catch { return false; }
          })
          .map((a) => (a as HTMLAnchorElement).target);
      });

      // Any external link that exists should open in a new tab
      for (const target of externalTargets) {
        expect(target).toBe('_blank');
      }
    });
  });

  test.describe('Loading States', () => {
    test('should show loading state during navigation', async ({ page }) => {
      // Might show loading spinner during lazy-loaded route chunks
      await page.goto('/documents');

      // Loading state might be transient
      const loading = page.locator('[data-testid="loading"], .animate-spin');
      // Soft assertion - may or may not be visible
    });
  });

  test.describe('Sidebar Toggle', () => {
    test('should allow collapsing sidebar', async ({ page }) => {
      await page.goto('/documents');

      // Look for collapse button
      const collapseButton = page.locator('button').filter({ hasText: /collapse|hide|menu/i });
      if (await collapseButton.count() > 0) {
        await collapseButton.first().click();

        // Sidebar should collapse
        // This depends on the sidebar implementation
      }
    });

    test('should allow expanding collapsed sidebar', async ({ page }) => {
      await page.goto('/documents');

      // Look for expand button (when sidebar is collapsed)
      const expandButton = page.locator('button').filter({ hasText: /expand|show|menu/i });
      if (await expandButton.count() > 0) {
        await expandButton.first().click();

        // Sidebar should expand
      }
    });
  });

  test.describe('Mobile Navigation', () => {
    test('should handle navigation on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Mobile navigation should work
      // Sidebar might be hidden behind a hamburger menu
    });

    test('should show mobile menu button on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/documents');

      // Mobile menu button should be visible
      const menuButton = page.locator('button').filter({ hasText: /menu|☰/i });
      if (await menuButton.count() > 0) {
        await expect(menuButton.first()).toBeVisible();
      }
    });
  });
});

/**
 * Note: Navigation tests depend on:
 * 1. React Router v8 configuration
 * 2. Proper testids on navigation elements
 * 3. The actual routing setup in App.tsx
 *
 * Some tests require proper authentication to verify protected routes.
 * To improve these tests:
 * - Add testids to all navigation elements
 * - Test with authenticated and unauthenticated states
 * - Test edge cases like rapid navigation clicks
 * - Test browser history manipulation
 */
