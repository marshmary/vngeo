-- ============================================================================
-- Storage RLS policies (seed-time — applied AFTER storage-api is healthy)
-- ============================================================================
-- The SAME 4 policies as init/05-storage-policies.sql, but applied here because
-- the storage-api service CLOBBERS them on its first boot.
--
-- WHY DUPLICATE / WHY NOT JUST FIX 05-:
-- init/05-storage-policies.sql runs at db-init time (before any service boots)
-- and creates these 4 policies on storage.objects. Then supabase/storage-api
-- starts, runs its OWN first-boot migrations, and re-owns the storage schema —
-- including dropping/recreating storage.objects and its policies to add the
-- columns it needs (public, file_size_limit, allowed_mime_types). That wipes
-- whatever 05 created. So policies defined at init time do not survive to
-- runtime. This is the same "service owns its schema" race that applies to
-- auth.users (GoTrue) and the documents bucket itself.
--
-- The seed compose service runs AFTER storage-api is healthy
-- (depends_on: storage: service_healthy), so applying the policies here is
-- durable: storage-api has already done its clobbering. The policies then
-- persist across restarts (storage-api only re-migrates on first boot of a
-- fresh db volume, which is exactly when the seed re-runs too).
--
-- Idempotent: DROP IF EXISTS before CREATE, safe to re-run.
-- ============================================================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

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
