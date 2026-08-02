// =============================================================================
// document-crud.spec.ts — Document upload / delete / validation (CRUD_TEST_SPEC §4.2)
// =============================================================================
// Covers the admin write path for documents through the real UI:
//   1. upload a small fixture PDF  -> appears in admin file list + on /documents
//   2. delete an uploaded [E2E-] doc -> removed from admin list + /documents
//   3. validation: reject an oversize file at the upload step
//   4. validation: reject disallowed file types  (fixme — see note)
//
// Gating (CRUD_TEST_SPEC §3.1 / §6): every test is skipped unless
//   - TEST_RUN_CRUD_WRITE=1 (crudWriteEnabled fixture), AND
//   - TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD are set.
//
// Teardown (CRUD_TEST_SPEC §3.2): every created storage object is named with a
// `[E2E-doc-` prefix and reaped in afterAll via cleanupE2EEntities(serviceRole)
// — a hard, best-effort sweep that never throws and no-ops when nothing matches.
//
// NOTE: tests do NOT run in this environment — they require LOCAL Supabase
// (http://localhost:8000) running. Marked "pending validation against local
// Supabase".
// =============================================================================

import { test, expect, createServiceRoleClient } from '../support/fixtures';
import { cleanupE2EEntities } from '../support/helpers/cleanup';
import {
  assertDocInAdminList,
  assertDocNotInAdminList,
  assertDocNotOnDocumentsPage,
  assertDocOnDocumentsPage,
  assertOversizeRejected,
  deleteFileByName,
  e2eDocName,
  getOversizeBuffer,
  getSamplePdfBuffer,
  hasAdminCredentials,
  loginAndOpenFilesTab,
  uploadDocumentViaUI,
} from '../support/crud/document-crud-helpers';

test.describe('Document CRUD — §4.2 (upload / delete / validation)', () => {
  // --- gating ----------------------------------------------------------------
  // Write tests only run when (a) CRUD writes are opted-in, (b) admin creds are
  // present, and (c) a service-role key exists so afterAll can tear down. This
  // last check makes the "no residue" hard gate real — we never write without a
  // working cleanup path. (CRUD_TEST_SPEC §3.2 / §6.)
  test.beforeEach(async ({ crudWriteEnabled }) => {
    test.skip(!crudWriteEnabled, 'CRUD write tests disabled (set TEST_RUN_CRUD_WRITE=1)');
    test.skip(!hasAdminCredentials(), 'Skipping: TEST_ADMIN_* credentials not set');
    test.skip(createServiceRoleClient() === null, 'Skipping: SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set (no teardown)');
  });

  // --- hard-gate teardown: reap every [E2E-] storage object + row -------------
  // Runs once after the suite regardless of pass/skip/crash. When CRUD writes
  // are disabled, nothing was created and this is a cheap no-op.
  test.afterAll(async () => {
    const client = createServiceRoleClient();
    if (!client) return; // no service-role key => cannot sweep (CRUD gate keeps this rare)
    const result = await cleanupE2EEntities(client);
    // eslint-disable-next-line no-console
    console.log('[document-crud] afterAll cleanup:', result);
  });

  // ---------------------------------------------------------------- 1. upload
  test('uploads a PDF and it appears in the documents list', async ({ page }) => {
    await loginAndOpenFilesTab(page);

    const name = await uploadDocumentViaUI(page, {
      name: e2eDocName('upload'),
      buffer: getSamplePdfBuffer(),
    });

    // Admin file manager lists the newly uploaded object.
    await assertDocInAdminList(page, name);

    // Public documents page surfaces root uploads under the "General" folder.
    await assertDocOnDocumentsPage(page, name);

    // Intentionally NOT deleted in-test — the afterAll sweep reaps this [E2E-]
    // object as the safety net (CRUD_TEST_SPEC §3.2).
    expect(name).toContain('[E2E-');
  });

  // ---------------------------------------------------------------- 2. delete
  test('deletes an uploaded document and it is removed from the list', async ({ page }) => {
    await loginAndOpenFilesTab(page);

    // Create a dedicated victim within the test (full round-trip).
    const name = await uploadDocumentViaUI(page, {
      name: e2eDocName('delete'),
      buffer: getSamplePdfBuffer(),
    });
    await assertDocInAdminList(page, name);

    // Delete via the per-card menu (handles the native confirm() dialog).
    await deleteFileByName(page, name);

    // Gone from the admin file manager.
    await assertDocNotInAdminList(page, name);

    // Gone from the public documents page.
    await assertDocNotOnDocumentsPage(page, name);
  });

  // --------------------------------------------- 3. validation: oversize file
  test('rejects an oversize file at the upload step', async ({ page }) => {
    await loginAndOpenFilesTab(page);

    // One byte over the effective client-side cap (VITE_SUPABASE_MAX_FILE_SIZE,
    // default 50MB). FileUpload shows an alert and never selects the file.
    await assertOversizeRejected(page, e2eDocName('oversize'), getOversizeBuffer());
  });

  // ----------------------------------------- 4. validation: disallowed type
  // FIXME: VITE_ALLOWED_FILE_TYPES is declared in .env.local but is NOT consumed
  // by FileUpload or DocumentService — there is no client-side file-type check
  // to drive. Adding that validation is an app-code change beyond this suite's
  // add-only-testid scope. The intended flow is sketched below so un-fixme-ing
  // it is trivial once the UI enforces allowed types.
  test.fixme('rejects disallowed file types', async ({ page }) => {
    await loginAndOpenFilesTab(page);

    const name = e2eDocName('wrongtype');
    await uploadDocumentViaUI(page, {
      name,
      mimeType: 'text/plain',
      buffer: Buffer.from('not an allowed type', 'utf8'),
    });

    // Once type validation exists, the disallowed file must not appear.
    await expect(page.locator('[data-testid="file-card"]', { hasText: name })).toHaveCount(0);
  });
});
