import { supabase } from '@/lib/supabase';
import type {
  PageVisit,
  CreatePageVisitData,
  AnalyticsStats,
  HourlyVisitData,
  MostVisitedPage,
  DeviceBreakdown,
  BrowserStats,
  VisitTrendData,
  DeviceType,
  DeviceInfo,
} from '@/types/analytics.types';

/**
 * Analytics Service
 * Handles all analytics tracking and data retrieval operations
 */
export class AnalyticsService {
  // ================================================================
  // TRACKING METHODS
  // ================================================================

  /**
   * Record a page visit
   * This is called automatically by the tracking hook
   */
  static async trackPageVisit(visitData: CreatePageVisitData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('page_visits')
        .insert([visitData]);

      if (error) {
        console.error('Error tracking page visit:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error tracking page visit:', error);
      return false;
    }
  }

  /**
   * Update session duration for a specific session
   */
  static async updateSessionDuration(
    sessionId: string,
    duration: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('page_visits')
        .update({ session_duration: duration })
        .eq('session_id', sessionId)
        .is('session_duration', null); // Only update if not already set

      if (error) {
        console.error('Error updating session duration:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating session duration:', error);
      return false;
    }
  }

  // ================================================================
  // ANALYTICS RETRIEVAL METHODS
  // ================================================================

  /**
   * Get overall analytics statistics for dashboard
   */
  static async getAnalyticsStats(): Promise<AnalyticsStats | null> {
    try {
      // Get total visits
      const { count: totalVisits } = await supabase
        .from('page_visits')
        .select('*', { count: 'exact', head: true });

      // Get today's visits
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count: todayVisits } = await supabase
        .from('page_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_timestamp', todayStart.toISOString());

      // Get unique visitors (total)
      const { data: uniqueVisitorsData } = await supabase
        .from('page_visits')
        .select('visitor_id');

      const uniqueVisitorsTotal = uniqueVisitorsData
        ? new Set(uniqueVisitorsData.map((v) => v.visitor_id)).size
        : 0;

      // Get unique visitors today
      const { data: uniqueVisitorsTodayData } = await supabase
        .from('page_visits')
        .select('visitor_id')
        .gte('visit_timestamp', todayStart.toISOString());

      const uniqueVisitorsToday = uniqueVisitorsTodayData
        ? new Set(uniqueVisitorsTodayData.map((v) => v.visitor_id)).size
        : 0;

      // Get average session duration
      const { data: avgDurationData } = await supabase
        .from('page_visits')
        .select('session_duration')
        .not('session_duration', 'is', null);

      const avgSessionDuration = avgDurationData && avgDurationData.length > 0
        ? avgDurationData.reduce((sum, v) => sum + (v.session_duration || 0), 0) / avgDurationData.length
        : 0;

      // Get most visited page
      const mostVisitedPages = await this.getMostVisitedPages(1);
      const mostVisitedPage = mostVisitedPages.length > 0
        ? {
            page_path: mostVisitedPages[0].page_path,
            page_title: mostVisitedPages[0].page_title,
            visit_count: mostVisitedPages[0].visit_count,
          }
        : undefined;

      return {
        total_visits: totalVisits || 0,
        total_visits_today: todayVisits || 0,
        unique_visitors_total: uniqueVisitorsTotal,
        unique_visitors_today: uniqueVisitorsToday,
        avg_session_duration: Math.round(avgSessionDuration),
        most_visited_page: mostVisitedPage,
      };
    } catch (error) {
      console.error('Error fetching analytics stats:', error);
      return null;
    }
  }

  /**
   * Get hourly visits for the last 24 hours
   */
  static async getHourlyVisits24h(): Promise<HourlyVisitData[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_hourly_visits_24h');

      if (error) {
        console.error('Error fetching hourly visits:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching hourly visits:', error);
      return [];
    }
  }

  /**
   * Get most visited pages
   */
  static async getMostVisitedPages(
    limit: number = 10,
    startDate?: Date
  ): Promise<MostVisitedPage[]> {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days

      const { data, error } = await supabase
        .rpc('get_most_visited_pages', {
          limit_count: limit,
          start_date: start.toISOString(),
        });

      if (error) {
        console.error('Error fetching most visited pages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching most visited pages:', error);
      return [];
    }
  }

  /**
   * Get device breakdown statistics
   */
  static async getDeviceBreakdown(days: number = 30): Promise<DeviceBreakdown[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('page_visits')
        .select('device_type')
        .gte('visit_timestamp', startDate.toISOString());

      if (error || !data) {
        console.error('Error fetching device breakdown:', error);
        return [];
      }

      // Count by device type
      const counts: Record<string, number> = {};
      let total = 0;

      data.forEach((visit) => {
        const deviceType = visit.device_type || 'unknown';
        counts[deviceType] = (counts[deviceType] || 0) + 1;
        total++;
      });

      // Convert to array with percentages
      return Object.entries(counts).map(([device_type, visit_count]) => ({
        device_type: device_type as DeviceType,
        visit_count,
        percentage: total > 0 ? Math.round((visit_count / total) * 100) : 0,
      }));
    } catch (error) {
      console.error('Error fetching device breakdown:', error);
      return [];
    }
  }

  /**
   * Get browser usage statistics
   */
  static async getBrowserStats(days: number = 30): Promise<BrowserStats[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('page_visits')
        .select('browser')
        .gte('visit_timestamp', startDate.toISOString())
        .not('browser', 'is', null);

      if (error || !data) {
        console.error('Error fetching browser stats:', error);
        return [];
      }

      // Count by browser
      const counts: Record<string, number> = {};
      let total = 0;

      data.forEach((visit) => {
        if (visit.browser) {
          counts[visit.browser] = (counts[visit.browser] || 0) + 1;
          total++;
        }
      });

      // Convert to array with percentages, sort by count
      return Object.entries(counts)
        .map(([browser, visit_count]) => ({
          browser,
          visit_count,
          percentage: total > 0 ? Math.round((visit_count / total) * 100) : 0,
        }))
        .sort((a, b) => b.visit_count - a.visit_count);
    } catch (error) {
      console.error('Error fetching browser stats:', error);
      return [];
    }
  }

  /**
   * Get visit trend data for a date range
   */
  static async getVisitTrend(days: number = 30): Promise<VisitTrendData[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const { data, error } = await supabase
        .rpc('get_visits_by_date_range', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

      if (error) {
        console.error('Error fetching visit trend:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        date: item.visit_date,
        total_visits: item.total_visits,
        unique_visitors: item.unique_visitors,
      }));
    } catch (error) {
      console.error('Error fetching visit trend:', error);
      return [];
    }
  }

  /**
   * Get all visits (for debugging/admin)
   */
  static async getAllVisits(limit: number = 100): Promise<PageVisit[]> {
    try {
      const { data, error } = await supabase
        .from('page_visits')
        .select('*')
        .order('visit_timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching all visits:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all visits:', error);
      return [];
    }
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  /**
   * Detect device type, browser, and OS from user agent
   */
  static detectDevice(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase();

    // Detect device type
    let device_type: DeviceType = 'desktop';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      device_type = 'tablet';
    } else if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        userAgent
      )
    ) {
      device_type = 'mobile';
    }

    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('edge') || ua.includes('edg/')) {
      browser = 'Edge';
    } else if (ua.includes('chrome') && !ua.includes('edg')) {
      browser = 'Chrome';
    } else if (ua.includes('firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browser = 'Safari';
    } else if (ua.includes('opera') || ua.includes('opr/')) {
      browser = 'Opera';
    } else if (ua.includes('trident') || ua.includes('msie')) {
      browser = 'Internet Explorer';
    }

    // Detect OS
    let os = 'Unknown';
    if (ua.includes('windows')) {
      os = 'Windows';
    } else if (ua.includes('mac os')) {
      os = 'macOS';
    } else if (ua.includes('linux')) {
      os = 'Linux';
    } else if (ua.includes('android')) {
      os = 'Android';
    } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
      os = 'iOS';
    }

    return {
      device_type,
      browser,
      os,
      user_agent: userAgent,
    };
  }

  /**
   * Generate a unique visitor ID (stored in localStorage)
   */
  static getOrCreateVisitorId(): string {
    const VISITOR_ID_KEY = 'vngeo_visitor_id';

    try {
      let visitorId = localStorage.getItem(VISITOR_ID_KEY);

      if (!visitorId) {
        // Generate a new unique ID
        visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem(VISITOR_ID_KEY, visitorId);
      }

      return visitorId;
    } catch {
      // Fallback if localStorage is not available
      return `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
  }

  /**
   * Generate a session ID (stored in sessionStorage)
   */
  static getOrCreateSessionId(): string {
    const SESSION_ID_KEY = 'vngeo_session_id';

    try {
      let sessionId = sessionStorage.getItem(SESSION_ID_KEY);

      if (!sessionId) {
        // Generate a new unique ID
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        sessionStorage.setItem(SESSION_ID_KEY, sessionId);
      }

      return sessionId;
    } catch {
      // Fallback if sessionStorage is not available
      return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
  }

  /**
   * Format session duration from seconds to readable string
   */
  static formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      return `${minutes}m ${secs}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }
}
