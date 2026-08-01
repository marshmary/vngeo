# Component Inventory - Vietnam Economic Zones

> Generated: 2026-05-16 | Scan Level: Exhaustive

## Component Categories

### Admin Components (10 components)

| Component | File | Purpose | State | Key Props |
|-----------|------|---------|-------|-----------|
| AnalyticsDashboard | `admin/AnalyticsDashboard.tsx` | Analytics overview with auto-refresh | stats, hourlyData, topPages, deviceBreakdown, isLoading | None |
| DeviceBreakdownChart | `admin/DeviceBreakdownChart.tsx` | Device type progress bars | None | data: DeviceBreakdown[] |
| FileCard | `admin/FileCard.tsx` | File/folder display card | showMenu | file, viewMode, onDelete, onFolderClick |
| FileManager | `admin/FileManager.tsx` | Full file manager CRUD | files, viewMode, searchQuery, currentPath, isLoading | None |
| FileUpload | `admin/FileUpload.tsx` | Drag-and-drop upload modal | dragActive, selectedFiles, mode, folderName, isUploading | onUpload, onCreateFolder, onClose, currentPath |
| GeneralSettings | `admin/GeneralSettings.tsx` | Settings editor with preview | videoUrl, feedbackUrl, isLoading, isSaving, hasChanges | None |
| HourlyVisitsChart | `admin/HourlyVisitsChart.tsx` | 24h bar chart | None | data: HourlyVisitData[] |
| QuizManager | `admin/QuizManager.tsx` | Quiz CRUD with modals | quizzes, isLoading, showCreateForm, newQuiz, showDeleteModal | None |
| StatsCard | `admin/StatsCard.tsx` | Metric display card | None | title, value, subtitle, icon, color, isNumeric |
| TopPagesTable | `admin/TopPagesTable.tsx` | Ranked pages table | None | pages: MostVisitedPage[] |

### Auth Components (3 components)

| Component | File | Purpose | Key Props |
|-----------|------|---------|-----------|
| AdminRoute | `auth/AdminRoute.tsx` | Admin-only route guard | children |
| ProtectedRoute | `auth/ProtectedRoute.tsx` | Auth-required route guard | children |
| UserProfileDropdown | `auth/UserProfileDropdown.tsx` | User menu with portal | isCollapsed? |

### Common Components (5 components)

| Component | File | Purpose | Notes |
|-----------|------|---------|-------|
| ConfirmationModal | `common/ConfirmationModal.tsx` | Reusable confirm dialog | Supports danger/warning/info types |
| LoadingSpinner | `common/LoadingSpinner.tsx` | Animated spinner | Sizes: sm/md/lg |
| NavBar | `common/NavBar.tsx` | Top navigation | **Not used** - Sidebar is used instead |
| Notification | `common/Notification.tsx` | Global toast system | Auto-hides 4s, uses Framer Motion |
| Sidebar | `common/Sidebar.tsx` | Left sidebar navigation | Collapsible, mobile hamburger, has data-guide attributes |

### Debug Components (1 component)

| Component | File | Purpose |
|-----------|------|---------|
| ProvinceDebugger | `debug/ProvinceDebugger.tsx` | Zone-province coverage overlay |

### Guide Components (1 component)

| Component | File | Purpose |
|-----------|------|---------|
| FirstTimeGuide | `guide/FirstTimeGuide.tsx` | 13-step onboarding tutorial |

### Map Components (5 components)

| Component | File | Purpose | Notes |
|-----------|------|---------|-------|
| InteractiveMapContainer | `map/InteractiveMapContainer.tsx` | **Primary map component** | GeoJSON zones, hover/click, controls, legend, island labels |
| MapContainer | `map/MapContainer.tsx` | Legacy map | Uses ZoneLayer; superseded by InteractiveMapContainer |
| ParacelIslandsLabel | `map/ParacelIslandsLabel.tsx` | Island text label | "Quần đảo Hoàng Sa" |
| SpratlyIslandsLabel | `map/SpratlyIslandsLabel.tsx` | Island text label | "Quần đảo Trường Sa" |
| ZoneLayer | `map/ZoneLayer/index.tsx` | GeoJSON zone rendering | Used by legacy MapContainer |

### Zone Components (1 component)

| Component | File | Purpose |
|-----------|------|---------|
| ZoneCard | `zone/ZoneCard.tsx` | Animated zone info card |

---

## Page Components (9 pages)

| Page | Route | Auth | Purpose |
|------|-------|------|---------|
| HomePage | `/` | None | Main map + zone sidebar |
| LoginPage | `/login` | None | Sign in / sign up form |
| AdminPage | `/admin` | Admin | Tabbed admin (analytics, files, quiz, settings) |
| DocumentsPage | `/documents` | None | Document browser with folders |
| FeedbackPage | `/feedback` | None | Embedded Google Form iframe |
| MapDrawingPage | `/map-drawing` | None | YouTube video embed + instructions |
| QuizListPage | `/quizzes` | None | Public quiz listing |
| QuizPage | `/quiz/:quizId` | None | Quiz-taking with timer |
| QuizEditPage | `/admin/quiz/:quizId/edit` | Admin | Full quiz editor with drafts |

---

## External Library Usage by Component

| Library | Used In | Purpose |
|---------|---------|---------|
| react-leaflet | InteractiveMapContainer, MapContainer, ZoneLayer, Island labels | Map rendering, GeoJSON, markers |
| framer-motion | Notification, LoginPage, ZoneCard | Animations (slide-in, fade) |
| react-hook-form | LoginPage | Form validation |
| @headlessui/react | UserProfileDropdown | Accessible Menu/Transition |
| @fortawesome/react-fontawesome | Sidebar, NavBar | Icons |
| react-i18next | Most components | Translation hook |
