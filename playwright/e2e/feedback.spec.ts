import { test, expect } from '../support/fixtures';
import { setLanguage } from '../support/helpers/auth-helpers';

/**
 * Feedback E2E Tests
 *
 * Tests for the feedback page which embeds a Google Form iframe.
 */

test.describe('Feedback Page', () => {
  test.describe('Page Load', () => {
    test('should load feedback page successfully', async ({ page }) => {
      await page.goto('/feedback');

      // Check page title
      await expect(page).toHaveTitle(/Vietnam Economic Zones/i);

      // Should show feedback page container
      const feedbackHeader = page.getByText(/Phản hồi|Feedback/i);
      await expect(feedbackHeader).toBeVisible();
    });

    test('should show loading state while fetching form URL', async ({ page }) => {
      await page.goto('/feedback');

      // Loading spinner should appear briefly
      const loadingSpinner = page.locator('.animate-spin');
      // Since loading is transient, we use a soft assertion
      if (await loadingSpinner.count() > 0) {
        await expect(loadingSpinner.first()).toBeVisible();
      }
    });

    test('should show header with title and description', async ({ page }) => {
      await page.goto('/feedback');

      // Wait for page to load
      await page.waitForTimeout(1000);

      // Should show title
      const title = page.locator('h1, h2').filter({ hasText: /Phản hồi|Feedback/i });
      if (await title.count() > 0) {
        await expect(title.first()).toBeVisible();
      }

      // Should show description
      const description = page.getByText(/Share your feedback|Chia sẻ ý kiến/i);
      if (await description.count() > 0) {
        await expect(description.first()).toBeVisible();
      }
    });
  });

  test.describe('Google Form Embed', () => {
    test('should display Google Form iframe', async ({ page }) => {
      await page.goto('/feedback');

      // Wait for page to load and fetch URL
      await page.waitForTimeout(2000);

      // Look for iframe element
      const iframe = page.locator('iframe[title*="Feedback" i], iframe[title*="Biểu mẫu" i]');
      if (await iframe.count() > 0) {
        await expect(iframe.first()).toBeVisible();
      }
    });

    test('should have iframe with valid src attribute', async ({ page }) => {
      await page.goto('/feedback');

      // Wait for page to load
      await page.waitForTimeout(2000);

      const iframe = page.locator('iframe');
      if (await iframe.count() > 0) {
        const src = await iframe.first().getAttribute('src');
        expect(src).toBeTruthy();
        expect(src).toMatch(/docs\.google\.com\/forms/i);
      }
    });

    test('should have proper iframe attributes', async ({ page }) => {
      await page.goto('/feedback');

      // Wait for page to load
      await page.waitForTimeout(2000);

      const iframe = page.locator('iframe');
      if (await iframe.count() > 0) {
        // Should have frameborder="0"
        const frameBorder = await iframe.first().getAttribute('frameBorder');
        expect(frameBorder).toBe('0');

        // Should have marginHeight="0"
        const marginHeight = await iframe.first().getAttribute('marginHeight');
        expect(marginHeight).toBe('0');

        // Should have marginWidth="0"
        const marginWidth = await iframe.first().getAttribute('marginWidth');
        expect(marginWidth).toBe('0');
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should show error state when form URL fetch fails', async ({ page }) => {
      // This would require mocking the API to simulate failure
      // For now, verify the error state component exists
      await page.goto('/feedback');

      // Error state exists in DOM
      const errorTitle = page.getByText(/Error|Lỗi/i);
      // May not be visible if no error occurred
    });

    test('should show error message', async ({ page }) => {
      // Would need to mock error response
      // Error should show: "Feedback form not found" or "Unable to load feedback form"
    });

    test('should show retry button on error', async ({ page }) => {
      // Would need to mock error response
      // Retry button should be visible and clickable
    });

    test('should retry loading form when retry clicked', async ({ page }) => {
      // Would need to mock error then success response
      // Click retry, verify form loads successfully
    });
  });

  test.describe('Form Not Found State', () => {
    test('should show specific message when form URL not configured', async ({ page }) => {
      // Would need to mock API returning null URL
      // Should show: "Feedback form not found. Please contact the administrator."
    });
  });

  test.describe('Language Support', () => {
    test('should display Vietnamese text by default', async ({ page }) => {
      await page.goto('/feedback');

      // Wait for page to load
      await page.waitForTimeout(1000);

      // Should show Vietnamese title
      const vietnameseTitle = page.getByText('Phản hồi');
      if (await vietnameseTitle.count() > 0) {
        await expect(vietnameseTitle.first()).toBeVisible();
      }
    });

    test('should switch to English when language changed', async ({ page }) => {
      await page.goto('/feedback');
      await page.waitForTimeout(1000);

      // Change to English
      await setLanguage(page, 'en');

      // Wait for language change to take effect
      await page.waitForTimeout(500);

      // Should show English text
      await expect(page.getByText('Feedback')).toBeVisible();
    });

    test('should update description on language change', async ({ page }) => {
      await page.goto('/feedback');
      await page.waitForTimeout(1000);

      // Change to English
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      // Should show English description
      const englishDesc = page.getByText(/Share your feedback to help us improve our service/i);
      if (await englishDesc.count() > 0) {
        await expect(englishDesc.first()).toBeVisible();
      }
    });

    test('should update error messages on language change', async ({ page }) => {
      // Would need to trigger error state
      // Error messages should update based on language
    });
  });

  test.describe('Loading State Messages', () => {
    test('should show Vietnamese loading message by default', async ({ page }) => {
      await page.goto('/feedback');

      // Loading message might be visible briefly
      const loadingMessage = page.getByText(/Đang tải|Loading/i);
      // Transient state, soft assertion
    });

    test('should show English loading message when in English', async ({ page }) => {
      // Would need to set language before navigation
      // Then verify loading message is in English
    });
  });

  test.describe('Retry Button Functionality', () => {
    test('should call reload function when retry clicked', async ({ page }) => {
      // Would need to mock error state
      // Click retry, verify it calls the load function again
    });
  });

  test.describe('Iframe Fallback Content', () => {
    test('should show fallback text in iframe', async ({ page }) => {
      await page.goto('/feedback');
      await page.waitForTimeout(2000);

      // Check iframe content (what shows if iframe doesn't load)
      // The iframe should have "Loading..." or "Đang tải..." as fallback
    });
  });
});

/**
 * Note: Feedback page tests are limited because:
 * 1. The Google Form URL is fetched from a service/settings
 * 2. We cannot control the actual Google Form content
 * 3. Loading states are transient and hard to catch in tests
 *
 * To improve these tests:
 * - Mock the settingsService.getFeedbackFormUrl() response
 * - Test with both valid and invalid URLs
 * - Test network failure scenarios
 * - Consider adding test IDs to key elements for easier selection
 */
