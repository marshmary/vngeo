import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { useMapStore } from '@/stores/mapStore';
import ZoneLayer from './ZoneLayer';
import ProvinceDebugger from '../debug/ProvinceDebugger';
import { Button } from '@/components/ui';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom colored markers for each zone
const createZoneIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-zone-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const VietnamMap: React.FC = () => {
  const { t } = useTranslation();
  const {
    mapCenter,
    zoomLevel,
    zones,
    selectedZone,
    isLoading,
    error,
    loadZones,
    setSelectedZone
  } = useMapStore();

  useEffect(() => {
    // Load zones when component mounts
    if (zones.length === 0) {
      loadZones();
    }
  }, [loadZones, zones.length]);

  if (isLoading) {
    return (
      <div className="h-96 w-full bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading Vietnam map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 w-full bg-danger-soft border border-danger/30 flex items-center justify-center">
        <div className="text-center text-danger">
          <p className="font-semibold">Error loading map</p>
          <p className="text-sm">{error}</p>
          <Button variant="danger" className="mt-2" onClick={loadZones}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 w-full overflow-hidden shadow-card border border-border relative">
      <ProvinceDebugger />
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
        // Event handlers will be managed by MapEventHandler component
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={18}
          minZoom={5}
        />

        {/* Zone and Vietnam borders */}
        <ZoneLayer />

        {zones.map((zone) => (
          <Marker
            key={zone.id}
            position={zone.coordinates}
            icon={createZoneIcon(zone.color)}
            eventHandlers={{
              click: () => {
                setSelectedZone(zone.id);
              },
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-lg text-foreground">
                  {zone.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {zone.nameVi}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  {zone.region}
                </p>
                <div className="space-y-1 text-xs text-foreground">
                  <p><strong>Population:</strong> {(zone.population / 1000000).toFixed(1)}M</p>
                  <p><strong>GDP:</strong> ${(zone.gdp / 1000000000).toFixed(1)}B</p>
                  <p><strong>Area:</strong> {zone.area.toLocaleString()} km²</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {zone.industries.slice(0, 3).map((industry) => (
                    <span
                      key={industry}
                      className="px-2 py-1 bg-muted text-xs rounded"
                    >
                      {t(`industries.${industry}`)}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedZone(zone.id)}
                  className="mt-2 w-full px-3 py-1 bg-brand text-white text-sm rounded-button hover:bg-brand-hover focus-ring"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map overlay showing selected zone */}
      {selectedZone && (
        <div className="map-overlay">
          {(() => {
            const zone = zones.find(z => z.id === selectedZone);
            return zone ? (
              <div>
                <h4 className="font-semibold text-sm">{zone.name}</h4>
                <p className="text-xs text-muted-foreground">{zone.nameVi}</p>
                <div
                  className="w-4 h-4 rounded-full mt-1"
                  style={{ backgroundColor: zone.color }}
                ></div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};

export default VietnamMap;