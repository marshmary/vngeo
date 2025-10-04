import React from 'react';
import { Marker } from 'react-leaflet';
import { useUIStore } from '@/stores/uiStore';
import L from 'leaflet';

const SpratlyIslandsLabel: React.FC = () => {
  const { language } = useUIStore();
  
  // Spratly Islands coordinates
  const spratlyCoordinates: [number, number] = [8.5, 111.5];
  
  // Create a custom icon for the text label
  const textIcon = L.divIcon({
    html: `
      <div style="
        background: transparent;
        border: none;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 600;
        color: #1e40af;
        text-align: center;
        white-space: nowrap;
        pointer-events: none;
      ">
        ${language === 'vi' ? 'Quần đảo Trường Sa' : 'Spratly Islands'}
      </div>
    `,
    className: 'spratly-label',
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });

  return (
    <Marker position={spratlyCoordinates} icon={textIcon} />
  );
};

export default SpratlyIslandsLabel;
