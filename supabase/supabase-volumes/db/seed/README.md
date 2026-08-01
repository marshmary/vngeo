# Seed data (`supabase-volumes/db/seed/`)

This directory holds **data only** — `INSERT`/`UPDATE`/`DELETE` statements that
populate the tables created by the schema files in `../init/`.

## The schema/seed separation rule

The local Supabase bootstrap is split into two layers that must never bleed into
each other:

| Layer        | Directory         | Contains                                            | When it runs                          |
|--------------|-------------------|-----------------------------------------------------|---------------------------------------|
| **Schema**   | `../init/`        | `CREATE TABLE`, RLS policies, indexes, functions    | Postgres first boot (initdb scripts)  |
| **Seed**     | `./` (here)       | Row data only — `INSERT`/`UPDATE`/`TRUNCATE`        | After the stack is healthy (manual)   |

**The two invariants:**

1. **Schema files never insert real data.** `init/01-*.sql` … `init/05-*.sql`
   define structure only. (Historical note: `init/01-general_settings.sql`
   shipped with placeholder `INSERT`s — these are intentionally left in place
   as structural defaults; *real* values are upserted by `07-seed-content.sql`
   here, which overrides them.)

2. **Seed files never create schema.** Files in this directory must not contain
   `CREATE TABLE`, `ALTER TABLE`, `CREATE POLICY`, etc. They operate purely on
   rows. This guarantees:
   - A schema change (a new migration in `init/`) can never be silently
    blocked or broken by a seed file.
   - Seeds can be re-run, skipped, or dropped without touching structure.
   - The same seed layer works against any schema revision that keeps the
    table names.

## Guarding against schema drift

Every seed file in here must be **safe to run regardless of whether its target
table exists**. The pattern (see `07-seed-content.sql`):

```sql
DO $$
BEGIN
  IF to_regclass('public.quizzes') IS NULL THEN
    RAISE NOTICE 'Skipping quiz seed: public.quizzes does not exist yet';
  ELSE
    -- … INSERT / TRUNCATE / UPDATE …
  END IF;
END $$;
```

This means a future schema change that renames or drops a table causes the seed
to **log and skip**, not crash the whole script.

## Files

| File                  | Populates                                  | Status        |
|-----------------------|--------------------------------------------|---------------|
| `06-seed-users.sql`   | admin + regular dev `auth.users`           | ✅ populated  |
| `07-seed-content.sql` | `general_settings`, `quizzes`(+children)   | ✅ prod data  |

> Binary documents (PDFs in the `documents` storage bucket) are **not** SQL —
> they're uploaded by the `seed` compose service (see
> `supabase-volumes/seed/seed-runner.mjs`) from
> `supabase-volumes/storage-seed/documents/`. No host-side script is needed.

## How it's applied

These files are applied automatically by the `seed` compose service on first
boot (fresh volumes). See the "Seeding" section of `docs/local-development.md`.
The seed service waits for GoTrue, applies `06` then `07`, uploads the
documents, and writes a sentinel so it runs once per fresh volume.

To re-apply the SQL seed manually (e.g. after editing it, without re-running
the whole one-shot service):

```bash
docker exec -i supabase-db psql -U supabase_admin -d postgres \
  < supabase-volumes/db/seed/07-seed-content.sql
```

It's **idempotent** — `ON CONFLICT` (settings) and `TRUNCATE … RESTART
IDENTITY CASCADE` (quizzes, FK order) make it safe to re-run.

## Refreshing from prod

The quiz/settings data is sourced from production. To refresh:

1. Export from prod (Dashboard → SQL Editor, or `pg_dump --data-only`):
   ```sql
   SELECT key, value, description FROM general_settings;
   SELECT * FROM quizzes; SELECT * FROM quiz_questions; SELECT * FROM quiz_options;
   ```
2. Regenerate `07-seed-content.sql` from the CSVs (the generator handles
   escaping, `created_by` → local admin, and FK integrity — see the generation
   step in the project history). Keep the original UUIDs so the FK chain holds.
3. Re-run: `docker compose down -v && docker compose up -d` (full re-seed),
   or apply the SQL directly as shown above for a data-only refresh.
