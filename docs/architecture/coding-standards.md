# Coding Standards

**Project:** Vietnam Economic Zones Explorer
**Date:** 2025-09-21
**Version:** 1.0

## Critical Development Rules

### 1. TypeScript First
**MANDATORY**: All components, hooks, services, and utilities MUST use TypeScript with proper interfaces.

```typescript
// ✅ CORRECT
interface ZoneCardProps {
  zoneId: string;
  zoneName: string;
  onZoneSelect?: (zoneId: string) => void;
  className?: string;
}

const ZoneCard: React.FC<ZoneCardProps> = ({ zoneId, zoneName }) => {
  // Implementation
};

// ❌ INCORRECT
const ZoneCard = ({ zoneId, zoneName }) => {
  // No TypeScript interface
};
```

### 2. Functional Components Only
**MANDATORY**: No class components allowed. Use React hooks and functional components only.

```typescript
// ✅ CORRECT
const MapContainer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  // Implementation
};

// ❌ INCORRECT
class MapContainer extends React.Component {
  // Class components not allowed
}
```

### 3. Zustand State Management
**MANDATORY**: Use Zustand stores for cross-component state. Avoid prop drilling and Context API for complex state.

```typescript
// ✅ CORRECT
const { selectedZone, setSelectedZone } = useMapStore();

// ❌ INCORRECT
const [selectedZone, setSelectedZone] = useState(); // For cross-component state
```

### 4. Custom Hooks for Logic
**MANDATORY**: Extract reusable logic into custom hooks. No business logic in components.

```typescript
// ✅ CORRECT
const useZoneData = (zoneId: string) => {
  const [zone, setZone] = useState<EconomicZone | null>(null);
  // Logic here
  return { zone, loading, error };
};

// ❌ INCORRECT
const ZoneDetails = ({ zoneId }) => {
  // Business logic directly in component
  const [zone, setZone] = useState();
  useEffect(() => {
    // Complex logic here
  }, []);
};
```

### 5. File Size Limits
**MANDATORY**: Enforce file size limits to maintain readability.

- **Components**: Max 200 lines
- **Hooks**: Max 100 lines
- **Stores**: Max 150 lines
- **Services**: Max 300 lines

### 6. Error Boundaries
**MANDATORY**: Wrap major sections in error boundaries. All pages must be wrapped.

```typescript
// ✅ CORRECT
<ErrorBoundary>
  <MapContainer />
</ErrorBoundary>

// ❌ INCORRECT
<MapContainer /> // No error boundary for major components
```

### 7. Loading States
**MANDATORY**: Show loading indicators for all async operations.

```typescript
// ✅ CORRECT
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

// ❌ INCORRECT
// No loading or error states
```

### 8. Accessibility Requirements
**MANDATORY**: All interactive elements must be keyboard accessible and have proper ARIA labels.

```typescript
// ✅ CORRECT
<button
  className="focus-ring"
  onClick={handleZoneSelect}
  onKeyDown={(e) => e.key === 'Enter' && handleZoneSelect()}
  aria-label={`Select ${zoneName} economic zone`}
>
  {zoneName}
</button>

// ❌ INCORRECT
<div onClick={handleZoneSelect}>{zoneName}</div> // Not keyboard accessible
```

## Component Standards

### Component Structure Template
```typescript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMapStore } from '@/stores/mapStore';
import { EconomicZone } from '@/types/zone.types';

interface ComponentProps {
  // Required props
  id: string;
  name: string;
  // Optional props
  className?: string;
  onAction?: (data: string) => void;
}

const Component: React.FC<ComponentProps> = ({
  id,
  name,
  className = '',
  onAction
}) => {
  // 1. State hooks
  const [localState, setLocalState] = useState<string>('');

  // 2. Store hooks
  const { globalState, setGlobalState } = useMapStore();

  // 3. Custom hooks
  const { data, loading, error } = useCustomHook(id);

  // 4. Event handlers
  const handleAction = () => {
    setGlobalState(newValue);
    onAction?.(data);
  };

  // 5. Effects
  useEffect(() => {
    // Side effects
  }, [id]);

  // 6. Early returns
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  // 7. Render
  return (
    <motion.div
      className={`component-class ${className}`}
      whileHover={{ scale: 1.02 }}
    >
      <h3 className="text-lg font-semibold">{name}</h3>
      <button onClick={handleAction} className="focus-ring">
        Action
      </button>
    </motion.div>
  );
};

export default Component;
```

## Naming Conventions

### Files and Directories
```bash
# ✅ CORRECT
src/components/zone/ZoneCard/index.tsx
src/hooks/useMapData.ts
src/stores/mapStore.ts
src/services/vietnamZonesApi.ts
src/types/zone.types.ts

# ❌ INCORRECT
src/components/zonecard.tsx
src/hooks/MapData.ts
src/stores/map_store.ts
```

### Variables and Functions
```typescript
// ✅ CORRECT
const selectedZone = 'zone-1';
const mapCenter: [number, number] = [16.0471, 108.2068];
const handleZoneClick = () => {};
const { zones, loading, error } = useZoneData();

// ❌ INCORRECT
const selected_zone = 'zone-1';
const MapCenter = [16.0471, 108.2068];
const zoneClickHandler = () => {};
```

### CSS Classes
```typescript
// ✅ CORRECT - Tailwind utilities
<div className="bg-white rounded-lg shadow-md p-4">

// ✅ CORRECT - Custom classes (kebab-case)
<div className="zone-card zone-card--selected">

// ✅ CORRECT - BEM methodology for complex components
<div className="zone-card__header zone-card__header--highlighted">

// ❌ INCORRECT
<div className="ZoneCard selected">
```

### Constants
```typescript
// ✅ CORRECT
const VIETNAM_MAP_CENTER: [number, number] = [16.0471, 108.2068];
const DEFAULT_ZOOM_LEVEL = 6;
const ZONE_COLORS = ['#ef4444', '#f97316', '#eab308'];

// ❌ INCORRECT
const vietnamMapCenter = [16.0471, 108.2068];
const defaultZoomLevel = 6;
```

## State Management Rules

### Zustand Store Structure
```typescript
// ✅ CORRECT
interface StoreState {
  // State
  data: DataType[];
  isLoading: boolean;
  error: string | null;
}

interface StoreActions {
  // Actions
  setData: (data: DataType[]) => void;
  loadData: () => Promise<void>;
  resetState: () => void;
}

export const useStore = create<StoreState & StoreActions>()((set, get) => ({
  // State
  data: [],
  isLoading: false,
  error: null,

  // Actions
  setData: (data) => set({ data }),
  loadData: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getData();
      set({ data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  resetState: () => set({ data: [], error: null }),
}));
```

### State Persistence Rules
```typescript
// ✅ CORRECT - Selective persistence
persist(
  (set, get) => ({}),
  {
    name: 'store-name',
    partialize: (state) => ({
      // Only persist necessary data
      mapCenter: state.mapCenter,
      selectedZone: state.selectedZone,
    }),
  }
)

// ❌ INCORRECT - Persisting everything
persist((set, get) => ({}), { name: 'store-name' })
```

## Testing Standards

### Component Testing Pattern
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Component from './index';

// Mock dependencies
vi.mock('@/stores/mapStore');

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Component', () => {
  const mockProps = {
    id: 'test-id',
    name: 'Test Name',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <TestWrapper>
        <Component {...mockProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Name')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const mockOnAction = vi.fn();

    render(
      <TestWrapper>
        <Component {...mockProps} onAction={mockOnAction} />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button'));
    expect(mockOnAction).toHaveBeenCalledWith(expect.any(String));
  });
});
```

### Coverage Requirements
- **Unit Tests**: 80% line coverage minimum
- **Component Tests**: All user interactions tested
- **Integration Tests**: Critical user flows
- **E2E Tests**: Core functionality only

## Performance Standards

### Bundle Size Targets
- **Initial Bundle**: < 500KB gzipped
- **Component Chunks**: < 100KB each
- **Lazy Loading**: All non-critical routes

### Code Splitting Requirements
```typescript
// ✅ CORRECT - Lazy loading pages
const ZoneDetailPage = lazy(() => import('@/pages/ZoneDetailPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));

// ✅ CORRECT - Lazy loading large components
const MapContainer = lazy(() => import('@/components/map/MapContainer'));
```

### React Performance
```typescript
// ✅ CORRECT - Memoization for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => processData(data), [data]);
  return <div>{processedData}</div>;
});

// ✅ CORRECT - Callback memoization
const handleClick = useCallback((id: string) => {
  onSelect(id);
}, [onSelect]);
```

## Educational Focus Requirements

### Vietnam-Specific Considerations
```typescript
// ✅ CORRECT - Vietnam coordinates
const VIETNAM_MAP_CENTER: [number, number] = [16.0471, 108.2068];

// ✅ CORRECT - Vietnamese language support
const zoneNames = {
  vi: 'Miền núi phía Bắc',
  en: 'North Mountain Region'
};

// ✅ CORRECT - Educational accessibility
const ZoneCard = ({ zone }) => (
  <div
    role="button"
    tabIndex={0}
    aria-label={`Explore ${zone.name} economic zone`}
    className="focus-ring"
  >
    {zone.name}
  </div>
);
```

### High School Student UX
- **Large click targets** (min 44px)
- **High contrast** color combinations
- **Clear visual hierarchy**
- **Intuitive navigation**
- **Fast loading** (< 3 seconds)

## Error Handling Standards

### Error Boundary Implementation
```typescript
// ✅ CORRECT
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Async Error Handling
```typescript
// ✅ CORRECT
const useZoneData = (zoneId: string) => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  });

  const loadZone = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await api.getZone(zoneId);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return { ...state, loadZone };
};
```

## Security Standards

### Input Validation
```typescript
// ✅ CORRECT
const validateFile = (file: File): string | null => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

  if (file.size > maxSize) {
    return 'File size exceeds 5MB limit';
  }

  if (!allowedTypes.includes(file.type)) {
    return 'File type not allowed';
  }

  return null;
};

// ❌ INCORRECT
const uploadFile = (file: File) => {
  // No validation
  storeFile(file);
};
```

### XSS Prevention
```typescript
// ✅ CORRECT - React automatically escapes
<div>{userInput}</div>

// ✅ CORRECT - For HTML content, use DOMPurify
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(htmlContent)
}} />

// ❌ INCORRECT
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

## Git Workflow Standards

### Commit Message Format
```bash
# ✅ CORRECT
feat(map): add zone selection functionality
fix(upload): validate file size before upload
docs(readme): update installation instructions
test(zones): add unit tests for zone store

# ❌ INCORRECT
added stuff
bug fix
updates
```

### Branch Naming
```bash
# ✅ CORRECT
feature/zone-selection
bugfix/file-upload-validation
chore/update-dependencies

# ❌ INCORRECT
my-feature
fix
update
```

### Pull Request Requirements
- **All tests passing**
- **Code review approved**
- **No console.log statements**
- **Documentation updated**
- **Performance impact assessed**