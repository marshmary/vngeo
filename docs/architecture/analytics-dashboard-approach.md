# Analytics Dashboard Implementation Approach

## Overview
This document outlines the approach for implementing a web analytics dashboard to track basic web information such as daily access counts, page views, user engagement, and other key metrics for the Vietnam Economic Zones Explorer application.

## 1. Requirements Analysis

### Core Metrics to Track
- **Daily Access Count**: Number of unique visitors per day
- **Page Views**: Total page views per day
- **Page-specific Analytics**: Views per page (Map, Documents, Quizzes, etc.)
- **Quiz Analytics**: Quiz attempts, completion rates, average scores
- **User Engagement**: Session duration, pages per session
- **Geographic Data**: Visitor location (optional)
- **Device Information**: Desktop vs Mobile usage
- **Popular Content**: Most viewed zones, documents, quizzes

### Dashboard Features
- Date range selector (daily, weekly, monthly views)
- Visual charts and graphs (line charts, bar charts, pie charts)
- Real-time vs historical data
- Export functionality (CSV, PDF)
- Key performance indicators (KPIs) at a glance

## 2. Technical Architecture

### 2.1 Database Schema (Supabase)

#### Table: `analytics_page_views`
Tracks individual page view events.

```sql
CREATE TABLE analytics_page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  ip_address INET,
  country TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_page_views_created_at (created_at),
  INDEX idx_page_views_page_path (page_path),
  INDEX idx_page_views_session (session_id)
);
```

#### Table: `analytics_sessions`
Tracks user sessions for engagement metrics.

```sql
CREATE TABLE analytics_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  page_count INTEGER DEFAULT 0,
  device_type TEXT,
  browser TEXT,
  entry_page TEXT,
  exit_page TEXT,

  INDEX idx_sessions_started_at (started_at),
  INDEX idx_sessions_user_id (user_id)
);
```

#### Table: `analytics_daily_summary`
Pre-aggregated daily statistics for faster dashboard loading.

```sql
CREATE TABLE analytics_daily_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  unique_visitors INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  avg_session_duration DECIMAL(10,2),
  avg_pages_per_session DECIMAL(10,2),
  bounce_rate DECIMAL(5,2), -- Percentage
  new_visitors INTEGER DEFAULT 0,
  returning_visitors INTEGER DEFAULT 0,

  -- Page-specific counts
  home_views INTEGER DEFAULT 0,
  map_views INTEGER DEFAULT 0,
  documents_views INTEGER DEFAULT 0,
  quiz_views INTEGER DEFAULT 0,
  map_drawing_views INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_daily_summary_date (date)
);
```

#### Table: `analytics_quiz_attempts`
Tracks quiz-specific analytics.

```sql
CREATE TABLE analytics_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  score INTEGER,
  total_questions INTEGER,
  time_spent_seconds INTEGER,
  completed BOOLEAN DEFAULT FALSE,

  INDEX idx_quiz_attempts_quiz_id (quiz_id),
  INDEX idx_quiz_attempts_started_at (started_at)
);
```

### 2.2 Row Level Security (RLS) Policies

```sql
-- Allow anonymous inserts for tracking (write-only)
CREATE POLICY "Allow anonymous page view inserts"
  ON analytics_page_views
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only admins can read analytics
CREATE POLICY "Allow admins to read page views"
  ON analytics_page_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Apply similar policies to other analytics tables
```

### 2.3 Backend Architecture

#### Analytics Service (`src/services/analyticsService.ts`)

```typescript
interface PageViewEvent {
  sessionId: string;
  userId?: string;
  pagePath: string;
  pageTitle: string;
  referrer?: string;
  userAgent: string;
}

interface DailySummary {
  date: string;
  uniqueVisitors: number;
  totalPageViews: number;
  avgSessionDuration: number;
  // ... other metrics
}

class AnalyticsService {
  // Event tracking methods
  trackPageView(event: PageViewEvent): Promise<void>
  trackSessionStart(sessionId: string): Promise<void>
  trackSessionEnd(sessionId: string): Promise<void>
  trackQuizAttempt(quizId: string, sessionId: string): Promise<void>

  // Dashboard data retrieval
  getDailySummary(startDate: Date, endDate: Date): Promise<DailySummary[]>
  getPageViewsByPage(startDate: Date, endDate: Date): Promise<PageStats[]>
  getQuizAnalytics(startDate: Date, endDate: Date): Promise<QuizStats[]>
  getTopContent(startDate: Date, endDate: Date): Promise<TopContent[]>

  // Utility methods
  generateSessionId(): string
  parseUserAgent(userAgent: string): DeviceInfo
  aggregateDailyStats(date: Date): Promise<void>
}
```

### 2.4 Frontend Architecture

#### Component Structure
```
src/components/admin/
├── AnalyticsDashboard.tsx          # Main dashboard container
├── analytics/
│   ├── DateRangePicker.tsx         # Date selection component
│   ├── MetricsCard.tsx             # KPI card component
│   ├── VisitorChart.tsx            # Line chart for visitors
│   ├── PageViewsChart.tsx          # Bar chart for page views
│   ├── DeviceDistribution.tsx      # Pie chart for devices
│   ├── TopPagesTable.tsx           # Table of popular pages
│   ├── QuizStatsTable.tsx          # Quiz performance metrics
│   └── ExportButton.tsx            # Export data functionality
```

#### State Management (Zustand Store)
```typescript
interface AnalyticsStore {
  dateRange: { start: Date; end: Date };
  dailySummary: DailySummary[];
  pageStats: PageStats[];
  quizStats: QuizStats[];
  isLoading: boolean;

  setDateRange: (start: Date, end: Date) => void;
  fetchAnalytics: () => Promise<void>;
  exportData: (format: 'csv' | 'pdf') => Promise<void>;
}
```

## 3. Implementation Strategy

### Phase 1: Foundation (Week 1)
1. **Database Setup**
   - Create analytics tables in Supabase
   - Set up RLS policies
   - Create database indexes for performance
   - Create database functions for aggregation

2. **Analytics Service**
   - Implement `analyticsService.ts` with core tracking methods
   - Add session management (generate/store session ID in localStorage)
   - Implement device detection and user agent parsing
   - Add error handling and retry logic

3. **Client-Side Tracking**
   - Create `AnalyticsProvider` React context
   - Add tracking hooks (`usePageView`, `useAnalytics`)
   - Integrate tracking into App.tsx routing
   - Track page views automatically on route changes

### Phase 2: Dashboard UI (Week 2)
1. **Admin Tab Addition**
   - Add "Analytics" tab to AdminPage.tsx
   - Create `AnalyticsDashboard.tsx` main component
   - Add i18n translations for analytics UI

2. **Core Dashboard Components**
   - Implement `MetricsCard` for KPI display
   - Add `DateRangePicker` with presets (Today, Last 7 days, Last 30 days, Custom)
   - Create loading and error states

3. **Chart Library Integration**
   - Install chart library (Recharts or Chart.js)
   - Implement `VisitorChart` (line chart)
   - Implement `PageViewsChart` (bar chart)
   - Implement `DeviceDistribution` (pie chart)

### Phase 3: Advanced Features (Week 3)
1. **Detailed Analytics**
   - Page-specific analytics views
   - Quiz performance analytics
   - User engagement metrics
   - Real-time visitor count

2. **Data Aggregation**
   - Create Supabase Edge Function for daily aggregation
   - Set up cron job to run aggregation nightly
   - Implement background job for historical data processing

3. **Export & Reporting**
   - Implement CSV export
   - Add PDF report generation
   - Create scheduled email reports (optional)

### Phase 4: Optimization & Testing (Week 4)
1. **Performance Optimization**
   - Add caching layer for dashboard queries
   - Optimize database queries with proper indexes
   - Implement pagination for large datasets
   - Add data compression for API responses

2. **Privacy & Compliance**
   - Implement IP anonymization
   - Add cookie consent integration
   - Create privacy policy updates
   - Add GDPR-compliant data retention policies

3. **Testing & Documentation**
   - Write unit tests for analytics service
   - Create integration tests for tracking
   - Document API endpoints
   - Create user guide for dashboard

## 4. Data Privacy Considerations

### Anonymization Strategy
- Hash IP addresses before storage
- Don't store personally identifiable information (PII)
- Aggregate data after 90 days, delete raw events
- Provide opt-out mechanism for users

### Cookie Consent
- Use localStorage for session tracking (doesn't require consent)
- If using cookies, implement consent banner
- Respect Do Not Track (DNT) browser settings

## 5. Performance Considerations

### Client-Side
- Batch tracking events (queue and send every 10 seconds)
- Use beacon API for tracking on page unload
- Non-blocking async tracking calls
- Fail silently to not affect user experience

### Server-Side
- Use materialized views for complex aggregations
- Implement query result caching (5-minute TTL for dashboard)
- Partition analytics tables by month for scalability
- Archive old data to separate tables

## 6. Chart Library Recommendation

**Recommended: Recharts**
- Native React components
- TypeScript support
- Responsive design
- Good documentation
- MIT License

```bash
npm install recharts
```

Alternative: Chart.js with react-chartjs-2 (more features but larger bundle)

## 7. Sample Implementation

### Tracking Hook
```typescript
// src/hooks/usePageTracking.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsService } from '@/services/analyticsService';

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      await AnalyticsService.trackPageView({
        sessionId: AnalyticsService.getSessionId(),
        pagePath: location.pathname,
        pageTitle: document.title,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      });
    };

    trackPageView();
  }, [location]);
};
```

### Dashboard Component Structure
```typescript
// src/components/admin/AnalyticsDashboard.tsx
const AnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState({ start: ..., end: ... });
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  return (
    <div className="space-y-6">
      {/* Header with Date Picker */}
      <div className="flex justify-between items-center">
        <h2>{t('admin.analytics.title')}</h2>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricsCard title="Total Visitors" value={metrics?.visitors} />
        <MetricsCard title="Page Views" value={metrics?.pageViews} />
        <MetricsCard title="Avg. Duration" value={metrics?.avgDuration} />
        <MetricsCard title="Bounce Rate" value={metrics?.bounceRate} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisitorChart data={metrics?.dailyVisitors} />
        <PageViewsChart data={metrics?.pageViews} />
      </div>

      {/* Tables */}
      <TopPagesTable data={metrics?.topPages} />
      <QuizStatsTable data={metrics?.quizStats} />
    </div>
  );
};
```

## 8. Migration Path

For existing applications with existing users:

1. **Soft Launch**: Deploy tracking without dashboard (1 week data collection)
2. **Dashboard Beta**: Enable for admin users only
3. **Full Launch**: Make available to all administrators
4. **Backfill**: Historical data estimation based on server logs (optional)

## 9. Cost Estimation

### Supabase Storage
- Estimated 10,000 page views/day = ~1.5MB/day
- 45MB/month raw data
- With aggregation and cleanup: ~10MB/month retained
- Well within Supabase free tier

### Additional Dependencies
- Recharts: ~450KB (production build)
- Date library (date-fns): ~70KB
- Total bundle increase: ~520KB

## 10. Success Metrics

Track these metrics to measure dashboard success:
- Dashboard load time < 2 seconds
- Tracking overhead < 50ms per page load
- Data accuracy > 95% (validate against server logs)
- Admin user engagement with dashboard
- Actionable insights derived from data

## 11. Future Enhancements

Phase 2+ features to consider:
- A/B testing framework
- Funnel analysis (user journey tracking)
- Heatmaps and click tracking
- Custom event tracking
- Integration with Google Analytics (comparison)
- Alerts and notifications (traffic spikes, errors)
- User segmentation and cohort analysis

## 12. Implementation Checklist

- [ ] Database schema created
- [ ] RLS policies configured
- [ ] Analytics service implemented
- [ ] Page tracking integrated
- [ ] Session management working
- [ ] Admin dashboard UI created
- [ ] Charts rendering correctly
- [ ] Date range filtering working
- [ ] Export functionality implemented
- [ ] Privacy measures in place
- [ ] Performance optimized
- [ ] Documentation complete
- [ ] Testing complete
- [ ] Deployed to production

## 13. Related Documentation

- [Supabase Analytics Guide](https://supabase.com/docs/guides/analytics)
- [Recharts Documentation](https://recharts.org/)
- [Web Analytics Best Practices](https://web.dev/vitals/)
- GDPR Compliance Guidelines

---

**Document Version**: 1.0
**Last Updated**: 2025-10-12
**Author**: Analytics Implementation Team
**Status**: Proposal - Pending Approval
