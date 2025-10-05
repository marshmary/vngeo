# Fix for 403 Error When Saving Quiz

## Problem
When trying to save a quiz (especially when adding new questions or options), you get a **403 Forbidden** error from Supabase.

## Root Cause
The Row Level Security (RLS) policies for `quiz_questions` and `quiz_options` tables were missing the `WITH CHECK` clause.

In PostgreSQL RLS:
- `USING` clause applies to **SELECT, UPDATE, DELETE** operations
- `WITH CHECK` clause applies to **INSERT and UPDATE** operations (for the new values being inserted/updated)

When using `FOR ALL` policy, both clauses are required:
- `USING` - checks if user can see/modify existing rows
- `WITH CHECK` - checks if user can insert/update rows with the new values

## The Fix

### Option 1: Quick Fix (Recommended)
Run the SQL script in `SUPABASE_QUIZ_SCHEMA_FIX.sql`:

```sql
-- This script will:
-- 1. Drop the existing incomplete policies
-- 2. Recreate them with both USING and WITH CHECK clauses
```

**Steps:**
1. Open Supabase SQL Editor
2. Copy and paste the contents of `SUPABASE_QUIZ_SCHEMA_FIX.sql`
3. Run the script
4. Verify the policies are created (the script includes a verification query)

### Option 2: Fresh Installation
If you're setting up a new database, use the updated `SUPABASE_QUIZ_SCHEMA.sql` file which now includes the correct policies with both `USING` and `WITH CHECK` clauses.

## What Changed

### Before (Incomplete):
```sql
CREATE POLICY "Users can manage questions for their own quizzes"
  ON quiz_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );
  -- Missing WITH CHECK clause!
```

### After (Complete):
```sql
CREATE POLICY "Users can manage questions for their own quizzes"
  ON quiz_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );
```

## Testing
After applying the fix:
1. Go to QuizEditPage
2. Add a new question with options
3. Click "Save Quiz"
4. Should save successfully without 403 errors

## Additional Notes

### Why Both Clauses?
- **USING**: "Can this user read/update/delete these existing rows?"
- **WITH CHECK**: "Can this user insert/update rows with these new values?"

For `quiz_questions`:
- USING checks: "Does the user own the quiz that these questions belong to?" (for reading/updating existing)
- WITH CHECK: "Does the user own the quiz that these NEW questions will belong to?" (for inserting new)

For `quiz_options`:
- USING checks: "Does the user own the quiz through the question?" (for reading/updating existing)
- WITH CHECK: "Does the user own the quiz through the NEW question?" (for inserting new)

### Alternative: Separate Policies
Instead of `FOR ALL`, you could create separate policies:
- `FOR SELECT` with only USING
- `FOR INSERT` with only WITH CHECK
- `FOR UPDATE` with both USING and WITH CHECK
- `FOR DELETE` with only USING

But `FOR ALL` with both clauses is cleaner and easier to maintain.

## Related Files
- `SUPABASE_QUIZ_SCHEMA.sql` - Updated main schema file
- `SUPABASE_QUIZ_SCHEMA_FIX.sql` - Quick fix script for existing databases
- `src/services/quizService.ts` - Quiz save logic (no changes needed)

## References
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
