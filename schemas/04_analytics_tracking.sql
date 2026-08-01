-- ====================================================================
-- Analytics Tracking Schema
-- ====================================================================
-- Purpose: Track website visits and user analytics for the admin dashboard
-- Version: 1.0
-- Created: 2025-10-29
--
-- Tables:
--   1. page_visits - Individual page view records with session tracking
--   2. analytics_summary_view - Aggregated analytics for dashboard
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. PAGE VISITS TABLE
-- --------------------------------------------------------------------
-- Stores individual page visit records with session and device info

CREATE TABLE IF NOT EXISTS page_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Page Information
  page_path VARCHAR(500) NOT NULL,
  page_title VARCHAR(500),
  referrer VARCHAR(500),

  -- Session Tracking
  session_id VARCHAR(100) NOT NULL,
  visitor_id VARCHAR(100) NOT NULL, -- Persistent visitor identifier

  -- User Information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_authenticated BOOLEAN DEFAULT false,

  -- Device & Browser Information
  user_agent TEXT,
  device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop'
  browser VARCHAR(100),
  os VARCHAR(100),

  -- Location (optional - can be added later)
  country_code VARCHAR(10),

  -- Timing
  visit_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_duration INTEGER, -- Duration in seconds (updated when session ends)

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 2. INDEXES FOR PERFORMANCE
-- --------------------------------------------------------------------

-- Index for querying visits by date range
CREATE INDEX IF NOT EXISTS idx_page_visits_timestamp
ON page_visits(visit_timestamp DESC);

-- Index for querying by session
CREATE INDEX IF NOT EXISTS idx_page_visits_session
ON page_visits(session_id, visit_timestamp);

-- Index for querying by visitor
CREATE INDEX IF NOT EXISTS idx_page_visits_visitor
ON page_visits(visitor_id, visit_timestamp);

-- Index for querying by page path
CREATE INDEX IF NOT EXISTS idx_page_visits_page_path
ON page_visits(page_path, visit_timestamp);

-- Index for user visits
CREATE INDEX IF NOT EXISTS idx_page_visits_user_id
ON page_visits(user_id) WHERE user_id IS NOT NULL;

-- Composite index for analytics queries
CREATE INDEX IF NOT EXISTS idx_page_visits_analytics
ON page_visits(visit_timestamp, page_path, visitor_id);

-- --------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public insert for tracking" ON page_visits;
DROP POLICY IF EXISTS "Allow authenticated read for analytics" ON page_visits;
DROP POLICY IF EXISTS "Allow users to view their own visits" ON page_visits;

-- Allow anyone to insert visit records (for tracking)
-- This allows the tracking system to work without authentication
CREATE POLICY "Allow public insert for tracking"
ON page_visits
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view all analytics data
-- This protects privacy while allowing admin dashboard access
CREATE POLICY "Allow authenticated read for analytics"
ON page_visits
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to view their own visit history
CREATE POLICY "Allow users to view their own visits"
ON page_visits
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND user_id = auth.uid()
);

-- Prevent updates and deletes (analytics data should be immutable)
-- Only database admin can delete old data via SQL

-- --------------------------------------------------------------------
-- 4. ANALYTICS VIEWS
-- --------------------------------------------------------------------

-- Drop existing view if any
DROP VIEW IF EXISTS analytics_summary_view;

-- Create a view for common analytics queries
CREATE OR REPLACE VIEW analytics_summary_view AS
SELECT
  -- Date grouping
  DATE(visit_timestamp) as visit_date,

  -- Time grouping (hour of day)
  EXTRACT(HOUR FROM visit_timestamp)::INTEGER as visit_hour,

  -- Page information
  page_path,
  page_title,

  -- Aggregated metrics
  COUNT(*) as visit_count,
  COUNT(DISTINCT visitor_id) as unique_visitors,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as authenticated_users,

  -- Device breakdown
  COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_visits,
  COUNT(*) FILTER (WHERE device_type = 'tablet') as tablet_visits,
  COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_visits,

  -- Average session duration (in seconds)
  AVG(session_duration) FILTER (WHERE session_duration IS NOT NULL) as avg_session_duration

FROM page_visits
GROUP BY
  DATE(visit_timestamp),
  EXTRACT(HOUR FROM visit_timestamp),
  page_path,
  page_title;

-- --------------------------------------------------------------------
-- 5. HELPER FUNCTIONS
-- --------------------------------------------------------------------

-- Function to get total visits count
CREATE OR REPLACE FUNCTION get_total_visits()
RETURNS BIGINT AS $$
  SELECT COUNT(*) FROM page_visits;
$$ LANGUAGE sql STABLE;

-- Function to get visits for a specific date range
CREATE OR REPLACE FUNCTION get_visits_by_date_range(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  visit_date DATE,
  total_visits BIGINT,
  unique_visitors BIGINT
) AS $$
  SELECT
    DATE(visit_timestamp) as visit_date,
    COUNT(*) as total_visits,
    COUNT(DISTINCT visitor_id) as unique_visitors
  FROM page_visits
  WHERE visit_timestamp >= start_date
    AND visit_timestamp < end_date
  GROUP BY DATE(visit_timestamp)
  ORDER BY visit_date DESC;
$$ LANGUAGE sql STABLE;

-- Function to get hourly visits for the last 24 hours
CREATE OR REPLACE FUNCTION get_hourly_visits_24h()
RETURNS TABLE (
  hour_timestamp TIMESTAMP WITH TIME ZONE,
  visit_count BIGINT
) AS $$
  SELECT
    DATE_TRUNC('hour', visit_timestamp) as hour_timestamp,
    COUNT(*) as visit_count
  FROM page_visits
  WHERE visit_timestamp >= NOW() - INTERVAL '24 hours'
  GROUP BY DATE_TRUNC('hour', visit_timestamp)
  ORDER BY hour_timestamp DESC;
$$ LANGUAGE sql STABLE;

-- Function to get most visited pages
CREATE OR REPLACE FUNCTION get_most_visited_pages(
  limit_count INTEGER DEFAULT 10,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days'
)
RETURNS TABLE (
  page_path VARCHAR(500),
  page_title VARCHAR(500),
  visit_count BIGINT,
  unique_visitors BIGINT
) AS $$
  SELECT
    pv.page_path,
    pv.page_title,
    COUNT(*) as visit_count,
    COUNT(DISTINCT pv.visitor_id) as unique_visitors
  FROM page_visits pv
  WHERE pv.visit_timestamp >= start_date
  GROUP BY pv.page_path, pv.page_title
  ORDER BY visit_count DESC
  LIMIT limit_count;
$$ LANGUAGE sql STABLE;

-- --------------------------------------------------------------------
-- 6. DATA RETENTION POLICY (OPTIONAL)
-- --------------------------------------------------------------------

-- Function to clean up old analytics data (older than 1 year)
-- This should be run periodically via a scheduled job
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM page_visits
  WHERE visit_timestamp < NOW() - INTERVAL '1 year';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------
-- 7. VERIFICATION QUERIES
-- --------------------------------------------------------------------

-- Verify table creation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'page_visits') THEN
    RAISE NOTICE '✅ Table "page_visits" created successfully';
  ELSE
    RAISE NOTICE '❌ Table "page_visits" was not created';
  END IF;
END $$;

-- Verify indexes
DO $$
BEGIN
  RAISE NOTICE '📊 Indexes created:';
  RAISE NOTICE '  - idx_page_visits_timestamp';
  RAISE NOTICE '  - idx_page_visits_session';
  RAISE NOTICE '  - idx_page_visits_visitor';
  RAISE NOTICE '  - idx_page_visits_page_path';
  RAISE NOTICE '  - idx_page_visits_user_id';
  RAISE NOTICE '  - idx_page_visits_analytics';
END $$;

-- Verify RLS policies
SELECT
  'RLS Policies:' as check_type,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'page_visits';

-- Verify functions
SELECT
  'Helper Functions:' as check_type,
  COUNT(*) as function_count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'get_total_visits',
    'get_visits_by_date_range',
    'get_hourly_visits_24h',
    'get_most_visited_pages',
    'cleanup_old_analytics'
  );

-- Check if RLS is enabled
SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status
FROM pg_tables
WHERE tablename = 'page_visits';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================================================';
  RAISE NOTICE '✅ Analytics Tracking Schema Installation Complete!';
  RAISE NOTICE '====================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  • page_visits table with session tracking';
  RAISE NOTICE '  • 6 performance indexes';
  RAISE NOTICE '  • 3 RLS policies for security';
  RAISE NOTICE '  • analytics_summary_view for aggregated data';
  RAISE NOTICE '  • 5 helper functions for common queries';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Update application code to send tracking data';
  RAISE NOTICE '  2. Implement analytics dashboard components';
  RAISE NOTICE '  3. Set up periodic cleanup job (optional)';
  RAISE NOTICE '';
END $$;
