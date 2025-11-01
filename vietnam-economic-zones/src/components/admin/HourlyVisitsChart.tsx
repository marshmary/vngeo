import React from 'react';
import type { HourlyVisitData } from '@/types/analytics.types';

interface HourlyVisitsChartProps {
  data: HourlyVisitData[];
}

const HourlyVisitsChart: React.FC<HourlyVisitsChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hourly data available
      </div>
    );
  }

  // Find max value for scaling
  const maxVisits = Math.max(...data.map((d) => d.visit_count), 1);

  // Sort data by timestamp (most recent first)
  const sortedData = [...data].sort((a, b) =>
    new Date(b.hour_timestamp).getTime() - new Date(a.hour_timestamp).getTime()
  );

  // Take last 24 hours
  const chartData = sortedData.slice(0, 24).reverse();

  // Format hour label
  const formatHour = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="space-y-2">
      {/* Chart */}
      <div className="flex items-end justify-between h-48 gap-1">
        {chartData.map((item, index) => {
          const height = (item.visit_count / maxVisits) * 100;
          const isRecent = index >= chartData.length - 4;

          return (
            <div
              key={item.hour_timestamp}
              className="flex-1 flex flex-col items-center group"
            >
              {/* Bar */}
              <div
                className={`w-full rounded-t-lg transition-all ${
                  isRecent
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-indigo-400 hover:bg-indigo-500'
                }`}
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${item.visit_count} visits at ${formatHour(item.hour_timestamp)}`}
              />

              {/* Tooltip */}
              <div className="hidden group-hover:block absolute -mt-12 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                {item.visit_count} visits
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatHour(chartData[0]?.hour_timestamp || new Date().toISOString())}</span>
        <span>Now</span>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-indigo-400" />
          <span>Older hours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-indigo-600" />
          <span>Recent hours</span>
        </div>
      </div>
    </div>
  );
};

export default HourlyVisitsChart;
