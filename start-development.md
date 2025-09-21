# 🚀 Vietnam Economic Zones - Start Development

**Quick Start Commands - Copy and run these in sequence**

## 1. Initialize Project (Run in parent directory)

```bash
# Create React + Vite project
npm create vite@latest vietnam-economic-zones -- --template react-ts
cd vietnam-economic-zones

# Install core dependencies
npm install

# Install project-specific dependencies
npm install react-leaflet leaflet zustand react-router-dom @headlessui/react
npm install framer-motion clsx react-hook-form

# Install development dependencies
npm install -D tailwindcss postcss autoprefixer @types/leaflet
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @types/react @types/react-dom eslint prettier

# Initialize Tailwind CSS
npx tailwindcss init -p
```

## 2. Configure Tailwind (Replace tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vietnam-red': '#da020e',
        'vietnam-yellow': '#ffcd00',
        'mekong-blue': '#1e40af',
        'rice-green': '#16a34a',
        'mountain-gray': '#6b7280',
        'zone-1': '#ef4444',  // North Mountain Region
        'zone-2': '#f97316',  // Red River Delta
        'zone-3': '#eab308',  // North Central Coast
        'zone-4': '#22c55e',  // South Central Coast
        'zone-5': '#3b82f6',  // Central Highlands
        'zone-6': '#8b5cf6',  // Mekong River Delta
      },
      fontFamily: {
        'primary': ['Inter', 'sans-serif'],
        'heading': ['Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

## 3. Create Environment Variables (.env.local)

```bash
# Vietnam Map Configuration
VITE_VIETNAM_MAP_CENTER_LAT=16.0471
VITE_VIETNAM_MAP_CENTER_LNG=108.2068
VITE_DEFAULT_ZOOM_LEVEL=6
VITE_MAX_ZOOM_LEVEL=18
VITE_MIN_ZOOM_LEVEL=5

# Economic Zones
VITE_ECONOMIC_ZONES_COUNT=6
VITE_ZONE_COLORS="ef4444,f97316,eab308,22c55e,3b82f6,8b5cf6"

# Storage Configuration
VITE_MAX_DOCUMENT_SIZE=5242880
VITE_ALLOWED_FILE_TYPES="pdf,doc,docx,ppt,pptx,jpg,jpeg,png"
VITE_LOCAL_STORAGE_PREFIX="vietnam_zones_"

# Admin Configuration
VITE_ADMIN_ENABLED=true
VITE_ADMIN_PASSWORD_REQUIRED=true
VITE_DEFAULT_ADMIN_PASSWORD="vietnam-zones-admin"

# Feature Flags
VITE_FEATURE_DARK_MODE=true
VITE_FEATURE_HIGH_CONTRAST=true
VITE_FEATURE_EXPORT_DATA=true

# Educational Content
VITE_CONTENT_LANGUAGE="vi,en"
VITE_DEFAULT_LANGUAGE="vi"
VITE_SHOW_ENGLISH_TRANSLATIONS=true
```

## 4. Update src/index.css (Replace with Vietnam theme)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Vietnam-inspired global theme */
:root {
  /* Vietnam color palette */
  --color-vietnam-red: #da020e;
  --color-vietnam-yellow: #ffcd00;
  --color-mekong-blue: #1e40af;
  --color-rice-green: #16a34a;
  --color-mountain-gray: #6b7280;

  /* Economic zone colors */
  --zone-1-color: #ef4444;
  --zone-2-color: #f97316;
  --zone-3-color: #eab308;
  --zone-4-color: #22c55e;
  --zone-5-color: #3b82f6;
  --zone-6-color: #8b5cf6;

  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-heading: 'Plus Jakarta Sans', sans-serif;
}

/* Leaflet CSS fix */
@import 'leaflet/dist/leaflet.css';

/* Component styles */
.zone-card {
  @apply bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200;
  @apply border-l-4 border-transparent hover:border-blue-500;
}

.zone-card.selected {
  @apply border-blue-500 bg-blue-50;
}

.map-overlay {
  @apply absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg;
  @apply border border-gray-200 max-w-sm;
}

/* Educational accessibility */
.high-contrast {
  filter: contrast(1.2);
}

/* Focus management */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}
```

## 5. Create Initial Folder Structure

```bash
# Create directories
mkdir -p src/components/map
mkdir -p src/components/zone
mkdir -p src/components/common
mkdir -p src/components/documents
mkdir -p src/components/qa
mkdir -p src/pages
mkdir -p src/stores
mkdir -p src/services
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/utils
mkdir -p public/vietnam-map-data
mkdir -p tests
```

## 6. Create First Components

### src/types/zone.types.ts
```typescript
export interface EconomicZone {
  id: string;
  name: string;
  region: string;
  color: string;
  coordinates: [number, number];
  boundaries?: GeoJSON.FeatureCollection;
  industries: string[];
  population: number;
  gdp: number;
  keyFacts: string[];
  description: string;
  establishedYear: number;
  majorCities: string[];
}

export interface MapState {
  selectedZone: string | null;
  mapCenter: [number, number];
  zoomLevel: number;
  zones: EconomicZone[];
  isLoading: boolean;
  error: string | null;
}
```

### src/stores/mapStore.ts
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EconomicZone, MapState } from '../types/zone.types';

interface MapActions {
  setSelectedZone: (zoneId: string | null) => void;
  setMapCenter: (center: [number, number]) => void;
  setZoomLevel: (zoom: number) => void;
  loadZones: () => Promise<void>;
  resetMapState: () => void;
}

export const useMapStore = create<MapState & MapActions>()(
  persist(
    (set, get) => ({
      // State
      selectedZone: null,
      mapCenter: [16.0471, 108.2068],
      zoomLevel: 6,
      zones: [],
      isLoading: false,
      error: null,

      // Actions
      setSelectedZone: (zoneId) => set({ selectedZone: zoneId }),
      setMapCenter: (center) => set({ mapCenter: center }),
      setZoomLevel: (zoom) => set({ zoomLevel: zoom }),

      loadZones: async () => {
        set({ isLoading: true, error: null });
        try {
          // For now, use dummy data - replace with actual data loading
          const dummyZones: EconomicZone[] = [
            {
              id: 'zone-1',
              name: 'North Mountain Region',
              region: 'Northern Vietnam',
              color: '#ef4444',
              coordinates: [21.0285, 105.8542],
              industries: ['Mining', 'Agriculture', 'Tourism'],
              population: 15000000,
              gdp: 45000000000,
              keyFacts: ['Mountainous terrain', 'Rich mineral resources', 'Border with China'],
              description: 'The northern mountainous region characterized by diverse economic activities.',
              establishedYear: 1986,
              majorCities: ['Hanoi', 'Hai Phong', 'Thai Nguyen'],
            },
            // Add 5 more zones here...
          ];

          set({ zones: dummyZones, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to load economic zones', isLoading: false });
        }
      },

      resetMapState: () => set({
        selectedZone: null,
        mapCenter: [16.0471, 108.2068],
        zoomLevel: 6,
        error: null
      }),
    }),
    {
      name: 'map-store',
      partialize: (state) => ({
        mapCenter: state.mapCenter,
        zoomLevel: state.zoomLevel,
        selectedZone: state.selectedZone,
      }),
    }
  )
);
```

### src/components/map/MapContainer.tsx
```typescript
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMapStore } from '../../stores/mapStore';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const VietnamMap: React.FC = () => {
  const { mapCenter, zoomLevel, zones, loadZones, setSelectedZone } = useMapStore();

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {zones.map((zone) => (
          <Marker
            key={zone.id}
            position={zone.coordinates}
            eventHandlers={{
              click: () => setSelectedZone(zone.id),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-lg">{zone.name}</h3>
                <p className="text-sm text-gray-600">{zone.region}</p>
                <p className="text-xs mt-1">{zone.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default VietnamMap;
```

### src/pages/HomePage.tsx
```typescript
import React from 'react';
import VietnamMap from '../components/map/MapContainer';
import { useMapStore } from '../stores/mapStore';

const HomePage: React.FC = () => {
  const { zones, selectedZone } = useMapStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Vietnam Economic Zones Explorer
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              Educational Tool for High School Students
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Interactive Map</h2>
              <VietnamMap />
            </div>
          </div>

          {/* Zone Information Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Economic Zones</h3>
              <div className="space-y-3">
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className={`zone-card p-3 cursor-pointer ${
                      selectedZone === zone.id ? 'selected' : ''
                    }`}
                    style={{ borderLeftColor: zone.color }}
                  >
                    <h4 className="font-medium">{zone.name}</h4>
                    <p className="text-sm text-gray-600">{zone.region}</p>
                    <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                      <span>Pop: {(zone.population / 1000000).toFixed(1)}M</span>
                      <span>Industries: {zone.industries.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedZone && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Zone Details</h3>
                {/* Zone detail content will go here */}
                <p className="text-sm text-gray-600">
                  Selected: {zones.find(z => z.id === selectedZone)?.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
```

### src/App.tsx (Replace existing)
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Add more routes later */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

## 7. Test Your Setup

```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
# You should see the Vietnam Economic Zones Explorer with a basic map
```

## ✅ Success Checklist

After running these commands, you should have:

- ✅ React + Vite project with TypeScript
- ✅ All necessary dependencies installed
- ✅ Tailwind CSS configured with Vietnam theme
- ✅ Basic map displaying Vietnam
- ✅ Zone markers on the map
- ✅ Zone selection functionality
- ✅ Responsive layout with sidebar
- ✅ State management with Zustand

## 🎯 Next Development Steps

1. **Add More Zone Data** - Complete all 6 economic zones
2. **Implement Zone Detail Pages** - Full zone information display
3. **Add GeoJSON Boundaries** - Proper zone boundary visualization
4. **Document Upload System** - File management functionality
5. **Q&A System** - Educational question and answer features

## 📖 References

- **Full Architecture**: `docs/ui-architecture.md`
- **Development Blueprint**: `docs/development-blueprint.md`
- **Business Requirements**: `docs/brainstorming-session-results.md`

**Ready to start coding! 🚀**