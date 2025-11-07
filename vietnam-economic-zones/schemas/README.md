# Database Schemas

This folder contains all SQL schema files and sample data for the Vietnam Economic Zones application.

## 📋 Quick Start - Execution Order

For a **fresh database setup**, run the SQL files in this **exact order**:

1. **`01_general_settings.sql`** - General application settings (Required)
2. **`02_quiz_complete_schema.sql`** - Quiz system schema (Required)
3. **`03_quiz_sample_data.sql`** - Sample quiz data (Optional - for testing)
4. **`04_analytics_tracking.sql`** - Website analytics tracking (Optional - for admin dashboard)

### ⚡ How to Execute

```bash
# In Supabase SQL Editor, run each file in order:
# 1. Copy contents of 01_general_settings.sql → Run
# 2. Copy contents of 02_quiz_complete_schema.sql → Run
# 3. Copy contents of 03_quiz_sample_data.sql → Run (optional)
# 4. Copy contents of 04_analytics_tracking.sql → Run (optional - for analytics)
```

---

## 📁 Files Overview

### 1. `01_general_settings.sql` ⭐ **General Settings Schema**

**Purpose:** Core application settings table for storing configurable values.

**What it does:**
- Creates `general_settings` table with key-value structure
- Enables Row Level Security (RLS)
- Public read access (unauthenticated users can read)
- Authenticated users can create/update/delete settings
- Sets up automatic `updated_at` trigger
- Inserts default map drawing video URL

**When to use:**
- **ALWAYS RUN FIRST** - Required for app settings functionality
- Fresh database setup
- After database reset

**Features:**
- 🔓 Public read access for settings
- 🔐 Admin-only write access
- ⏰ Auto-updating timestamps
- 🎥 Default map drawing video configuration

---

### 2. `02_quiz_complete_schema.sql` ⭐ **Quiz System Schema**

**Purpose:** Complete quiz system schema with all tables, indexes, RLS policies, and triggers.

**What it does:**
- Creates 3 tables: `quizzes`, `quiz_questions`, `quiz_options`
- Sets up all indexes for performance
- Enables Row Level Security (RLS)
- Creates all security policies with proper USING and WITH CHECK clauses
- Sets up automatic timestamp triggers
- Includes verification queries

**When to use:**
- Fresh database setup
- Recreating the quiz schema from scratch
- After database reset

**How to use:**
1. Open Supabase SQL Editor
2. Copy and paste the entire file
3. Click "Run"
4. Check the output for success messages and verification results

---

### 3. `03_quiz_sample_data.sql`

**Purpose:** Sample quiz data for testing and demonstration.

**What it includes:**
- 3 complete quizzes with different difficulty levels:
  - **Easy:** Vietnam Economic Zones - Basic Knowledge (5 questions)
  - **Medium:** Industrial Parks and Export Processing Zones (6 questions)
  - **Hard:** Investment and Business in Economic Zones (7 questions)
- Total: 18 questions with 72 answer options
- Mix of single-answer and multiple-answer questions
- Detailed explanations for each question

**When to use:**
- After running `01_general_settings.sql` and `02_quiz_complete_schema.sql`
- For testing the quiz system
- For demonstration purposes
- For development and debugging

**How to use:**
1. Ensure both `01_general_settings.sql` and `02_quiz_complete_schema.sql` have been run first
2. Get your user ID: `SELECT id FROM auth.users LIMIT 1;`
3. The script will automatically use the first user found
4. Open Supabase SQL Editor
5. Copy and paste the entire file
6. Click "Run"

**Note:** The sample data automatically assigns quizzes to the first user in the `auth.users` table.

---

### 4. `QUIZ_403_ERROR_FIX.sql` 🔧 **Quiz 403 Error Quick Fix**

**Purpose:** Fixes 403 Forbidden errors when saving quizzes by updating RLS policies.

**What it does:**
- Drops incomplete RLS policies on `quiz_questions` and `quiz_options`
- Recreates policies with both USING and WITH CHECK clauses
- Includes verification queries to confirm fix
- Safe to run on existing databases (won't affect data)

**When to use:**
- **When experiencing 403 errors** saving quizzes
- **Existing databases** that need policy updates
- **Quick fix** without recreating entire schema

**Symptoms that indicate you need this:**
- ❌ 403 Forbidden error when creating quiz questions
- ❌ 403 Forbidden error when adding quiz options
- ❌ 403 Forbidden error when saving quiz edits
- ✅ Quiz creation works but can't add questions

**How to use:**
1. Open Supabase SQL Editor
2. Copy and paste the entire `QUIZ_403_ERROR_FIX.sql` file
3. Click "Run"
4. Check verification output - should show both USING and WITH CHECK clauses

**Why this happens:**
RLS policies need both clauses for `FOR ALL` operations:
- `USING` - Controls SELECT, UPDATE, DELETE (checks existing rows)
- `WITH CHECK` - Controls INSERT and UPDATE (validates new data)

**Alternative:** For fresh installations, use `02_quiz_complete_schema.sql` which already includes the fix.

**Related Documentation:** See `QUIZ_403_ERROR_FIX.md` for detailed explanation.

---

### 5. `04_analytics_tracking.sql` ⭐ **Analytics Tracking Schema**

**Purpose:** Website analytics and visitor tracking system for the admin dashboard.

**What it does:**
- Creates `page_visits` table for tracking individual page views
- Stores session information, device details, and visitor metadata
- Sets up performance indexes for fast queries
- Creates analytics views for aggregated statistics
- Includes helper functions for common analytics queries
- Enables RLS with public insert (tracking) and authenticated read (dashboard)

**What it tracks:**
- 📊 Page visits with timestamps and referrer
- 🔄 Session tracking with duration
- 👥 Unique visitors (persistent ID)
- 🖥️ Device type, browser, and OS information
- 👤 User authentication status
- 🌍 Optional country tracking

**When to use:**
- After running `01_general_settings.sql` (required for core setup)
- When you want to add analytics tracking to the application
- For admin dashboard metrics
- Optional but recommended for production deployments

**How to use:**
1. Ensure `01_general_settings.sql` has been run first
2. Open Supabase SQL Editor
3. Copy and paste the entire file
4. Click "Run"
5. Verify success messages in output

**Features:**
- 🔓 Public insert for anonymous tracking
- 🔐 Authenticated-only read for privacy
- 📊 Pre-built analytics views and functions
- ⚡ Performance-optimized indexes
- 🧹 Data retention cleanup function

**Helper Functions:**
- `get_total_visits()` - Get total visit count
- `get_visits_by_date_range(start, end)` - Visits for date range
- `get_hourly_visits_24h()` - Hourly breakdown (last 24h)
- `get_most_visited_pages(limit, start_date)` - Popular pages
- `cleanup_old_analytics()` - Remove data older than 1 year

---

## 🚀 Quick Start Guide

### For Fresh Setup (New Database)

**Execute in this exact order:**

```sql
-- Step 1: General Settings (REQUIRED)
-- File: 01_general_settings.sql
-- Creates: general_settings table with RLS policies
-- Purpose: Stores app-wide settings (video URLs, etc.)

-- Step 2: Quiz Schema (REQUIRED)
-- File: 02_quiz_complete_schema.sql
-- Creates: quizzes, quiz_questions, quiz_options tables
-- Purpose: Complete quiz system with RLS policies

-- Step 3: Sample Data (OPTIONAL - for testing)
-- File: 03_quiz_sample_data.sql
-- Creates: 3 sample quizzes with 18 questions
-- Purpose: Test data for development

-- Step 4: Analytics Tracking (OPTIONAL - for admin dashboard)
-- File: 04_analytics_tracking.sql
-- Creates: page_visits table with analytics functions
-- Purpose: Website visitor tracking and statistics
```

**⚠️ IMPORTANT:** You must have at least one user in `auth.users` before running sample data.

### For Existing Database (Updating Schemas)

If you already have tables but need to update policies or add new features:

**Option 1: Safe Re-run (Recommended)**
```sql
-- Run entire files again (safe - uses IF NOT EXISTS and DROP IF EXISTS)
-- 1. 01_general_settings.sql (updates settings policies)
-- 2. 02_quiz_complete_schema.sql (updates quiz policies)
```

**Option 2: Selective Update**
```sql
-- Only run specific sections:
-- From 01_general_settings.sql:
--   - DROP/CREATE POLICY sections
-- From 02_quiz_complete_schema.sql:
--   - DROP EXISTING POLICIES section
--   - RLS POLICIES sections
```

### For Adding New Settings

To add a new general setting key:

```sql
-- Add to SettingKey type in settings.types.ts:
export type SettingKey = 'map_drawing_video_url' | 'your_new_setting';

-- Insert in database:
INSERT INTO general_settings (key, value, description)
VALUES ('your_new_setting', 'default_value', 'Description here')
ON CONFLICT (key) DO NOTHING;
```

---

## 📊 Schema Overview

### Database Tables Structure

```
general_settings (01_general_settings.sql)
├── id (UUID, PK)
├── key (VARCHAR, UNIQUE) - Setting identifier
├── value (TEXT) - Setting value
├── description (TEXT) - Optional description
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

quizzes (02_quiz_complete_schema.sql)
├── id (UUID, PK)
├── title (TEXT)
├── description (TEXT)
├── difficulty (easy|medium|hard)
├── status (draft|published|archived)
├── time_limit (INTEGER, minutes)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── created_by (UUID, FK → auth.users)

quiz_questions (02_quiz_complete_schema.sql)
├── id (UUID, PK)
├── quiz_id (UUID, FK → quizzes)
├── question (TEXT)
├── explanation (TEXT)
├── allow_multiple_answers (BOOLEAN)
├── order_index (INTEGER)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

quiz_options (02_quiz_complete_schema.sql)
├── id (UUID, PK)
├── question_id (UUID, FK → quiz_questions)
├── text (TEXT)
├── is_correct (BOOLEAN)
├── order_index (INTEGER)
└── created_at (TIMESTAMP)

page_visits (04_analytics_tracking.sql)
├── id (UUID, PK)
├── page_path (VARCHAR) - URL path visited
├── page_title (VARCHAR) - Page title
├── referrer (VARCHAR) - Referrer URL
├── session_id (VARCHAR) - Session identifier
├── visitor_id (VARCHAR) - Persistent visitor ID
├── user_id (UUID, FK → auth.users) - Optional authenticated user
├── is_authenticated (BOOLEAN) - User auth status
├── user_agent (TEXT) - Browser user agent
├── device_type (VARCHAR) - mobile|tablet|desktop
├── browser (VARCHAR) - Browser name
├── os (VARCHAR) - Operating system
├── country_code (VARCHAR) - Optional country
├── visit_timestamp (TIMESTAMP) - Visit time
├── session_duration (INTEGER) - Session length in seconds
└── created_at (TIMESTAMP)
```

### 🔐 Security Rules (RLS Policies)

**General Settings:**
- ✅ **Public Read:** Anyone can read settings (no auth required)
- ✅ **Authenticated Write:** Only logged-in users can create/update/delete
- ✅ Use case: Map drawing video visible to all, only admins can change

**Quizzes:**
- ✅ **Anyone** can view published quizzes
- ✅ **Authenticated users** can create quizzes
- ✅ **Quiz creators** can update/delete their own quizzes

**Questions & Options:**
- ✅ **Anyone** can view questions/options from published quizzes
- ✅ **Quiz creators** can manage questions/options for their own quizzes
- ✅ Both USING and WITH CHECK clauses ensure proper INSERT/UPDATE validation

**Page Visits (Analytics):**
- ✅ **Public Insert:** Anyone can record visits (anonymous tracking)
- ✅ **Authenticated Read:** Only logged-in users can view analytics data
- ✅ **User Privacy:** Users can view their own visit history
- ✅ **Immutable Data:** No updates/deletes allowed (data integrity)
- ✅ Use case: Track all visitors, but only admins can see statistics

---

## Troubleshooting

### 403 Forbidden Errors

**Symptom:** Getting 403 errors when saving quizzes or adding questions.

**Cause:** Missing or incorrect RLS policies (missing WITH CHECK clauses).

**Solution (Quick Fix - Recommended):**
1. Run `05_quiz_403_error_fix.sql` to update only the problematic policies
2. This is safe and won't affect your existing data

**Solution (Full Recreate):**
1. Run `02_quiz_complete_schema.sql` to recreate all tables and policies
2. This will preserve your data but recreate all policies

**Documentation:** See `QUIZ_403_ERROR_FIX.md` for detailed explanation of the issue and fix.

### Cannot View Quizzes in Navigation

**Symptom:** Quizzes don't appear in the navbar dropdown or quiz list page.

**Cause:** Quiz status is not set to "published".

**Solution:**
1. Go to Admin → Quiz Management
2. Click Edit on the quiz
3. Change Status to "Published"
4. Save the quiz

### Sample Data Not Inserting

**Symptom:** Error when running `quiz_sample_data.sql`.

**Cause:** No users exist in the `auth.users` table.

**Solution:**
1. Create at least one user account first
2. Then run the sample data script

---

## Migration Notes

### From Old Schema

If you're migrating from the old schema files (SUPABASE_QUIZ_SCHEMA.sql):

1. **Backup your data first!**
2. Run `quiz_complete_schema.sql` - it will drop and recreate policies
3. Your quiz data will be preserved (tables use IF NOT EXISTS)
4. Only policies will be updated

### Version History

- **v1.0** - Initial quiz schema with basic RLS policies
- **v2.0** - Added WITH CHECK clauses to fix 403 errors
- **v3.0** - Added general_settings table and numbered file convention (current)

---

## ✅ Best Practices

1. **Follow execution order:** Always run files in numbered order (01 → 02 → 03)
2. **Schema before data:** Run schema files before sample data
3. **Test in development first:** Never run untested SQL in production
4. **Backup before updates:** Always backup before running schema updates
5. **Verify after running:** Check the verification queries output
6. **Use transactions:** Wrap in BEGIN/COMMIT if making manual changes
7. **Check dependencies:** Ensure auth.users has at least one user before sample data

---

## Related Documentation

### In This Directory
- `QUIZ_403_ERROR_FIX.md` - Detailed explanation of 403 error and fix
- `QUIZ_403_ERROR_FIX.sql` - Quick fix SQL script for 403 errors
- `QUICK_START.md` - Quick start guide for database setup

### External Resources
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

## Support

If you encounter issues:
1. Check the verification queries output at the end of schema execution
2. Review the error messages in Supabase SQL Editor
3. Check browser console for client-side errors
4. Verify user authentication status

For policy debugging:
```sql
-- Check which policies exist
SELECT * FROM pg_policies
WHERE tablename IN ('general_settings', 'quizzes', 'quiz_questions', 'quiz_options');

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('general_settings', 'quizzes', 'quiz_questions', 'quiz_options');

-- View current settings
SELECT * FROM general_settings ORDER BY key;
```

---

## 📝 File Naming Convention

Files are numbered to indicate execution order:

- `01_*.sql` - Core/foundational schemas (run first)
- `02_*.sql` - Feature schemas (run after core)
- `03_*.sql` - Sample/seed data (run last, optional)

When adding new schemas:
- Dependencies go first (lower numbers)
- Independent features can use same number with different names
- Always update this README with execution order
