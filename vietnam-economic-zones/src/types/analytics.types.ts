// ====================================================================
// Analytics Types
// ====================================================================
// Type definitions for website analytics and visitor tracking
// ====================================================================

/**
 * Device type enumeration
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

/**
 * Individual page visit record
 * Matches the page_visits table in Supabase
 */
export interface PageVisit {
  id: string;

  // Page Information
  page_path: string;
  page_title?: string;
  referrer?: string;

  // Session Tracking
  session_id: string;
  visitor_id: string;

  // User Information
  user_id?: string;
  is_authenticated: boolean;

  // Device & Browser Information
  user_agent?: string;
  device_type?: DeviceType;
  browser?: string;
  os?: string;

  // Location
  country_code?: string;

  // Timing
  visit_timestamp: string; // ISO 8601 datetime string
  session_duration?: number; // Duration in seconds

  // Metadata
  created_at: string; // ISO 8601 datetime string
}

/**
 * Data for creating a new page visit record
 * Omits auto-generated fields
 */
export interface CreatePageVisitData {
  page_path: string;
  page_title?: string;
  referrer?: string;
  session_id: string;
  visitor_id: string;
  user_id?: string;
  is_authenticated?: boolean;
  user_agent?: string;
  device_type?: DeviceType;
  browser?: string;
  os?: string;
  country_code?: string;
  session_duration?: number;
}

/**
 * Aggregated analytics summary
 * Matches the analytics_summary_view
 */
export interface AnalyticsSummary {
  visit_date: string; // Date string (YYYY-MM-DD)
  visit_hour: number; // 0-23
  page_path: string;
  page_title?: string;
  visit_count: number;
  unique_visitors: number;
  unique_sessions: number;
  authenticated_users: number;
  mobile_visits: number;
  tablet_visits: number;
  desktop_visits: number;
  avg_session_duration?: number; // In seconds
}

/**
 * Overall analytics statistics for dashboard
 */
export interface AnalyticsStats {
  total_visits: number;
  total_visits_today: number;
  unique_visitors_total: number;
  unique_visitors_today: number;
  avg_session_duration: number; // In seconds
  most_visited_page?: {
    page_path: string;
    page_title?: string;
    visit_count: number;
  };
}

/**
 * Hourly visit data for charts
 */
export interface HourlyVisitData {
  hour_timestamp: string; // ISO 8601 datetime string
  visit_count: number;
}

/**
 * Most visited pages data
 */
export interface MostVisitedPage {
  page_path: string;
  page_title?: string;
  visit_count: number;
  unique_visitors: number;
}

/**
 * Device breakdown statistics
 */
export interface DeviceBreakdown {
  device_type: DeviceType;
  visit_count: number;
  percentage: number;
}

/**
 * Browser usage statistics
 */
export interface BrowserStats {
  browser: string;
  visit_count: number;
  percentage: number;
}

/**
 * Date range for analytics queries
 */
export interface AnalyticsDateRange {
  start_date: Date;
  end_date: Date;
}

/**
 * Analytics filter options
 */
export interface AnalyticsFilters {
  date_range?: AnalyticsDateRange;
  page_path?: string;
  device_type?: DeviceType;
  is_authenticated?: boolean;
}

/**
 * Visit trend data for charts
 */
export interface VisitTrendData {
  date: string; // Date string (YYYY-MM-DD)
  total_visits: number;
  unique_visitors: number;
}

/**
 * Session information for tracking
 */
export interface SessionInfo {
  session_id: string;
  visitor_id: string;
  start_time: Date;
  last_activity: Date;
  page_count: number;
}

/**
 * Browser/Device detection result
 */
export interface DeviceInfo {
  device_type: DeviceType;
  browser: string;
  os: string;
  user_agent: string;
}
