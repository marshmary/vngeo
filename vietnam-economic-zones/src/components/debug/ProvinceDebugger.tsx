import React, { useEffect, useState } from 'react';
import { gadmService } from '@/services/gadmService';
import { ZONE_PROVINCES } from '@/utils/zoneProvinces';

const ProvinceDebugger: React.FC = () => {
  const [provinces, setProvinces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const provinceList = await gadmService.getProvinceList();
        setProvinces(provinceList);
        console.log('All provinces from GADM:', provinceList);

        // Check mapping coverage
        Object.entries(ZONE_PROVINCES).forEach(([zoneId, zoneProvinces]) => {
          const unmatchedProvinces = zoneProvinces.filter(p => !provinceList.includes(p));
          if (unmatchedProvinces.length > 0) {
            console.warn(`Zone ${zoneId} has unmatched provinces:`, unmatchedProvinces);
          } else {
            console.log(`Zone ${zoneId}: All ${zoneProvinces.length} provinces matched ✅`);
          }
        });

        // Find provinces in GADM that aren't assigned to any zone
        const allAssignedProvinces = Object.values(ZONE_PROVINCES).flat();
        const unassignedProvinces = provinceList.filter(p => !allAssignedProvinces.includes(p));
        if (unassignedProvinces.length > 0) {
          console.warn('Provinces in GADM not assigned to any zone:', unassignedProvinces);
        }
      } catch (error) {
        console.error('Error loading provinces:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProvinces();
  }, []);

  if (loading) {
    return <div className="p-4">Loading province data...</div>;
  }

  return (
    <div className="fixed top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm max-h-96 overflow-y-auto z-50">
      <h3 className="font-bold mb-2">Zone Configuration</h3>
      <p className="text-sm mb-2">Total provinces: {provinces.length}</p>

      {/* Show zone breakdown */}
      <div className="text-xs space-y-2 mb-3">
        {Object.entries(ZONE_PROVINCES).map(([zoneId, zoneProvinces]) => (
          <div key={zoneId} className="border rounded p-2">
            <div className="font-semibold text-blue-600 mb-1">
              {zoneId}: {zoneProvinces.length} provinces
            </div>
            <div className="text-gray-600">
              {zoneProvinces.slice(0, 3).join(', ')}
              {zoneProvinces.length > 3 && ` + ${zoneProvinces.length - 3} more`}
            </div>
          </div>
        ))}
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer font-medium">All Provinces</summary>
        <div className="mt-2 space-y-1">
          {provinces.map(province => (
            <div key={province} className="border-b border-gray-100 pb-1">
              {province}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

export default ProvinceDebugger;