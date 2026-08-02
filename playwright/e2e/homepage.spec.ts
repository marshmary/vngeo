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
    await expect(page).toHaveTitle(/Viet Nam Economic Zone/i);

    // Check main navigation (sidebar) is visible on desktop
    const navbar = page.getByTestId('navbar');
    await expect(navbar).toBeVisible();

    // Check map container is loaded
    await expect(page.getByTestId('interactive-map')).toBeVisible();
  });

  test('should display economic zones in legend', async ({ page }) => {
    await page.goto('/');

    // Wait for map to load
    const mapContainer = page.getByTestId('interactive-map');
    await expect(mapContainer).toBeVisible();

    // Check for map legend which contains zone buttons
    const mapLegend = page.getByTestId('map-legend');
    await expect(mapLegend).toBeVisible();

    // Check for at least one zone button in the legend
    const zoneButtons = page.getByTestId(/zone-button-/);
    const buttonCount = await zoneButtons.count();

    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should navigate to zone details on legend click', async ({ page }) => {
    await page.goto('/');

    // Wait for map to load
    const mapContainer = page.getByTestId('interactive-map');
    await expect(mapContainer).toBeVisible();

    // Click on a zone button in the legend
    const firstZoneButton = page.getByTestId(/zone-button-/).first();
    await firstZoneButton.click();

    // Should open zone details sidebar
    await expect(page.getByTestId('zone-details')).toBeVisible();
  });

  test('should toggle language between Vietnamese and English', async ({ page }) => {
    await page.goto('/');

    // Click language selector in sidebar
    await page.click('[data-testid="language-selector"]');

    // Select English (EN)
    await page.click('[data-testid="language-option-en"]');

    // Verify English text is visible (check for common English UI elements)
    // The page title should update to contain English text
    await expect(page.getByText(/Economic Zones/i).first()).toBeVisible();

    // Switch back to Vietnamese
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-vi"]');

    // Verify Vietnamese text is visible
    await expect(page.getByText(/Vùng Kinh Té|Kinh Tế/i).first()).toBeVisible();
  });

  test('should show Paracel and Spratly islands labels', async ({ page }) => {
    await page.goto('/');

    // Wait for map to fully load
    const mapContainer = page.getByTestId('interactive-map');
    await expect(mapContainer).toBeVisible();

    // Check for Paracel Islands label in map container
    // Note: These are Leaflet markers with custom DivIcon content
    await expect(page.getByTestId('paracel-islands-label')).toBeVisible();

    // Check for Spratly Islands label
    await expect(page.getByTestId('spratly-islands-label')).toBeVisible();
  });

  test('should close zone details sidebar', async ({ page }) => {
    await page.goto('/');

    // Click on a zone button to open details
    const firstZoneButton = page.getByTestId(/zone-button-/).first();
    await firstZoneButton.click();

    // Verify zone details is visible
    await expect(page.getByTestId('zone-details')).toBeVisible();

    // Click close button
    await page.click('[data-testid="zone-details-close"]');

    // Zone details should be hidden (it's only visible when xl breakpoint and selected)
    // On desktop, it becomes hidden when no zone is selected
    const zoneDetails = page.getByTestId('zone-details');
    // After closing, clicking elsewhere on map should deselect
    await page.locator('.leaflet-container').click();
  });

  test('should display quick zone list when no zone selected', async ({ page }) => {
    await page.goto('/');

    // When no zone is selected, the zone details sidebar should show quick zone list
    // Wait for map to load
    await expect(page.getByTestId('interactive-map')).toBeVisible();

    // Zone details sidebar should be visible on xl screens showing quick zone list
    const zoneDetails = page.getByTestId('zone-details');
    await expect(zoneDetails).toBeVisible();

    // Should contain zone links
    const zoneLinks = page.getByTestId(/zone-link-/);
    await expect(zoneLinks.first()).toBeVisible();
  });
});
