import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EconomicZone, MapState } from '@/types/zone.types';
import { VIETNAM_ECONOMIC_ZONES, VIETNAM_MAP_CENTER, DEFAULT_ZOOM_LEVEL } from '@/utils/constants';

interface MapActions {
  setSelectedZone: (zoneId: string | null) => void;
  setMapCenter: (center: [number, number]) => void;
  setZoomLevel: (zoom: number) => void;
  loadZones: () => Promise<void>;
  resetMapState: () => void;
  getZoneById: (zoneId: string) => EconomicZone | undefined;
}

export const useMapStore = create<MapState & MapActions>()(
  persist(
    (set, get) => ({
      // State
      selectedZone: null,
      mapCenter: VIETNAM_MAP_CENTER,
      zoomLevel: DEFAULT_ZOOM_LEVEL,
      zones: [],
      isLoading: false,
      error: null,

      // Actions
      setSelectedZone: (zoneId) => {
        set({ selectedZone: zoneId });

        // Auto-center map on selected zone
        if (zoneId) {
          const zone = get().getZoneById(zoneId);
          if (zone) {
            set({
              mapCenter: zone.coordinates,
              zoomLevel: 8 // Zoom in when selecting a zone
            });
          }
        }
      },

      setMapCenter: (center) => set({ mapCenter: center }),

      setZoomLevel: (zoom) => set({ zoomLevel: zoom }),

      loadZones: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call with setTimeout for realistic loading
          await new Promise(resolve => setTimeout(resolve, 500));

          // Load static zone data
          set({
            zones: VIETNAM_ECONOMIC_ZONES,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load economic zones',
            isLoading: false
          });
        }
      },

      resetMapState: () => set({
        selectedZone: null,
        mapCenter: VIETNAM_MAP_CENTER,
        zoomLevel: DEFAULT_ZOOM_LEVEL,
        zones: [],
        isLoading: false,
        error: null
      }),

      getZoneById: (zoneId) => {
        return get().zones.find(zone => zone.id === zoneId);
      }
    }),
    {
      name: 'vietnam-zones-map-store',
      partialize: (state) => ({
        // Only persist user preferences, not zones data
        mapCenter: state.mapCenter,
        zoomLevel: state.zoomLevel,
        selectedZone: state.selectedZone,
      }),
    }
  )
);