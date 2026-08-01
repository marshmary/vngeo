import { test, expect } from '../support/fixtures';

/**
 * Homepage E2E Tests
 *
 * Tests for the Vietnam Economic Zones homepage functionality.
 */

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Vietnam Economic Zones/i);

    // Check main navigation is visible
    await expect(page.getByTestId('navbar')).toBeVisible();

    // Check map container is loaded
    await expect(page.getByTestId('interactive-map')).toBeVisible();
  });

  test('should display all six economic zones', async ({ page }) => {
    await page.goto('/');

    // Wait for map to load
    const mapContainer = page.getByTestId('interactive-map');
    await expect(mapContainer).toBeVisible();

    // Check for zone markers (6 zones expected)
    const zoneMarkers = page.getByTestId(/zone-marker-/);
    const markerCount = await zoneMarkers.count();

    expect(markerCount).toBeGreaterThanOrEqual(6);
  });

  test('should navigate to zone details on marker click', async ({ page }) => {
    await page.goto('/');

    // Click on a zone marker
    const firstZoneMarker = page.getByTestId(/zone-marker-/).first();
    await firstZoneMarker.click();

    // Should open zone details dialog/sidebar
    await expect(page.getByTestId('zone-details')).toBeVisible();
  });

  test('should toggle language between Vietnamese and English', async ({ page }) => {
    await page.goto('/');

    // Click language selector
    await page.click('[data-testid="language-selector"]');

    // Select English
    await page.click('[data-testid="language-option-en"]');

    // Verify English text is visible (check for common English UI elements)
    await expect(page.getByText(/Economic Zones/i)).toBeVisible();

    // Switch back to Vietnamese
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-vi"]');

    // Verify Vietnamese text is visible
    await expect(page.getByText(/Khu vực kinh tế/i)).toBeVisible();
  });

  test('should show Paracel and Spratly islands labels', async ({ page }) => {
    await page.goto('/');

    // Wait for map to fully load
    const mapContainer = page.getByTestId('interactive-map');
    await expect(mapContainer).toBeVisible();

    // Check for Paracel Islands label
    await expect(page.getByTestId('paracel-islands-label')).toBeVisible();

    // Check for Spratly Islands label
    await expect(page.getByTestId('spratly-islands-label')).toBeVisible();
  });
});
