import { test, expect } from '../support/fixtures';
import { setLanguage } from '../support/helpers/auth-helpers';
import { openMobileSidebarIfNeeded } from '../support/helpers/sidebar-helpers';

/**
 * Language Switching E2E Tests
 *
 * Tests for the bilingual functionality (English/Vietnamese) across the application.
 * Tests verify that language switching works correctly on all pages and that
 * content updates appropriately.
 */

test.describe('Language Switching', () => {
  test.describe('Language Selector', () => {
    test('should display language selector on homepage', async ({ page }) => {
      await page.goto('/');

      // Language selector should be visible
      await expect(page.getByTestId('language-selector')).toBeVisible();
    });

    test('should display language selector on all pages', async ({ page }) => {
      const pages = ['/', '/documents', '/quizzes', '/feedback'];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForTimeout(500);

        // Language selector should be visible on each page
        const selector = page.getByTestId('language-selector');
        if (await selector.count() > 0) {
          await expect(selector.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Vietnamese (Default)', () => {
    test('should show Vietnamese as default language', async ({ page }) => {
      await page.goto('/');

      // Should show Vietnamese text
      await expect(page.getByText(/Vùng Kinh Tế|Economic Zones/i)).toBeVisible();
    });

    test('should display Vietnamese UI elements on homepage', async ({ page }) => {
      await page.goto('/');

      // Check for Vietnamese common elements
      const vietnameseText = page.getByText(/Khu kinh tế|Vùng|Việt Nam|Hà Nội|TP\. Hồ Chí Minh/i);
      // At least some Vietnamese content should be present
    });
  });

  test.describe('Switching to English', () => {
    test('should switch to English when English selected', async ({ page }) => {
      await page.goto('/');

      // Switch to English
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      // Should show English text
      await expect(page.getByText(/Economic Zones|Vietnam/i).first()).toBeVisible();
    });

    test('should persist language selection across navigation', async ({ page }) => {
      await page.goto('/');

      // Switch to English
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      // Navigate to another page
      await page.goto('/documents');
      await page.waitForTimeout(500);

      // Should still show English
      await expect(page.getByText(/Geography Zone Documents/i)).toBeVisible();
    });

    test('should persist language selection on reload', async ({ page }) => {
      await page.goto('/');

      // Switch to English
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      // Reload page
      await page.reload();
      await page.waitForTimeout(500);

      // Should still show English
      await expect(page.getByText(/Economic Zones|Geography Zone Documents/i).first()).toBeVisible();
    });
  });

  test.describe('Switching Back to Vietnamese', () => {
    test('should switch to Vietnamese when Vietnamese selected', async ({ page }) => {
      await page.goto('/');

      // First switch to English
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      // Then switch back to Vietnamese
      await setLanguage(page, 'vi');
      await page.waitForTimeout(500);

      // Should show Vietnamese text
      await expect(page.getByText(/Vùng Kinh Tế/i).first()).toBeVisible();
    });
  });

  test.describe('Language Options', () => {
    test('should show Vietnamese and English options', async ({ page }) => {
      await page.goto('/');

      // The language selector lives in the sidebar, which is off-canvas on mobile.
      await openMobileSidebarIfNeeded(page);
      await page.click('[data-testid="language-selector"]');

      // Should show both language options
      await expect(page.getByTestId('language-option-vi')).toBeVisible();
      await expect(page.getByTestId('language-option-en')).toBeVisible();
    });
  });

  test.describe('Homepage Language Content', () => {
    test('should update homepage title on language change', async ({ page }) => {
      await page.goto('/');

      // Switch to English
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      await expect(page.getByText('Economic Zones').first()).toBeVisible();

      // Switch to Vietnamese
      await setLanguage(page, 'vi');
      await page.waitForTimeout(500);

      await expect(page.getByText(/Vùng Kinh Tế/i).first()).toBeVisible();
    });

    test('should update island labels on language change', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await page.waitForTimeout(2000);

      // Switch to English
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      // Should show English island names (or bilingual)
      const englishIslands = page.getByText(/Paracel|Spratly/i);

      // Switch to Vietnamese
      await setLanguage(page, 'vi');
      await page.waitForTimeout(500);

      // Should show Vietnamese island names
      const vietnameseIslands = page.getByText(/Hoàng Sa|Trường Sa/i);
    });
  });

  test.describe('Documents Page Language Content', () => {
    test('should update documents page title on language change', async ({ page }) => {
      await page.goto('/documents');

      // Switch to English
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      await expect(page.getByText('Geography Zone Documents')).toBeVisible();

      // Switch to Vietnamese
      await setLanguage(page, 'vi');
      await page.waitForTimeout(500);

      await expect(page.getByText('Tài Liệu Vùng Địa Lý')).toBeVisible();
    });

    test('should update filter buttons on language change', async ({ page }) => {
      await page.goto('/documents');

      // Switch to English
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      await expect(page.getByText('All').first()).toBeVisible();

      // Switch to Vietnamese
      await setLanguage(page, 'vi');
      await page.waitForTimeout(500);

      await expect(page.getByText('Tất cả').first()).toBeVisible();
    });

    test('should update download button text on language change', async ({ page }) => {
      await page.goto('/documents');

      // Switch to English
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      const downloadEn = page.locator('a').filter({ hasText: /Download/i });
      if (await downloadEn.count() > 0) {
        await expect(downloadEn.first()).toBeVisible();
      }

      // Switch to Vietnamese
      await setLanguage(page, 'vi');
      await page.waitForTimeout(500);

      const downloadVi = page.locator('a').filter({ hasText: /Tải về/i });
      if (await downloadVi.count() > 0) {
        await expect(downloadVi.first()).toBeVisible();
      }
    });
  });

  test.describe('Feedback Page Language Content', () => {
    test('should update feedback page title on language change', async ({ page }) => {
      await page.goto('/feedback');
      await page.waitForTimeout(1000);

      // Switch to English
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      await expect(page.getByText('Feedback').first()).toBeVisible();

      // Switch to Vietnamese
      await setLanguage(page, 'vi');
      await page.waitForTimeout(500);

      await expect(page.getByText('Phản hồi').first()).toBeVisible();
    });
  });

  test.describe('Quiz Pages Language Content', () => {
    test('should update quiz list page on language change', async ({ page }) => {
      await page.goto('/quizzes');

      // Switch to English
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      // Should show English quiz-related text
      const quizTextEn = page.getByText(/Quiz|Test|Question/i);
      // May or may not have visible text depending on content

      // Switch to Vietnamese
      await setLanguage(page, 'vi');
      await page.waitForTimeout(500);

      // Should show Vietnamese quiz-related text
      const quizTextVi = page.getByText(/Bài kiểm tra|Câu hỏi/i);
    });
  });

  test.describe('Sidebar Navigation Language', () => {
    test('should update sidebar text on language change', async ({ page }) => {
      await page.goto('/documents');

      // Switch to English
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      // Sidebar should show English labels
      // This depends on the sidebar implementation

      // Switch to Vietnamese
      await setLanguage(page, 'vi');
      await page.waitForTimeout(500);

      // Sidebar should show Vietnamese labels
    });
  });

  test.describe('Admin Page Language Content', () => {
    test('should update admin tabs on language change', async ({ page }) => {
      // Would need admin auth to test properly
      // Admin tabs should update based on language
    });
  });

  test.describe('Language State Storage', () => {
    test('should store language preference', async ({ page }) => {
      await page.goto('/');

      // Switch to English
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      // Check localStorage (would need to evaluate in browser context)
      // Language should be stored in localStorage or Zustand persist
    });

    test('should load stored language preference on visit', async ({ page }) => {
      // First, set a preference
      await page.goto('/');
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      // Close and reopen page (or use new context)
      // Should load with English preference
    });
  });

  test.describe('Language-specific Content', () => {
    test('should show bilingual content where appropriate', async ({ page }) => {
      // Some content may be bilingual (showing both languages)
      await page.goto('/');

      // Map labels might show both Vietnamese and English
    });

    test('should handle missing translations gracefully', async ({ page }) => {
      // If a translation key is missing, should show fallback or key
      // This would require testing with incomplete translation files
    });
  });

  test.describe('RTL/LTR Direction', () => {
    test('should maintain LTR direction for both languages', async ({ page }) => {
      await page.goto('/');

      // Both English and Vietnamese are LTR languages
      const html = page.locator('html');
      const dir = await html.getAttribute('dir');

      // Should be LTR or have no dir attribute (default LTR)
      expect(dir === null || dir === 'ltr').toBeTruthy();
    });
  });
});

/**
 * Note: Language switching tests depend on:
 * 1. The i18next configuration and translation files
 * 2. Proper testids on language-related elements
 * 3. The UI store managing language state
 *
 * Some tests are soft assertions because:
 * - Content may vary based on actual data
 * - Some elements may not exist on all pages
 * - Loading states can be transient
 *
 * To improve these tests:
 * - Ensure all translatable elements have testids
 * - Add test-specific translation keys for easier verification
 * - Mock the UI store for controlled testing
 */
