import React from 'react';
import type { MostVisitedPage } from '@/types/analytics.types';

interface TopPagesTableProps {
  pages: MostVisitedPage[];
}

const TopPagesTable: React.FC<TopPagesTableProps> = ({ pages }) => {
  if (!pages || pages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No page visit data available
      </div>
    );
  }

  // Calculate total visits for percentage
  const totalVisits = pages.reduce((sum, page) => sum + page.visit_count, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Rank
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Page Path
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Page Title
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
              Visits
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
              Unique Visitors
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
              Share
            </th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page, index) => {
            const percentage = totalVisits > 0
              ? ((page.visit_count / totalVisits) * 100).toFixed(1)
              : '0';

            return (
              <tr
                key={`${page.page_path}-${index}`}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* Rank */}
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                    {index + 1}
                  </div>
                </td>

                {/* Page Path */}
                <td className="py-3 px-4">
                  <code className="text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    {page.page_path}
                  </code>
                </td>

                {/* Page Title */}
                <td className="py-3 px-4 text-sm text-gray-700">
                  {page.page_title || '-'}
                </td>

                {/* Visits */}
                <td className="py-3 px-4 text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    {page.visit_count.toLocaleString()}
                  </span>
                </td>

                {/* Unique Visitors */}
                <td className="py-3 px-4 text-right">
                  <span className="text-sm text-gray-600">
                    {page.unique_visitors.toLocaleString()}
                  </span>
                </td>

                {/* Share */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TopPagesTable;
