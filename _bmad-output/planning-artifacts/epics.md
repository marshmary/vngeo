---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - docs/architecture.md
  - docs/ui-architecture.md
  - docs/data-models-main.md
  - docs/api-contracts-main.md
---

# vngeo - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for vngeo, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: All direct npm dependencies with critical or high severity vulnerabilities are upgraded to patched versions
FR2: `npm audit` passes with zero critical/high findings after upgrade
FR3: The application builds successfully (`npm run build`) and runs without runtime errors after upgrade
FR4: All existing features (map, quiz, auth, documents, analytics) continue to function after upgrade
FR5: A Docker Compose file provides local Supabase services: PostgreSQL database, GoTrue auth, PostgREST API, Realtime, Storage, Imgproxy, Kong gateway, and Studio dashboard
FR6: A setup script generates secure JWT keys, passwords, and environment variables for local Supabase
FR7: The local Supabase instance is accessible at `http://localhost:8000` with Studio at `http://localhost:3001`
FR8: Local Supabase supports email/password authentication with auto-confirm (no email verification needed for local dev)
FR9: Local Supabase supports file storage with upload/download/delete operations
FR10: Local Supabase supports database tables with Row Level Security (RLS)
FR11: Developers can switch between local and cloud Supabase by changing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
FR12: Database schema from the cloud project can be migrated to the local instance
FR13: The paused Supabase cloud project is reactivated with all existing data intact (tables, RLS policies, storage buckets, auth users)
FR14: The cloud project is configured to remain active on the free tier without automatic pause or data deletion
FR15: A keep-alive strategy (e.g., scheduled ping, cron job, or periodic activity) is in place to prevent Supabase's inactivity-based pause policy

### NonFunctional Requirements

NFR1: All Supabase database tables have Row Level Security (RLS) enabled
NFR2: Supabase Storage bucket is private with admin-only upload/delete RLS policies
NFR3: Admin role is verified via JWT user_metadata on every protected route
NFR4: Production build strips all console.log, console.info, and console.debug statements via Terser
NFR5: Monthly npm dependency audits are part of the development workflow
NFR6: Docker Compose volumes persist local database and storage data across restarts
NFR7: Local Supabase setup is reproducible on any developer machine with Docker installed
NFR8: Local Supabase development server responds within 2 seconds for API calls
NFR9: Docker Compose resource usage stays under 2GB RAM on the host machine

### Additional Requirements

- **Brownfield context:** No starter template needed; work on existing React 19.1 + TypeScript 5.8 + Vite 4.5 + Supabase codebase
- **Service layer architecture:** All 7 service classes (AuthService, AnalyticsService, QuizService, QuizDraftService, DocumentService, DocumentsPageService, SettingsService, GADMService) use static methods and must continue to work with local Supabase
- **Unidirectional dependency rule:** Services must NOT import stores (enforced in codebase)
- **Database schema:** 5 tables (general_settings, quizzes, quiz_questions, quiz_options, page_visits) with RLS policies must be replicated locally
- **Storage bucket:** `documents` bucket (private, 50MB max) must be created in local Supabase
- **Supabase RPC functions:** get_total_visits(), get_visits_by_date_range(), get_hourly_visits_24h(), get_most_visited_pages(), cleanup_old_analytics() must exist in local instance
- **i18n:** Vietnamese (vi) fallback language must remain functional with local Supabase
- **Environment variable validation:** Missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` throws at startup
- **Existing routes:** All 9 routes must continue to work with local Supabase backend
- **Netlify deployment:** Current hosting on Netlify; local Supabase is for development only

### UX Design Requirements

UX-DR1: Maintain Tailwind CSS v3 utility-first styling approach with `@apply` patterns in `@/index.css` for reusable classes
UX-DR2: Maintain Framer Motion animations for interactive UI elements (hover, tap, fade, zone transitions)
UX-DR3: Maintain dark mode toggle via UIStore (isDarkMode persisted field) with CARTO dark map tiles support
UX-DR4: Maintain high contrast mode toggle (isHighContrast persisted field) for educational accessibility
UX-DR5: Maintain bilingual UI (Vietnamese/English) via i18next across all pages and components
UX-DR6: Maintain responsive design suitable for high school students on various devices (mobile-first)
UX-DR7: Maintain zone color consistency: 6 distinct colors (red, orange, yellow, green, blue, purple) across map and UI
UX-DR8: Maintain LoadingSpinner and ErrorBoundary components for all async operations
UX-DR9: Maintain keyboard accessibility for all interactive elements per educational accessibility standard

### FR Coverage Map

| FR | Covered By Epic | Epic.Story |
|----|----------------|------------|
| FR1 | Epic 1 | 1.1 |
| FR2 | Epic 1 | 1.1 |
| FR3 | Epic 1 | 1.2 |
| FR4 | Epic 1 | 1.2 |
| FR5 | Epic 2 | 2.1 |
| FR6 | Epic 2 | 2.2 |
| FR7 | Epic 2 | 2.1 |
| FR8 | Epic 2 | 2.3 |
| FR9 | Epic 2 | 2.3 |
| FR10 | Epic 2 | 2.4 |
| FR11 | Epic 2 | 2.5 |
| FR12 | Epic 2 | 2.4 |
| FR6  | Epic 2 | 2.6 |
| FR13 | Epic 3 | 3.1 |
| FR14 | Epic 3 | 3.2 |
| FR15 | Epic 3 | 3.2 |

## Epic List

| Epic | Title | Goal | Stories |
|------|-------|------|---------|
| 1 | Dependency Security Audit & Upgrade | Eliminate all critical/high npm vulnerabilities while maintaining full functionality | 2 |
| 2 | Local Supabase Development Environment | Docker-based local Supabase with full feature parity for development | 6 |
| 3 | Supabase Cloud Reactivation & Keep-Alive | Restore cloud project activity and prevent future auto-pause | 2 |

## Epic 1: Dependency Security Audit & Upgrade

**Goal:** Upgrade all npm dependencies with critical or high severity vulnerabilities to patched versions, ensuring the application builds, runs, and all existing features continue to function correctly.

### Story 1.1: Audit and Upgrade Vulnerable Dependencies

As a developer,
I want to identify and upgrade all packages with critical/high npm vulnerabilities,
So that the codebase is free of known security risks.

**Acceptance Criteria:**

**Given** the current package.json and lock file exist
**When** I run `npm audit` to identify all vulnerabilities
**And** I upgrade all packages with critical or high severity to their patched versions
**And** I review the changelogs for all upgraded dependencies (including minor version bumps) for breaking API changes
**And** I run `npm audit` again
**Then** the audit reports zero critical or high severity findings
**And** `npm audit` exits with code 0

### Story 1.2: Verify Build and Feature Regression After Upgrade

As a developer,
I want to verify that the application builds and all features work after dependency upgrades,
So that security improvements don't break existing functionality.

**Acceptance Criteria:**

**Given** all vulnerable dependencies have been upgraded
**When** I run `npm run build`
**Then** the build completes without TypeScript or Vite errors
**And** the production bundle loads without runtime errors
**And** all 9 routes load and render correctly: `/`, `/login`, `/documents`, `/quizzes`, `/quiz/:quizId`, `/map-drawing`, `/feedback`, `/admin`, `/admin/quiz/:quizId/edit`
**And** the interactive map displays and responds to zone clicks
**And** the quiz system (list, take, admin CRUD) works correctly
**And** the authentication flow (sign in, sign out, admin routes) works
**And** the document management (upload, list, delete) works
**And** the analytics dashboard displays data correctly

## Epic 2: Local Supabase Development Environment

**Goal:** Verify and fix the existing Docker Compose-based local Supabase environment to achieve full parity with the cloud project for development, including auth, database, storage, and all RPC functions.

### Story 2.1: Verify and Fix Docker Compose Configuration

As a developer,
I want to verify that the existing `docker-compose.yml` starts all Supabase services correctly,
So that I know which parts work and what needs fixing.

**Acceptance Criteria:**

**Given** the existing `docker-compose.yml` is in the repo root
**When** I run `docker compose up`
**Then** I have documented which of the 8 Supabase services start successfully and which fail
**And** any failing services are identified with their error messages
**And** the API is accessible at `http://localhost:8000` (or the configured port)
**And** Studio is accessible at `http://localhost:3001` (or the configured port)
**And** Docker volumes persist data across restarts
**And** all issues found are fixed or documented for the next story

### Story 2.2: Verify and Fix Setup Script and Environment Variables

As a developer,
I want to verify that the existing `setup-local-supabase.sh` generates correct credentials,
So that I can bootstrap a working local environment reliably.

**Acceptance Criteria:**

**Given** the existing `setup-local-supabase.sh` and `.env.local.supabase` are in the repo
**When** I run the setup script
**Then** I have verified whether the generated JWT keys, passwords, and env vars are correct
**And** `VITE_SUPABASE_URL` points to `http://localhost:8000`
**And** `VITE_SUPABASE_ANON_KEY` matches the local Kong configuration
**And** any issues in the script are fixed
**And** the script runs successfully on Windows (Git Bash)

### Story 2.3: Verify Local Auth and Storage Functionality

As a developer,
I want to verify that local Supabase auth and storage work end-to-end,
So that I can test auth flows and document management locally.

**Acceptance Criteria:**

**Given** local Supabase is running with the setup script output
**When** I attempt email/password sign up and sign in
**Then** user creation works (auto-confirm enabled via `GOTRUE_MAILER_AUTOCONFIRM=true`)
**And** sign in returns a valid session
**And** file upload, download, and delete work on the `documents` bucket
**And** the storage bucket respects the 50MB max file size
**And** any configuration gaps are fixed

### Story 2.4: Verify Database Schema and RPC Functions Match Cloud

As a developer,
I want to verify that the local database schema matches the cloud instance,
So that queries and RLS policies work identically.

**Acceptance Criteria:**

**Given** local Supabase database is running
**When** I inspect the local database
**Then** I have verified all 5 tables exist: general_settings, quizzes, quiz_questions, quiz_options, page_visits
**And** RLS is enabled on all tables
**And** the `documents` storage bucket exists and is private with correct RLS policies
**And** all RPC functions exist and return correct results:
  - `get_total_visits()` returns an INTEGER
  - `get_visits_by_date_range(start_date, end_date)` returns a table
  - `get_hourly_visits_24h()` returns a table
  - `get_most_visited_pages(limit_count, start_date)` returns a table
  - `cleanup_old_analytics()` returns void
**And** any missing tables, policies, or functions are created/fixed

### Story 2.5: Verify Full App Integration with Local Supabase

As a developer,
I want to verify the app works end-to-end against local Supabase,
So that I can develop locally without cloud dependencies.

**Acceptance Criteria:**

**Given** local Supabase is running with verified schema
**When** I set `VITE_SUPABASE_URL=http://localhost:8000` and `VITE_SUPABASE_ANON_KEY` to the local key
**And** I start the dev server
**Then** the application loads without startup errors
**And** `initializeAuth()` succeeds against the local instance
**And** all service layer calls (AuthService, QuizService, DocumentService, AnalyticsService, SettingsService) work
**And** switching back to cloud by restoring env vars works
**And** i18n Vietnamese/English continues to work

### Story 2.6: Document Local Development Setup

As a developer,
I want clear documentation for the local Supabase setup,
So that the setup process is reproducible.

**Acceptance Criteria:**

**Given** all local Supabase infrastructure is verified and working
**When** a developer clones the repository
**Then** `.env.example` includes entries for both local and cloud configurations
**And** the README or docs contain a "Local Development Setup" section with step-by-step instructions
**And** the documentation covers Windows (Git Bash) specifics
**And** the end-to-end workflow is verified: start Docker → sign up → upload file → query database → stop

## Epic 3: Supabase Cloud Reactivation & Keep-Alive

**Goal:** Reactivate the paused Supabase cloud project and implement a keep-alive strategy to prevent future automatic pausing on the free tier.

### Story 3.1: Reactivate Supabase Cloud Project and Verify Data Integrity

As a project maintainer,
I want the paused Supabase cloud project to be reactivated with all data intact,
So that the production application functions correctly again.

**Acceptance Criteria:**

**Given** the Supabase cloud project is currently paused
**When** the project is reactivated via the Supabase dashboard or CLI
**Then** all 5 tables exist with their data: general_settings, quizzes, quiz_questions, quiz_options, page_visits
**And** all RLS policies are intact and functional
**And** the `documents` storage bucket exists with its files
**And** all registered auth users and their sessions are preserved
**And** all RPC functions exist and return data
**And** the existing app can connect and authenticate against the cloud project
**And** the cloud API responds to requests without errors
**And** a read operation (fetch published quizzes) completes successfully
**And** a write operation (track a page visit) completes successfully

### Story 3.2: Implement Keep-Alive Strategy for Supabase Free Tier

*Blocked by Story 3.1 — requires active cloud project.*

As a project maintainer,
I want an automated keep-alive mechanism that prevents Supabase from pausing the project due to inactivity,
So that the application remains available without manual intervention.

**Acceptance Criteria:**

**Given** the Supabase cloud project is active on the free tier (Story 3.1 complete)
**When** Supabase's inactivity-based pause policy timeframe (7 days) is approached
**Then** a free-tier uptime monitor (e.g., UptimeRobot or cron-job.org) makes a `GET` request to `https://{project}.supabase.co/rest/v1/` every 48 hours
**And** the request uses the `anon` key (not service role) in the `apikey` header — safe to expose as it is already public in the client bundle
**And** email alerting is configured to notify on 2 consecutive ping failures
**And** a second monitor hits the live Netlify URL to verify the app returns HTTP 200
**And** the keep-alive mechanism is documented in `docs/` for future maintainers (URL, headers, schedule, alert config)
**And** the mechanism costs nothing (confirmed free-tier monitoring service, no credit card)
**And** the uptime monitor dashboard provides visibility into ping success/failure
