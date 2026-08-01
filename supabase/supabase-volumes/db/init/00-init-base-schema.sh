#!/bin/bash
# ============================================================================
# Base Supabase schema bootstrap
# ============================================================================
# The supabase/postgres image ships its base schema (auth/storage schemas,
# authenticator role, etc.) as SQL files under /docker-entrypoint-initdb.d/
# in the `init-scripts/` and `migrations/` subdirectories. The stock postgres
# docker-entrypoint.sh only globs the TOP LEVEL of initdb.d (non-recursive),
# so those subdirectory scripts are never applied automatically — and the
# image's migrate.sh requires `dbmate` which is not present in this image.
#
# This script is a top-level *.sh file, so the entrypoint DOES execute it. It
# applies the image's base init-scripts/*.sql files directly via psql so the
# auth/storage schemas and roles exist before the app migrations run. The app
# migrations (01-04) are ordered to run afterwards (sort after 00-).
# ============================================================================
set -e

# The supabase/postgres image uses `supabase_admin` as its superuser, but the
# base schema SQL files (shipped under init-scripts/) grant privileges to a
# `postgres` role. Connect as the actual superuser and create a `postgres`
# superuser alias so those grants resolve.
ADMIN_USER="supabase_admin"
echo "[00-init-base-schema] Ensuring 'postgres' superuser role exists..."
psql -v ON_ERROR_STOP=1 -U "$ADMIN_USER" -d "$POSTGRES_DB" <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
    CREATE ROLE postgres WITH SUPERUSER LOGIN;
  END IF;
END$$;
SQL

echo "[00-init-base-schema] Applying Supabase base init-scripts/*.sql..."

# Apply the image's base schema files in filename order. These create the
# initial roles (anon/authenticated/service_role/authenticator/supabase_*_admin),
# the auth schema (tables + helper functions), and the storage schema.
for sql in /docker-entrypoint-initdb.d/init-scripts/*.sql; do
  echo "[00-init-base-schema] applying $(basename "$sql")"
  psql -v ON_ERROR_STOP=1 -U "$ADMIN_USER" -d "$POSTGRES_DB" -f "$sql"
done

# The auth helper functions (uid, role, email, ...) are created by the base
# schema owned by supabase_admin, but GoTrue (which connects as
# supabase_auth_admin) expects to OWN them so it can REPLACE them during its
# first-boot migrations. Without this, GoTrue fails with
# "must be owner of function <name>" (42501). Transfer ownership of ALL
# functions in the auth schema to supabase_auth_admin so GoTrue can manage them.
echo "[00-init-base-schema] Transferring auth schema ownership to supabase_auth_admin..."
psql -v ON_ERROR_STOP=1 -U "$ADMIN_USER" -d "$POSTGRES_DB" <<'SQL'
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN SELECT p.oid FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid WHERE n.nspname='auth'
  LOOP
    EXECUTE format('ALTER FUNCTION %s OWNER TO supabase_auth_admin', fn.oid::regprocedure);
  END LOOP;
END$$;
ALTER SCHEMA auth OWNER TO supabase_auth_admin;
ALTER TABLE auth.users OWNER TO supabase_auth_admin;
ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;
ALTER TABLE auth.instances OWNER TO supabase_auth_admin;
ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;
ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;
SQL

echo "[00-init-base-schema] Setting admin role passwords to POSTGRES_PASSWORD..."

# The base init-scripts create the service roles (authenticator,
# supabase_auth_admin, supabase_storage_admin, etc.) WITHOUT a password that
# matches POSTGRES_PASSWORD. The dependent services (GoTrue, PostgREST,
# storage-api) connect using $POSTGRES_PASSWORD, so auth fails (28P01) unless
# we set every service role's password to match. This mirrors the official
# supabase roles.sql. We loop over only roles that exist so a missing role
# (e.g. supabase_functions_admin in some image variants) does not abort the
# block and leave later roles passwordless.
# NOTE: the password is interpolated by the shell (local dev only); the DO
# block reads it via a session GUC because psql :'var' is not valid inside $$.
psql -v ON_ERROR_STOP=1 -U "$ADMIN_USER" -d "$POSTGRES_DB" <<SQL
SET app.set_pw TO '${POSTGRES_PASSWORD}';
DO \$\$
DECLARE
  pw text := current_setting('app.set_pw');
  r record;
BEGIN
  FOR r IN SELECT rolname FROM pg_roles
           WHERE rolname IN ('authenticator','pgbouncer','supabase_auth_admin',
                             'supabase_functions_admin','supabase_storage_admin','postgres')
  LOOP
    EXECUTE format('ALTER USER %I WITH PASSWORD %L', r.rolname, pw);
    RAISE NOTICE 'Set password for role %', r.rolname;
  END LOOP;
END\$\$;
SQL

echo "[00-init-base-schema] Setting DB-level JWT secret..."

# PostgREST and GoTrue verify JWTs against this DB-level setting.
psql -v ON_ERROR_STOP=1 -U "$ADMIN_USER" -d "$POSTGRES_DB" -v jwt_secret="$JWT_SECRET" <<'SQL'
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO :'jwt_secret';
ALTER DATABASE postgres SET "app.settings.jwt_exp" TO '3600';
SQL

echo "[00-init-base-schema] Applying base migrations/*.sql..."

# Apply incremental migrations (permissions tweaks, realtime schema, etc.).
# These are ordered by timestamp prefix. Some may reference objects created by
# later services (realtime) or attempt to create roles that already exist
# (e.g. pgbouncer) — tolerate failures gracefully with ON_ERROR_STOP=0.
for sql in /docker-entrypoint-initdb.d/migrations/*.sql; do
  psql -v ON_ERROR_STOP=0 -U "$ADMIN_USER" -d "$POSTGRES_DB" -f "$sql" 2>&1 | \
    grep -v "already exists" || true
done

echo "[00-init-base-schema] Base schema applied. auth/storage schemas + roles now exist."
