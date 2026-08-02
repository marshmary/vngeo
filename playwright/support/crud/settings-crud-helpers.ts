// =============================================================================
// settings-crud-helpers.ts — private UI + teardown helpers for the
// Admin Settings CRUD spec (CRUD_TEST_SPEC §4.3).
// =============================================================================
// OWNERSHIP: this file is private to `admin-settings-crud.spec.ts`. It contains
// the UI-drive helpers (open settings tab, save a URL, read back an embedded
// iframe src) plus the snapshot/restore pair that backs the suite's afterAll.
//
// Why a "save" helper fills BOTH URL fields:
//   GeneralSettings' save button is `disabled` unless BOTH the video URL and
//   the feedback URL are syntactically valid (see isValidUrl guard in
//   GeneralSettings.tsx). A test that only changes one field could still be
//   blocked if the other field is empty/invalid. So each save helper fills
//   both inputs: a unique value for the field under test, and a stable valid
//   sentinel for the other field. afterAll restores the originals regardless.
// =============================================================================

import { expect, type Page } from '@playwright/test';
import type { SupabaseClient } from '@supabase/supabase-js';

// --- general_settings keys (mirror src/services/settingsService.ts) ----------
export const SETTING_KEY_FEEDBACK = 'feedback_form_url';
export const SETTING_KEY_VIDEO = 'map_drawing_video_url';

/** A clearly invalid URL: `new URL('not-a-valid-url')` throws -> validation error. */
export const INVALID_URL = 'not-a-valid-url';

/**
 * Stable valid URL used for the field NOT under test, so the save button's
 * "both URLs valid" requirement is always satisfied. These are never asserted
 * on; the per-run unique value is what each test verifies.
 */
const PLACEHOLDER_VIDEO_URL = 'https://www.youtube.com/embed/e2e-placeholder-video';
const PLACEHOLDER_FEEDBACK_URL =
  'https://docs.google.com/forms/d/e/e2e-placeholder-feedback/viewform?embedded=true';

/** Iframe src polling timeout — the pages fetch the setting from Supabase on mount. */
const IFRAME_SRC_TIMEOUT = 15000;

// -----------------------------------------------------------------------------
// Snapshot + restore (read-then-restore) — backs afterAll so the suite leaves
// the settings rows exactly as it found them.
// ----------------------------------------------------------------------------

export interface SettingsSnapshot {
  feedbackFormUrl: string | null;
  mapDrawingVideoUrl: string | null;
}

export interface RestoreResult {
  /** Non-fatal error messages — restore is best-effort and never throws. */
  errors: string[];
}

/**
 * Read the current values of the two settings this suite may mutate. Used in
 * beforeAll to snapshot the prior state. A missing row and an empty value both
 * surface as `null` (matching how the app's SettingsService treats them).
 */
export async function readSettingsSnapshot(
  client: SupabaseClient
): Promise<SettingsSnapshot> {
  const { data, error } = await client
    .from('general_settings')
    .select('key, value')
    .in('key', [SETTING_KEY_FEEDBACK, SETTING_KEY_VIDEO]);

  if (error) {
    throw new Error(`readSettingsSnapshot: ${error.message}`);
  }

  const byKey = new Map<string, string>();
  for (const row of data ?? []) {
    const r = row as { key: string; value: string | null };
    byKey.set(r.key, r.value ?? '');
  }

  const get = (key: string): string | null => {
    const v = byKey.get(key);
    // Treat missing row or empty string as null (matches app semantics).
    return v === undefined || v === '' ? null : v;
  };

  return {
    feedbackFormUrl: get(SETTING_KEY_FEEDBACK),
    mapDrawingVideoUrl: get(SETTING_KEY_VIDEO),
  };
}

/**
 * Restore the two settings rows to their snapshot values. Best-effort: collects
 * errors instead of throwing, so afterAll never fails the run.
 *
 *  - Non-empty original -> upsert the original value back.
 *  - Null/empty original -> delete the row, returning it to "not configured".
 */
export async function restoreSettings(
  client: SupabaseClient,
  snapshot: SettingsSnapshot
): Promise<RestoreResult> {
  const errors: string[] = [];
  const entries: Array<[string, string | null]> = [
    [SETTING_KEY_FEEDBACK, snapshot.feedbackFormUrl],
    [SETTING_KEY_VIDEO, snapshot.mapDrawingVideoUrl],
  ];

  for (const [key, value] of entries) {
    try {
      if (value && value.trim() !== '') {
        const { error } = await client
          .from('general_settings')
          .upsert({ key, value }, { onConflict: 'key' });
        if (error) throw new Error(error.message);
      } else {
        // Original was unset/empty -> remove the row so we leave no residue.
        const { error } = await client.from('general_settings').delete().eq('key', key);
        if (error) throw new Error(error.message);
      }
    } catch (e) {
      errors.push(`${key}: ${formatError(e)}`);
    }
  }

  return { errors };
}

// -----------------------------------------------------------------------------
// URL builders — per-run unique so an iframe src assertion can prove the new
// value propagated (the identifier appears nowhere else). The `E2E-SETTINGS-`
// marker makes the value identifiable in the DB if an owner inspects it.
// ----------------------------------------------------------------------------

let urlCounter = 0;
const runToken = (): string => `${Date.now()}-${process.pid ?? 'np'}-${urlCounter++}`;

/** A valid Google-Forms-shaped embed URL unique to this run (for the feedback field). */
export function uniqueFeedbackUrl(tag: string): string {
  return `https://docs.google.com/forms/d/e/E2E-SETTINGS-${tag}-${runToken()}/viewform?embedded=true`;
}

/** A valid YouTube embed URL unique to this run (for the video field). */
export function uniqueVideoUrl(tag: string): string {
  return `https://www.youtube.com/embed/E2E-SETTINGS-${tag}-${runToken()}`;
}

// -----------------------------------------------------------------------------
// UI-drive helpers
// ----------------------------------------------------------------------------

/**
 * Open the admin GeneralSettings tab. Uses `?section=settings` (read by
 * AdminPage on mount) to avoid depending on locale-sensitive tab labels.
 * `loginAdmin` must have already established the admin session.
 */
export async function openAdminSettingsTab(page: Page): Promise<void> {
  await page.goto('/admin?section=settings');
  // The form renders a spinner while loading; wait for both inputs to attach.
  await page.getByTestId('feedback-url-input').waitFor({ state: 'visible', timeout: 15000 });
  await page.getByTestId('video-url-input').waitFor({ state: 'visible', timeout: 15000 });
}

/**
 * Fill both URL inputs and click save, asserting the success toast. The field
 * under test gets `value`; the other gets a stable valid sentinel so the save
 * button's "both URLs valid" guard is satisfied.
 */
async function saveSettingsViaUI(
  page: Page,
  fields: { feedbackUrl: string; videoUrl: string }
): Promise<void> {
  await openAdminSettingsTab(page);

  await page.getByTestId('video-url-input').fill(fields.videoUrl);
  await page.getByTestId('feedback-url-input').fill(fields.feedbackUrl);

  const saveButton = page.getByTestId('settings-save-button');
  // Web-first: auto-retries until React flips the button enabled.
  await expect(saveButton).toBeEnabled({ timeout: 10000 });
  await saveButton.click();

  // The global Notification component renders data-testid="settings-saved-toast"
  // (src/components/common/Notification.tsx) once the upsert round-trips.
  await expect(page.getByTestId('settings-saved-toast')).toBeVisible({
    timeout: IFRAME_SRC_TIMEOUT,
  });
}

/** Save a feedback URL (the field under test); pins the video field to a sentinel. */
export async function saveFeedbackUrlViaUI(page: Page, feedbackUrl: string): Promise<void> {
  await saveSettingsViaUI(page, { feedbackUrl, videoUrl: PLACEHOLDER_VIDEO_URL });
}

/** Save a video URL (the field under test); pins the feedback field to a sentinel. */
export async function saveVideoUrlViaUI(page: Page, videoUrl: string): Promise<void> {
  await saveSettingsViaUI(page, { videoUrl, feedbackUrl: PLACEHOLDER_FEEDBACK_URL });
}

// -----------------------------------------------------------------------------
// Verification helpers — navigate to the consumer page and read back the
// embedded iframe src, proving the saved setting propagated end-to-end.
// ----------------------------------------------------------------------------

/**
 * Navigate to /feedback and return the Google-Form iframe's `src`. The iframe
 * only renders once SettingsService resolves a non-null feedback URL, so we
 * web-first-wait for a non-empty src.
 */
export async function getFeedbackIframeSrc(page: Page): Promise<string | null> {
  await page.goto('/feedback');
  await page.getByTestId('feedback-page').waitFor({ state: 'visible', timeout: 15000 });
  await waitForNonEmptyIframeSrc(page);
  return await page.locator('iframe').first().getAttribute('src');
}

/**
 * Navigate to /map-drawing and return the video iframe's `src`. The page shows
 * a spinner then (with a saved URL) the iframe; we wait for a non-empty src.
 */
export async function getMapDrawingVideoSrc(page: Page): Promise<string | null> {
  await page.goto('/map-drawing');
  await waitForNonEmptyIframeSrc(page);
  return await page.locator('iframe').first().getAttribute('src');
}

/** Wait until at least one iframe on the page has a non-empty `src`. */
async function waitForNonEmptyIframeSrc(page: Page): Promise<void> {
  await expect(page.locator('iframe').first()).toHaveAttribute('src', /.+/, {
    timeout: IFRAME_SRC_TIMEOUT,
  });
}

/**
 * Dismiss any visible notification so the generic `settings-saved-toast`
 * testid (which the global Notification component reuses for EVERY toast
 * type) cannot contaminate a later "no toast" assertion. No-op when none is
 * showing. Used by the validation test before its `toHaveCount(0)` check.
 */
export async function dismissLingeringToast(page: Page): Promise<void> {
  const toast = page.getByTestId('settings-saved-toast');
  if ((await toast.count()) === 0) return;
  // The Notification close button (src/components/common/Notification.tsx).
  const close = page.getByRole('button', { name: 'Close notification' });
  if (await close.isVisible().catch(() => false)) {
    await close.click().catch(() => {});
  }
  // Wait for the (animated) toast to leave the DOM.
  await expect(toast).toHaveCount(0, { timeout: 5000 }).catch(() => {});
}

// -----------------------------------------------------------------------------

function formatError(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
