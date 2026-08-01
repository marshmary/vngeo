-- ============================================================================
-- Storage RLS Policies (init-time — INTENT; clobbered by storage-api at boot)
-- ============================================================================
-- ⚠️  These 4 policies are RE-APPLIED at seed time by
--    supabase-volumes/db/seed/08-storage-policies.sql, which is the version
--    that actually takes effect. This file is kept as a statement of intent
--    and runs first (best-effort), but storage-api wipes storage.objects'
--    policies during its first-boot migrations, so whatever this file creates
--    does NOT survive to runtime. The seed service applies them again AFTER
--    storage-api is healthy — that's the durable copy.
--
-- Mirrors the storage.objects RLS policies from the live Supabase project
-- (bfahqobxbuobifkfedzw) so local development matches production access
-- control. Without these (at runtime), authenticated uploads fail with:
--   "new row violates row-level security policy" (StorageApiError).
--
-- WHY THIS GETS CLOBBERED:
-- This file runs at db-init time (before any service boots). Then
-- supabase/storage-api starts, runs its OWN first-boot migrations, and
-- re-owns the storage schema — dropping/recreating storage.objects and its
-- policies to add the columns it needs (public, file_size_limit,
-- allowed_mime_types). Same "service owns its schema" race that applies to
-- auth.users (GoTrue) and the documents bucket itself.
--
-- The policies reference only `bucket_id` and `auth.jwt()` — they do NOT
-- depend on `storage.foldername()`, so they are syntactically safe here.
-- They just don't persist. See 08-storage-policies.sql for the durable copy.
--
-- NOTE on the bucket `public` flag: prod has `documents.public = true`, but
-- that column is added by the storage-api service at runtime (not present in
-- the DB schema at init time — see 03-storage.sql). It therefore cannot be
-- set here. Set it once via Studio (Storage > documents > Edit bucket >
-- Public = on) after first boot, if you need anon public-URL access.
--
-- Source: prod pg_policies dump, snapshot 2025-10.
-- ============================================================================

-- Ensure RLS is enabled on storage.objects (idempotent; matches prod).
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies so this file is re-runnable / idempotent.
DROP POLICY IF EXISTS "Allow authenticated users to read"   ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to delete"         ON storage.objects;
DROP POLICY IF EXISTS "Give anon users read access"         ON storage.objects;

-- Authenticated users can read any object in the documents bucket.
CREATE POLICY "Allow authenticated users to read"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

-- Authenticated users can upload to the documents bucket.
-- This is the policy that fixes the createFolder/upload 403 error.
CREATE POLICY "Allow authenticated users to upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- Admins (role = 'admin' in user_metadata OR app_metadata) can delete objects.
CREATE POLICY "Allow admin users to delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

-- Anon users can read the documents bucket (mirrors prod's public-bucket behaviour).
CREATE POLICY "Give anon users read access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'documents' AND auth.role() = 'anon');
