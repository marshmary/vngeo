# Supabase Keep-Alive Strategy Guide

## Overview

This guide explains how to set up an automated keep-alive mechanism to prevent the Supabase free-tier project from being automatically paused due to inactivity.

## Problem Statement

Supabase's free tier automatically pauses projects after **7 days of inactivity**. When paused:
- The application cannot connect to the database
- API requests fail
- Users experience downtime
- Manual reactivation is required

> **⚠️ Hard-learned lesson (2026-07):** this is not theoretical. The vngeo project was
> paused, exceeded the free-tier retention window, and was **permanently deleted** (DNS
> returned NXDOMAIN). It had to be restored from a held backup. A working keep-alive
> monitor is the difference between the project staying up and it being gone.
> **If the project has just been restored, set this up within 6 days** — the 7-day
> inactivity clock starts immediately on restore.

This keep-alive solution ensures the project stays active by making automated requests at regular intervals.

## Solution: Automated Health Checks

We use free-tier monitoring services to ping the Supabase API every 48 hours, ensuring the project never reaches the 7-day inactivity threshold.

### Why 48 Hours?

- Supabase pause threshold: 7 days (168 hours)
- Our ping interval: 48 hours
- **Safety margin:** 3.5x buffer
- Accounts for potential monitor downtime
- Stays well within free tier limits

## Recommended Monitoring Services

### Option 1: UptimeRobot (Recommended)

**Website:** [https://uptimerobot.com](https://uptimerobot.com)

**Free Tier Features:**
- 50 monitors
- 5-minute check intervals
- HTTP/S, keyword, port, ping checks
- Email alerts included
- No credit card required
- Status page available

**Pros:**
- Established service with good uptime
- Simple, intuitive interface
- Reliable alerting
- Mobile app available

**Cons:**
- 5-minute minimum interval (we only need 48 hours)

### Option 2: cron-job.org

**Website:** [https://cron-job.org](https://cron-job.org)

**Free Tier Features:**
- Unlimited cron jobs
- HTTP GET/POST support
- Custom schedules (including intervals)
- Email alerts included
- No credit card required
- Execution history

**Pros:**
- More flexible scheduling
- Can set exact 48-hour intervals
- Lightweight interface
- Good for developers

**Cons:**
- Less polished UI than UptimeRobot

## Setup Instructions

### Prerequisites

Before setting up monitors, you'll need:
1. Your Supabase project URL (format: `https://{project-ref}.supabase.co`)
2. Your Supabase anon key (public key)
3. Your Netlify app URL (e.g., `https://vngeo.netlify.app`)

### Finding Your Credentials

#### Supabase Project URL:

1. Go to [https://supabase.com](https://supabase.com)
2. Open your project
3. Go to Settings → API
4. Copy the "Project URL" (format: `https://{xxxx}.supabase.co`)

#### Supabase Anon Key:

1. In the same Settings → API section
2. Copy the "anon public" key
3. This is safe to use in monitoring requests (already public in client bundle)

#### Netlify App URL:

1. Go to your Netlify dashboard
2. Find your vngeo deployment
3. Copy the deployed URL

### Monitor 1: Supabase API Keep-Alive (via Netlify function)

**Purpose:** Prevents Supabase project from pausing by making an authenticated API request on a schedule.

> **⚠️ Critical — authenticated request required.** A bare `GET /rest/v1/` returns
> **HTTP 401** without an `apikey`, and Supabase does **not** count an unauthenticated
> 401 as project activity. The monitor MUST make an authenticated request, or the
> project will pause despite the monitor "passing."
>
> **Why a Netlify function (not a direct Supabase URL):** UptimeRobot's free tier
> cannot send custom HTTP *headers* (Pro-only), and passing the 208-char anon key as a
> URL query param produces a ~300-char URL that UptimeRobot rejects as "invalid." A
> server-side function sidesteps both problems: it holds the key as an env var, calls
> Supabase itself, and exposes a **short, clean URL** for the monitor to hit.
>
> **Note: monitoring the Netlify SPA root alone does NOT keep Supabase alive** — Netlify
> serves static HTML and the monitor never runs the client JS that talks to Supabase.
> The function is what makes the Supabase call happen server-side on each ping.

#### Step A — Deploy the health-check function (one-time)

The function is already in the repo at `vietnam-economic-zones/netlify/functions/health.ts`. It exposes `GET /api/health`, which does an authenticated Supabase read and returns `{"status":"ok",...}` (HTTP 200) or an error code.

1. Ensure these Netlify env vars are set (Site settings → Environment variables). These are the **same vars the app already uses** — no new secrets:
   - `VITE_SUPABASE_URL` — e.g. `https://bfahqobxbuobifkfedzw.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` — the anon public key
2. Deploy (push to your main branch, or trigger a manual deploy). The function is auto-discovered from `netlify/functions/` (configured in `netlify.toml`).
3. **Verify the function works:** open `https://vngeo.netlify.app/api/health` in a browser — expect `{"status":"ok","supabase":"reachable"}`. If you get `missing-env`, the env vars aren't set on Netlify.

#### Step B — Point UptimeRobot at it (free Keyword monitor)

1. Sign up or log in at [https://uptimerobot.com](https://uptimerobot.com)
2. Click "Add New Monitor"
3. Configure:
   - **Monitor Type:** **Keyword**
   - **URL:** `https://vngeo.netlify.app/api/health` *(short, clean — no key, no length issue)*
   - **Keyword:** `ok` (the function returns `{"status":"ok",...}` on success; an auth failure or Supabase outage returns a different body + non-200 status, so keyword-not-found catches both)
   - **Monitor Interval:** **1 hour** (free tier; ~720 requests/month — negligible, and ~1 hour is far inside the 7-day pause threshold)
   - **HTTP Headers:** leave **empty** (not needed — the key lives server-side in the function)
   - **Alert Contacts:** add your email
   - **Alert When:** keyword **not** found
   - **Alert Threshold:** 2 consecutive failures
4. Click "Create Monitor"
5. **Verify immediately:** the first check should be "UP." If "DOWN," open `/api/health` in a browser to see the reason (`missing-env`, `supabase-401`, etc.).

#### Using cron-job.org (alternative to UptimeRobot)

Same idea — point it at the function URL instead of Supabase directly:
- **URL:** `https://vngeo.netlify.app/api/health`
- **Execution:** every 1 day (or hourly)
- **Notifications:** email on failure
The function holds the key, so no query-string or header hacking is needed.

### Monitor 2: Netlify App Health Check

**Purpose:** Verifies the entire application stack is working, not just Supabase.

#### Using UptimeRobot:

1. Add another monitor
2. Configure as follows:
   - **Monitor Type:** HTTP
   - **URL:** Your Netlify app URL
   - **Monitor Interval:** 5 minutes or 1 hour
   - **Alert Contacts:** Same as above
   - **Alert Threshold:** 2 consecutive failures

3. Click "Create Monitor"

#### Using cron-job.org:

1. Add another cron job
2. Configure as follows:
   - **Title:** Netlify App Health
   - **URL:** Your Netlify app URL
   - **Execution:** Every hour or every 6 hours
   - **Notifications:** Enable email on failure
   - **Save on failures:** Yes

3. Save the cron job

## Verification

After setting up monitors:

### Test Supabase Monitor:

1. Manually trigger the monitor (if supported) or wait for first check
2. Verify status shows "UP" or "Success"
3. Check Supabase dashboard to confirm project remains active

### Test Netlify Monitor:

1. Manually trigger or wait for first check
2. Verify status shows "UP" or "Success"
3. Visit your Netlify URL to confirm app loads

### Monitor Dashboards:

- **UptimeRobot:** Check "My Monitors" page for status
- **cron-job.org:** Check dashboard for execution history

## Advanced Configuration

### Custom Health Endpoint (Optional)

For more robust monitoring, you can create a dedicated health endpoint:

**In your React app, add a route:**

```typescript
// src/routes/health.tsx or similar
export function loader() {
  // Quick database check
  return Response.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected' 
  });
}
```

Then point your monitor to `/health` instead of root.

### Integrate with Analytics (Optional)

The keep-alive requests will show up in your `page_visits` table. To filter these out:

```typescript
// In your tracking service
const trackPageVisit = (page: string) => {
  // Skip tracking for health check bot traffic
  if (navigator.userAgent.includes('uptimerobot') || 
      navigator.userAgent.includes('cron-job')) {
    return;
  }
  
  // Normal tracking logic
  // ...
};
```

## Cost Confirmation

Both recommended services are **completely free**:

| Service | Free Tier Limits | Credit Card Required |
|---------|-----------------|---------------------|
| UptimeRobot | 50 monitors, 5-min intervals | No |
| cron-job.org | Unlimited cron jobs | No |

## Monitoring Dashboard

### Key Metrics to Watch:

1. **Uptime %:** Should be 99%+
2. **Response Time:** Should be < 1 second
3. **Incidents:** Should be minimal
4. **Alert triggers:** Investigate any repeated failures

### Common False Alarms:

- Temporary network blips (single failure)
- Supabase scheduled maintenance (check status page)
- Monitor service outages (check service status)

This is why we use "2 consecutive failures" for alerting.

## Troubleshooting

### Monitor Shows "Down"

**Step 1:** Verify Supabase project is actually active:
- Check Supabase dashboard
- Look for any "paused" warnings
- Test API manually with curl

**Step 2:** Verify credentials:
- Check project URL format
- Confirm anon key is current

**Step 3:** Check monitor configuration:
- Verify URL is correct
- Check for typos in headers (if any)

### Monitor Succeeds But App Still Fails

This indicates a problem beyond basic connectivity:

- Check browser console for errors
- Verify app environment variables
- Check Supabase logs in dashboard
- Test database queries directly

### Monitor Service Outage

Occasionally, monitoring services have issues:

1. Check service status page:
   - UptimeRobot: [https://status.uptimerobot.com](https://status.uptimerobot.com)
   - cron-job.org: Check their Twitter/status

2. Consider setting up a second backup monitor using the other service

3. Keep manual verification as fallback

## Maintenance

### Monthly Review:

1. [ ] Check monitor dashboards for uptime percentage
2. [ ] Verify email alerts are working
3. [ ] Confirm Supabase project is still active
4. [ ] Review any incident patterns
5. [ ] Update documentation if settings change

### After Any Supabase Changes:

1. [ ] Regenerate anon key if rotated
2. [ ] Update monitor URLs if project changes
3. [ ] Test monitors manually
4. [ ] Verify new key works

## Alternative Approaches

### GitHub Actions scheduled workflow

A `.github/workflows/*.yml` running daily could ping Supabase directly (using a repo secret for the key) with built-in failure alerting via GitHub. This is a valid free-tier option and avoids Netlify functions entirely. We chose the Netlify-function + UptimeRobot route because UptimeRobot gives a dedicated uptime dashboard + email/SMS alerting UX, but GitHub Actions is a fine alternative if you prefer keeping everything in the repo.

### Direct Supabase URL with key in query string (NOT recommended)

Passing the anon key as `?apikey=...` against Supabase directly does authenticate (verified), but the resulting ~300-char URL gets rejected by UptimeRobot's free-tier URL validator ("URL is invalid"). It also puts a long JWT in a URL that shows up in monitor logs. The Netlify-function approach supersedes this.

### Paid Monitoring Services

Services like Pingdom, StatusCake, etc. offer more features but cost money. Not necessary for this use case.

## Summary

**What We've Set Up:**

1. ✅ Netlify serverless function `/api/health` (`vietnam-economic-zones/netlify/functions/health.ts`) that performs an authenticated Supabase read
2. ✅ UptimeRobot free Keyword monitor hitting the short, clean `/api/health` URL
3. ✅ Email alerts on 2+ consecutive failures
4. ✅ Entirely free-tier (Netlify functions free allowance + UptimeRobot free + Supabase free)

**Result:**

Each hourly monitor ping triggers the function, which makes a real authenticated request to Supabase — registering as project activity and keeping it safely inside the 7-day inactivity threshold. The project stays continuously active on the free tier without manual intervention.

## References

- [Supabase Free Tier Limits](https://supabase.com/pricing)
- [UptimeRobot Documentation](https://uptimerobot.com)
- [cron-job.org Documentation](https://cron-job.org)
- [Netlify Status Page](https://www.netlify-status.com/)

## Change Log

- 2026-05-18: Initial documentation created
- 2026-07-31: Tightened after the 2026-07 deletion incident. Added the post-restore
  urgency note; fixed the critical auth gap (a bare `GET /rest/v1/` returns 401 and
  does NOT count as activity — the monitor must make an authenticated request).
- 2026-07-31 (final): switched the recommended approach to a **Netlify serverless
  function** (`/api/health`) + UptimeRobot free Keyword monitor. The earlier
  query-string-key approach was rejected by UptimeRobot's free-tier URL validator
  (~300-char "invalid URL") and custom headers are Pro-only. The function holds the
  key server-side as an env var, exposing a short clean URL the monitor accepts.
  Verified the underlying authenticated Supabase read returns HTTP 200 live.
