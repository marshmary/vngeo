-- ============================================================================
-- QUICK FIX FOR QUIZ 403 ERROR
-- ============================================================================
-- This script fixes the 403 Forbidden error when saving quizzes by adding
-- the missing WITH CHECK clauses to RLS policies.
--
-- Run this in Supabase SQL Editor if you're getting 403 errors when:
-- - Creating new quiz questions
-- - Creating new quiz options
-- - Saving quiz edits
--
-- SAFE TO RUN: This script will drop and recreate only the problematic
-- policies. It won't affect your data or table structure.
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop Existing Incomplete Policies
-- ============================================================================

-- Drop quiz_questions policies
DROP POLICY IF EXISTS "Users can manage questions for their own quizzes" ON quiz_questions;

-- Drop quiz_options policies
DROP POLICY IF EXISTS "Users can manage options for their own quizzes" ON quiz_options;

-- ============================================================================
-- STEP 2: Create Complete Policies with USING and WITH CHECK Clauses
-- ============================================================================

-- Fix quiz_questions policy
-- IMPORTANT: Both USING and WITH CHECK are required for FOR ALL policies
-- - USING: Controls SELECT, UPDATE, DELETE operations (checks existing rows)
-- - WITH CHECK: Controls INSERT and UPDATE operations (validates new data)
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

-- Fix quiz_options policy
CREATE POLICY "Users can manage options for their own quizzes"
  ON quiz_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      WHERE quiz_questions.id = quiz_options.question_id
      AND quizzes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      WHERE quiz_questions.id = quiz_options.question_id
      AND quizzes.created_by = auth.uid()
    )
  );

-- ============================================================================
-- STEP 3: Verification
-- ============================================================================

-- Verify policies are created correctly
SELECT
  tablename,
  policyname,
  cmd,
  CASE
    WHEN qual IS NOT NULL THEN '✓ Has USING'
    ELSE '✗ Missing USING'
  END as using_clause,
  CASE
    WHEN with_check IS NOT NULL THEN '✓ Has WITH CHECK'
    ELSE '✗ Missing WITH CHECK'
  END as with_check_clause
FROM pg_policies
WHERE tablename IN ('quiz_questions', 'quiz_options')
  AND policyname LIKE '%manage%'
ORDER BY tablename, policyname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Quiz RLS policies fixed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Fixed policies:';
  RAISE NOTICE '  - quiz_questions: Users can manage questions for their own quizzes';
  RAISE NOTICE '  - quiz_options: Users can manage options for their own quizzes';
  RAISE NOTICE '';
  RAISE NOTICE 'Both policies now have:';
  RAISE NOTICE '  ✓ USING clause (for SELECT, UPDATE, DELETE)';
  RAISE NOTICE '  ✓ WITH CHECK clause (for INSERT and UPDATE validation)';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now save quizzes without 403 errors!';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Remember to test:';
  RAISE NOTICE '   1. Create a new quiz';
  RAISE NOTICE '   2. Add questions and options';
  RAISE NOTICE '   3. Save the quiz';
  RAISE NOTICE '';
END $$;
