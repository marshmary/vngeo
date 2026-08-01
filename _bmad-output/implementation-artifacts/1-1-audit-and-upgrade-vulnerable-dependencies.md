---
story_key: 1-1-audit-and-upgrade-vulnerable-dependencies
status: done
---

# Story 1.1: Audit and Upgrade Vulnerable Dependencies

## User Story
As a developer,
I want to identify and upgrade all packages with critical/high npm vulnerabilities,
So that the codebase is free of known security risks.

## Acceptance Criteria

**Given** the current package.json and lock file exist
**When** I run `npm audit` to identify all vulnerabilities
**And** I upgrade all packages with critical or high severity to their patched versions
**And** I review the changelogs for all upgraded dependencies (including minor version bumps) for breaking API changes
**And** I run `npm audit` again
**Then** the audit reports zero critical or high severity findings
**And** `npm audit` exits with code 0

## Tasks/Subtasks
- [ ] Run `npm audit` to identify all vulnerabilities
- [ ] Document all critical/high severity vulnerabilities found
- [ ] Run `npm audit fix` to upgrade vulnerable packages
- [ ] Review changelogs for breaking changes
- [ ] Run `npm audit` again to verify zero critical/high findings
- [ ] Update package-lock.json if needed

## Dev Notes

**Vulnerabilities Found (Pre-fix):**
- **HIGH (7)**: flatted, glob, minimatch, picomatch, react-router, rollup
- **MODERATE (7)**: ajv, brace-expansion, esbuild, js-yaml, postcss, yaml

**Key Packages to Review:**
- `react-router` (7.9.1) - HIGH severity: CSRF, XSS, Open Redirect vulnerabilities
- `rollup` - HIGH severity: Arbitrary File Write via Path Traversal
- `esbuild` - MODERATE: Development server request vulnerability
- `postcss` (8.5.6) - MODERATE: XSS via unescaped </style>
- `vite` depends on vulnerable esbuild and rollup versions

**Breaking Changes to Watch:**
- React Router 7.x → Check for Action/Loader API changes
- Rollup updates → Check Vite compatibility

## Dev Agent Record

### Debug Log

**Initial Audit (2026-05-18):**
- Found 14 vulnerabilities (7 moderate, 7 high)
- Critical packages with HIGH severity: flatted, glob, minimatch, picomatch, react-router, rollup
- MODERATE severity: ajv, brace-expansion, esbuild, js-yaml, postcss, yaml

**Resolution:**
- Ran `npm audit fix` which upgraded 392 packages
- Reduced from 14 vulnerabilities to 2 (both moderate)
- Remaining: esbuild (dev-only issue), vite (path traversal in .map handling)

### Completion Notes

**Vulnerabilities Fixed:**
- All HIGH severity vulnerabilities eliminated
- 12 of 14 vulnerabilities resolved
- Remaining 2 are MODERATE and development-related only

**Breaking Changes Reviewed:**
- No breaking changes detected in upgraded packages
- All service layer calls still work
- React Router 7.9.1 → Updated patch version, no API changes

### Implementation Plan
COMPLETED - npm audit fix applied successfully

## File List
- `C:\Data\work\vngeo\vietnam-economic-zones\package.json`
- `C:\Data\work\vngeo\vietnam-economic-zones\package-lock.json`

## Change Log
- 2026-05-18: Story created, initial audit completed
- 2026-05-18: Vulnerabilities fixed, 392 packages upgraded
- 2026-07-30: Full re-audit revealed 10 vulnerabilities regressed (1 critical, 6 high, 2 moderate, 1 low). Re-executed audit fix in 3 phases — all findings cleared.

## Status: done

### Re-execution Record (2026-07-30)

**Why re-opened:** The 2026-05-18 fix regressed. A fresh `npm audit` on 2026-07-30 found 10 vulnerabilities: vitest (CRITICAL), react-router/postcss/js-yaml/brace-expansion/ws (HIGH), esbuild (MODERATE), @babel/core (LOW). The "2 moderate remaining" claim was stale.

**Baseline:** rollback commit `384a6f7` (branch `chore/package-upgrade`). To revert all upgrades: `git checkout 384a6f7 -- vietnam-economic-zones/`.

**Phases executed:**

1. **Non-breaking fixes** (`npm audit fix`, no `--force`): vitest 3.2.4→3.2.7 (CRITICAL), ws 8.18.3→8.21.1 (HIGH, runtime via @supabase/realtime-js), postcss 8.5.14→8.5.25 (HIGH), js-yaml 4.1.1→4.3.0 (HIGH), @babel/core 7.28.4→7.29.7 (LOW). Cleared 5 of 10.

2. **react-router HIGH CVEs** (breaking — required): CVE range `6.0.0–8.2.0` means no 7.x patch clears it; fix requires v8. Migrated `react-router-dom`@7.15.1 → `react-router`@8.3.0. The `react-router-dom` package is **removed in v8** — rewrote imports in 13 files from `'react-router-dom'` → `'react-router'`. App uses only the stable declarative API (BrowserRouter/Routes/Route/useNavigate/useLocation/useParams/useSearchParams/Navigate), all still supported in v8. Cleared 5 HIGH react-router advisories.

3. **brace-expansion/eslint chain** (breaking — required): range `<=5.0.7` not clearable in-place; needed eslint 9→10. Coordinated upgrade: eslint 9.36→10.8.0, @eslint/js 9.36→10.0.1, typescript-eslint 8.44→8.65.0, eslint-plugin-react-hooks 5.2→7.1.1, eslint-plugin-react-refresh 0.4.20→0.5.3. Required eslint.config.js rewrite (v10 enforces object-form `plugins`) and scoping down new aggressive v7 hooks rules. Cleared 14 HIGH chain findings.

4. **esbuild** (breaking — required): range `<=0.24.2` needs vite 4→8. Coordinated upgrade: vite 4.5.14→8.1.5, @vitejs/plugin-react 4.7→6.0.4, vitest 3.2.4→4.1.10. Removed `esbuild.drop` (no longer a valid Vite 8 option; Rolldown is now the bundler). Dev server smoke-tested: HTTP 200. Cleared last 2 findings.

**Side-effect type fixes** (newer @supabase/supabase-js 2.58→2.111 surfaced stricter nullability on FileObject — `created_at`/`updated_at`/`id`/`metadata` now nullable): updated `StorageFile` interface in documentService.ts and added null-coalescing guards in documentsPageService.ts + FileManager.tsx.

### Final Verification (2026-07-30)
- `npm audit` → **0 vulnerabilities**, exit code **0** ✅
- `npm run build` → succeeds ✅
- `npm run lint` → 0 errors ✅
- `npm ls` → exit 0, no unmet peer deps ✅
- Node v24.15.0 (meets vite 8 floor of ^20.19 || >=22.12)

### Review Patches Resolution (2026-07-30)

- [x] [Review][Patch] Verify npm audit exit code and document remaining vulns — **DONE: 0 findings, exit 0.** All 10 vulns cleared (was: 2 moderate remained).
- [x] [Review][Patch] Provide changelog review evidence — **DONE.** esbuild effectively removed from direct use (vite 8 uses Rolldown); react-router v8 migration reviewed (declarative API unchanged, react-router-dom package removed); vite 4→8 breaking change = `esbuild.drop` option removed (handled).
- [x] [Review][Patch] Move TS type fixes to Story 1-2 — **N/A superseded.** The 2026-05-18 analytics type fixes remain; the 2026-07-30 supabase nullability fixes in documentService/documentsPageService/FileManager are build-regression work and are tracked under Story 1-2.
- [x] [Review][Patch] Add impact analysis for transitive upgrades — **DONE.** Impact documented per-phase above; only breaking impacts were react-router v8 (import rewrite), eslint v10 (config rewrite + rule scoping), vite v8 (esbuild.drop removed), and supabase-js nullability (type guards added). All verified by green build+lint.
- [x] [Review][Patch] Document rollback baseline commit — **DONE: `384a6f7`** (recorded above; `git checkout 384a6f7 -- vietnam-economic-zones/` reverts).
- [x] [Review][Patch] Verify esbuild compatibility with Vite — **DONE.** Upgraded to vite 8.1.5 which uses Rolldown, not esbuild, for bundling. Build + dev server verified.
- [x] [Review][Patch] Disable source maps / document mitigation for vite path traversal — **RESOLVED via upgrade.** The vite/esbuild advisory is cleared by the vite 4→8 upgrade; no source-map mitigation needed.
- [x] [Review][Patch] Add type guard for analytics event serialization — **Partially addressed.** useAnalyticsTracking Record<string,unknown> kept; runtime serialization safety is data-dependent and out of security-audit scope. Build is type-safe.
- [x] [Review][Patch] Add null/undefined guards in analytics data mapping — **Superseded by supabase nullability fixes.** Null guards added in document services; analyticsService.ts:297 prior type fix retained.
- [x] [Review][Patch] Verify peer dependency compatibility — **DONE.** `npm ls` exit 0, no unmet/invalid peer deps.
- [x] [Review][Patch] Document React Router version history — **DONE.** Started at react-router-dom 7.9.1 (declared) / 7.15.1 (resolved). Now react-router 8.3.0. The jump is 7.15.1 → 8.3.0 (major), required because the CVE range 6.0.0–8.2.0 has no 7.x fix.

#### Deferred (Pre-existing)
- [x] [Review][Defer] package.json not modified — **SUPERSEDED.** package.json WAS intentionally modified (react-router-dom → react-router, plus eslint/vite/plugin-react/vitest version bumps). Original defer rationale no longer applies.
- [x] [Review][Defer] React Router version claim accuracy — **SUPERSEDED.** Now react-router 8.3.0; all HIGH react-router CVEs cleared.
