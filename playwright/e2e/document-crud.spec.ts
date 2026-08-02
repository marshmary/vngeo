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
// bracket-free `e2e-doc-` prefix and reaped in afterAll. Note Supabase Storage
// rejects `[` `]` in object keys (HTTP 400 "Invalid key"), so document uploads
// CANNOT use the `[E2E-` bracket tag the shared cleanupE2EEntities() matches;
// afterAll runs BOTH the shared sweep AND cleanupRootE2eDocs() (which targets
// the `e2e-doc-` prefix). Both are hard, best-effort, and no-op when nothing
// matches.
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
  cleanupRootE2eDocs,
  deleteFileByName,
  e2eDocName,
  E2E_DOC_NAME_PREFIX,
  getOversizeBuffer,
  getSamplePdfBuffer,
  hasAdminCredentials,
  loginAndOpenFilesTab,
  uploadDocumentViaUI,
} from '../support/crud/document-crud-helpers';

test.describe('Document CRUD — §4.2 (upload / delete / validation)', () => {
  // Run serially in a single worker. These tests share mutable state (the
  // `documents` storage bucket) and rely on ONE afterAll safety-net sweep
  // (cleanupE2EEntities + cleanupRootE2eDocs). Under fullyParallel + multiple
  // workers, afterAll fires once PER WORKER, and a fast worker's sweep deletes
  // the upload test's still-needed file while the upload test (in another
  // worker) is asserting it on the public documents page — a cross-worker
  // teardown race. Serial mode collapses to one worker / one afterAll at the
  // very end, matching the suite's shared-state + safety-net design.
  test.describe.configure({ mode: 'serial' });

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
  //
  // Two sweeps: (1) the shared cleanupE2EEntities() safety-net for any `[E2E-`
  // bracket-tagged rows/objects, and (2) cleanupRootE2eDocs() for THIS suite's
  // bracket-free `e2e-doc-` root uploads — Supabase Storage rejects `[` `]` in
  // object keys (HTTP 400 "Invalid key"), so document uploads cannot use the
  // bracket tag and need their own service-role sweep. See CRUD_DEBUG_SPEC §4.
  test.afterAll(async () => {
    const client = createServiceRoleClient();
    if (!client) return; // no service-role key => cannot sweep (CRUD gate keeps this rare)
    const result = await cleanupE2EEntities(client);
    const docsRemoved = await cleanupRootE2eDocs(client);
    // eslint-disable-next-line no-console
    console.log('[document-crud] afterAll cleanup:', result, 'rootE2eDocs:', docsRemoved);
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

    // Intentionally NOT deleted in-test — the afterAll sweep reaps this
    // bracket-free `e2e-doc-` object as the safety net (CRUD_TEST_SPEC §3.2).
    expect(name).toContain(E2E_DOC_NAME_PREFIX);
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
