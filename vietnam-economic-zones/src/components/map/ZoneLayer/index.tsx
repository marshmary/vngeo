import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useMapStore } from '@/stores/mapStore';
import { gadmService, type ZoneGeoJSON } from '@/services/gadmService';
import L from 'leaflet';

interface VietnamBoundariesData {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: {
      GID_0: string;
      COUNTRY: string;
      NAME_0?: string;
      VARNAME_0?: string;
      NL_NAME_0?: string;
      TYPE_0?: string;
      ENGTYPE_0?: string;
    };
    geometry: {
      type: 'MultiPolygon' | 'Polygon';
      coordinates: number[][][][] | number[][][];
    };
  }>;
}

const ZoneLayer: React.FC = () => {
  const { selectedZone, setSelectedZone } = useMapStore();
  const [vietnamBoundaries, setVietnamBoundaries] = useState<VietnamBoundariesData | null>(null);
  const [zoneBoundaries, setZoneBoundaries] = useState<ZoneGeoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load Vietnam boundaries (keep the existing file for country outline)
        const vietnamResponse = await fetch('/vietnam-map-data/gadm41_VNM_0.json');
        if (!vietnamResponse.ok) {
          throw new Error('Failed to load Vietnam boundaries');
        }
        const vietnamData = await vietnamResponse.json();
        setVietnamBoundaries(vietnamData);

        // Generate zone boundaries from GADM data
        console.log('Loading GADM data and generating zone boundaries...');
        const zoneData = await gadmService.generateZoneGeoJSON();
        setZoneBoundaries(zoneData);
        console.log('Zone boundaries generated successfully');

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map data');
        console.error('Error loading map data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  // Style function for Vietnam country borders
  const vietnamBorderStyle = {
    color: '#1f2937',
    weight: 3,
    opacity: 1,
    fillColor: 'transparent',
    fillOpacity: 0,
    dashArray: '5, 5'
  };

  // Style function for economic zone borders
  const zoneStyle = (feature: any) => {
    const isSelected = feature.properties.id === selectedZone;
    return {
      color: feature.properties.color || '#374151',
      weight: isSelected ? 4 : 2,
      opacity: isSelected ? 1 : 0.8,
      fillColor: feature.properties.color || '#374151',
      fillOpacity: isSelected ? 0.3 : 0.1,
      dashArray: isSelected ? undefined : '2, 4'
    };
  };

  // Event handlers for zone interactions
  const onEachZone = (feature: any, layer: L.Layer) => {
    if (feature.properties.id) {
      layer.on({
        click: () => {
          setSelectedZone(feature.properties.id);
        },
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle({
            weight: 4,
            opacity: 1,
            fillOpacity: 0.3
          });
        },
        mouseout: (e) => {
          // Reset style when mouse leaves
          if (zoneBoundaries) {
            const geoJsonLayer = e.target._map._layers;
            Object.values(geoJsonLayer).forEach((mapLayer: any) => {
              if (mapLayer._geojson === zoneBoundaries) {
                mapLayer.resetStyle(e.target);
              }
            });
          }
        }
      });

      // Add tooltip with province information
      const provinceList = feature.properties.provinces?.slice(0, 5).join(', ') || '';
      const remainingCount = feature.properties.provinces?.length > 5
        ? ` + ${feature.properties.provinces.length - 5} more`
        : '';

      layer.bindTooltip(
        `<div>
          <strong>${feature.properties.name}</strong>
          ${feature.properties.nameVi ? `<br/><em>${feature.properties.nameVi}</em>` : ''}
          ${provinceList ? `<br/><small>${provinceList}${remainingCount}</small>` : ''}
        </div>`,
        {
          permanent: false,
          direction: 'top',
          className: 'zone-tooltip'
        }
      );
    }
  };

  if (loading) {
    return null; // Don't render anything while loading
  }

  if (error) {
    console.error('ZoneLayer error:', error);
    return null; // Don't render anything on error
  }

  return (
    <>
      {/* Vietnam country borders */}
      {vietnamBoundaries && (
        <GeoJSON
          key="vietnam-borders"
          data={vietnamBoundaries}
          style={vietnamBorderStyle}
        />
      )}

      {/* Economic zone borders */}
      {zoneBoundaries && (
        <GeoJSON
          key={`zone-borders-${selectedZone || 'none'}`}
          data={zoneBoundaries}
          style={zoneStyle}
          onEachFeature={onEachZone}
        />
      )}
    </>
  );
};

export default ZoneLayer;