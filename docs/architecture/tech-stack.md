# Technology Stack

**Project:** Vietnam Economic Zones Explorer
**Date:** 2025-09-21
**Version:** 1.0

## Core Technologies

### Frontend Framework
- **React** ^18.2.0 - UI framework with modern hooks
- **TypeScript** ^5.0.0 - Type safety and better development experience
- **Vite** ^5.0.0 - Build tool with fast HMR and optimized bundling

### Mapping & Visualization
- **React Leaflet** ^4.2.1 - Interactive mapping library
- **Leaflet** ^1.9.0 - Core mapping functionality
- **GeoJSON** - Vietnam economic zone boundary data

### State Management
- **Zustand** ^4.4.0 - Lightweight state management
  - mapStore: Map state and zone selection
  - documentStore: Document management
  - qaStore: Q&A functionality
  - uiStore: UI state (modals, loading)

### Routing & Navigation
- **React Router** ^6.8.0 - Client-side routing
- Zone-based URLs: `/zones/:zoneId`, `/zones/:zoneId/documents`, `/zones/:zoneId/qa`

### UI & Styling
- **Tailwind CSS** ^3.3.0 - Utility-first CSS framework
- **Headless UI** ^1.7.0 - Accessible component primitives
- **Framer Motion** ^10.0.0 - Animation library for smooth transitions
- **Clsx** - Conditional className utility

### Forms & Input
- **React Hook Form** ^7.43.0 - Form management with minimal re-renders

### Testing
- **Vitest** ^1.0.0 - Test runner (Vite-native)
- **React Testing Library** - Component testing
- **@testing-library/jest-dom** - Additional matchers
- **@testing-library/user-event** - User interaction simulation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **React DevTools** - React debugging

## Package Versions

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.0",
    "zustand": "^4.4.0",
    "react-router-dom": "^6.8.0",
    "tailwindcss": "^3.3.0",
    "@headlessui/react": "^1.7.0",
    "framer-motion": "^10.0.0",
    "react-hook-form": "^7.43.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/leaflet": "^1.9.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.4.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

## Environment Configuration

### Required Environment Variables
```bash
# Vietnam Map Configuration
VITE_VIETNAM_MAP_CENTER_LAT=16.0471
VITE_VIETNAM_MAP_CENTER_LNG=108.2068
VITE_DEFAULT_ZOOM_LEVEL=6
VITE_ECONOMIC_ZONES_COUNT=6
VITE_ZONE_COLORS="ef4444,f97316,eab308,22c55e,3b82f6,8b5cf6"

# Storage & Features
VITE_MAX_DOCUMENT_SIZE=5242880
VITE_ADMIN_ENABLED=true
VITE_FEATURE_DARK_MODE=true
VITE_CONTENT_LANGUAGE="vi,en"
```

## Technology Decisions Rationale

### React + Vite
- **Fast development** with instant hot reload
- **Modern React features** with hooks and functional components
- **Excellent mapping ecosystem** support
- **TypeScript integration** out of the box

### Zustand over Redux
- **Simpler API** for moderate state complexity
- **Better performance** for map interactions
- **Less boilerplate** code
- **TypeScript friendly**

### React Leaflet over Mapbox
- **Open source** - better for educational projects
- **Vietnam map data** readily available
- **No API keys** required
- **Smaller bundle size**

### Tailwind CSS
- **Rapid prototyping** capabilities
- **Responsive design** utilities
- **Vietnam-themed** color palette
- **Consistent spacing** and typography

### Minimal Backend Approach
- **IndexedDB/localStorage** for document storage
- **Static JSON files** for zone data
- **Client-side** routing and state management
- **Easy deployment** to static hosting

## Browser Support

### Target Browsers
- **Chrome** 90+ (primary)
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Mobile Support
- **iOS Safari** 14+
- **Chrome Mobile** 90+
- **Samsung Internet** 14+

## Performance Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Bundle Size
- **Initial Bundle**: < 500KB gzipped
- **Map Bundle**: Lazy loaded
- **Document Bundle**: Lazy loaded

## Security Considerations

### Client-Side Security
- **XSS Prevention**: React's built-in protection
- **Content Security Policy**: Strict CSP headers
- **File Upload Validation**: Size and type restrictions
- **Admin Access**: Simple password protection

### Data Privacy
- **Local Storage**: All data stored client-side
- **No Analytics**: Privacy-first approach for education
- **No Third-Party**: Minimal external dependencies