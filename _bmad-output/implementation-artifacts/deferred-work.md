# Deferred Work

## Deferred from: code review of 1-1-audit-and-upgrade-vulnerable-dependencies (2026-06-14)

- package.json not modified — npm audit fix correctly only touches lock file, not a defect
- React Router version claim accuracy — acceptance criteria met (HIGH severity fixed), version history not critical for security fix

## Deferred from: code review of 3-1-reactivate-supabase-cloud-project-and-verify-data-integrity (2026-06-14)

- RLS functionality not verified — Doc checks policies exist but doesn't verify they permit/deny correctly; requires live cloud access with specific policy intentions, must be verified manually during reactivation
- Write test pollutes production — Creates verification entries in page_visits with no cleanup mechanism, design choice for simple verification
- Shebang portability — `#!/bin/bash` not portable to systems with bash v3 or other shells, environmental concern
- Color codes for TTY only — Will print escape codes in non-terminal environments, UX issue for non-interactive use
- Date command portability — `date +%s` not POSIX-compliant and fails on some systems, environmental concern

## Deferred from: Epic 2 runtime smoke test (2026-07-30)

- **Realtime `DB_ENC_KEY` bad key size** — realtime v2.33.9 uses `SECRET_KEY_BASE` as an AES-128 key but the setup script generates a base64-48 string (wrong size). Realtime keeps restarting. Kong dependency relaxed to `service_started` so the API works without it. **Fix:** generate a 16-byte `DB_ENC_KEY` separately for realtime in the setup script. Non-critical (realtime is only for live subscriptions, not core CRUD).
- **Studio "unhealthy" status (cosmetic)** — Studio responds HTTP 307 on :3001 (login redirect) but its in-container healthcheck reports unhealthy. Studio is functionally accessible; the healthcheck definition needs tuning. Non-blocking.
- **Authenticated-user storage upload (RLS)** — service_role (admin) upload/list/delete work fully; authenticated-user upload returns 403 because storage-api applies its own tenant/claim scoping on top of the bucket policy. The app's admin document management uses service_role, so this is non-blocking for admin flows. Finer-grained per-user policies can be applied via Studio post-init.
- **No graceful shutdown configuration** — enhancement, pre-existing.
- **No resource limits configured** — enhancement, pre-existing.

## RESOLVED at runtime (2026-07-30) — previously deferred

The following were previously deferred as "runtime testing not documented" and are now **verified live**:
- API accessibility at localhost:8000 → HTTP 200 ✅
- Studio accessibility at localhost:3001 → HTTP 307 ✅
- kong.yml validation → validated; auth-v1 URL bug found and fixed ✅
- DB init directory → ordering defect found and fixed (base schema bootstrap via 00-init-base-schema.sh) ✅
- Auth signup/signin flows → verified live ✅
- Storage bucket upload/list (admin) → verified live ✅
- All 5 tables + 5 RPC functions → verified present and queryable ✅

---

## Deferred from: code review of 1-1-audit-and-upgrade-vulnerable-dependencies (2026-06-14)
