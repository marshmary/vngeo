import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AnalyticsService } from '@/services/analyticsService';
import type {
  AnalyticsStats,
  HourlyVisitData,
  MostVisitedPage,
  DeviceBreakdown,
} from '@/types/analytics.types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatsCard from './StatsCard';
import HourlyVisitsChart from './HourlyVisitsChart';
import TopPagesTable from './TopPagesTable';
import DeviceBreakdownChart from './DeviceBreakdownChart';

const AnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyVisitData[]>([]);
  const [topPages, setTopPages] = useState<MostVisitedPage[]>([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState<DeviceBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [statsData, hourlyVisits, mostVisited, devices] = await Promise.all([
        AnalyticsService.getAnalyticsStats(),
        AnalyticsService.getHourlyVisits24h(),
        AnalyticsService.getMostVisitedPages(10),
        AnalyticsService.getDeviceBreakdown(30),
      ]);

      setStats(statsData);
      setHourlyData(hourlyVisits);
      setTopPages(mostVisited);
      setDeviceBreakdown(devices);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyticsData();

    // Refresh data every 5 minutes
    const intervalId = setInterval(loadAnalyticsData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [loadAnalyticsData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{t('admin.analytics.noData')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('admin.analytics.title')}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('admin.analytics.subtitle')}
          </p>
        </div>
        <button
          onClick={loadAnalyticsData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {t('admin.analytics.refresh')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('admin.analytics.totalVisits')}
          value={stats.total_visits}
          subtitle={t('admin.analytics.allTime')}
          icon="chart"
          color="blue"
        />
        <StatsCard
          title={t('admin.analytics.visitsToday')}
          value={stats.total_visits_today}
          subtitle={t('admin.analytics.last24Hours')}
          icon="calendar"
          color="green"
        />
        <StatsCard
          title={t('admin.analytics.uniqueVisitors')}
          value={stats.unique_visitors_today}
          subtitle={t('admin.analytics.today')}
          icon="users"
          color="purple"
        />
        <StatsCard
          title={t('admin.analytics.avgSessionTime')}
          value={AnalyticsService.formatDuration(stats.avg_session_duration)}
          subtitle={t('admin.analytics.perSession')}
          icon="clock"
          color="orange"
          isNumeric={false}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Visits Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('admin.analytics.hourlyVisits')}
          </h3>
          <HourlyVisitsChart data={hourlyData} />
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('admin.analytics.deviceBreakdown')}
          </h3>
          <DeviceBreakdownChart data={deviceBreakdown} />
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('admin.analytics.mostVisitedPages')}
        </h3>
        <TopPagesTable pages={topPages} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
