# Supabase Cloud Reactivation & Verification Guide

> **✅ UPDATE 2026-07-31: Cloud project RESTORED and verified live.**
>
> The Supabase cloud project (`bfahqobxbuobifkfedzw`) was restored from backup and is
> now fully operational. Verified live on 2026-07-31:
> - DNS resolves (was NXDOMAIN while deleted)
> - REST API → HTTP 200; all 5 tables intact (`general_settings`, `quizzes`,
>   `quiz_questions`, `quiz_options`, `page_visits`) with real data
> - All 5 RPC functions return correctly (`get_total_visits` → 0, others → `[]`)
> - `documents` storage bucket present with its 8 economic-zone folders
> - Auth (GoTrue v2.194.0) healthy
>
> **Preventing recurrence:** to avoid another deletion from free-tier inactivity,
> see `docs/supabase-keep-alive-guide.md`.

## Overview

This guide provides step-by-step instructions for reactivating a paused Supabase cloud project and verifying that all data, configuration, and functionality remain intact.

## Prerequisites

- Supabase account with access to the vngeo project
- Project is currently in paused state
- Access to Supabase dashboard (supabase.com)
- Project reference URL (format: `https://{project-ref}.supabase.co`)

## Part 1: Reactivation Process

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in with your account credentials
3. Navigate to your projects list

### Step 2: Reactivate the Project

1. Find the vngeo project in your projects list
2. The project status should show as "Paused"
3. Click on the project to open it
4. Look for a "Resume", "Reactivate", or "Restore" button
5. Click the button and confirm reactivation
6. Wait for the project to fully initialize (typically 1-2 minutes)
7. Verify the project status changes to "Active"

**Expected Timeline:**
- Resume initiation: Immediate
- Full activation: 1-2 minutes
- All services ready: 2-3 minutes

### Step 3: Confirm Project is Active

1. In the Supabase dashboard, the project header should show "Active"
2. The green status indicator should be visible
3. Navigate to different sections (Database, Auth, Storage) to ensure they load

## Part 2: Comprehensive Verification Checklist

### A. Database Tables Verification

**Expected Tables (5 total):**
1. `general_settings`
2. `quizzes`
3. `quiz_questions`
4. `quiz_options`
5. `page_visits`

#### Verification via Supabase SQL Editor:

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Expected Output:**
```
table_name
--------------------
general_settings
page_visits
quiz_options
quiz_questions
quizzes
```

#### Verify Row Counts:

```sql
-- Check data exists in each table
SELECT 
    'general_settings' as table_name, COUNT(*) as row_count FROM general_settings
UNION ALL
SELECT 'quizzes', COUNT(*) FROM quizzes
UNION ALL
SELECT 'quiz_questions', COUNT(*) FROM quiz_questions
UNION ALL
SELECT 'quiz_options', COUNT(*) FROM quiz_options
UNION ALL
SELECT 'page_visits', COUNT(*) FROM page_visits;
```

### B. RLS Policies Verification

#### Check RLS is Enabled:

```sql
-- Check RLS status on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected:** All 5 tables should show `rls_enabled = true`

#### View RLS Policies:

```sql
-- List all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### C. Storage Bucket Verification

#### Via Supabase Dashboard:

1. Navigate to "Storage" section
2. Verify `documents` bucket exists
3. Click on the bucket to view files
4. Verify files are present and accessible

#### Via SQL:

```sql
-- Check storage bucket exists
SELECT * FROM storage.buckets WHERE name = 'documents';
```

**Expected:**
- `name`: documents
- `public`: false (private bucket)
- `file_size_limit`: 52428800 (50MB)
- `allowed_mime_types`: null or specific types

#### Verify Storage RLS Policies:

```sql
-- Check storage RLS policies
SELECT * FROM storage.policies WHERE bucket_id = 'documents';
```

### D. Auth Users Verification

#### Via Supabase Dashboard:

1. Navigate to "Authentication" section
2. Click "Users"
3. Verify all expected users are listed
4. Check user metadata is intact

#### Via SQL:

```sql
-- Count auth users
SELECT COUNT(*) as total_users FROM auth.users;

-- List users with email and created_at
SELECT id, email, created_at, last_sign_in_at 
FROM auth.users 
ORDER BY created_at DESC;
```

### E. RPC Functions Verification

**Expected RPC Functions (5 total):**
1. `get_total_visits()`
2. `get_visits_by_date_range(start_date, end_date)`
3. `get_hourly_visits_24h()`
4. `get_most_visited_pages(limit_count, start_date)`
5. `cleanup_old_analytics()`

#### List All Functions:

```sql
-- List all custom functions
SELECT 
    routine_name,
    data_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

#### Test Each Function:

```sql
-- Test get_total_visits()
SELECT get_total_visits();

-- Test get_visits_by_date_range()
SELECT * FROM get_visits_by_date_range(
    '2024-01-01'::date, 
    CURRENT_DATE
) LIMIT 10;

-- Test get_hourly_visits_24h()
SELECT * FROM get_hourly_visits_24h();

-- Test get_most_visited_pages()
SELECT * FROM get_most_visited_pages(10, '2024-01-01'::date);

-- Test cleanup_old_analytics() - BE CAREFUL, this deletes data
-- SELECT cleanup_old_analytics();
```

### F. API Functionality Tests

#### Test Read Operation (Fetch Quizzes):

Using curl (replace `{project-ref}` and `{anon-key}`):

```bash
curl -X GET 'https://{project-ref}.supabase.co/rest/v1/quizzes?is_published=eq.true' \
  -H "apikey: {anon-key}" \
  -H "Authorization: Bearer {anon-key}" \
  -H "Content-Type: application/json"
```

**Expected:** JSON array of published quizzes with HTTP 200

#### Test Write Operation (Track Page Visit):

```bash
curl -X POST 'https://{project-ref}.supabase.co/rest/v1/page_visits' \
  -H "apikey: {anon-key}" \
  -H "Authorization: Bearer {anon-key}" \
  -H "Content-Type: application/json" \
  -d '{
    "page": "/verification-test",
    "user_agent": "verification-script",
    "referrer": "manual-verification"
  }'
```

**Expected:** HTTP 201 with created record

### G. Authentication Test

#### Test Auth Session:

```bash
# If you have a test user's credentials:
curl -X POST 'https://{project-ref}.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: {anon-key}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "your-password",
    "gotrue_meta_security": {}
  }'
```

**Expected:** HTTP 200 with access_token and user object

## Part 3: Application Connection Test

### Test with Environment Variables

1. Ensure your local environment has the cloud project credentials:
   ```bash
   VITE_SUPABASE_URL=https://{project-ref}.supabase.co
   VITE_SUPABASE_ANON_KEY={your-anon-key}
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Navigate to the app and verify:
   - [ ] Homepage loads without errors
   - [ ] Authentication works (sign in/sign out)
   - [ ] Quiz list displays
   - [ ] Documents page loads
   - [ ] Analytics dashboard shows data
   - [ ] Map drawing tool works

### Quick Smoke Test via Browser Console

Open the app in a browser and run in the console:

```javascript
// Test Supabase connection
const { data, error } = await supabase
  .from('quizzes')
  .select('count')
  .single();

console.log('Connection test:', error ? 'FAILED' : 'SUCCESS');
```

## Part 4: Troubleshooting

### Project Won't Reactivate

**Symptoms:** Resume button not working, errors during activation

**Solutions:**
- Ensure you have project owner/admin permissions
- Check Supabase status page for platform issues
- Contact Supabase support if the issue persists
- Try a different browser or incognito mode

### Tables Missing Data

**Symptoms:** Tables exist but contain no rows

**Solutions:**
- Check if data was properly backed up before pause
- Look for any export files in Supabase dashboard
- Consider restoring from a database backup if available
- Review pause notification emails from Supabase

### RPC Functions Not Found

**Symptoms:** Functions return "function does not exist" error

**Solutions:**
- Recreate missing functions using migration files
- Check function definitions in your local development setup
- Use Supabase migrations to redeploy functions

### Storage Files Not Accessible

**Symptoms:** Bucket exists but files return 404

**Solutions:**
- Verify bucket RLS policies allow anon read (if needed)
- Check if files need to be re-uploaded
- Verify file paths are correct

### API Returns 401/403

**Symptoms:** API requests fail authentication

**Solutions:**
- Verify anon key is correct (check in project settings)
- Ensure API key header format is correct
- Check if RLS policies are blocking access
- Verify project is fully active (wait 1-2 more minutes)

## Part 5: Post-Verification Actions

### If All Checks Pass:

1. Mark Story 3.1 as complete
2. Proceed to Story 3.2 (Keep-Alive setup)
3. Update sprint status accordingly
4. Document any anomalies found

### If Checks Fail:

1. Document which checks failed
2. Capture error messages
3. Attempt troubleshooting steps
4. If unresolvable, escalate to team lead
5. Consider data recovery options

## Part 6: Verification Script Template

Save this as `verify-supabase-cloud.sh` and run after reactivation:

```bash
#!/bin/bash

# Configuration
PROJECT_REF="your-project-ref"
ANON_KEY="your-anon-key"
API_URL="https://${PROJECT_REF}.supabase.co"

echo "=== Supabase Cloud Verification ==="
echo ""

# Test 1: API Health
echo "[1/5] Testing API Health..."
response=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/rest/v1/")
if [ "$response" = "200" ]; then
    echo "✓ API is responding"
else
    echo "✗ API returned status $response"
fi
echo ""

# Test 2: Read Quizzes
echo "[2/5] Testing Read Operation..."
response=$(curl -s "${API_URL}/rest/v1/quizzes?is_published=eq.true&limit=1" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")
if echo "$response" | grep -q "\["; then
    echo "✓ Read operation successful"
else
    echo "✗ Read operation failed"
fi
echo ""

# Test 3: Write Page Visit
echo "[3/5] Testing Write Operation..."
response=$(curl -s -w "\n%{http_code}" "${API_URL}/rest/v1/page_visits" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"page": "/verification-test", "user_agent": "verify-script"}')
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "201" ]; then
    echo "✓ Write operation successful"
else
    echo "✗ Write operation failed with status $http_code"
fi
echo ""

echo "=== Verification Complete ==="
echo "For full database verification, use the Supabase SQL Editor"
echo "and run the queries in this document."
```

## Summary

After completing this verification:

- [ ] All 5 tables exist with data
- [ ] RLS policies enabled on all tables
- [ ] Storage bucket exists with files
- [ ] Auth users preserved
- [ ] All RPC functions working
- [ ] Read operations successful
- [ ] Write operations successful
- [ ] App connects and authenticates

**Next Steps:** Proceed to setting up the keep-alive mechanism (Story 3.2).
