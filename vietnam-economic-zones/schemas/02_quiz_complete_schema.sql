-- ============================================================================
-- COMPLETE QUIZ SCHEMA FOR SUPABASE
-- ============================================================================
-- This is the complete, corrected schema for the quiz system.
-- Run this in Supabase SQL Editor to create all tables and policies.
--
-- IMPORTANT: This script includes the fixes for 403 errors by ensuring
-- all RLS policies have both USING and WITH CHECK clauses where needed.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  time_limit INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  explanation TEXT,
  allow_multiple_answers BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz options table
CREATE TABLE IF NOT EXISTS quiz_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON quiz_options(question_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP EXISTING POLICIES (for clean reinstall)
-- ============================================================================

-- Quizzes policies
DROP POLICY IF EXISTS "Anyone can view published quizzes" ON quizzes;
DROP POLICY IF EXISTS "Authenticated users can create quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can update their own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can delete their own quizzes" ON quizzes;

-- Quiz questions policies
DROP POLICY IF EXISTS "Anyone can view questions from published quizzes" ON quiz_questions;
DROP POLICY IF EXISTS "Users can manage questions for their own quizzes" ON quiz_questions;

-- Quiz options policies
DROP POLICY IF EXISTS "Anyone can view options from published quizzes" ON quiz_options;
DROP POLICY IF EXISTS "Users can manage options for their own quizzes" ON quiz_options;

-- ============================================================================
-- RLS POLICIES - QUIZZES TABLE
-- ============================================================================

-- Allow anyone to view published quizzes, or users to view their own quizzes
CREATE POLICY "Anyone can view published quizzes"
  ON quizzes FOR SELECT
  USING (status = 'published' OR auth.uid() = created_by);

-- Allow authenticated users to create quizzes
CREATE POLICY "Authenticated users can create quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own quizzes
CREATE POLICY "Users can update their own quizzes"
  ON quizzes FOR UPDATE
  USING (auth.uid() = created_by);

-- Allow users to delete their own quizzes
CREATE POLICY "Users can delete their own quizzes"
  ON quizzes FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================================================
-- RLS POLICIES - QUIZ_QUESTIONS TABLE
-- ============================================================================

-- Allow anyone to view questions from published quizzes
CREATE POLICY "Anyone can view questions from published quizzes"
  ON quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND (quizzes.status = 'published' OR quizzes.created_by = auth.uid())
    )
  );

-- Allow users to manage questions for their own quizzes
-- IMPORTANT: Both USING and WITH CHECK are required for FOR ALL policies
-- - USING: Controls SELECT, UPDATE, DELETE operations
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

-- ============================================================================
-- RLS POLICIES - QUIZ_OPTIONS TABLE
-- ============================================================================

-- Allow anyone to view options from published quizzes
CREATE POLICY "Anyone can view options from published quizzes"
  ON quiz_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      WHERE quiz_questions.id = quiz_options.question_id
      AND (quizzes.status = 'published' OR quizzes.created_by = auth.uid())
    )
  );

-- Allow users to manage options for their own quizzes
-- IMPORTANT: Both USING and WITH CHECK are required for FOR ALL policies
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
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for quizzes table
DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for quiz_questions table
DROP TRIGGER IF EXISTS update_quiz_questions_updated_at ON quiz_questions;
CREATE TRIGGER update_quiz_questions_updated_at
  BEFORE UPDATE ON quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify tables are created
SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE tablename IN ('quizzes', 'quiz_questions', 'quiz_options')
ORDER BY tablename;

-- Verify RLS is enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('quizzes', 'quiz_questions', 'quiz_options')
ORDER BY tablename;

-- Verify policies are created correctly
SELECT
  tablename,
  policyname,
  cmd,
  CASE
    WHEN qual IS NOT NULL THEN 'Has USING'
    ELSE 'No USING'
  END as using_clause,
  CASE
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK'
    ELSE 'No WITH CHECK'
  END as with_check_clause
FROM pg_policies
WHERE tablename IN ('quizzes', 'quiz_questions', 'quiz_options')
ORDER BY tablename, policyname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Quiz schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - quizzes';
  RAISE NOTICE '  - quiz_questions';
  RAISE NOTICE '  - quiz_options';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS enabled on all tables';
  RAISE NOTICE 'All policies created with proper USING and WITH CHECK clauses';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run quiz_sample_data.sql to populate with test data';
END $$;
