# Source Tree Structure

**Project:** Vietnam Economic Zones Explorer
**Date:** 2025-09-21
**Version:** 1.0

## Project Root Structure

```
vietnam-economic-zones/
├── public/                          # Static assets
│   ├── vietnam-map-data/           # GeoJSON and zone data
│   │   ├── vietnam-boundaries.json
│   │   ├── zone-1-boundaries.json
│   │   ├── zone-2-boundaries.json
│   │   ├── zone-3-boundaries.json
│   │   ├── zone-4-boundaries.json
│   │   ├── zone-5-boundaries.json
│   │   ├── zone-6-boundaries.json
│   │   └── zones-metadata.json
│   ├── zone-images/                # Zone photos and diagrams
│   │   ├── zone-1/
│   │   ├── zone-2/
│   │   └── ...
│   └── favicon.ico
├── src/                            # Source code
├── tests/                          # Test files
├── docs/                           # Documentation
├── .env.example                    # Environment template
├── .gitignore
├── index.html                      # Vite HTML template
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Source Code Structure (`src/`)

```
src/
├── components/                     # Reusable UI components
│   ├── common/                    # Generic reusable components
│   │   ├── Button/
│   │   │   ├── index.tsx
│   │   │   └── Button.test.tsx
│   │   ├── Modal/
│   │   │   ├── index.tsx
│   │   │   └── Modal.test.tsx
│   │   ├── LoadingSpinner/
│   │   │   ├── index.tsx
│   │   │   └── LoadingSpinner.test.tsx
│   │   └── ErrorBoundary/
│   │       ├── index.tsx
│   │       └── ErrorBoundary.test.tsx
│   ├── map/                       # Map-specific components
│   │   ├── MapContainer/
│   │   │   ├── index.tsx
│   │   │   └── MapContainer.test.tsx
│   │   ├── ZoneLayer/
│   │   │   ├── index.tsx
│   │   │   └── ZoneLayer.test.tsx
│   │   ├── MapControls/
│   │   │   ├── index.tsx
│   │   │   └── MapControls.test.tsx
│   │   └── ZonePopup/
│   │       ├── index.tsx
│   │       └── ZonePopup.test.tsx
│   ├── zone/                      # Zone information components
│   │   ├── ZoneDetails/
│   │   │   ├── index.tsx
│   │   │   └── ZoneDetails.test.tsx
│   │   ├── ZoneCard/
│   │   │   ├── index.tsx
│   │   │   └── ZoneCard.test.tsx
│   │   └── ZoneStats/
│   │       ├── index.tsx
│   │       └── ZoneStats.test.tsx
│   ├── documents/                 # Document management components
│   │   ├── DocumentUpload/
│   │   │   ├── index.tsx
│   │   │   └── DocumentUpload.test.tsx
│   │   ├── DocumentList/
│   │   │   ├── index.tsx
│   │   │   └── DocumentList.test.tsx
│   │   └── DocumentViewer/
│   │       ├── index.tsx
│   │       └── DocumentViewer.test.tsx
│   └── qa/                        # Q&A components
│       ├── QuestionForm/
│       │   ├── index.tsx
│       │   └── QuestionForm.test.tsx
│       ├── AnswerList/
│       │   ├── index.tsx
│       │   └── AnswerList.test.tsx
│       └── QASearch/
│           ├── index.tsx
│           └── QASearch.test.tsx
├── pages/                         # Route-level components
│   ├── HomePage/
│   │   ├── HomePage.tsx
│   │   └── HomePage.test.tsx
│   ├── ZoneDetailPage/
│   │   ├── ZoneDetailPage.tsx
│   │   └── ZoneDetailPage.test.tsx
│   ├── DocumentsPage/
│   │   ├── DocumentsPage.tsx
│   │   └── DocumentsPage.test.tsx
│   ├── QAPage/
│   │   ├── QAPage.tsx
│   │   └── QAPage.test.tsx
│   └── AdminPage/
│       ├── AdminPage.tsx
│       └── AdminPage.test.tsx
├── hooks/                         # Custom React hooks
│   ├── useMapData.ts
│   ├── useMapData.test.ts
│   ├── useZoneInfo.ts
│   ├── useZoneInfo.test.ts
│   ├── useLocalStorage.ts
│   ├── useLocalStorage.test.ts
│   ├── useDocuments.ts
│   ├── useDocuments.test.ts
│   └── useEnvironment.ts
├── stores/                        # Zustand state stores
│   ├── mapStore.ts
│   ├── mapStore.test.ts
│   ├── documentStore.ts
│   ├── documentStore.test.ts
│   ├── qaStore.ts
│   ├── qaStore.test.ts
│   ├── uiStore.ts
│   ├── uiStore.test.ts
│   └── index.ts                   # Store exports
├── services/                      # API and data services
│   ├── mapService.ts
│   ├── mapService.test.ts
│   ├── storageService.ts
│   ├── storageService.test.ts
│   ├── fileService.ts
│   ├── fileService.test.ts
│   └── vietnamZonesApi.ts
├── utils/                         # Helper functions
│   ├── constants.ts
│   ├── formatters.ts
│   ├── formatters.test.ts
│   ├── validators.ts
│   ├── validators.test.ts
│   └── index.ts                   # Utility exports
├── styles/                        # Global styles
│   ├── globals.css                # Global CSS + Tailwind imports
│   └── components.css             # Component-specific styles
├── types/                         # TypeScript type definitions
│   ├── map.types.ts
│   ├── zone.types.ts
│   ├── document.types.ts
│   ├── qa.types.ts
│   └── index.ts                   # Type exports
├── App.tsx                        # Main app component
├── main.tsx                       # Vite entry point
├── router.tsx                     # React Router configuration
└── vite-env.d.ts                  # Vite type definitions
```

## Test Structure (`tests/`)

```
tests/
├── components/                    # Component tests
│   ├── common/
│   ├── map/
│   ├── zone/
│   ├── documents/
│   └── qa/
├── hooks/                         # Custom hook tests
├── utils/                         # Utility function tests
├── stores/                        # Store tests
├── services/                      # Service tests
├── e2e/                          # End-to-end tests
│   ├── map-navigation.spec.ts
│   ├── document-upload.spec.ts
│   └── zone-exploration.spec.ts
├── fixtures/                      # Test data and fixtures
│   ├── zone-data.json
│   ├── test-documents/
│   └── mock-responses/
└── setup.ts                      # Test configuration
```

## Documentation Structure (`docs/`)

```
docs/
├── architecture/                  # Architecture documentation
│   ├── tech-stack.md
│   ├── source-tree.md
│   ├── coding-standards.md
│   └── deployment.md
├── development-blueprint.md       # Development guide
├── ui-architecture.md            # Frontend architecture
├── brainstorming-session-results.md
└── api/                          # API documentation
    ├── zones-api.md
    └── storage-api.md
```

## File Naming Conventions

### Components
- **Folder Structure**: `ComponentName/index.tsx`
- **Test Files**: `ComponentName.test.tsx`
- **Example**: `ZoneCard/index.tsx`, `ZoneCard.test.tsx`

### Pages
- **Page Files**: `PageName.tsx`
- **Test Files**: `PageName.test.tsx`
- **Example**: `HomePage.tsx`, `HomePage.test.tsx`

### Hooks
- **Hook Files**: `useHookName.ts`
- **Test Files**: `useHookName.test.ts`
- **Example**: `useMapData.ts`, `useMapData.test.ts`

### Stores
- **Store Files**: `storeName.ts`
- **Test Files**: `storeName.test.ts`
- **Example**: `mapStore.ts`, `mapStore.test.ts`

### Services
- **Service Files**: `serviceName.ts`
- **Test Files**: `serviceName.test.ts`
- **Example**: `mapService.ts`, `mapService.test.ts`

### Types
- **Type Files**: `domain.types.ts`
- **Example**: `zone.types.ts`, `map.types.ts`

## Import Path Organization

### Absolute Imports (Vite Configuration)
```typescript
// From src/components/map/MapContainer/index.tsx
import { useMapStore } from '@/stores/mapStore';
import { EconomicZone } from '@/types/zone.types';
import { Button } from '@/components/common/Button';
```

### Import Order (ESLint Configuration)
1. **External libraries** (React, Leaflet, etc.)
2. **Internal stores** (@/stores/*)
3. **Internal services** (@/services/*)
4. **Internal types** (@/types/*)
5. **Internal components** (@/components/*)
6. **Relative imports** (./*, ../*）
7. **CSS imports** (*.css)

## Bundle Organization

### Code Splitting Strategy
- **Main Bundle**: Core app, routing, common components
- **Map Bundle**: Leaflet and map-related components (lazy loaded)
- **Documents Bundle**: Document management (lazy loaded)
- **Admin Bundle**: Administrative features (lazy loaded)

### Asset Organization
```
public/
├── vietnam-map-data/              # Map data (preloaded)
├── zone-images/                   # Zone photos (lazy loaded)
└── icons/                         # UI icons (sprite sheet)
```

## Development Guidelines

### Directory Creation Rules
1. **Components**: Always create folder with `index.tsx` and `.test.tsx`
2. **Services**: Single file with corresponding test file
3. **Types**: Domain-specific type files
4. **Tests**: Mirror source structure in `tests/` directory

### File Size Guidelines
- **Components**: Max 200 lines per file
- **Stores**: Max 150 lines per store
- **Services**: Max 300 lines per service
- **Types**: Max 100 lines per type file

### Dependency Guidelines
- **No circular dependencies** between modules
- **Services** should not import from stores
- **Components** can import from stores and services
- **Types** should be dependency-free