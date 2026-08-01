import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useMapStore } from '@/stores/mapStore';
import type { EconomicZone } from '@/types/zone.types';

interface ZoneCardProps {
  zone: EconomicZone;
  className?: string;
}

const ZoneCard: React.FC<ZoneCardProps> = ({ zone, className = '' }) => {
  const { t } = useTranslation();
  const { selectedZone, setSelectedZone } = useMapStore();
  const isSelected = selectedZone === zone.id;

  const handleClick = () => {
    setSelectedZone(zone.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <motion.div
      className={`zone-card p-4 cursor-pointer ${
        isSelected ? 'selected' : ''
      } ${className}`}
      style={{
        borderLeftColor: zone.color,
        borderLeftWidth: '4px',
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Select ${zone.name} economic zone`}
      aria-pressed={isSelected}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 text-sm">
            {zone.name}
          </h4>
          <p className="text-xs text-gray-600 mt-1">
            {zone.nameVi}
          </p>
          <p className="text-xs text-gray-500">
            {zone.region}
          </p>
        </div>
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: zone.color }}
          aria-label={`Zone color: ${zone.color}`}
        ></div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div>
          <span className="font-medium">Population:</span>
          <br />
          {(zone.population / 1000000).toFixed(1)}M
        </div>
        <div>
          <span className="font-medium">GDP:</span>
          <br />
          ${(zone.gdp / 1000000000).toFixed(1)}B
        </div>
      </div>

      <div className="mt-3">
        <div className="flex flex-wrap gap-1">
          {zone.industries.slice(0, 2).map((industry) => (
            <span
              key={industry}
              className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-700"
            >
              {t(`industries.${industry}`)}
            </span>
          ))}
          {zone.industries.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-500">
              +{zone.industries.length - 2} more
            </span>
          )}
        </div>
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-gray-200"
        >
          <p className="text-xs text-blue-600 font-medium">
            Click on map marker for more details →
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ZoneCard;