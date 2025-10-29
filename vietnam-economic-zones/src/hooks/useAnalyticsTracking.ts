import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsService } from '@/services/analyticsService';
import type { CreatePageVisitData } from '@/types/analytics.types';

/**
 * Custom hook to track page visits and analytics
 * Automatically tracks when the route changes
 *
 * @example
 * ```tsx
 * function App() {
 *   useAnalyticsTracking();
 *   return <Routes>...</Routes>;
 * }
 * ```
 */
export function useAnalyticsTracking() {
  const location = useLocation();
  const sessionStartTime = useRef<Date>(new Date());
  const lastActivityTime = useRef<Date>(new Date());
  const isFirstVisit = useRef<boolean>(true);

  // Track page view on location change
  useEffect(() => {
    const trackPageVisit = async () => {
      try {
        // Get or create visitor and session IDs
        const visitorId = AnalyticsService.getOrCreateVisitorId();
        const sessionId = AnalyticsService.getOrCreateSessionId();

        // Detect device information
        const deviceInfo = AnalyticsService.detectDevice(navigator.userAgent);

        // Get page title
        const pageTitle = document.title;

        // Get referrer (only on first visit)
        const referrer = isFirstVisit.current ? document.referrer : undefined;

        // Check if user is authenticated
        const isAuthenticated = false; // TODO: Get from auth context/store
        const userId = undefined; // TODO: Get from auth context/store

        // Calculate session duration if not first visit
        const now = new Date();
        const sessionDuration = !isFirstVisit.current
          ? Math.floor((now.getTime() - lastActivityTime.current.getTime()) / 1000)
          : undefined;

        // Prepare visit data
        const visitData: CreatePageVisitData = {
          page_path: location.pathname + location.search,
          page_title: pageTitle,
          referrer,
          session_id: sessionId,
          visitor_id: visitorId,
          user_id: userId,
          is_authenticated: isAuthenticated,
          user_agent: deviceInfo.user_agent,
          device_type: deviceInfo.device_type,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          session_duration: sessionDuration,
        };

        // Track the page visit
        await AnalyticsService.trackPageVisit(visitData);

        // Update tracking state
        lastActivityTime.current = now;
        isFirstVisit.current = false;

        // Optional: Log in development
        if (import.meta.env.DEV) {
          console.log('📊 Analytics tracked:', {
            path: visitData.page_path,
            title: visitData.page_title,
            device: visitData.device_type,
            browser: visitData.browser,
          });
        }
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.error('Error tracking page visit:', error);
      }
    };

    // Track after a small delay to ensure page title is set
    const timeoutId = setTimeout(trackPageVisit, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, location.search]);

  // Track session duration on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        const sessionId = AnalyticsService.getOrCreateSessionId();
        const now = new Date();
        const sessionDuration = Math.floor(
          (now.getTime() - sessionStartTime.current.getTime()) / 1000
        );

        // Update session duration (fire and forget)
        AnalyticsService.updateSessionDuration(sessionId, sessionDuration);
      } catch (error) {
        // Silently fail
        console.error('Error updating session duration:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => {
      lastActivityTime.current = new Date();
    };

    // Track various user interactions
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, []);
}

/**
 * Hook to manually track custom events (optional future use)
 */
export function useAnalyticsEvent() {
  return {
    trackEvent: async (eventName: string, eventData?: Record<string, any>) => {
      // This can be extended in the future for custom event tracking
      console.log('Custom event tracked:', eventName, eventData);
    },
  };
}
