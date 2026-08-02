// =============================================================================
// document-crud-helpers.ts — private UI-drive helpers for the document CRUD
// suite (CRUD_TEST_SPEC.md §4.2). These drive the admin file manager
// (FileManager / FileUpload / FileCard) and the public DocumentsPage through
// the real UI so the write path is covered end-to-end.
// =============================================================================
// Ownership: document-crud.spec.ts ONLY. Do not import from other suites.
//
// Assumptions baked in (verified against the source):
//   - The admin file manager uploads to the Supabase `documents` bucket at the
//     current path (root by default). Root-level uploads surface on the public
//     DocumentsPage under the synthetic "General" folder.
//   - Client-side validation lives in FileUpload (oversize => alert()) backed
//     by DocumentService.getMaxFileSizeBytes(), which reads
//     VITE_SUPABASE_MAX_FILE_SIZE (default 50MB = 52428800). The
//     VITE_MAX_DOCUMENT_SIZE / VITE_ALLOWED_FILE_TYPES vars declared in
//     .env.local are NOT consumed by the code, so there is no client-side
//     file-TYPE check (see the fixme test in the spec).
//   - Deletion uses a native confirm() dialog (FileManager.handleDelete).
// =============================================================================

import { expect, type Locator, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loginAdmin } from '../helpers/auth-helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Absolute path to the small, structurally-valid PDF fixture. */
export const SAMPLE_PDF_PATH = path.resolve(__dirname, '..', 'fixtures', 'sample.pdf');

/**
 * Effective client-side size cap, in bytes. DocumentService reads
 * VITE_SUPABASE_MAX_FILE_SIZE (default 52428800 = 50MB); .env.local sets the
 * same value. The oversize test must exceed THIS, not the unused
 * VITE_MAX_DOCUMENT_SIZE (5MB) declared in .env.local.
 */
export const EFFECTIVE_MAX_FILE_SIZE_BYTES = 52_428_800;

/** One byte over the cap — guaranteed to trip FileUpload's alert. */
export const OVERSIZE_BYTES = EFFECTIVE_MAX_FILE_SIZE_BYTES + 1;

/** Required admin credentials (TEST_ADMIN_* from playwright/.env / env). */
export function adminCredentials(): { email: string; password: string } {
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD must be set for document CRUD tests'
    );
  }
  return { email, password };
}

/** True when the admin credentials env vars are present. */
export const hasAdminCredentials = (): boolean =>
  !!process.env.TEST_ADMIN_EMAIL && !!process.env.TEST_ADMIN_PASSWORD;

/**
 * Unique, cleanup-targetable file name. Every created storage object is named
 * `[E2E-doc-<label>-<stamp>-<rand>].pdf` so the `[E2E-` teardown sweep
 * (cleanupE2EEntities) catches it even from the bucket root.
 */
export function e2eDocName(label: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `[E2E-doc-${label}-${stamp}-${rand}].pdf`;
}

// --- memoized binary payloads ------------------------------------------------

let samplePdfBuffer: Buffer | null = null;
/** Read the sample.pdf fixture once and reuse across tests. */
export function getSamplePdfBuffer(): Buffer {
  if (!samplePdfBuffer) samplePdfBuffer = fs.readFileSync(SAMPLE_PDF_PATH);
  return samplePdfBuffer;
}

let oversizeBuffer: Buffer | null = null;
/** A buffer one byte over the client-side cap, allocated once. */
export function getOversizeBuffer(): Buffer {
  if (!oversizeBuffer) oversizeBuffer = Buffer.alloc(OVERSIZE_BYTES, 0);
  return oversizeBuffer;
}

// --- navigation --------------------------------------------------------------

/**
 * Log in as admin (via the shared loginAdmin helper) and land on the admin
 * file-manager tab. Resolves once the file-manager toolbar (upload button) is
 * visible — the file list itself loads asynchronously afterwards.
 */
export async function loginAndOpenFilesTab(page: Page): Promise<void> {
  await loginAdmin(page, adminCredentials());
  // The `section=files` query param makes AdminPage render the FileManager.
  await page.goto('/admin?section=files');
  await expect(page.getByTestId('document-upload-button')).toBeVisible({
    timeout: 15_000,
  });
}

// --- upload ------------------------------------------------------------------

/**
 * Drive the upload modal: open it, attach a buffer under an explicit (tagged)
 * name, submit, and wait for the modal to close (= upload + list refresh
 * settled). Returns the name it was uploaded under.
 *
 * The object form of setInputFiles lets us control the File.name precisely, so
 * the object lands in storage under a `[E2E-`-tagged key the teardown sweep can
 * find (the admin file manager uploads to the current/root path).
 */
export async function uploadDocumentViaUI(
  page: Page,
  opts: { name: string; buffer: Buffer; mimeType?: string }
): Promise<string> {
  const { name, buffer, mimeType = 'application/pdf' } = opts;

  await page.getByTestId('document-upload-button').click();
  // The file input is hidden by design (button-triggered). setInputFiles works
  // on hidden inputs, so wait for it to attach rather than assert visibility.
  const input = page.getByTestId('document-upload-input');
  await input.waitFor({ state: 'attached', timeout: 10_000 });

  await input.setInputFiles({ name, mimeType, buffer });

  // The selected-file row enables the submit button; if selection was rejected
  // (oversize), this assertion fails fast with a clear cause.
  const submit = page.getByTestId('document-upload-submit');
  await expect(submit).toBeEnabled();

  await submit.click();

  // handleUpload closes the modal after DocumentService.uploadFiles + loadFiles.
  // If the upload errors, the modal stays open and this times out — which is
  // the correct signal that the write did not succeed.
  await expect(input).toHaveCount(0);

  return name;
}

// --- assertions --------------------------------------------------------------

/** Assert a file/card with this name is visible in the admin file manager. */
export async function assertDocInAdminList(
  page: Page,
  name: string
): Promise<Locator> {
  const card = page.locator('[data-testid="file-card"]', { hasText: name });
  await expect(card).toBeVisible({ timeout: 15_000 });
  return card;
}

/**
 * Assert the file surfaces on the public documents page. Navigates fresh so the
 * DocumentsPageService re-fetches (forceRefresh on mount) instead of serving
 * its 5-minute cache.
 */
export async function assertDocOnDocumentsPage(
  page: Page,
  name: string
): Promise<void> {
  await page.goto('/documents');
  await expect(page.getByTestId('documents-page')).toBeVisible();
  await expect(
    page.locator('[data-testid="document-card"]', { hasText: name })
  ).toBeVisible({ timeout: 15_000 });
}

/** Assert a file/card with this name is absent from the admin file manager. */
export async function assertDocNotInAdminList(page: Page, name: string): Promise<void> {
  await expect(
    page.locator('[data-testid="file-card"]', { hasText: name })
  ).toHaveCount(0);
}

/** Assert the file is absent from the public documents page. */
export async function assertDocNotOnDocumentsPage(
  page: Page,
  name: string
): Promise<void> {
  await page.goto('/documents');
  await expect(page.getByTestId('documents-page')).toBeVisible();
  await expect(
    page.locator('[data-testid="document-card"]', { hasText: name })
  ).toHaveCount(0);
}

// --- delete ------------------------------------------------------------------

/**
 * Delete the file with the given name via the per-card menu, accepting the
 * native confirm() dialog, then assert the card is removed from the list.
 */
export async function deleteFileByName(page: Page, name: string): Promise<void> {
  const card = page.locator('[data-testid="file-card"]', { hasText: name });
  await expect(card).toBeVisible();
  const id = await card.getAttribute('data-file-id');
  if (!id) throw new Error(`file-card for "${name}" has no data-file-id`);

  // handleDelete() fires a native confirm(). Register a one-shot accept handler
  // BEFORE the triggering click so Playwright doesn't auto-dismiss the dialog.
  page.once('dialog', (d) => {
    void d.accept();
  });

  // The "..." menu toggle is opacity:0 until hover; hover the card to reveal it
  // (clicking also works, but hover removes any flake).
  await card.hover();
  await page.getByTestId(`file-menu-button-${id}`).click();
  await page.getByTestId(`document-delete-button-${id}`).click();

  // After deleteFile() + loadFiles(), the card is gone.
  await expect(card).toHaveCount(0);
}

// --- validation --------------------------------------------------------------

/**
 * Attempt to attach a file that is one byte over the client-side cap and assert
 * the upload step rejects it: the FileUpload shows an alert mentioning the size
 * limit and never adds the file to the selected-files list (submit stays
 * disabled, no row with the tagged name).
 */
export async function assertOversizeRejected(
  page: Page,
  name: string,
  buffer: Buffer
): Promise<void> {
  await page.getByTestId('document-upload-button').click();
  const input = page.getByTestId('document-upload-input');
  await expect(input).toBeVisible();

  // FileUpload.handleChange fires a native alert() for oversize files. Register
  // a one-shot handler BEFORE the action so Playwright doesn't auto-dismiss it;
  // capture the message so we can assert on it.
  let dialogMessage = '';
  page.once('dialog', async (d) => {
    dialogMessage = d.message();
    await d.accept();
  });

  await input.setInputFiles({ name, mimeType: 'application/pdf', buffer });

  // FileUpload.handleChange alert: "The following files exceed the <N>MB size
  // limit: ...".
  await expect
    .poll(() => dialogMessage, { timeout: 10_000 })
    .toMatch(/exceed|size limit|MB/i);

  // File was not selected — submit stays disabled and no row is rendered.
  await expect(page.getByTestId('document-upload-submit')).toBeDisabled();
  await expect(page.getByText(name)).toHaveCount(0);
}
