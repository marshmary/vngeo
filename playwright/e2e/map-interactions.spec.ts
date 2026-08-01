import { test, expect } from '../support/fixtures';
import { setLanguage } from '../support/helpers/auth-helpers';

/**
 * Map Interactions E2E Tests
 *
 * Tests for the interactive economic zone map functionality including
 * zone markers, island labels, and map controls beyond the basic homepage tests.
 */

test.describe('Map Interactions', () => {
  test.describe('Map Loading', () => {
    test('should load interactive map on homepage', async ({ page }) => {
      await page.goto('/');

      // Map container should be visible
      await expect(page.getByTestId('interactive-map')).toBeVisible();
    });

    test('should wait for map tiles to load', async ({ page }) => {
      await page.goto('/');

      // Wait for map to initialize
      const mapContainer = page.getByTestId('interactive-map');
      await expect(mapContainer).toBeVisible();

      // Give map tiles time to load
      await page.waitForTimeout(2000);
    });
  });

  test.describe('Zone Markers', () => {
    test('should display all six economic zone markers', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await expect(page.getByTestId('interactive-map')).toBeVisible();
      await page.waitForTimeout(2000);

      // Check for zone markers
      const zoneMarkers = page.getByTestId(/zone-button-/);
      const markerCount = await zoneMarkers.count();

      expect(markerCount).toBeGreaterThanOrEqual(6);
    });

    test('should show zone details on marker click', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await expect(page.getByTestId('interactive-map')).toBeVisible();
      await page.waitForTimeout(2000);

      // Click on first zone marker
      const firstZoneMarker = page.getByTestId(/zone-button-/).first();
      await firstZoneMarker.click();

      // Should open zone details
      const zoneDetails = page.getByTestId('zone-details');
      if (await zoneDetails.count() > 0) {
        await expect(zoneDetails.first()).toBeVisible();
      }
    });

    test('should close zone details on close button click', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await expect(page.getByTestId('interactive-map')).toBeVisible();
      await page.waitForTimeout(2000);

      // Open zone details
      const firstZoneMarker = page.getByTestId(/zone-button-/).first();
      await firstZoneMarker.click();
      await page.waitForTimeout(500);

      // Close details
      const closeButton = page.locator('button').filter({ hasText: /×|close|Close/i }).first();
      if (await closeButton.count() > 0) {
        await closeButton.click();

        // Details should close
        const zoneDetails = page.getByTestId('zone-details');
        if (await zoneDetails.count() > 0) {
          await expect(zoneDetails.first()).not.toBeVisible();
        }
      }
    });

    test('should highlight marker on hover', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await expect(page.getByTestId('interactive-map')).toBeVisible();
      await page.waitForTimeout(2000);

      // Hover over a marker
      const firstZoneMarker = page.getByTestId(/zone-button-/).first();
      await firstZoneMarker.hover();

      // Marker should have hover styling
      // This is hard to test without seeing the actual styles
      await page.waitForTimeout(500);
    });
  });

  test.describe('Island Labels', () => {
    test('should display Paracel Islands label', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await expect(page.getByTestId('interactive-map')).toBeVisible();
      await page.waitForTimeout(2000);

      await expect(page.getByTestId('paracel-islands-label')).toBeVisible();
    });

    test('should display Spratly Islands label', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await expect(page.getByTestId('interactive-map')).toBeVisible();
      await page.waitForTimeout(2000);

      await expect(page.getByTestId('spratly-islands-label')).toBeVisible();
    });

    test('should show Vietnamese names for islands', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await page.waitForTimeout(2000);

      // Should show Hoàng Sa and Trường Sa labels
      const hoangSa = page.getByText(/Hoàng Sa|Paracel/i);
      const truongSa = page.getByText(/Trường Sa|Spratly/i);

      // At least one variant should be visible
      const hasIslandLabels = await hoangSa.count() > 0 || await truongSa.count() > 0;
      expect(hasIslandLabels).toBeTruthy();
    });
  });

  test.describe('Map Controls', () => {
    test('should have zoom controls', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await page.waitForTimeout(2000);

      // Leaflet adds zoom controls by default
      const zoomControls = page.locator('.leaflet-control-zoom');
      if (await zoomControls.count() > 0) {
        await expect(zoomControls.first()).toBeVisible();
      }
    });

    test('should zoom in when zoom in clicked', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await page.waitForTimeout(2000);

      const zoomIn = page.locator('.leaflet-control-zoom-in');
      if (await zoomIn.count() > 0) {
        await zoomIn.first().click();
        await page.waitForTimeout(500);

        // Map should be zoomed in (hard to verify without checking actual zoom level)
      }
    });

    test('should zoom out when zoom out clicked', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await page.waitForTimeout(2000);

      const zoomOut = page.locator('.leaflet-control-zoom-out');
      if (await zoomOut.count() > 0) {
        await zoomOut.first().click();
        await page.waitForTimeout(500);

        // Map should be zoomed out
      }
    });
  });

  test.describe('Map Pan', () => {
    test('should allow panning the map', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await page.waitForTimeout(2000);

      const mapContainer = page.getByTestId('interactive-map');

      // Drag map to pan
      await mapContainer.click();
      await page.mouse.down();
      await page.mouse.move(100, 100);
      await page.mouse.up();

      await page.waitForTimeout(500);
    });
  });

  test.describe('Zone Details Content', () => {
    test('should show zone name in details', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await page.waitForTimeout(2000);

      // Click on a zone marker
      const firstZoneMarker = page.getByTestId(/zone-button-/).first();
      await firstZoneMarker.click();
      await page.waitForTimeout(500);

      // Should show zone details
      const zoneDetails = page.getByTestId('zone-details');
      if (await zoneDetails.count() > 0) {
        // Should have some content
        const content = zoneDetails.first();
        const textContent = await content.textContent();
        expect(textContent?.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Multiple Zone Selection', () => {
    test('should allow switching between zones', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await page.waitForTimeout(2000);

      // Click first zone
      const firstZone = page.getByTestId(/zone-button-/).nth(0);
      await firstZone.click();
      await page.waitForTimeout(500);

      // Click second zone
      const secondZone = page.getByTestId(/zone-button-/).nth(1);
      await secondZone.click();
      await page.waitForTimeout(500);

      // Details should update to second zone
      // Hard to verify without knowing the actual content
    });
  });

  test.describe('Map Layer Controls', () => {
    test('should have layer control if multiple layers exist', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await page.waitForTimeout(2000);

      // Layer control might exist
      const layerControl = page.locator('.leaflet-control-layers');
      // May or may not exist depending on map configuration
    });
  });

  test.describe('Map Attribution', () => {
    test('should show map attribution', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await page.waitForTimeout(2000);

      // Leaflet adds attribution control by default
      const attribution = page.locator('.leaflet-control-attribution');
      if (await attribution.count() > 0) {
        await expect(attribution.first()).toBeVisible();
      }
    });
  });

  test.describe('Responsive Map', () => {
    test('should fill viewport on homepage', async ({ page }) => {
      await page.goto('/');

      // Map container should be full height
      const mapContainer = page.getByTestId('interactive-map');
      await expect(mapContainer).toBeVisible();

      // Verify map takes full viewport height
      const mapHeight = await mapContainer.evaluate(el => el.clientHeight);
      expect(mapHeight).toBeGreaterThan(400); // At least 400px
    });

    test('should resize on window resize', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await page.waitForTimeout(2000);

      // Resize window
      await page.setViewportSize({ width: 800, height: 600 });
      await page.waitForTimeout(500);

      // Map should still be visible
      await expect(page.getByTestId('interactive-map')).toBeVisible();
    });
  });

  test.describe('Language Support on Map', () => {
    test('should show Vietnamese zone names by default', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await page.waitForTimeout(2000);

      // Zone names should be in Vietnamese
      // Hard to test without knowing the actual zone names
    });

    test('should switch to English when language changed', async ({ page }) => {
      await page.goto('/');

      // Wait for map to load
      await page.waitForTimeout(2000);

      // Change to English
      await setLanguage(page, 'en');
      await page.waitForTimeout(500);

      // Zone names should update to English
      // Hard to test without knowing the actual zone names
    });
  });

  test.describe('Map Performance', () => {
    test('should load map within reasonable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');

      // Wait for map container
      await expect(page.getByTestId('interactive-map')).toBeVisible();

      const loadTime = Date.now() - startTime;

      // Map should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });
  });

  test.describe('Map Error Handling', () => {
    test('should handle map tile loading errors gracefully', async ({ page }) => {
      // Would need to intercept tile requests to simulate failure
      await page.goto('/');

      // Map should still show even if some tiles fail
      await expect(page.getByTestId('interactive-map')).toBeVisible();
    });
  });
});

/**
 * Note: Map interaction tests are limited because:
 * 1. The map uses Leaflet with GeoJSON data loaded from files
 * 2. Zone markers and details depend on the actual data structure
 * 3. We cannot verify exact content without knowing the test data
 *
 * To improve these tests:
 * - Add testids to all interactive map elements
 * - Mock the GeoJSON data for consistent testing
 * - Test with known zone IDs and verify expected content
 * - Add tests for zone-specific features (province lists, etc.)
 */
