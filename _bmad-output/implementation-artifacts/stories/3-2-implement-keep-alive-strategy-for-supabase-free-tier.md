---
story_key: 3-2-implement-keep-alive-strategy-for-supabase-free-tier
status: ready-for-dev
---

# Story 3.2: Implement Keep-Alive Strategy for Supabase Free Tier

*Blocked by Story 3.1 — requires active cloud project.*

## User Story
As a project maintainer,
I want an automated keep-alive mechanism that prevents Supabase from pausing the project due to inactivity,
So that the application remains available without manual intervention.

## Context
- Supabase free tier pauses projects after 7 days of inactivity
- Activity is defined as database/API requests
- Need free monitoring solution (no cost)
- Application is deployed on Netlify

## Acceptance Criteria

**Given** the Supabase cloud project is active on the free tier (Story 3.1 complete)
**When** Supabase's inactivity-based pause policy timeframe (7 days) is approached
**Then** a free-tier uptime monitor (e.g., UptimeRobot or cron-job.org) makes a `GET` request to `https://{project}.supabase.co/rest/v1/` every 48 hours
**And** the request uses the `anon` key (not service role) in the `apikey` header — safe to expose as it is already public in the client bundle
**And** email alerting is configured to notify on 2 consecutive ping failures
**And** a second monitor hits the live Netlify URL to verify the app returns HTTP 200
**And** the keep-alive mechanism is documented in `docs/` for future maintainers (URL, headers, schedule, alert config)
**And** the mechanism costs nothing (confirmed free-tier monitoring service, no credit card)
**And** the uptime monitor dashboard provides visibility into ping success/failure

## Tasks/Subtasks

### Documentation (Can be completed now)
- [x] Create comprehensive keep-alive documentation
- [x] Document recommended monitoring services (UptimeRobot, cron-job.org)
- [x] Document exact API endpoint and headers to use
- [x] Document monitoring interval (48 hours)
- [x] Document alert configuration
- [x] Create setup step-by-step guide

### Setup Actions (To be completed after Story 3.1)
- [ ] Create account on chosen monitoring service
- [ ] Create Supabase API monitor (every 48 hours)
- [ ] Create Netlify app monitor
- [ ] Configure email alerts (2 consecutive failures)
- [ ] Test monitors trigger successfully
- [ ] Verify monitoring dashboard shows successful pings

## Dev Notes

### Keep-Alive Mechanism Design

**Why 48 hours?**
- Supabase free tier pauses after 7 days of inactivity
- Pinging every 48 hours = ~3.5x safety margin
- Accounts for potential monitor downtime
- Stays well under free tier limits of most monitoring services

**Why GET request to Supabase API?**
- Counts as "activity" for Supabase
- Uses existing anon key (already public)
- Lightweight request (no heavy queries)
- Returns 200 when project is active

### Recommended Services

**UptimeRobot (uptimerobot.com)**
- Free tier: 50 monitors, 5-minute intervals
- Email alerts included
- No credit card required
- Simple setup

**cron-job.org**
- Free tier: unlimited cron jobs
- Email alerts included
- HTTP GET/POST support
- No credit card required

### Request Details

**Supabase Health Check:**
```
GET https://{project-ref}.supabase.co/rest/v1/
Headers:
  apikey: {anon-key}
  Authorization: Bearer {anon-key}
Expected: HTTP 200
```

**Netlify App Health Check:**
```
GET https://{app-name}.netlify.app
Expected: HTTP 200
```

### Environment Variables Needed
- `VITE_SUPABASE_URL` - to extract project ref
- `VITE_SUPABASE_ANON_KEY` - for authentication

## Dev Agent Record

### Debug Log
No issues encountered during documentation creation.

### Completion Notes
**Story Status: REVIEW (pending Story 3.1 completion)**

All documentation tasks completed:
- ✅ Created comprehensive keep-alive guide
- ✅ Documented UptimeRobot setup (recommended)
- ✅ Documented cron-job.org setup (alternative)
- ✅ Documented exact API endpoints and headers
- ✅ Documented 48-hour interval with rationale
- ✅ Documented alert configuration (2 consecutive failures)
- ✅ Documented cost confirmation (both services free)
- ✅ Created step-by-step setup instructions

**Pending Actions (after Story 3.1 completes):**
1. User creates account on monitoring service
2. User sets up Supabase API monitor (every 48 hours)
3. User sets up Netlify app monitor
4. User configures email alerts
5. User tests monitors trigger successfully

**Why Blocked by Story 3.1:**
Keep-alive monitors need to verify against an active Supabase project. Setting up monitors before reactivation would result in immediate failure alerts, giving false impression that something is broken.

### Implementation Plan
This story provides complete setup documentation for keep-alive mechanism. Once cloud project is active (Story 3.1), user can:
1. Follow setup guide in docs/supabase-keep-alive-guide.md
2. Set up monitors in under 15 minutes
3. Verify monitors show "UP" status
4. Configure email alerts for proactive notification

## File List
- docs/supabase-keep-alive-guide.md
- _bmad-output/implementation-artifacts/stories/3-2-implement-keep-alive-strategy-for-supabase-free-tier.md

## Change Log
- 2026-05-18: Initial story creation, completed all documentation tasks
- 2026-05-18: Story marked as REVIEW (documentation complete, awaits Story 3.1)

## Status: review
