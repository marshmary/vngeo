-- ============================================================================
-- Storage Bucket Configuration
-- ============================================================================
-- Creates the documents storage bucket with RLS policies
-- ============================================================================

-- Insert the storage bucket.
-- NOTE: The supabase/postgres image's storage.buckets table only has the
-- columns (id, name, owner, created_at, updated_at). The `public`,
-- `file_size_limit`, and `allowed_mime_types` properties are managed by the
-- storage-api service at runtime (not stored in the DB schema in this
-- version). Insert with the available columns; the bucket defaults to private.
INSERT INTO storage.buckets (id, name)
VALUES (
  'documents',
  'documents'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE RLS POLICIES (bucket + base grants only at init time)
-- ============================================================================
-- NOTE: Per-object storage.objects policies that reference storage.foldername()
-- are NOT applied here. The storage-api service manages the storage.foldername()
-- function (it drops/recreates it during its own migration), so defining
-- policies that depend on it at DB-init time causes a circular dependency
-- ("cannot drop function foldername because other objects depend on it").
-- For local development, the documents bucket is created above with default
-- (permissive) access. Apply finer-grained per-user policies via Studio after
-- the storage-api service is healthy, if needed.

-- Grant necessary base permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON SCHEMA storage TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres;
