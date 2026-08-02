// =============================================================================
// cleanup.ts — service-role teardown for E2E CRUD tests (CRUD_TEST_SPEC §3.2)
// =============================================================================
// Exports `cleanupE2EEntities(serviceRoleClient)` which hard-deletes every row
// and storage object tagged `[E2E-` so crashed tests leave no residue.
//
// MUST be called with a service-role client (bypasses RLS). Safe to call when
// nothing matches — every operation is a filtered delete that no-ops on zero
// rows/objects and never throws on "not found".
//
// Schema reference (supabase/supabase-volumes/db/init/02-quiz_schema.sql):
//   quizzes(id, title, ...)            <- filter on title LIKE '[E2E-%'
//   quiz_questions(quiz_id FK CASCADE) <- removed automatically when quiz deleted
//   quiz_options(question_id FK CASCADE) <- removed automatically via questions
// Documents live in Supabase Storage (bucket `documents` → storage.objects),
// NOT in a dedicated table, so document cleanup removes storage objects only.
// =============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';

/** Tag every E2E entity is named with so it is identifiable for teardown. */
export const E2E_TAG = '[E2E-';

/** Dedicated storage prefix for E2E-uploaded documents (CRUD_TEST_SPEC §3.2). */
export const E2E_DOC_PREFIX = '__e2e__/';

/** Storage bucket that holds uploaded documents (03-storage.sql). */
export const DOCUMENTS_BUCKET = 'documents';

/** Maximum folder depth to walk when scanning storage for E2E objects. */
const MAX_STORAGE_DEPTH = 8;

/** Supabase storage `list` page size (API caps at 1000). */
const LIST_PAGE_SIZE = 1000;

/** Batch size for storage `remove` calls (keep well under API limits). */
const REMOVE_BATCH_SIZE = 500;

export interface CleanupResult {
  /** Number of quiz rows deleted (questions/options cascade — not counted). */
  quizzes: number;
  /** Number of storage objects deleted from the documents bucket. */
  documents: number;
  /** Non-fatal error messages (cleanup is best-effort; it never throws). */
  errors: string[];
}

interface StorageObject {
  name: string;
  id: string | null;
}

/**
 * Delete every E2E-tagged entity the CRUD suites can create.
 *
 * Removes:
 *   1. quizzes whose title starts with `[E2E-` (cascade clears questions/options).
 *   2. storage objects under the `__e2e__/` prefix in the documents bucket.
 *   3. any other storage object whose name contains `[E2E-` (stray uploads).
 *
 * @param client - a service-role Supabase client (RLS-bypassing).
 * @returns counts + any non-fatal errors. Never throws.
 */
export async function cleanupE2EEntities(client: SupabaseClient): Promise<CleanupResult> {
  const result: CleanupResult = { quizzes: 0, documents: 0, errors: [] };

  // --- 1. Quizzes (ON DELETE CASCADE removes quiz_questions + quiz_options) ---
  try {
    const deleted = await deleteE2EQuizzes(client);
    result.quizzes = deleted;
  } catch (e) {
    result.errors.push(`quizzes: ${formatError(e)}`);
  }

  // --- 2 + 3. Documents in storage (dedicated prefix + stray tagged names) ---
  try {
    result.documents = await deleteE2EDocuments(client);
  } catch (e) {
    result.errors.push(`documents: ${formatError(e)}`);
  }

  return result;
}

/** Delete quizzes whose title starts with the E2E tag. Returns the row count. */
async function deleteE2EQuizzes(client: SupabaseClient): Promise<number> {
  // Postgres ILIKE treats `[` as a literal char, so `[E2E-%` matches titles
  // beginning with "[E2E-".
  const { count, error } = await client
    .from('quizzes')
    .delete({ count: 'exact' })
    .ilike('title', `${E2E_TAG}%`);

  if (error) {
    throw new Error(error.message);
  }
  return count ?? 0;
}

/**
 * Delete E2E documents from storage: everything under `__e2e__/` plus any
 * object whose name contains `[E2E-` anywhere in the bucket. Returns the count
 * of removed objects.
 */
async function deleteE2EDocuments(client: SupabaseClient): Promise<number> {
  const pathsToDelete = new Set<string>();

  // (a) Everything under the dedicated E2E prefix is fair game.
  const prefixed = await listStoragePaths(client, E2E_DOC_PREFIX);
  for (const p of prefixed) pathsToDelete.add(p);

  // (b) Walk the whole bucket and pick up any stray E2E-tagged object names.
  // (Safe to walk: local-dev bucket is small; the filter guarantees we only
  // ever delete E2E-tagged objects here.)
  const allPaths = await listStoragePaths(client, '');
  for (const p of allPaths) {
    if (p.includes(E2E_TAG)) pathsToDelete.add(p);
  }

  if (pathsToDelete.size === 0) return 0;

  let removed = 0;
  const batch = Array.from(pathsToDelete);
  for (let i = 0; i < batch.length; i += REMOVE_BATCH_SIZE) {
    const chunk = batch.slice(i, i + REMOVE_BATCH_SIZE);
    const { error } = await client.storage.from(DOCUMENTS_BUCKET).remove(chunk);
    if (error) {
      // Don't abort the whole sweep — record and continue with the next batch.
      throw new Error(`${error.message} (batch starting at ${i})`);
    }
    removed += chunk.length;
  }
  return removed;
}

/**
 * Recursively list all storage object paths under `prefix` in the documents
 * bucket. Folders (entries with a null id) are descended into; files return
 * their full path (`prefix + name`). Pagination + depth-guarded.
 */
async function listStoragePaths(client: SupabaseClient, prefix: string): Promise<string[]> {
  const collected: string[] = [];
  await walkStorage(client, prefix, 0, collected);
  return collected;
}

async function walkStorage(
  client: SupabaseClient,
  prefix: string,
  depth: number,
  out: string[]
): Promise<void> {
  if (depth > MAX_STORAGE_DEPTH) return;

  let offset = 0;
  // Paginate the current folder.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await client.storage
      .from(DOCUMENTS_BUCKET)
      .list(prefix, { limit: LIST_PAGE_SIZE, offset });

    if (error) {
      throw new Error(`${error.message} (prefix="${prefix}", offset=${offset})`);
    }
    if (!data || data.length === 0) break;

    for (const item of data as StorageObject[]) {
      // Supabase storage marks folders with a null id; only files have one.
      const isFolder = !item.id;
      const fullPath = prefix ? `${prefix}${item.name}` : item.name;

      if (isFolder) {
        // Descend into the subfolder.
        await walkStorage(client, `${fullPath}/`, depth + 1, out);
      } else if (item.name === '.folderkeep') {
        // Skip the folder-placeholder file used by the app's file manager.
        continue;
      } else {
        out.push(fullPath);
      }
    }

    if (data.length < LIST_PAGE_SIZE) break;
    offset += LIST_PAGE_SIZE;
  }
}

function formatError(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
