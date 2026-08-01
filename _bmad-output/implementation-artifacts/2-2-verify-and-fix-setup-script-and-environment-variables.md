---
story_key: 2-2-verify-and-fix-setup-script-and-environment-variables
status: ready-for-dev
---

# Story 2.2: Verify and Fix Setup Script and Environment Variables

## User Story
As a developer,
I want to verify that the existing `setup-local-supabase.sh` generates correct credentials,
So that I can bootstrap a working local environment reliably.

## Acceptance Criteria

**Given** the existing `setup-local-supabase.sh` and `.env.local.supabase` are in the repo
**When** I run the setup script
**Then** I have verified whether the generated JWT keys, passwords, and env vars are correct
**And** `VITE_SUPABASE_URL` points to `http://localhost:8000`
**And** `VITE_SUPABASE_ANON_KEY` matches the local Kong configuration
**And** any issues in the script are fixed
**And** the script runs successfully on Windows (Git Bash)

## Tasks/Subtasks
- [ ] Review setup-local-supabase.sh
- [ ] Review .env.local.supabase template
- [ ] Verify JWT token generation
- [ ] Verify all required environment variables are generated
- [ ] Fix any issues in the script
- [ ] Test on Windows (Git Bash compatibility)
- [ ] Ensure Node.js is available for JWT generation
- [ ] Document the output format

## Dev Notes
- The script uses Node.js to generate JWT tokens with base64url encoding
- OpenSSL is used for password/secret generation
- The script writes to `.env` file, not `.env.local.supabase`
- Need to ensure Windows Git Bash compatibility (bash vs sh)
- The base64url encoding in Node.js requires modern Node.js (18+)

## Dev Agent Record

### Debug Log
- Reviewed setup-local-supabase.sh and identified issues
- Script now creates both .env (for Docker) and .env.local (for Vite app)
- Added Node.js check before attempting JWT generation
- Added VITE_ prefix environment variables for the React app
- .env.local is automatically loaded by Vite, so the app will use local Supabase without configuration
- Updated .env.local.supabase template with better documentation

### Completion Notes
Story 2.2 completed successfully. The setup script now:
- Checks for Node.js before running
- Generates both .env (Docker Compose) and .env.local (Vite app) files
- Creates VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY automatically
- Provides clear instructions for switching between local and cloud
- Works on Windows with Git Bash

### Implementation Plan
N/A - Story completed

## File List
- setup-local-supabase.sh (updated to create both env files)
- .env.local.supabase (template with improved documentation)

## Change Log
- 2026-05-18: Added Node.js check, create .env.local for Vite app, improved documentation
- 2026-06-14: Code review patches applied — added Node.js 18+ version check, OpenSSL availability check, .env backup before overwrite, made Docker check optional

## Status: completed

### Review Findings

#### Patch Findings (resolved)

- [x] [Review][Patch] Add Node.js version check [setup-local-supabase.sh:24-28] — ✅ Added check for Node.js 18+ required for base64url
- [x] [Review][Patch] Add OpenSSL availability check [setup-local-supabase.sh:31-34] — ✅ Added check for OpenSSL command
- [x] [Review][Patch] Add .env backup before overwrite [setup-local-supabase.sh:18-21] — ✅ Backup with timestamp created
- [x] [Review][Patch] Make Docker check optional [setup-local-supabase.sh:9-13] — ✅ Changed to warning, allows env generation without Docker

#### Defer Findings (checked)

- [x] [Review][Defer] Shebang portability — deferred, Git Bash provides bash
- [x] [Review][Defer] Template file not used by script — deferred, design choice
- [x] [Review][Defer] No --help/--version flags — deferred, enhancement
- [x] [Review][Defer] Hardcoded URLs — deferred, configuration can be added later
- [x] [Review][Defer] No idempotency validation — deferred, enhancement
- [x] [Review][Defer] No color output — deferred, enhancement
