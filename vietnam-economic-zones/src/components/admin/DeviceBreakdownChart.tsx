import React from 'react';
import type { DeviceBreakdown } from '@/types/analytics.types';

interface DeviceBreakdownChartProps {
  data: DeviceBreakdown[];
}

const DeviceBreakdownChart: React.FC<DeviceBreakdownChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No device data available
      </div>
    );
  }

  const deviceConfig = {
    desktop: {
      label: 'Desktop',
      color: 'bg-blue-500',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      ),
    },
    mobile: {
      label: 'Mobile',
      color: 'bg-green-500',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      ),
    },
    tablet: {
      label: 'Tablet',
      color: 'bg-purple-500',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
        />
      ),
    },
    unknown: {
      label: 'Unknown',
      color: 'bg-gray-400',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
  };

  // Sort by visit count descending
  const sortedData = [...data].sort((a, b) => b.visit_count - a.visit_count);
  const totalVisits = sortedData.reduce((sum, item) => sum + item.visit_count, 0);

  return (
    <div className="space-y-6">
      {/* Device List */}
      <div className="space-y-3">
        {sortedData.map((item) => {
          const config = deviceConfig[item.device_type] || deviceConfig.unknown;

          return (
            <div key={item.device_type} className="space-y-2">
              {/* Device Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color} bg-opacity-10`}>
                    <svg
                      className={`w-5 h-5 ${config.color.replace('bg-', 'text-')}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {config.icon}
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {config.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.visit_count.toLocaleString()} visits
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {item.percentage}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${config.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Total Devices
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {totalVisits.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeviceBreakdownChart;
