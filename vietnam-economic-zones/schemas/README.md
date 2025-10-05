# Database Schemas

This folder contains all SQL schema files and sample data for the Vietnam Economic Zones application.

## Files

### 1. `quiz_complete_schema.sql` ⭐ **Main Schema File**

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

### 2. `quiz_sample_data.sql`

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
- After running `quiz_complete_schema.sql`
- For testing the quiz system
- For demonstration purposes
- For development and debugging

**How to use:**
1. Ensure `quiz_complete_schema.sql` has been run first
2. Get your user ID: `SELECT id FROM auth.users LIMIT 1;`
3. The script will automatically use the first user found
4. Open Supabase SQL Editor
5. Copy and paste the entire file
6. Click "Run"

**Note:** The sample data automatically assigns quizzes to the first user in the `auth.users` table.

---

## Quick Start Guide

### For Fresh Setup (New Database)

```sql
-- Step 1: Run the complete schema
-- File: quiz_complete_schema.sql
-- This creates all tables and policies

-- Step 2: Run the sample data (optional)
-- File: quiz_sample_data.sql
-- This populates the database with test quizzes
```

### For Existing Database (Updating)

If you already have the quiz tables but need to fix RLS policies:

```sql
-- Just run the relevant sections from quiz_complete_schema.sql:
-- 1. DROP EXISTING POLICIES section
-- 2. RLS POLICIES sections

-- Or simply run the entire file (it's safe - uses IF NOT EXISTS and DROP IF EXISTS)
```

---

## Schema Overview

### Tables Structure

```
quizzes
├── id (UUID, PK)
├── title (TEXT)
├── description (TEXT)
├── difficulty (easy|medium|hard)
├── status (draft|published|archived)
├── time_limit (INTEGER, minutes)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── created_by (UUID, FK → auth.users)

quiz_questions
├── id (UUID, PK)
├── quiz_id (UUID, FK → quizzes)
├── question (TEXT)
├── explanation (TEXT)
├── allow_multiple_answers (BOOLEAN)
├── order_index (INTEGER)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

quiz_options
├── id (UUID, PK)
├── question_id (UUID, FK → quiz_questions)
├── text (TEXT)
├── is_correct (BOOLEAN)
├── order_index (INTEGER)
└── created_at (TIMESTAMP)
```

### Security Rules (RLS Policies)

**Quizzes:**
- ✅ Anyone can view published quizzes
- ✅ Authenticated users can create quizzes
- ✅ Users can update/delete their own quizzes

**Questions & Options:**
- ✅ Anyone can view questions/options from published quizzes
- ✅ Users can manage questions/options for their own quizzes
- ✅ Both USING and WITH CHECK clauses ensure proper INSERT/UPDATE validation

---

## Troubleshooting

### 403 Forbidden Errors

**Symptom:** Getting 403 errors when saving quizzes or adding questions.

**Cause:** Missing or incorrect RLS policies.

**Solution:** Run `quiz_complete_schema.sql` to recreate all policies with the correct USING and WITH CHECK clauses.

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

- **v1.0** - Initial schema with basic RLS policies
- **v2.0** - Added WITH CHECK clauses to fix 403 errors (current)

---

## Best Practices

1. **Always run schema before data:** Schema file first, then sample data
2. **Test in development first:** Never run untested SQL in production
3. **Backup before updates:** Always backup before running schema updates
4. **Verify after running:** Check the verification queries output
5. **Use transactions:** Wrap in BEGIN/COMMIT if making manual changes

---

## Related Documentation

- [Quiz 403 Error Fix Guide](../QUIZ_403_ERROR_FIX.md)
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
WHERE tablename IN ('quizzes', 'quiz_questions', 'quiz_options');

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('quizzes', 'quiz_questions', 'quiz_options');
```
