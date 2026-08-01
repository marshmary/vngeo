-- ============================================================================
-- Local development seed data
-- ============================================================================
-- Creates default test users (admin + regular) for the local Supabase instance
-- so that after `docker compose down -v && up` you can immediately log in
-- without re-running the signup flow or manually promoting users.
--
-- Idempotent: safe to re-run. Uses fixed UUIDs and ON CONFLICT upserts so the
-- credentials are stable across volume resets.
--
-- == Credentials (LOCAL DEV ONLY — never use these in production) ==
--   Admin:    admin@vngeo.local     / AdminPass123!
--   Regular:  user@vngeo.local      / UserPass123!
--
-- The admin user's role is stored in `raw_app_meta_data`, which GoTrue bakes
-- into the JWT at login. The frontend (`authService.ts`) and the storage RLS
-- policies both check `app_metadata.role = 'admin'`.
--
-- WHY DIRECT INSERT IS OK LOCALLY:
-- GoTrue owns `auth.users`, but on a self-hosted local instance the DB has no
-- Admin API gating. The community-documented pattern (see laros.io, the
-- Supabase local-dev guides) is to INSERT directly with a `crypt()`-hashed
-- password. GoTrue verifies the bcrypt hash on login. This is local-dev only;
-- on hosted Supabase you must use the Auth Admin API instead.
--
-- REQUIREMENTS:
--  - The `pgcrypto` extension (for `crypt()` / `gen_salt()`). It ships with the
--    supabase/postgres image and is created by the base schema, but we create
--    it IF NOT EXISTS here to be safe.
--  - The auth.users table (created by GoTrue's first-boot migration). Because
--    this file runs at DB-init time — BEFORE GoTrue has run its migrations —
--    we CANNOT reference auth.users yet. This script is therefore meant to be
--    run AFTER first boot (see docs/local-development.md), OR you can wire it
--    into the db container as an init script and run it manually once GoTrue
--    is healthy. See the comment block at the bottom of this file.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Admin user
-- ---------------------------------------------------------------------------
-- NOTE: in GoTrue >= v2.x, `confirmed_at` is a GENERATED column
-- (`GENERATED ALWAYS AS LEAST(email_confirmed_at, phone_confirmed_at) STORED`),
-- so it CANNOT be inserted into. Set `email_confirmed_at` instead; the
-- generated `confirmed_at` is derived automatically.
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  "role",
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  -- GoTrue scans these token/text columns as Go `string` (not sql.NullString),
  -- so NULL breaks login with "Database error querying schema" /
  -- "converting NULL to string is unsupported". The columns are nullable in
  -- DDL but GoTrue expects ''. Phone columns are LEFT NULL — `phone` has a
  -- UNIQUE constraint (users_phone_key), so '' would collide across users.
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  reauthentication_token,
  is_sso_user,
  is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'admin@vngeo.local',
  crypt('AdminPass123!', gen_salt('bf')),
  now(),
  '{"role":"admin","provider":"email","providers":["email"]}'::jsonb,
  '{"username":"admin"}'::jsonb,
  now(),
  now(),
  '', '', '', '', '', '',  false, false
)
-- auth.users has a partial unique INDEX on email (WHERE deleted_at IS NULL),
-- not a plain unique constraint, so ON CONFLICT (email) is rejected with
-- "no unique or exclusion constraint matching the ON CONFLICT specification".
-- The PK on `id` is the correct upsert target — and the seed uses fixed UUIDs,
-- so re-runs converge to the same rows.
ON CONFLICT (id) DO UPDATE SET
  encrypted_password          = EXCLUDED.encrypted_password,
  raw_app_meta_data           = EXCLUDED.raw_app_meta_data,
  email_confirmed_at          = EXCLUDED.email_confirmed_at,
  confirmation_token          = EXCLUDED.confirmation_token,
  recovery_token              = EXCLUDED.recovery_token,
  email_change_token_new      = EXCLUDED.email_change_token_new,
  email_change                = EXCLUDED.email_change,
  email_change_token_current  = EXCLUDED.email_change_token_current,
  reauthentication_token      = EXCLUDED.reauthentication_token,
  is_sso_user                 = EXCLUDED.is_sso_user,
  is_anonymous                = EXCLUDED.is_anonymous,
  updated_at                  = now();

-- ---------------------------------------------------------------------------
-- 2. Regular (non-admin) user
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  "role",
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  reauthentication_token,
  is_sso_user,
  is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-4000-8000-000000000002',
  'authenticated',
  'authenticated',
  'user@vngeo.local',
  crypt('UserPass123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"username":"user"}'::jsonb,
  now(),
  now(),
  '', '', '', '', '', '',  false, false
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password          = EXCLUDED.encrypted_password,
  raw_app_meta_data           = EXCLUDED.raw_app_meta_data,
  email_confirmed_at          = EXCLUDED.email_confirmed_at,
  confirmation_token          = EXCLUDED.confirmation_token,
  recovery_token              = EXCLUDED.recovery_token,
  email_change_token_new      = EXCLUDED.email_change_token_new,
  email_change                = EXCLUDED.email_change,
  email_change_token_current  = EXCLUDED.email_change_token_current,
  reauthentication_token      = EXCLUDED.reauthentication_token,
  is_sso_user                 = EXCLUDED.is_sso_user,
  is_anonymous                = EXCLUDED.is_anonymous,
  updated_at                  = now();

-- ---------------------------------------------------------------------------
-- 3. (documents seeded separately)
-- ---------------------------------------------------------------------------
-- The documents bucket is populated by the seed service uploading the 32 real
-- production PDFs (from supabase-volumes/storage-seed/documents/) — see
-- seed-runner.mjs step 4. No placeholder folder is needed here; the upload
-- includes real .folderkeep markers in every folder. (A previous version of
-- this file inserted a synthetic sample-folder row, but that used
-- gen_random_uuid() for the id, making ON CONFLICT (id) ineffective against
-- the (bucket_id, name) unique constraint on re-runs.)

-- ---------------------------------------------------------------------------
-- Verification (run from Studio SQL Editor to confirm)
-- ---------------------------------------------------------------------------
-- SELECT email,
--        raw_app_meta_data->>'role' AS role,
--        confirmed_at IS NOT NULL   AS email_confirmed
--   FROM auth.users
--  ORDER BY email;
--
-- Expected:
--   admin@vngeo.local | admin | true
--   user@vngeo.local  |        | true

-- ============================================================================
-- HOW THIS FILE IS APPLIED
-- ============================================================================
-- It is NOT a docker-entrypoint init script (those run before GoTrue, when
-- auth.users doesn't exist yet). Instead, the `seed` compose service
-- (supabase-volumes/seed/seed-runner.mjs) waits for GoTrue to create
-- auth.users, then applies this file followed by 07-seed-content.sql.
--
-- The seed service runs once per fresh sentinel volume (see docker-compose.yml
-- → seed → volumes → supabase-seed-sentinel), so the whole stack is ready
-- after a single `docker compose up -d` with no host-side bash.
--
-- To apply manually instead (e.g. iterating without re-running the whole seed):
--   docker exec -i supabase-db psql -U supabase_admin -d postgres \
--     < supabase-volumes/db/seed/06-seed-users.sql
-- Idempotent — safe to re-run.
-- ============================================================================
