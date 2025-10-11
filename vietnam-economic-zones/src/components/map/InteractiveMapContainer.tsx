import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { useMapStore } from '@/stores/mapStore';
import { useUIStore } from '@/stores/uiStore';
import { gadmService, type ZoneGeoJSON } from '@/services/gadmService';
import { ZONE_METADATA } from '@/utils/zoneProvinces';
import ParacelIslandsLabel from './ParacelIslandsLabel';
import SpratlyIslandsLabel from './SpratlyIslandsLabel';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map event handler component
const MapEventHandler: React.FC = () => {
  const { setMapCenter, setZoomLevel, setSelectedZone } = useMapStore();

  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      setMapCenter([center.lat, center.lng]);
    },
    zoomend: (e) => {
      const map = e.target;
      setZoomLevel(map.getZoom());
    },
    click: () => {
      // Click on empty map area deselects zone
      setSelectedZone(null);
    }
  });

  return null;
};

// Map controls component
const MapControls: React.FC = () => {
  const map = useMap();
  const { resetMapState } = useMapStore();
  const { showNotification, language } = useUIStore();

  const handleResetView = () => {
    resetMapState();
    map.setView([16.0471, 108.2068], 6);
    showNotification(
      language === 'vi' ? 'Đã đặt lại bản đồ' : 'Map view reset',
      'info'
    );
  };

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div data-guide="map-controls" className="absolute top-4 left-4 z-[1000] flex flex-col space-y-2">
      <button
        onClick={handleZoomIn}
        className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-3 py-2 shadow-md focus-ring"
        aria-label="Zoom in"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      <button
        onClick={handleZoomOut}
        className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-3 py-2 shadow-md focus-ring"
        aria-label="Zoom out"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      <button
        onClick={handleResetView}
        className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-3 py-2 shadow-md focus-ring"
        title={language === 'vi' ? 'Đặt lại bản đồ' : 'Reset map view'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
};

// Zone tooltip component
interface ZoneTooltipProps {
  zone: {
    name: string;
    nameVi: string;
  } | null;
  mousePosition: { x: number; y: number } | null;
}

const ZoneTooltip: React.FC<ZoneTooltipProps> = ({ zone, mousePosition }) => {
  const { language } = useUIStore();

  if (!zone || !mousePosition) return null;

  return (
    <div
      className="fixed bg-black bg-opacity-80 text-white px-3 py-2 rounded text-sm pointer-events-none z-[2000] max-w-xs"
      style={{
        left: mousePosition.x + 10,
        top: mousePosition.y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="font-semibold">
        {language === 'vi' ? zone.nameVi : zone.name}
      </div>
      <div className="text-xs opacity-90">
        {language === 'vi' ? 'Nhấp để khám phá' : 'Click to explore'}
      </div>
    </div>
  );
};

const InteractiveMapContainer: React.FC = () => {
  const { t } = useTranslation();
  const {
    mapCenter,
    zoomLevel,
    zones,
    selectedZone,
    isLoading,
    error,
    loadZones,
    setSelectedZone,
    getZoneById
  } = useMapStore();

  const { showNotification, language } = useUIStore();

  const [geoJsonData, setGeoJsonData] = useState<ZoneGeoJSON | null>(null);
  const [hoveredZone, setHoveredZone] = useState<{ name: string; nameVi: string } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [isLoadingBoundaries, setIsLoadingBoundaries] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Record<string, L.Layer>>({});

  // Load zones and GADM-based boundary data
  useEffect(() => {
    if (zones.length === 0) {
      loadZones();
    }
  }, [loadZones, zones.length]);

  useEffect(() => {
    // Load zone boundaries from GADM data
    const loadZoneBoundaries = async () => {
      try {
        setIsLoadingBoundaries(true);
        console.log('Loading zone boundaries from GADM data...');
        const zoneData = await gadmService.generateZoneGeoJSON();
        setGeoJsonData(zoneData);
        console.log('Zone boundaries loaded successfully');
      } catch (error) {
        console.error('Error loading zone boundaries:', error);
        showNotification(
          language === 'vi' ? 'Lỗi tải dữ liệu bản đồ' : 'Error loading map data',
          'error'
        );
      } finally {
        setIsLoadingBoundaries(false);
      }
    };

    loadZoneBoundaries();
  }, [showNotification, language]);

  // Mouse move handler for tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // GeoJSON layer styling and interactions
  const onEachFeature = (feature: {
    properties: {
      id: string;
      color: string;
      provinces?: string[];
    };
  }, layer: L.Layer) => {
    const zoneId = feature.properties.id;
    const zoneMetadata = ZONE_METADATA[zoneId as keyof typeof ZONE_METADATA];
    const zone = getZoneById(zoneId);

    if (!zoneMetadata) return;

    // Store layer reference for legend click access
    layersRef.current[zoneId] = layer;

    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        setHoveredZone({
          ...feature.properties,
          name: zoneMetadata.name,
          nameVi: zoneMetadata.nameVi
        });

        layer.setStyle({
          weight: 3,
          color: feature.properties.color,
          fillOpacity: 0.4,
          dashArray: '',
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          layer.bringToFront();
        }
      },

      mouseout: (e) => {
        const layer = e.target;
        setHoveredZone(null);

        layer.setStyle(getZoneStyle(feature.properties.id === selectedZone));
      },

      click: (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedZone(zoneId);

        // Fit map to zone bounds with animation
        const layer = e.target;
        if (layer.getBounds) {
          mapRef.current?.fitBounds(layer.getBounds(), {
            padding: [20, 20],
            maxZoom: 10,
            animate: true,
            duration: 0.8
          });
        }

        showNotification(
          language === 'vi'
            ? `Đã chọn ${zoneMetadata.nameVi}`
            : `Selected ${zoneMetadata.name}`,
          'info'
        );
      }
    });

    // Enhanced popup with province information
    const provinces = feature.properties.provinces || [];
    const provinceList = provinces.slice(0, 5).join(', ');
    const remainingCount = provinces.length > 5
      ? ` + ${provinces.length - 5} more`
      : '';

    // Translate industries
    const translatedIndustries = zone ? zone.industries.slice(0, 3).map((industry: string) =>
      t(`industries.${industry}`)
    ) : [];

    const popupContent = `
      <div class="p-3 min-w-[250px]">
        <h3 class="font-semibold text-lg text-gray-800 mb-1">
          ${zoneMetadata.name}
        </h3>
        <p class="text-sm text-gray-600 mb-2">
          ${zoneMetadata.nameVi}
        </p>
        ${zone ? `
          <div class="space-y-1 text-xs text-gray-700">
            <p><strong>Population:</strong> ${(zone.population / 1000000).toFixed(1)}M</p>
            <p><strong>GDP:</strong> $${(zone.gdp / 1000000000).toFixed(1)}B</p>
            <p><strong>Area:</strong> ${zone.area.toLocaleString()} km²</p>
          </div>
          <div class="mt-2 flex flex-wrap gap-1">
            ${translatedIndustries.map((industry: string) =>
              `<span class="px-2 py-1 bg-gray-100 text-xs rounded">${industry}</span>`
            ).join('')}
          </div>
        ` : ''}
        ${provinceList ? `
          <div class="border-t pt-2 mt-2">
            <p class="text-xs font-medium text-gray-700 mb-1">Provinces:</p>
            <p class="text-xs text-gray-600">${provinceList}${remainingCount}</p>
          </div>
        ` : ''}
      </div>
    `;

    layer.bindPopup(popupContent);
  };

  const getZoneStyle = (isSelected: boolean) => ({
    fillColor: '#3b82f6',
    weight: isSelected ? 3 : 2,
    opacity: 1,
    color: isSelected ? '#1d4ed8' : '#64748b',
    dashArray: isSelected ? '' : '5, 5',
    fillOpacity: isSelected ? 0.3 : 0.1
  });

  const geoJsonStyle = (feature: {
    properties: {
      id: string;
      color: string;
    };
  }) => {
    const isSelected = feature.properties.id === selectedZone;
    return {
      fillColor: feature.properties.color,
      weight: isSelected ? 3 : 2,
      opacity: 1,
      color: isSelected ? feature.properties.color : '#64748b',
      dashArray: isSelected ? '' : '5, 5',
      fillOpacity: isSelected ? 0.3 : 0.15
    };
  };

  // Handle legend click to focus on zone with animation
  const handleLegendClick = (zoneId: string) => {
    setSelectedZone(zoneId);

    const layer = layersRef.current[zoneId];
    const zoneMetadata = ZONE_METADATA[zoneId as keyof typeof ZONE_METADATA];

    if (layer && 'getBounds' in layer && typeof layer.getBounds === 'function') {
      mapRef.current?.fitBounds(layer.getBounds(), {
        padding: [20, 20],
        maxZoom: 10,
        animate: true,
        duration: 0.8
      });
    }

    if (zoneMetadata) {
      showNotification(
        language === 'vi'
          ? `Đã chọn ${zoneMetadata.nameVi}`
          : `Selected ${zoneMetadata.name}`,
        'info'
      );
    }
  };

  if (isLoading || isLoadingBoundaries) {
    return (
      <div className="h-96 w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            {language === 'vi' ? 'Đang tải bản đồ...' : 'Loading map...'}
          </p>
          {isLoadingBoundaries && (
            <p className="text-xs text-gray-500 mt-1">
              {language === 'vi' ? 'Đang xử lý dữ liệu tỉnh thành...' : 'Processing administrative data...'}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 w-full bg-red-50 border border-red-200 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="font-semibold">
            {language === 'vi' ? 'Lỗi tải bản đồ' : 'Error loading map'}
          </p>
          <p className="text-sm">{error}</p>
          <button
            onClick={loadZones}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus-ring"
          >
            {language === 'vi' ? 'Thử lại' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-guide="map-container" className="relative h-full w-full overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        ref={mapRef}
        className="focus:outline-none"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={18}
          minZoom={5}
        />

        {/* Zone boundaries */}
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={(feature) => {
            if (!feature) return {};
            return geoJsonStyle(feature);
          }}
            onEachFeature={onEachFeature}
          />
        )}

        <MapEventHandler />
        <MapControls />
        <ParacelIslandsLabel />
        <SpratlyIslandsLabel />
      </MapContainer>

      {/* Zone tooltip */}
      <ZoneTooltip zone={hoveredZone} mousePosition={mousePosition} />

      {/* Economic Zone Legend */}
      <div data-guide="map-legend" className="legend-container">
        <div className="mb-3">
          <h4 className="font-semibold text-sm text-gray-900">
            {language === 'vi' ? 'VÙNG KINH TẾ' : 'ECONOMIC ZONES'}
          </h4>
        </div>

        <div className="space-y-2">
          {Object.entries(ZONE_METADATA).map(([zoneId, metadata]) => (
            <button
              key={zoneId}
              onClick={() => handleLegendClick(zoneId)}
              className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-50 ${
                selectedZone === zoneId ? 'bg-blue-50 border border-blue-200' : ''
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: metadata.color }}
              ></div>
              <span className="text-xs text-gray-700 font-medium">
                {language === 'vi' ? metadata.nameVi : metadata.name}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default InteractiveMapContainer;