# Local Development Setup Guide

This guide explains how to set up and run vngeo with a local Supabase instance for development.

## Overview

The vngeo project uses a Docker Compose-based local Supabase environment that provides:
- PostgreSQL database with all tables and RLS policies
- GoTrue authentication (auto-confirm enabled)
- PostgREST API
- Realtime server
- Storage API (documents bucket)
- Image transformation proxy
- Kong API gateway
- Studio dashboard

## Prerequisites

### Required Software
- **Docker Desktop** - Download from [docker.com](https://www.docker.com/products/docker-desktop/)
- **Git** - Required for cloning and running setup scripts
- **Node.js** 18+ - Required for JWT generation in setup script
- **OpenSSL** - Usually included with Git Bash on Windows

### Windows Notes
- Use **Git Bash** (not PowerShell or Command Prompt) for running shell scripts
- Docker Desktop must be running before starting local Supabase
- OpenSSL is included with Git Bash

## Quick Start

> **Cross-platform.** The entire stack — services **and** seed data — starts
> with a single `docker compose up -d` on both **Windows and Unix**. No
> host-side bash is required: the seed runs inside its own container.

### 1. Start Local Supabase (services + seed)

```bash
# Generate secure credentials and environment files (one-time, per machine)
bash setup-local-supabase.sh

# Start all Supabase services AND auto-seed users + quizzes + documents
docker compose up -d
```

The setup script will:
- Generate secure random passwords and JWT secrets
- Create valid JWT tokens for API keys
- Create `.env` file for Docker Compose
- Create `.env.local` file for the Vite app (auto-loaded)

`docker compose up -d` starts every service **and** runs the `seed` service,
which on first boot (fresh volumes) automatically:
1. Waits for GoTrue to create `auth.users`,
2. Applies `06-seed-users.sql` (admin + regular dev users),
3. Applies `07-seed-content.sql` (settings + quizzes/questions/options),
4. Uploads the 32 production PDFs into the `documents` bucket,
5. Writes a sentinel so subsequent `up`s skip the seed (local edits survive).

When it's done, log in as `admin@vngeo.local / AdminPass123!` — quizzes and
documents are already there.

> **Re-running the seed:** the seed service runs **once per fresh sentinel
> volume**. To force a full re-seed (wipe data + sentinel):
> ```bash
> docker compose down -v && docker compose up -d
> ```

### 2. Start the Application

```bash
npm install
npm run dev
```

The app will automatically connect to your local Supabase instance at `http://localhost:8000`.

### 3. Access Studio Dashboard

Navigate to [http://localhost:3001](http://localhost:3001) and log in with:
- Username: `supabase`
- Password: (displayed after running setup script)

## Environment Variables

### Local Supabase URLs

| Service | URL |
|---------|-----|
| API Gateway | http://localhost:8000 |
| Studio Dashboard | http://localhost:3001 |
| Database | localhost:5432 |

### App Environment Variables

The setup script creates `.env.local` with:
```bash
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=<generated-key>
```

### Switching Between Local and Cloud

**To use local Supabase:**
- Run `./setup-local-supabase.sh` (creates `.env.local`)
- The app automatically uses local instance

**To use cloud Supabase:**
- Delete `.env.local`
- Get your cloud credentials from [Supabase Dashboard](https://supabase.com/dashboard)
- Create `.env.local` with your cloud credentials from `.env.example`

## Docker Compose Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f db
docker compose logs -f auth

# Stop all services
docker compose down

# Stop and remove all data (reset to fresh state)
docker compose down -v

# Restart a specific service
docker compose restart storage
```

### Seeding (automatic, on first boot)

Seeding is fully automated by the `seed` compose service — no manual steps and
no host-side bash. On a fresh volume (`docker compose up -d` for the first
time, or after `docker compose down -v`), the seed container:

1. Waits for GoTrue to create `auth.users` (the initdb-vs-GoTrue race that used
   to require a manual post-startup step),
2. Applies `supabase-volumes/db/seed/06-seed-users.sql` — admin + regular dev users,
3. Applies `supabase-volumes/db/seed/07-seed-content.sql` — real production
   `general_settings` + quizzes/questions/options,
4. Uploads the 32 production PDFs from `supabase-volumes/storage-seed/documents/`
   into the `documents` storage bucket,
5. Writes a sentinel file to the `supabase-seed-sentinel` volume, so subsequent
   `up`s skip the seed and **local edits survive restarts**.

| Seeded data             | Source file                                |
|-------------------------|--------------------------------------------|
| Admin + test users      | `supabase-volumes/db/seed/06-seed-users.sql`|
| `general_settings` rows | `supabase-volumes/db/seed/07-seed-content.sql`|
| Quizzes + questions + options | `supabase-volumes/db/seed/07-seed-content.sql`|
| Document PDFs (32)      | `supabase-volumes/storage-seed/documents/` |

Dev login (LOCAL DEV ONLY — never use in production):

| Email                  | Password        | Role  |
|------------------------|-----------------|-------|
| `admin@vngeo.local`    | `AdminPass123!` | admin |
| `user@vngeo.local`     | `UserPass123!`  | —     |

The admin user's role is stored in `raw_app_meta_data`, which GoTrue bakes into
the JWT at login. Both the frontend (`authService.ts`) and the storage RLS
policies check `app_metadata.role = 'admin'`, so the seeded admin can delete
files and access the admin panel without further configuration.

> **Re-seeding:** the sentinel lives in a named volume, so the seed runs once
> per fresh volume. To force a full re-seed:
> ```bash
> docker compose down -v && docker compose up -d
> ```
> To re-apply only the SQL seed without wiping data (e.g. after editing
> `07-seed-content.sql`), run it directly:
> ```bash
> docker exec -i supabase-db psql -U supabase_admin -d postgres \
>   < supabase-volumes/db/seed/07-seed-content.sql
> ```

#### Schema vs. seed separation

The local bootstrap is strictly layered so schema changes never collide with
seed data:

- **Schema** (`supabase-volumes/db/init/`): `CREATE TABLE`, RLS, indexes — run
  at first boot. Never inserts real data.
- **Seed** (`supabase-volumes/db/seed/`): row data only — `INSERT`/`UPDATE`/
  `TRUNCATE`, run after the stack is healthy. Never creates schema.

Every seed block is guarded by `to_regclass()`, so a missing or renamed table
logs a `NOTICE` and skips instead of crashing. See
`supabase-volumes/db/seed/README.md` for the full policy.

## Service Health Checks

Check that all services are running:
```bash
docker compose ps
```

All services should show "healthy" status:
- `supabase-db` - PostgreSQL database
- `supabase-auth` - GoTrue authentication
- `supabase-rest` - PostgREST API
- `supabase-realtime` - Realtime server
- `supabase-storage` - Storage API
- `supabase-imgproxy` - Image transformation proxy
- `supabase-kong` - API gateway
- `supabase-studio` - Dashboard
- `supabase-meta` - Postgres meta

`supabase-seed` is a one-shot: it runs, seeds, writes a sentinel, and exits
(`restart: "no"`). It shows as `exited (0)` on subsequent `up`s — that's the
sentinel skip, which is the desired behavior.

## Database Schema

The local Supabase instance includes all production tables:

### Tables
- `general_settings` - App-wide settings (video URLs, etc.)
- `quizzes` - Quiz definitions
- `quiz_questions` - Quiz questions
- `quiz_options` - Quiz answer options
- `page_visits` - Analytics tracking

### Storage
- `documents` bucket - Private file storage (50MB limit)

> Schema lives in `supabase-volumes/db/init/` (DDL only). Seed data lives
> separately in `supabase-volumes/db/seed/` — see
> [Seeding Content](#seeding-content-documents-settings-quizzes) above.

### RPC Functions
- `get_total_visits()` - Total visit count
- `get_visits_by_date_range(start, end)` - Visits by date
- `get_hourly_visits_24h()` - Hourly visits for last 24 hours
- `get_most_visited_pages(limit, start)` - Most visited pages
- `cleanup_old_analytics()` - Delete old analytics data

## Troubleshooting

### Docker Issues

**Problem**: Docker commands fail
```bash
# Solution: Make sure Docker Desktop is running
docker info
```

**Problem**: Services not starting
```bash
# Solution: Check port conflicts
netstat -ano | findstr :8000
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Solution: Kill conflicting process on Windows (Task Manager) or restart Docker
```

### Connection Issues

**Problem**: App can't connect to Supabase
```
# Solution: Verify services are healthy
docker compose ps

# Solution: Check Kong gateway is accessible
curl http://localhost:8000/rest/v1/
```

### Auth Issues

**Problem**: Sign up requires email verification
```
# Solution: Verify auto-confirm is enabled in docker-compose.yml
GOTRUE_MAILER_AUTOCONFIRM: "true"
```

### Storage Issues

**Problem**: File upload fails
```
# Solution: Verify storage bucket exists
# Check in Studio: Storage > documents

# Solution: Check storage service logs
docker compose logs storage
```

### Database Issues

**Problem**: Tables or functions missing
```
# Solution: Verify migrations ran
docker compose exec db psql -U supabase_admin -d postgres -c "\dt"

# Solution: Re-run migrations manually
docker compose exec db psql -U supabase_admin -d postgres -f /docker-entrypoint-initdb.d/01-general_settings.sql
```

## Data Persistence

Docker volumes persist data across container restarts:
- `supabase-db-data` - Database data
- `supabase-storage-data` - Storage files (uploaded documents)
- `supabase-seed-sentinel` - Seed sentinel (marks first-boot seed as done)

To completely reset your local environment (wipes all data + forces a re-seed):
```bash
docker compose down -v
docker compose up -d   # services start, then seed runs fresh
```

The one-time `setup-local-supabase.sh` only needs re-running if `.env` is
missing or you want to regenerate credentials.

## Windows-Specific Tips

1. **No Git Bash required for the stack** - `docker compose up -d` is the only
   command needed to start services + seed. It runs identically on Windows
   (PowerShell/CMD) and Unix. (Git Bash is only needed for
   `setup-local-supabase.sh`, which is a one-time credential generator.)
2. **Path separators** - Use forward slashes `/` even on Windows
3. **Permissions** - Run your shell as Administrator if you get permission errors
4. **Line endings** - Make sure Git doesn't convert line endings (repo-specific):
   ```bash
   # Already configured in .gitattributes - no action needed
   # If you have issues: git config core.autocrlf input (affects this repo only)
   ```
5. **Docker Desktop** - Make sure it's running before starting services

## End-to-End Workflow

1. **Setup (one-time)** - Run `bash setup-local-supabase.sh` to generate `.env`
2. **Start** - Run `docker compose up -d` (services + auto-seed in one command)
3. **Verify** - Check `docker compose ps` and the seed logs:
   `docker compose logs seed`
4. **Start App** - Run `npm run dev`
5. **Test Auth** - Log in as `admin@vngeo.local / AdminPass123!`
6. **Test Storage** - Confirm documents appear at `/documents`
7. **Test Quizzes** - Quizzes visible at the quiz pages
8. **Test Analytics** - Visit pages and check `/admin`
9. **Stop** - Run `docker compose down`

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Project Integration Guide](./local-development-integration-guide.md)
- [Project Documentation Index](./index.md)

## Note on .gitignore

The `.env` and `.env.local` files generated by the setup script should never be committed to git. These files contain sensitive credentials and are automatically excluded by the project's .gitignore configuration.
