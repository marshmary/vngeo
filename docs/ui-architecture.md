# Vietnam Economic Zones Explorer Frontend Architecture Document

**Date:** 2025-09-21
**Version:** 1.0
**Architect:** Winston
**Project:** Vietnam Economic Zones Interactive Mapping Application

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-09-21 | 1.0 | Initial frontend architecture document | Winston |

---

## Frontend Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Framework | React | ^18.2.0 | UI framework | Modern hooks, excellent ecosystem for mapping |
| Build Tool | Vite | ^5.0.0 | Development & bundling | Fast HMR, optimized for React, minimal config |
| UI Library | React Leaflet | ^4.2.1 | Interactive mapping | Open source, Vietnam map support, educational-friendly |
| State Management | Zustand | ^4.4.0 | Lightweight state | Simple API, perfect for map state & document management |
| Routing | React Router | ^6.8.0 | Client-side routing | Standard React routing for zone navigation |
| Styling | Tailwind CSS | ^3.3.0 | Utility-first CSS | Rapid prototyping, responsive design, modern UI |
| Component Library | Headless UI | ^1.7.0 | Accessible components | Works with Tailwind, accessible for education |
| Form Handling | React Hook Form | ^7.43.0 | Form management | Minimal re-renders, good for Q&A forms |
| Animation | Framer Motion | ^10.0.0 | UI animations | Smooth map transitions, engaging student experience |
| Testing | Vitest + Testing Library | ^1.0.0 | Unit & integration tests | Vite-native testing, React testing best practices |
| Dev Tools | React DevTools | latest | Development debugging | Essential React debugging capabilities |

---

## Project Structure

```
vietnam-economic-zones/
├── public/
│   ├── vietnam-map-data/          # GeoJSON files for Vietnam zones
│   │   ├── vietnam-boundaries.json
│   │   ├── zone-1-boundaries.json
│   │   ├── zone-2-boundaries.json
│   │   └── ...
│   ├── zone-images/               # Zone photos and diagrams
│   └── favicon.ico
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── common/               # Generic components
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── LoadingSpinner/
│   │   │   └── ErrorBoundary/
│   │   ├── map/                  # Map-specific components
│   │   │   ├── MapContainer/
│   │   │   ├── ZoneLayer/
│   │   │   ├── MapControls/
│   │   │   └── ZonePopup/
│   │   ├── zone/                 # Zone information components
│   │   │   ├── ZoneDetails/
│   │   │   ├── ZoneCard/
│   │   │   └── ZoneStats/
│   │   ├── documents/            # Document management
│   │   │   ├── DocumentUpload/
│   │   │   ├── DocumentList/
│   │   │   └── DocumentViewer/
│   │   └── qa/                   # Q&A components
│   │       ├── QuestionForm/
│   │       ├── AnswerList/
│   │       └── QASearch/
│   ├── pages/                    # Route-level components
│   │   ├── HomePage/
│   │   ├── ZoneDetailPage/
│   │   ├── DocumentsPage/
│   │   ├── QAPage/
│   │   └── AdminPage/
│   ├── hooks/                    # Custom React hooks
│   │   ├── useMapData.js
│   │   ├── useZoneInfo.js
│   │   ├── useLocalStorage.js
│   │   └── useDocuments.js
│   ├── stores/                   # Zustand state stores
│   │   ├── mapStore.js          # Map state, selected zones
│   │   ├── documentStore.js     # Document management state
│   │   ├── qaStore.js           # Q&A state
│   │   └── uiStore.js           # UI state (modals, loading)
│   ├── services/                 # API and data services
│   │   ├── mapService.js        # Map data loading
│   │   ├── storageService.js    # Local storage operations
│   │   └── fileService.js       # File handling utilities
│   ├── utils/                    # Helper functions
│   │   ├── constants.js         # App constants
│   │   ├── formatters.js        # Data formatting
│   │   └── validators.js        # Form validation
│   ├── styles/                   # Global styles
│   │   ├── globals.css          # Global CSS + Tailwind imports
│   │   └── components.css       # Component-specific styles
│   ├── types/                    # TypeScript type definitions
│   │   ├── map.types.ts
│   │   ├── zone.types.ts
│   │   └── document.types.ts
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Vite entry point
│   └── router.jsx                # React Router configuration
├── tests/                        # Test files
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── setup.js
├── .env.example                  # Environment variables template
├── .gitignore
├── index.html                    # Vite HTML template
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## Component Standards

### Component Template

```typescript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useZoneStore } from '../stores/zoneStore';

interface ZoneCardProps {
  zoneId: string;
  zoneName: string;
  onZoneSelect?: (zoneId: string) => void;
  className?: string;
}

const ZoneCard: React.FC<ZoneCardProps> = ({
  zoneId,
  zoneName,
  onZoneSelect,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { selectedZone, setSelectedZone } = useZoneStore();

  const handleClick = () => {
    setSelectedZone(zoneId);
    onZoneSelect?.(zoneId);
  };

  return (
    <motion.div
      className={`zone-card bg-white rounded-lg shadow-md p-4 cursor-pointer ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <h3 className="text-lg font-semibold text-gray-800">
        {zoneName}
      </h3>
      <div className="mt-2 text-sm text-gray-600">
        Economic Zone {zoneId}
      </div>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-blue-600 text-sm"
        >
          Click to explore →
        </motion.div>
      )}
    </motion.div>
  );
};

export default ZoneCard;
```

### Naming Conventions

**Components:**
- **Files**: PascalCase with folder structure: `ZoneCard/index.tsx`, `ZoneCard/ZoneCard.tsx`
- **Components**: PascalCase: `ZoneCard`, `MapContainer`, `DocumentUpload`
- **Props interfaces**: ComponentName + "Props": `ZoneCardProps`, `MapContainerProps`

**Files & Directories:**
- **Pages**: PascalCase: `HomePage`, `ZoneDetailPage`
- **Hooks**: camelCase with "use" prefix: `useMapData`, `useZoneInfo`
- **Stores**: camelCase with "Store" suffix: `mapStore`, `documentStore`
- **Services**: camelCase with "Service" suffix: `mapService`, `storageService`
- **Utils**: camelCase: `formatters`, `validators`

**Variables & Functions:**
- **State variables**: camelCase: `selectedZone`, `mapCenter`
- **Event handlers**: "handle" + action: `handleZoneClick`, `handleFileUpload`
- **Custom hooks return**: Destructured objects: `{ zones, loading, error }`

**CSS Classes:**
- **Tailwind**: Standard utility classes
- **Custom**: kebab-case with component prefix: `zone-card`, `map-container`
- **BEM for complex components**: `zone-card__header`, `zone-card__content`

**Constants:**
- **Global constants**: SCREAMING_SNAKE_CASE: `VIETNAM_MAP_CENTER`, `DEFAULT_ZOOM_LEVEL`
- **Component constants**: camelCase: `defaultMapOptions`, `zoneColors`

---

## State Management

### Store Structure

```plaintext
src/stores/
├── mapStore.js              # Map interactions and zone selection
├── documentStore.js         # Document upload and management
├── qaStore.js              # Questions and answers data
├── uiStore.js              # UI state (modals, loading, notifications)
└── index.js                # Store exports and combinations
```

### State Management Template

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Map Store - Handles map state and zone interactions
interface MapState {
  selectedZone: string | null;
  mapCenter: [number, number];
  zoomLevel: number;
  zones: EconomicZone[];
  isLoading: boolean;
  error: string | null;
}

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
      mapCenter: [16.0471, 108.2068], // Vietnam center coordinates
      zoomLevel: 6,
      zones: [],
      isLoading: false,
      error: null,

      // Actions
      setSelectedZone: (zoneId) =>
        set({ selectedZone: zoneId }),

      setMapCenter: (center) =>
        set({ mapCenter: center }),

      setZoomLevel: (zoom) =>
        set({ zoomLevel: zoom }),

      loadZones: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/vietnam-map-data/zones.json');
          const zones = await response.json();
          set({ zones, isLoading: false });
        } catch (error) {
          set({
            error: 'Failed to load economic zones',
            isLoading: false
          });
        }
      },

      resetMapState: () =>
        set({
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

// Document Store - Handles file management with minimal backend
interface DocumentState {
  documents: Document[];
  uploadQueue: File[];
  isUploading: boolean;
  searchQuery: string;
}

interface DocumentActions {
  addDocument: (file: File, zoneId: string) => Promise<void>;
  removeDocument: (documentId: string) => void;
  searchDocuments: (query: string) => void;
  getDocumentsByZone: (zoneId: string) => Document[];
}

export const useDocumentStore = create<DocumentState & DocumentActions>()(
  persist(
    (set, get) => ({
      // State
      documents: [],
      uploadQueue: [],
      isUploading: false,
      searchQuery: '',

      // Actions
      addDocument: async (file, zoneId) => {
        set({ isUploading: true });
        try {
          // Convert file to base64 for local storage
          const base64 = await fileToBase64(file);
          const document: Document = {
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            size: file.size,
            zoneId,
            content: base64,
            uploadDate: new Date().toISOString(),
          };

          set((state) => ({
            documents: [...state.documents, document],
            isUploading: false,
          }));
        } catch (error) {
          set({ isUploading: false });
          throw new Error('Failed to upload document');
        }
      },

      removeDocument: (documentId) =>
        set((state) => ({
          documents: state.documents.filter(doc => doc.id !== documentId),
        })),

      searchDocuments: (query) =>
        set({ searchQuery: query }),

      getDocumentsByZone: (zoneId) => {
        const { documents, searchQuery } = get();
        return documents
          .filter(doc => doc.zoneId === zoneId)
          .filter(doc =>
            searchQuery === '' ||
            doc.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
      },
    }),
    {
      name: 'document-store',
    }
  )
);
```

---

## API Integration

### Service Template

```typescript
import { EconomicZone, Document, QAItem } from '../types';

// API Service for Vietnam Economic Zones Data
class VietnamZonesApiService {
  private baseUrl: string;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  }

  // Zone Data Services
  async getEconomicZones(): Promise<EconomicZone[]> {
    if (this.cache.has('zones')) {
      return this.cache.get('zones');
    }

    try {
      // Load from local JSON files (minimal backend approach)
      const response = await fetch('/vietnam-map-data/economic-zones.json');
      if (!response.ok) throw new Error('Failed to load zones data');

      const zones = await response.json();
      this.cache.set('zones', zones);
      return zones;
    } catch (error) {
      console.error('Error loading economic zones:', error);
      throw new Error('Unable to load economic zones data');
    }
  }

  async getZoneDetails(zoneId: string): Promise<EconomicZone> {
    try {
      const response = await fetch(`/vietnam-map-data/zones/${zoneId}.json`);
      if (!response.ok) throw new Error(`Zone ${zoneId} not found`);

      return await response.json();
    } catch (error) {
      console.error(`Error loading zone ${zoneId}:`, error);
      throw new Error(`Unable to load zone ${zoneId} details`);
    }
  }

  async getZoneGeometry(zoneId: string): Promise<GeoJSON.FeatureCollection> {
    const cacheKey = `geometry-${zoneId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`/vietnam-map-data/boundaries/${zoneId}.geojson`);
      if (!response.ok) throw new Error(`Geometry for zone ${zoneId} not found`);

      const geometry = await response.json();
      this.cache.set(cacheKey, geometry);
      return geometry;
    } catch (error) {
      console.error(`Error loading zone ${zoneId} geometry:`, error);
      throw new Error(`Unable to load zone ${zoneId} boundaries`);
    }
  }

  // Document Services (Local Storage)
  async uploadDocument(file: File, zoneId: string): Promise<Document> {
    try {
      // Validate file size (limit for browser storage)
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size exceeds 5MB limit');
      }

      // Convert to base64 for storage
      const base64Content = await this.fileToBase64(file);

      const document: Document = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        zoneId,
        content: base64Content,
        uploadDate: new Date().toISOString(),
        tags: this.extractTags(file.name),
      };

      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  }

  // Utility Methods
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  private extractTags(filename: string): string[] {
    // Simple tag extraction from filename
    const name = filename.toLowerCase().replace(/\.[^/.]+$/, "");
    return name.split(/[-_\s]+/).filter(tag => tag.length > 2);
  }
}

export const vietnamZonesApi = new VietnamZonesApiService();
```

---

## Routing

### Route Configuration

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ZoneDetailPage = lazy(() => import('./pages/ZoneDetailPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const QAPage = lazy(() => import('./pages/QAPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'zones/:zoneId',
        element: <ZoneDetailPage />,
        loader: async ({ params }) => {
          const { vietnamZonesApi } = await import('./services/vietnamZonesApi');
          return vietnamZonesApi.getZoneDetails(params.zoneId!);
        },
      },
      {
        path: 'zones/:zoneId/documents',
        element: <DocumentsPage />,
      },
      {
        path: 'zones/:zoneId/qa',
        element: <QAPage />,
      },
      {
        path: 'admin',
        element: <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>,
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
```

**Route Structure:**
- `/` - Home page with Vietnam map
- `/zones/:zoneId` - Zone detail page
- `/zones/:zoneId/documents` - Zone-specific documents
- `/zones/:zoneId/qa` - Zone-specific Q&A
- `/admin` - Administrative dashboard

---

## Styling Guidelines

### Styling Approach

**Primary Methodology: Tailwind CSS + Custom Components**

- **Utility-first approach**: Use Tailwind utilities for rapid development and consistent spacing/colors
- **Component-level customization**: Create reusable component classes for complex UI patterns
- **Educational accessibility**: Focus on high contrast, readable fonts, and clear visual hierarchy
- **Responsive design**: Mobile-first approach suitable for high school students using various devices

### Global Theme Variables

```css
:root {
  /* Vietnam-inspired color palette */
  --color-vietnam-red: #da020e;
  --color-vietnam-yellow: #ffcd00;
  --color-mekong-blue: #1e40af;
  --color-rice-green: #16a34a;
  --color-mountain-gray: #6b7280;

  /* Economic zone colors (6 distinct zones) */
  --zone-1-color: #ef4444;  /* North Mountain Region */
  --zone-2-color: #f97316;  /* Red River Delta */
  --zone-3-color: #eab308;  /* North Central Coast */
  --zone-4-color: #22c55e;  /* South Central Coast */
  --zone-5-color: #3b82f6;  /* Central Highlands */
  --zone-6-color: #8b5cf6;  /* Mekong River Delta */

  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-heading: 'Plus Jakarta Sans', sans-serif;

  /* Spacing scale */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
}

/* Zone-specific component styling */
.zone-card {
  @apply bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200;
  @apply border-l-4 border-transparent hover:border-blue-500;
}

.zone-card.selected {
  @apply border-blue-500 bg-blue-50;
}

/* Map overlay styling */
.map-overlay {
  @apply absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg;
  @apply border border-gray-200 max-w-sm;
}

/* Educational accessibility enhancements */
.high-contrast {
  --color-text-primary: #000000;
  --color-bg-primary: #ffffff;
  filter: contrast(1.2);
}
```

---

## Testing Requirements

### Component Test Template

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ZoneCard from '../components/zone/ZoneCard';

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

describe('ZoneCard Component', () => {
  const mockZone = {
    id: 'zone-1',
    name: 'North Mountain Region',
    description: 'Mountainous region with diverse economic activities',
  };

  it('renders zone information correctly', () => {
    render(
      <TestWrapper>
        <ZoneCard
          zoneId={mockZone.id}
          zoneName={mockZone.name}
        />
      </TestWrapper>
    );

    expect(screen.getByText(mockZone.name)).toBeInTheDocument();
    expect(screen.getByText(`Economic Zone ${mockZone.id}`)).toBeInTheDocument();
  });

  it('handles zone selection on click', async () => {
    const user = userEvent.setup();
    const mockOnZoneSelect = vi.fn();

    render(
      <TestWrapper>
        <ZoneCard
          zoneId={mockZone.id}
          zoneName={mockZone.name}
          onZoneSelect={mockOnZoneSelect}
        />
      </TestWrapper>
    );

    const zoneCard = screen.getByRole('button');
    await user.click(zoneCard);

    expect(mockOnZoneSelect).toHaveBeenCalledWith(mockZone.id);
  });
});
```

### Testing Best Practices

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test critical user flows (using Cypress/Playwright)
4. **Coverage Goals**: Aim for 80% code coverage
5. **Test Structure**: Arrange-Act-Assert pattern
6. **Mock External Dependencies**: API calls, routing, state management

---

## Environment Configuration

### Environment Variables

```bash
# .env.example - Copy to .env.local for development

# Application Configuration
VITE_APP_NAME="Vietnam Economic Zones Explorer"
VITE_APP_VERSION="1.0.0"

# Map Configuration
VITE_VIETNAM_MAP_CENTER_LAT=16.0471
VITE_VIETNAM_MAP_CENTER_LNG=108.2068
VITE_DEFAULT_ZOOM_LEVEL=6
VITE_MAX_ZOOM_LEVEL=18
VITE_MIN_ZOOM_LEVEL=5

# Educational Zone Configuration
VITE_ECONOMIC_ZONES_COUNT=6
VITE_ZONE_COLORS="ef4444,f97316,eab308,22c55e,3b82f6,8b5cf6"

# Storage Configuration (Client-side)
VITE_MAX_DOCUMENT_SIZE=5242880  # 5MB in bytes
VITE_ALLOWED_FILE_TYPES="pdf,doc,docx,ppt,pptx,jpg,jpeg,png"
VITE_LOCAL_STORAGE_PREFIX="vietnam_zones_"

# Admin Configuration
VITE_ADMIN_ENABLED=true
VITE_ADMIN_PASSWORD_REQUIRED=true
VITE_DEFAULT_ADMIN_PASSWORD="vietnam-zones-admin"

# Feature Flags
VITE_FEATURE_DARK_MODE=true
VITE_FEATURE_HIGH_CONTRAST=true
VITE_FEATURE_OFFLINE_MODE=false
VITE_FEATURE_EXPORT_DATA=true

# Educational Content Configuration
VITE_CONTENT_LANGUAGE="vi,en"
VITE_DEFAULT_LANGUAGE="vi"
VITE_SHOW_ENGLISH_TRANSLATIONS=true
```

### Environment Configuration Hook

```typescript
// hooks/useEnvironment.ts
export const useEnvironment = (): EnvironmentConfig => {
  return useMemo(() => ({
    appName: import.meta.env.VITE_APP_NAME || 'Vietnam Economic Zones',
    mapCenter: [
      parseFloat(import.meta.env.VITE_VIETNAM_MAP_CENTER_LAT) || 16.0471,
      parseFloat(import.meta.env.VITE_VIETNAM_MAP_CENTER_LNG) || 108.2068,
    ],
    defaultZoom: parseInt(import.meta.env.VITE_DEFAULT_ZOOM_LEVEL) || 6,
    maxDocumentSize: parseInt(import.meta.env.VITE_MAX_DOCUMENT_SIZE) || 5242880,
    economicZonesCount: parseInt(import.meta.env.VITE_ECONOMIC_ZONES_COUNT) || 6,
    zoneColors: import.meta.env.VITE_ZONE_COLORS?.split(',') || [
      'ef4444', 'f97316', 'eab308', '22c55e', '3b82f6', '8b5cf6'
    ],
  }), []);
};
```

---

## Frontend Developer Standards

### Critical Coding Rules

1. **TypeScript First**: All components must use TypeScript interfaces
2. **Functional Components**: No class components allowed
3. **Custom Hooks**: Extract reusable logic into custom hooks
4. **Zustand Integration**: Use stores for shared state, avoid prop drilling
5. **Accessibility**: All interactive elements must be keyboard accessible
6. **Error Boundaries**: Wrap major sections in error boundaries
7. **Loading States**: Show loading indicators for async operations
8. **File Size Limits**: Enforce 5MB limit for document uploads
9. **Map Performance**: Use React.memo for map-related components
10. **Educational Focus**: Prioritize clear UX over complex animations

### Quick Reference

**Common Commands:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run test suite
npm run lint         # Lint code
npm run preview      # Preview production build
```

**Key Import Patterns:**
```typescript
// Store imports
import { useMapStore } from '../stores/mapStore';

// Component imports
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

// Utility imports
import { vietnamZonesApi } from '../services/vietnamZonesApi';
```

**File Naming Conventions:**
- Components: `ZoneCard/index.tsx`
- Pages: `HomePage/HomePage.tsx`
- Hooks: `useMapData.ts`
- Stores: `mapStore.ts`
- Services: `vietnamZonesApi.ts`

---

*Frontend Architecture Document v1.0 - Generated for Vietnam Economic Zones Explorer educational mapping application*