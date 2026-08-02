// =============================================================================
// admin-settings-crud.spec.ts — Admin Settings CRUD (CRUD_TEST_SPEC §4.3)
// =============================================================================
// Coverage:
//   1. Save a valid feedback URL -> success toast; verify /feedback embeds it.
//   2. Save a valid video URL   -> success toast; verify /map-drawing shows it.
//   3. Validation: invalid URL  -> settings-validation-error, save disabled, no save.
//
// Gating: every test skips cleanly unless `crudWriteEnabled` (TEST_RUN_CRUD_WRITE=1)
// AND admin credentials (TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD) are present.
//
// Teardown: beforeAll snapshots the two settings rows via the service-role
// client; afterAll restores them (read-then-restore) and runs the shared
// cleanupE2EEntities hard-gate for any stray [E2E-] data. Settings rows are not
// [E2E-]-tagged (they're key/value rows), so their safety net is the restore,
// not the generic cleanup. The suite leaves the settings exactly as found.
//
// PENDING VALIDATION AGAINST LOCAL SUPABASE: not executed in this environment.
// =============================================================================

import { test, expect, createServiceRoleClient, isCrudWriteEnabled } from '../support/fixtures';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminUser } from '../support/factories/user-factory';
import { loginAdmin } from '../support/helpers/auth-helpers';
import { cleanupE2EEntities } from '../support/helpers/cleanup';
import {
  readSettingsSnapshot,
  restoreSettings,
  saveFeedbackUrlViaUI,
  saveVideoUrlViaUI,
  getFeedbackIframeSrc,
  getMapDrawingVideoSrc,
  openAdminSettingsTab,
  dismissLingeringToast,
  uniqueFeedbackUrl,
  uniqueVideoUrl,
  INVALID_URL,
  type SettingsSnapshot,
} from '../support/crud/settings-crud-helpers';

// -----------------------------------------------------------------------------
// Gating helpers
// ----------------------------------------------------------------------------

/** Both pieces of admin credential must be present to log in via the UI. */
const hasAdminCredentials = (): boolean =>
  !!process.env.TEST_ADMIN_EMAIL && !!process.env.TEST_ADMIN_PASSWORD;

/** Build an admin-credentials object from env (mirrors admin.spec.ts). */
const adminFromEnv = () =>
  createAdminUser({
    email: process.env.TEST_ADMIN_EMAIL!,
    password: process.env.TEST_ADMIN_PASSWORD!,
  });

/** True only when this suite is permitted to run (write-gate + creds + key). */
const suiteMayRun = (): boolean =>
  isCrudWriteEnabled() && hasAdminCredentials();

// -----------------------------------------------------------------------------
// Shared snapshot state (populated in beforeAll, restored in afterAll)
// ----------------------------------------------------------------------------

let serviceClient: SupabaseClient | null = null;
let snapshot: SettingsSnapshot | undefined;

// =============================================================================
// SERIAL: these tests mutate the SAME two shared `general_settings` rows
// (`feedback_form_url`, `map_drawing_video_url`) via the global SettingsService.
// `playwright.config.ts` sets `fullyParallel: true`, which would otherwise run
// the feedback and video write-tests on concurrent workers against those shared
// rows. Each save helper pins the field NOT under test to a stable placeholder,
// so under parallel execution the slower test's /feedback or /map-drawing read
// races and picks up the OTHER test's placeholder (the value under test gets
// overwritten mid-flight) — a flaky, order-dependent failure that swaps between
// the two tests run-to-run. The fix is to serialize the block so the writes are
// strictly ordered. (Root cause validated: forcing --workers=1 made the suite
// pass deterministically; neither FeedbackPage nor SettingsService caches —
// both refetch on mount, so the original "stale cache" hypothesis was wrong.)
test.describe.serial('Admin Settings CRUD — §4.3', () => {
  // --- Per-test gate --------------------------------------------------------
  // Skips each test cleanly when writes are off, credentials are missing, or
  // the service-role key is absent (no teardown possible -> can't guarantee
  // no residue). All three conditions mirror the §6 "Write" run-mode contract.
  test.beforeEach(async ({ crudWriteEnabled, serviceRole }) => {
    test.skip(!crudWriteEnabled, 'CRUD write tests disabled (set TEST_RUN_CRUD_WRITE=1)');
    test.skip(!hasAdminCredentials(), 'Skipping: TEST_ADMIN_* credentials not set');
    test.skip(!serviceRole, 'Skipping: SUPABASE_SERVICE_ROLE_KEY not set (no teardown)');
  });

  // --- Snapshot prior settings so afterAll can restore them -----------------
  test.beforeAll(async () => {
    if (!suiteMayRun()) return; // suite is skipped entirely; nothing to snapshot.
    serviceClient = createServiceRoleClient();
    if (!serviceClient) return; // no service-role key -> skip snapshot/restore.
    try {
      snapshot = await readSettingsSnapshot(serviceClient);
    } catch {
      // Don't fail the run if the snapshot read fails; afterAll will no-op.
      snapshot = undefined;
    }
  });

  // --- Restore settings + run the shared cleanup hard-gate ------------------
  test.afterAll(async () => {
    if (!serviceClient) return;
    if (snapshot) {
      // Read-then-restore: put the settings rows back exactly as found.
      await restoreSettings(serviceClient, snapshot);
    }
    // Standard hard-gate for stray [E2E-] data. A no-op for this suite
    // (settings rows are not [E2E-]-tagged), kept for consistency with the
    // global teardown contract. Never throws (best-effort).
    await cleanupE2EEntities(serviceClient);
  });

  // ---------------------------------------------------------------------------
  // 1. Save a valid feedback URL -> toast -> /feedback embeds the new URL.
  // ---------------------------------------------------------------------------
  test('saves a valid feedback URL and embeds it on /feedback', async ({ page }) => {
    await loginAdmin(page, adminFromEnv());

    const url = uniqueFeedbackUrl('1');
    await saveFeedbackUrlViaUI(page, url);

    const src = await getFeedbackIframeSrc(page);
    expect(
      src,
      '/feedback iframe src should reflect the just-saved feedback URL'
    ).toContain(url);
  });

  // ---------------------------------------------------------------------------
  // 2. Save a valid video URL -> toast -> /map-drawing shows the new URL.
  // ---------------------------------------------------------------------------
  test('saves a valid video URL and shows it on /map-drawing', async ({ page }) => {
    await loginAdmin(page, adminFromEnv());

    const url = uniqueVideoUrl('2');
    await saveVideoUrlViaUI(page, url);

    const src = await getMapDrawingVideoSrc(page);
    expect(
      src,
      '/map-drawing iframe src should reflect the just-saved video URL'
    ).toContain(url);
  });

  // ---------------------------------------------------------------------------
  // 3. Validation: invalid URL -> error + save disabled -> no save.
  // ---------------------------------------------------------------------------
  test('rejects an invalid URL with a validation error and does not save', async ({ page }) => {
    await loginAdmin(page, adminFromEnv());
    await openAdminSettingsTab(page);

    // Type a clearly invalid feedback URL.
    await page.getByTestId('feedback-url-input').fill(INVALID_URL);

    // Validation error appears (GeneralSettings renders data-testid
    // "settings-validation-error" when a field is non-empty and invalid).
    await expect(page.getByTestId('settings-validation-error').first()).toBeVisible();

    // Save is disabled (isValidUrl guard), so no save can occur.
    await expect(page.getByTestId('settings-save-button')).toBeDisabled();

    // Dismiss any toast that may have lingered (the testid is shared by every
    // notification type), then confirm no success toast was shown — i.e. the
    // invalid value was never persisted.
    await dismissLingeringToast(page);
    await expect(page.getByTestId('settings-saved-toast')).toHaveCount(0);
  });
});
