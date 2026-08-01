# Data Models — Vietnam Economic Zones (vngeo)

> Source of truth: the live SQL under `schemas/` (human-reference set, run in the Supabase SQL Editor) and `supabase/supabase-volumes/db/` (local-Docker bootstrap/seed set). Verified 2026-08-01.

## Overview

- **Database:** Supabase-managed PostgreSQL 15 (cloud) / `supabase/postgres:15.8.1.060` (local Docker).
- **Five application tables:** `general_settings`, `quizzes`, `quiz_questions`, `quiz_options`, `page_visits`.
- **Row Level Security is ENABLED on all five tables** (no `FORCE ROW LEVEL SECURITY`, so the `postgres`/service role bypasses RLS).
- **No migration framework.** Schema is applied by pasting the numbered files in `schemas/` into the Supabase SQL Editor in order (`01_`…`05_`). Locally, the Docker compose stack auto-applies `supabase/supabase-volumes/db/init/*.sql` and seeds via the one-shot `seed` service.
- **Two copies of the schema exist** (see [Schema copies & divergences](#schema-copies--divergences)). Document each table once; differences are called out inline.
- **Shared trigger function** `update_updated_at_column()` (sets `updated_at = NOW()`) is defined idempotently in `01_general_settings.sql` and `02_quiz_complete_schema.sql`, and attached to `general_settings`, `quizzes`, and `quiz_questions` (the only tables with an `updated_at` column).

### Schema copies & divergences

| Concern | `schemas/` (human reference) | `supabase/.../db/init/` (Docker bootstrap) |
|---|---|---|
| UUID default | `uuid_generate_v4()` (requires `uuid-ossp`) | `gen_random_uuid()` (built-in pgcrypto) |
| `general_settings` seed | `ON CONFLICT (key) DO NOTHING` | `ON CONFLICT (key) DO UPDATE` (upsert) + `DROP POLICY IF EXISTS` guards |
| `get_most_visited_pages` | `LANGUAGE sql STABLE` | `LANGUAGE plpgsql STABLE` (adds `limit_count < 1 → 10` guard) |
| `pg_stat_statements` | not attempted | attempted in a `BEGIN … EXCEPTION` block (optional) |

The two forms are functionally identical; `gen_random_uuid()` is the modern preferred form used consistently in the Docker init set.

---

## ERD

```
auth.users (Supabase Auth)
    ▲
    │ created_by        │ user_id (ON DELETE SET NULL)
    │                     │
quizzes ──< quiz_questions ──< quiz_options      page_visits
 (1)         (N)                (N)                 │
    │         │ quiz_id ON DELETE CASCADE           │ session_id / visitor_id (string ids)
    │         └─ question_id ON DELETE CASCADE      └─ device/browser/os denormalized at insert
    │
    └─ created_by → auth.users(id)

general_settings   (standalone key/value lookup)
```

---

## Settings domain

### `general_settings`

Application-wide key/value settings (e.g. video links, form URLs).

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, `DEFAULT gen_random_uuid()` |
| `key` | VARCHAR(255) | NOT NULL, UNIQUE |
| `value` | TEXT | NOT NULL |
| `description` | TEXT | nullable |
| `created_at` | TIMESTAMPTZ | `DEFAULT NOW()` |
| `updated_at` | TIMESTAMPTZ | `DEFAULT NOW()` |

- **Indexes:** unique index on `key` (from the UNIQUE constraint).
- **Trigger:** `update_general_settings_updated_at` — `BEFORE UPDATE FOR EACH ROW → update_updated_at_column()`.

**RLS policies** (no `TO` clause → applies to `public` = anon + authenticated):

| Policy | Command | Expression |
|---|---|---|
| Allow public read access | SELECT | `USING (true)` |
| Allow authenticated insert | INSERT | `WITH CHECK (auth.role() = 'authenticated')` |
| Allow authenticated update | UPDATE | `USING (auth.role() = 'authenticated')` |
| Allow authenticated delete | DELETE | `USING (auth.role() = 'authenticated')` |

**Known keys:** `map_drawing_video_url`, `feedback_form_url`.

---

## Quiz domain

`02_quiz_complete_schema.sql` (definition), `03_quiz_sample_data.sql` (sample seed), `05_quiz_403_error_fix.sql` (re-runnable RLS safety net — see note). Extension `uuid-ossp` enabled in the `schemas/` copy.

### `quizzes`

Top-level quiz container.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, `DEFAULT uuid_generate_v4()` / `gen_random_uuid()` |
| `title` | TEXT | NOT NULL |
| `description` | TEXT | nullable |
| `difficulty` | TEXT | CHECK in `('easy','medium','hard')`, DEFAULT `'medium'` |
| `status` | TEXT | CHECK in `('draft','published','archived')`, DEFAULT `'draft'` |
| `time_limit` | INTEGER | nullable (minutes) |
| `created_at` | TIMESTAMPTZ | `DEFAULT NOW()` |
| `updated_at` | TIMESTAMPTZ | `DEFAULT NOW()` |
| `created_by` | UUID | FK → `auth.users(id)` (no ON DELETE action) |

- **Indexes:** `idx_quizzes_status`, `idx_quizzes_created_by`.
- **Trigger:** `update_quizzes_updated_at`.
- **RLS:**

| Policy | Command | Expression |
|---|---|---|
| Anyone can view published quizzes | SELECT | `USING (status = 'published' OR auth.uid() = created_by)` |
| Authenticated users can create quizzes | INSERT | `WITH CHECK (auth.role() = 'authenticated')` |
| Users can update their own quizzes | UPDATE | `USING (auth.uid() = created_by)` |
| Users can delete their own quizzes | DELETE | `USING (auth.uid() = created_by)` |

### `quiz_questions`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, `DEFAULT uuid_generate_v4()` / `gen_random_uuid()` |
| `quiz_id` | UUID | NOT NULL, FK → `quizzes(id) ON DELETE CASCADE` |
| `question` | TEXT | NOT NULL |
| `explanation` | TEXT | nullable |
| `allow_multiple_answers` | BOOLEAN | DEFAULT `FALSE` |
| `order_index` | INTEGER | NOT NULL |
| `created_at` | TIMESTAMPTZ | `DEFAULT NOW()` |
| `updated_at` | TIMESTAMPTZ | `DEFAULT NOW()` |

- **Index:** `idx_quiz_questions_quiz_id`.
- **Trigger:** `update_quiz_questions_updated_at`.
- **RLS:** view rule = questions whose parent quiz is published OR owned by caller; manage rule (ALL) = caller owns the parent quiz (both `USING` and `WITH CHECK`).

### `quiz_options`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `question_id` | UUID | NOT NULL, FK → `quiz_questions(id) ON DELETE CASCADE` |
| `text` | TEXT | NOT NULL |
| `is_correct` | BOOLEAN | DEFAULT `FALSE` |
| `order_index` | INTEGER | NOT NULL |
| `created_at` | TIMESTAMPTZ | `DEFAULT NOW()` |

- **Index:** `idx_quiz_options_question_id`.
- **No `updated_at` column / no trigger.**
- **RLS:** view rule = parent (question → quiz) is published or owned; manage rule (ALL) = caller owns the grandparent quiz (`USING` + `WITH CHECK`).

> **Note on `05_quiz_403_error_fix.sql`:** it exists solely to `DROP` and recreate the `quiz_questions` "manage" policy identically with **both** `USING` and `WITH CHECK`. The version in `02_` already includes both clauses; `05_` is a re-runnable safety net against the historical 403-on-insert bug.

### Seed data

- **Sample** (`schemas/03_quiz_sample_data.sql`): 3 published quizzes (Basic Knowledge / Industrial Parks / Investment & Business) — 18 questions, 72 options. `created_by` = `(SELECT id FROM auth.users LIMIT 1)`.
- **Production-export seed** (`supabase/.../db/seed/07-seed-content.sql`, the durable dataset): TRUNCATEs then inserts **5 quizzes, 25 questions, 99 options**, all `created_by` forced to the local admin `a0000000-0000-4000-8000-000000000001`.

---

## Analytics domain

`04_analytics_tracking.sql`. Powers the admin analytics dashboard.

### `page_visits`

Individual page-visit records with session + device info.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, `DEFAULT gen_random_uuid()` |
| `page_path` | VARCHAR(500) | NOT NULL |
| `page_title` | VARCHAR(500) | nullable |
| `referrer` | VARCHAR(500) | nullable |
| `session_id` | VARCHAR(100) | NOT NULL |
| `visitor_id` | VARCHAR(100) | NOT NULL (persistent visitor id) |
| `user_id` | UUID | FK → `auth.users(id) ON DELETE SET NULL` |
| `is_authenticated` | BOOLEAN | DEFAULT `false` |
| `user_agent` | TEXT | nullable |
| `device_type` | VARCHAR(50) | nullable (`mobile`/`tablet`/`desktop`) |
| `browser` | VARCHAR(100) | nullable |
| `os` | VARCHAR(100) | nullable |
| `country_code` | VARCHAR(10) | nullable |
| `visit_timestamp` | TIMESTAMPTZ | `DEFAULT NOW()` |
| `session_duration` | INTEGER | nullable (seconds) |
| `created_at` | TIMESTAMPTZ | `DEFAULT NOW()` |

- **Indexes:** `idx_page_visits_timestamp` (`visit_timestamp DESC`), `idx_page_visits_session` (`session_id, visit_timestamp`), `idx_page_visits_visitor` (`visitor_id, visit_timestamp`), `idx_page_visits_page_path` (`page_path, visit_timestamp`), `idx_page_visits_user_id` (partial, `WHERE user_id IS NOT NULL`), `idx_page_visits_analytics` (composite `visit_timestamp, page_path, visitor_id`).
- **No triggers.**
- **RLS:**

| Policy | Command | Expression |
|---|---|---|
| Allow public insert for tracking | INSERT | `WITH CHECK (true)` |
| Allow authenticated read for analytics | SELECT | `USING (auth.role() = 'authenticated')` |
| Allow users to view their own visits | SELECT | `USING (auth.role() = 'authenticated' AND user_id = auth.uid())` |

> No UPDATE/DELETE policies — analytics rows are immutable via the API. `cleanup_old_analytics()` (DB-admin only) is the only deletion path.

### View — `analytics_summary_view`

Aggregates `page_visits` by date, hour, page path/title. Columns: `visit_date`, `visit_hour`, `page_path`, `page_title`, `visit_count`, `unique_visitors`, `unique_sessions`, `authenticated_users`, `mobile_visits`, `tablet_visits`, `desktop_visits`, `avg_session_duration`.

### Functions (all `STABLE` unless noted)

| Function | Returns | Notes |
|---|---|---|
| `get_total_visits()` | BIGINT | `LANGUAGE sql` |
| `get_visits_by_date_range(start, end)` | TABLE(visit_date, total_visits, unique_visitors) | `LANGUAGE sql` |
| `get_hourly_visits_24h()` | TABLE(hour_timestamp, visit_count) | `LANGUAGE sql` |
| `get_most_visited_pages(limit_count DEFAULT 10, start_date DEFAULT now()-30d)` | TABLE(page_path, page_title, visit_count, unique_visitors) | `sql` in `schemas/`, `plpgsql` in Docker init (adds `limit_count<1→10` guard) |
| `cleanup_old_analytics()` | INTEGER | `LANGUAGE plpgsql`, **not** stable — deletes rows older than 1 year; intended for a scheduled job |

Three of these are invoked from the app via Supabase RPC — see [api-contracts.md](./api-contracts.md).

---

## Storage (local-Docker only)

These live under `supabase/supabase-volumes/db/` and concern the `documents` bucket (no core app table).

- **`storage.buckets`** — `init/03-storage.sql` inserts bucket `('documents','documents')` `ON CONFLICT DO NOTHING`. Size/MIME limits are managed by the storage-api service at runtime, not by DDL.
- **`storage.objects` RLS** (the `seed/08-storage-policies.sql` version is the durable one — storage-api clobbers these on first boot and the seed service re-applies them after):

| Policy | Command | Role | Expression |
|---|---|---|---|
| Allow authenticated users to read | SELECT | `authenticated` | `bucket_id = 'documents'` |
| Allow authenticated users to upload | INSERT | `authenticated` | `bucket_id = 'documents'` |
| Allow admin users to delete | DELETE | `authenticated` | `bucket_id = 'documents' AND (jwt user_metadata.role = 'admin' OR app_metadata.role = 'admin')` |
| Give anon users read access | SELECT | `public` (anon) | `bucket_id = 'documents' AND auth.role() = 'anon'` |

### Seeded auth users (local dev only)

`seed/06-seed-users.sql` inserts two `auth.users` (passwords hashed with `crypt(..., gen_salt('bf'))`):

| Email | Password | Role (`app_metadata`) |
|---|---|---|
| `admin@vngeo.local` | `AdminPass123!` | `admin` |
| `user@vngeo.local` | `UserPass123!` | _(none)_ |

---

## Related docs

- [API Contracts](./api-contracts.md) — the service methods that read/write these tables and call these RPCs.
- [Architecture](./architecture.md) — data architecture in context.
- [Development Guide](./development-guide.md) — how to apply the schema locally.
