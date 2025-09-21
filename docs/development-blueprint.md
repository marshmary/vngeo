# Vietnam Economic Zones Explorer - Development Blueprint

**Project:** Vietnam Economic Zones Interactive Mapping Application
**Target:** High School Students
**Approach:** Frontend-focused with minimal backend
**Status:** Ready for immediate development
**Date:** 2025-09-21

---

## 🚀 Quick Start Guide

### Immediate Development Steps

**1. Initialize Project (5 minutes)**
```bash
# Create React + Vite project
npm create vite@latest vietnam-economic-zones -- --template react-ts
cd vietnam-economic-zones
npm install

# Install core dependencies
npm install react-leaflet leaflet zustand react-router-dom @headlessui/react
npm install -D tailwindcss postcss autoprefixer @types/leaflet
npx tailwindcss init -p
```

**2. Essential Dependencies from Architecture**
```bash
# UI and Styling
npm install framer-motion clsx

# Form handling and utilities
npm install react-hook-form

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Development tools
npm install -D @types/react @types/react-dom eslint prettier
```

**3. Create Initial Structure (10 minutes)**
Follow the exact structure from `docs/ui-architecture.md` section "Project Structure"

---

## 📋 Development Roadmap

### Phase 1: Core Infrastructure (Week 1)
**Priority: Get basic map working**

1. **Day 1-2: Project Setup & Map Foundation**
   - ✅ Initialize project with dependencies
   - ✅ Configure Tailwind CSS with Vietnam theme colors
   - ✅ Create basic MapContainer component with React Leaflet
   - ✅ Add Vietnam map center coordinates (16.0471, 108.2068)

2. **Day 3-4: State Management & Routing**
   - ✅ Implement Zustand stores (mapStore, uiStore)
   - ✅ Configure React Router with zone-based routes
   - ✅ Create basic page structure (HomePage, ZoneDetailPage)

3. **Day 5-7: Zone Visualization**
   - ✅ Create dummy zone data (6 economic zones)
   - ✅ Implement zone boundary overlays on map
   - ✅ Add zone selection functionality

### Phase 2: Zone Information System (Week 2)
**Priority: Zone details and navigation**

1. **Zone Detail Pages**
   - ✅ ZoneDetailPage with information display
   - ✅ Zone statistics and key data
   - ✅ Navigation between zones

2. **Information Architecture**
   - ✅ Create zone information JSON files
   - ✅ Implement zone data loading service
   - ✅ Add zone comparison features

### Phase 3: Document Management (Week 3)
**Priority: File upload and management**

1. **Client-side Document System**
   - ✅ DocumentUpload component
   - ✅ File size validation (5MB limit)
   - ✅ Local storage using IndexedDB
   - ✅ Document list and search

2. **Administrator Features**
   - ✅ Simple admin authentication
   - ✅ Document management interface
   - ✅ Admin dashboard

### Phase 4: Q&A System (Week 4)
**Priority: Educational interaction**

1. **Q&A Interface**
   - ✅ Question and answer display
   - ✅ Search and categorization
   - ✅ Zone-specific Q&A sections

2. **Content Management**
   - ✅ Q&A data structure
   - ✅ Admin Q&A management
   - ✅ Educational content integration

---

## 🎯 Critical Implementation Details

### 1. Map Implementation (Start Here)

**MapContainer.tsx** - Primary component
```typescript
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useMapStore } from '../stores/mapStore';

const VietnamMap: React.FC = () => {
  const { mapCenter, zoomLevel, zones } = useMapStore();

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoomLevel}
      className="h-96 w-full rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      {/* Zone boundaries will be added here */}
    </MapContainer>
  );
};
```

**Key Files to Create First:**
- `src/stores/mapStore.ts` - Map state management
- `src/components/map/MapContainer.tsx` - Main map component
- `src/pages/HomePage.tsx` - Landing page with map
- `src/types/zone.types.ts` - TypeScript definitions

### 2. Zone Data Structure

**Vietnam Economic Zones (6 zones to implement):**

```typescript
interface EconomicZone {
  id: string;
  name: string;
  region: string;
  color: string;
  coordinates: [number, number];
  boundaries: GeoJSON.FeatureCollection;
  industries: string[];
  population: number;
  gdp: number;
  keyFacts: string[];
  description: string;
}

// Zone definitions
const VIETNAM_ZONES = [
  {
    id: 'zone-1',
    name: 'North Mountain Region',
    color: '#ef4444',
    coordinates: [21.0285, 105.8542], // Hanoi area
    // ... rest of data
  },
  {
    id: 'zone-2',
    name: 'Red River Delta',
    color: '#f97316',
    coordinates: [20.8449, 106.1256],
    // ... rest of data
  },
  // ... 4 more zones
];
```

### 3. File Structure Priority

**Create These Directories First:**
```
src/
├── components/
│   ├── map/           # MapContainer, ZoneLayer, MapControls
│   ├── zone/          # ZoneCard, ZoneDetails, ZoneStats
│   └── common/        # Button, Modal, LoadingSpinner
├── pages/             # HomePage, ZoneDetailPage
├── stores/            # mapStore, documentStore
├── services/          # mapService, storageService
├── types/             # zone.types.ts, map.types.ts
└── data/              # zone data JSON files
```

**Vietnam Map Data Files (Create in public/):**
```
public/
├── vietnam-map-data/
│   ├── vietnam-boundaries.geojson
│   ├── zone-1-boundaries.geojson
│   ├── zone-2-boundaries.geojson
│   ├── ... (6 zones total)
│   └── zones-metadata.json
```

---

## 🛠️ Development Guidelines

### Coding Standards (From Architecture)

1. **TypeScript First** - All components use interfaces
2. **Functional Components** - No class components
3. **Zustand State Management** - For cross-component state
4. **Tailwind CSS** - Utility-first styling approach
5. **React Leaflet** - For all mapping functionality

### Key Patterns to Follow

**Component Structure:**
```typescript
// Standard component template from architecture
interface ComponentProps {
  // TypeScript interface required
}

const Component: React.FC<ComponentProps> = ({ props }) => {
  // Zustand store access
  const { state, actions } = useStore();

  // Event handlers
  const handleAction = () => {
    // Implementation
  };

  return (
    <motion.div className="tailwind-classes">
      {/* JSX content */}
    </motion.div>
  );
};

export default Component;
```

**File Naming:**
- Components: `ZoneCard/index.tsx`
- Pages: `HomePage/HomePage.tsx`
- Hooks: `useMapData.ts`
- Stores: `mapStore.ts`

### Vietnam-Specific Configuration

**Environment Variables (.env.local):**
```bash
VITE_VIETNAM_MAP_CENTER_LAT=16.0471
VITE_VIETNAM_MAP_CENTER_LNG=108.2068
VITE_DEFAULT_ZOOM_LEVEL=6
VITE_ECONOMIC_ZONES_COUNT=6
VITE_ZONE_COLORS="ef4444,f97316,eab308,22c55e,3b82f6,8b5cf6"
```

**Tailwind Theme (tailwind.config.js):**
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'vietnam-red': '#da020e',
        'vietnam-yellow': '#ffcd00',
        'zone-1': '#ef4444',
        'zone-2': '#f97316',
        'zone-3': '#eab308',
        'zone-4': '#22c55e',
        'zone-5': '#3b82f6',
        'zone-6': '#8b5cf6',
      }
    }
  }
}
```

---

## 📚 Reference Documentation

### Existing Architecture
- **Complete Frontend Architecture**: `docs/ui-architecture.md`
- **Business Requirements**: `docs/brainstorming-session-results.md`
- **BMad Method Framework**: `.bmad-core/` (agent infrastructure)

### Key Technical Decisions Made
1. **React + Vite** - Fast development with modern tooling
2. **React Leaflet** - Open source mapping for educational use
3. **Zustand** - Lightweight state management
4. **Local Storage** - Minimal backend approach for documents
5. **TypeScript** - Type safety and better development experience

### Educational Focus Requirements
- **Target Audience**: High school students
- **Accessibility**: High contrast options, keyboard navigation
- **Performance**: Fast loading for school networks
- **Content**: Vietnamese economic zones education
- **Features**: Map exploration, document access, Q&A system

---

## 🧪 Testing Strategy

### Testing Priorities
1. **Map Functionality** - Zone selection, navigation
2. **Document Upload** - File handling, size limits
3. **Accessibility** - Keyboard navigation, screen readers
4. **Educational Workflows** - Student exploration paths

### Test Commands
```bash
npm run test        # Vitest unit tests
npm run test:watch  # Watch mode for development
npm run coverage    # Coverage report
```

---

## 🚀 Deployment Preparation

### Build Configuration
```bash
npm run build       # Production build
npm run preview     # Preview production build locally
```

### Static Hosting Options
- **Vercel** - Recommended for React apps
- **Netlify** - Good for educational projects
- **GitHub Pages** - Free option for schools
- **Firebase Hosting** - Google integration

### Educational Deployment Considerations
- **No backend required** - Can be hosted on any static hosting
- **Offline capability** - Service worker for school environments
- **Content updates** - JSON file updates for zone information

---

## 🎯 Success Metrics

### Development Milestones
- ✅ Map displays Vietnam with 6 economic zones
- ✅ Zone selection and detail viewing works
- ✅ Document upload and management functional
- ✅ Q&A system operational
- ✅ Responsive design for mobile/desktop
- ✅ Basic admin features working

### Educational Goals
- Students can explore all 6 economic zones
- Zone information is clear and engaging
- Document system supports learning materials
- Q&A helps student comprehension
- Interface is intuitive for high school level

---

## 📞 Next Steps

**Immediate Actions:**
1. Run the project initialization commands above
2. Create the basic map component following the architecture
3. Set up the zone data structure with dummy data
4. Implement zone visualization on the map
5. Test zone selection functionality

**Development Support:**
- Reference `docs/ui-architecture.md` for detailed component patterns
- Use BMad Method agents in `.bmad-core/agents/` for specialized help
- Follow the exact folder structure specified in the architecture

**Ready to Code!** 🚀

*This blueprint enables immediate development start while maintaining alignment with the comprehensive architecture design.*