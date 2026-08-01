---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
classification:
  projectType: web_app
  domain: edtech
  complexity: medium
  projectContext: brownfield
  focus: educational_mapping
inputDocuments:
  - _bmad-output/project-context.md
  - docs/index.md
  - docs/project-overview.md
  - docs/architecture.md
  - docs/development-blueprint.md
  - docs/ui-architecture.md
  - docs/brainstorming-session-results.md
  - docs/data-models-main.md
  - docs/api-contracts-main.md
  - docs/component-inventory-main.md
  - docs/development-guide-main.md
  - docs/source-tree-analysis.md
  - docs/design/vietnam-economic-zones-ui-modernization-spec.md
  - docs/architecture/analytics-dashboard-approach.md
  - docs/architecture/coding-standards.md
  - docs/architecture/console-log-removal.md
  - docs/architecture/source-tree.md
  - docs/architecture/tech-stack.md
  - docs/setup/SUPABASE_SETUP.md
  - docs/setup/setup.md
  - docs/setup/start-development.md
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 1
  projectDocs: 17
  projectContext: 1
workflowType: 'prd'
releaseMode: single-release
---

# Product Requirements Document - vngeo

**Author:** marshmary
**Date:** 2026-05-18

## Executive Summary

Vietnam Economic Zones Explorer (vngeo) is an educational single-page web application that enables Vietnamese high school students to explore the country's six economic zones through an interactive map. The product combines geographic visualization with economic data, document management, quiz-based assessment, and analytics to create an engaging learning experience aligned with Vietnam's geography curriculum.

The core value proposition is visual, map-first discovery: instead of reading static textbook descriptions, students click colored zone overlays on a real map of Vietnam and immediately see population, GDP, key industries, and major cities for each region. This spatial approach to economic geography is the differentiator — no comparable Vietnamese-language educational tool exists that pairs GADM-based province boundary rendering with curated economic zone data and interactive quizzes.

**Target users:** Vietnamese high school students (primary), teachers/administrators (secondary). All content is bilingual (Vietnamese default, English secondary).

**Problem solved:** Geography education in Vietnam relies on static textbook materials with no interactive spatial component. Students struggle to connect provincial boundaries to economic regions and retain abstract economic data without visual anchoring.

**What makes this special:** The combination of real GADM province-level GeoJSON data grouped into six economic zones, bilingual content, a quiz system with draft auto-save, and Supabase-backed document management — all in a lightweight SPA that loads fast on school networks.

## Project Classification

| Attribute | Value |
|-----------|-------|
| Project Type | Web Application (SPA) |
| Domain | EdTech |
| Complexity | Medium |
| Context | Brownfield — existing codebase in production |
| Stack | React 19 + TypeScript 5.8 + Vite 4 + Supabase + React Leaflet |
| Deployment | Netlify |
| Status | Live, iterative enhancement phase |

## Success Criteria

### User Success

- Students can identify all six economic zones on the interactive map within 30 seconds of loading the app
- Students can associate key industries, population figures, and GDP data with each zone after a single session
- Students complete at least one quiz per session and see their score immediately
- First-time users complete the 13-step onboarding tutorial and can navigate the map independently
- Bilingual users can switch between Vietnamese and English without losing context or data

### Business Success

- Application serves as a reference tool adopted by at least 3 Vietnamese high schools for geography curriculum
- Admin users actively manage documents and create quizzes on a weekly basis
- Page analytics show returning visitor rate above 30% within the first semester
- Quiz completion rate above 60% for published quizzes

### Technical Success

- LCP under 2.5 seconds on 3G-equivalent school networks
- CLS under 0.1 — no jarring reflows during map interaction
- Initial bundle under 500KB gzipped
- Zero TypeScript errors blocking production build
- console.log/info/debug stripped from production; console.error/warn preserved

### Measurable Outcomes

| Metric | Target | Measurement |
|--------|--------|-------------|
| Map interaction rate | >70% of sessions include zone selection | Analytics page_visits |
| Quiz engagement | >40% of visitors attempt a quiz | Quiz attempt count |
| Returning visitors | >30% within first semester | Analytics unique visitors |
| Session duration | Average >3 minutes | Analytics session_duration |
| Build success | Zero TS errors | `npm run build` exit code 0 |

## User Journeys

### Journey 1: Student Explores Economic Zones (Primary — Happy Path)

**Persona:** Linh, 16-year-old high school student in Hanoi preparing for a geography exam on Vietnam's economic regions.

**Opening Scene:** Linh opens the app on her phone during a study break. The map loads centered on Vietnam with six color-coded zone overlays. She sees the first-time guide tooltip pointing to the map.

**Rising Action:** She taps the Northern Mountains zone (red). The map zooms in, the zone highlights, and a sidebar card animates in showing: population 15M, key industries (mining, agriculture, tourism), major cities (Hanoi, Hai Phong). She scrolls through the zone card reading key facts. She taps the Red River Delta next and compares the two zones visually.

**Climax:** She switches to the Quizzes page, selects a "Medium" difficulty quiz on economic zones, and answers 8 multiple-choice questions with a 10-minute timer. She sees her score immediately — 7/8 correct.

**Resolution:** She feels confident about her exam material. She bookmarks the app to revisit before the test. The spatial memory of clicking zones on the map reinforces what she read in her textbook.

**Capabilities revealed:** Interactive map, zone selection, zone data display, bilingual content, quiz system, timed assessment, score display.

### Journey 2: Admin Manages Educational Content (Secondary)

**Persona:** Mr. Thanh, geography teacher and app administrator at a high school in Ho Chi Minh City.

**Opening Scene:** Mr. Thanh logs in via the admin panel. His user metadata has `role: admin`, granting access to the admin dashboard.

**Rising Action:** He navigates to the Files tab, creates a folder "Semester 2 — Southeast Zone", and uploads three PDF documents about industrial parks in the Southeast economic zone. He then switches to the Quiz tab, creates a new quiz titled "Southeast Zone Industries", sets difficulty to "Easy", adds 5 questions with 4 options each, and publishes it.

**Climax:** He checks the Analytics tab and sees: 342 visits this week, top page is the map (78% of visits), 23 quiz attempts, average session duration 4.2 minutes. The hourly visits chart shows peaks during school hours (8-10am, 2-4pm).

**Resolution:** He has fresh content ready for next week's class and data to share with the department head showing student engagement with the tool.

**Capabilities revealed:** Admin authentication, file upload/folder management, quiz CRUD, quiz publishing workflow, analytics dashboard, session duration tracking.

### Journey 3: Student Takes a Timed Quiz with Draft Recovery (Edge Case)

**Persona:** Hieu, 17-year-old student who starts a quiz but gets interrupted.

**Opening Scene:** Hieu opens a 15-minute quiz on the Central Highlands zone. He answers questions 1-3.

**Rising Action:** His phone battery dies at question 4. The quiz draft (questions 1-3 answers + timer state) is auto-saved to localStorage via QuizDraftService.

**Climax:** He returns the next day, opens the same quiz. A notification appears: "You have a saved draft. Resume?" He taps yes, and his previous answers are restored with the timer resumed from where it left off.

**Resolution:** He completes the quiz without retaking the first three questions. The draft is automatically deleted on quiz submission.

**Capabilities revealed:** Quiz draft auto-save, draft recovery on return, timer persistence, draft cleanup on completion.

### Journey 4: New User Onboarding (First Visit)

**Persona:** A first-time visitor lands on the app from a shared link.

**Opening Scene:** The FirstTimeGuide component detects no previous visit in the UI store. A 13-step tutorial overlay begins highlighting the map, zone colors, sidebar navigation, and key features.

**Rising Action:** The guide walks through: map interaction, zone selection, zone data cards, navigation menu items (Documents, Quizzes, Map Drawing, Feedback), language toggle, and theme options.

**Climax:** After completing the guide, the user understands the app's full feature set without reading any documentation.

**Resolution:** The guide state is persisted so it never shows again. The user independently navigates to explore zones.

**Capabilities revealed:** Onboarding tutorial, state persistence, progressive disclosure, feature discovery.

### Journey Requirements Summary

| Journey | Primary Capabilities Revealed |
|---------|------------------------------|
| Student explores zones | Map, zone selection, zone data, quiz system |
| Admin manages content | Auth, file upload, quiz CRUD, analytics |
| Quiz draft recovery | Draft auto-save, recovery, cleanup |
| New user onboarding | Tutorial, state persistence, feature discovery |

## Domain-Specific Requirements

### Student Privacy & Data Protection

- No PII collected from students beyond optional account creation
- Analytics uses anonymous session IDs and visitor IDs — no student identity linkage
- Quiz results are not stored per student identity
- Future student accounts must comply with Vietnamese Decree 13/2023/ND-CP on personal data protection
- Supabase RLS policies ensure students can only read published content

### Accessibility for Educational Use

- WCAG 2.1 Level AA for all student-facing interfaces
- High contrast mode for students with visual impairments
- Keyboard navigation for all interactive elements
- Minimum 44px touch targets for mobile classroom use
- Color-independent information delivery — zone data not conveyed by color alone
- `prefers-reduced-motion` respected for animation-sensitive students

### Content & Curriculum Alignment

- Zone data sourced from official Vietnamese government economic statistics
- Bilingual content (Vietnamese primary, English secondary) supports both language tracks
- Quiz content created and moderated by admin users (teachers) for curriculum alignment
- Document management enables teachers to upload supplementary materials per zone

### Educational Safety

- No social features or user-generated content visible between students
- Admin-only content creation prevents inappropriate material from reaching students
- Feedback mechanism uses external Google Form — no in-app user-to-user communication

## Web Application Specific Requirements

### Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Chrome Mobile | 90+ |
| iOS Safari | 14+ |

### Responsive Design

- Desktop (1024px+): Full sidebar + map + zone card layout
- Tablet (768px-1023px): Collapsible sidebar, full map
- Mobile (<768px): Hamburger menu, stacked layout, touch-optimized map controls

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP | < 2.5s | Lighthouse / Core Web Vitals |
| FID / INP | < 100ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| Initial bundle | < 500KB gzipped | Build output |
| Map tile load | < 1s on 3G | Network panel |
| Quiz save | < 500ms | localStorage write |

### SEO & Discoverability

- SPA with Netlify redirect rules for client-side routing
- Meta tags for Vietnamese geography education keywords
- Open Graph tags for social sharing
- No SEO requirement for admin pages (behind authentication)

### Accessibility Level

- WCAG 2.1 Level AA for all public-facing pages
- ARIA labels on all interactive map elements
- Screen reader compatible zone selection and quiz flow
- Focus management for modal dialogs
- `data-guide` attributes on sidebar for tutorial system

## Project Scoping

### Strategy & Philosophy

**Approach:** Brownfield single release — the product is in production with core features complete. Scope covers the existing feature set as the baseline PRD, with growth features identified for future iterations.

**Resource Requirements:** Solo developer (marshmary) with Supabase BaaS. No backend team needed — all server logic is Supabase RLS, RPC functions, and storage policies.

### Must-Have Capabilities (Current Production)

- Interactive Leaflet map with six economic zone overlays from GADM GeoJSON
- Zone sidebar with animated cards showing economic data
- Vietnamese/English bilingual interface
- Supabase authentication with admin role detection
- Admin panel: Analytics, Files, Quizzes, Settings tabs
- Quiz system: CRUD for admins, timed quiz-taking with draft recovery
- Document management via Supabase Storage with folder support
- Analytics tracking with admin dashboard
- 13-step first-time user guide
- Dark mode, high contrast, responsive sidebar

### Nice-to-Have Capabilities (Growth)

- Modern dark UI theme with glassmorphism effects
- Zone comparison feature
- Province-level drill-down
- Enhanced analytics with Recharts
- Student progress tracking
- Offline/PWA support

### Risk Mitigation Strategy

**Technical Risks:** GADM GeoJSON files are large (~2MB). Mitigated by serving from `/public/` static assets with browser caching.

**Adoption Risks:** School network reliability. Mitigated by performance targets optimized for 3G and lightweight bundle.

**Content Risks:** Admin-dependent content creation. Mitigated by seed data in `03_quiz_sample_data.sql` and simple admin role assignment via SQL.

## Functional Requirements

### Map & Zone Visualization

- FR1: Users can view an interactive map of Vietnam centered at [16.0471, 108.2068] with zoom levels 5-18
- FR2: Users can see six economic zones rendered as colored GeoJSON overlays on the map
- FR3: Users can hover over a zone to see a tooltip with the zone name
- FR4: Users can click a zone to highlight it, zoom to its bounds, and view detailed economic data
- FR5: Users can see Paracel Islands and Spratly Islands labels on the map
- FR6: Users can see a zone legend mapping colors to zone names
- FR7: Users can reset the map view to default center and zoom

### Zone Information Display

- FR8: Users can view a sidebar card for the selected zone showing name, region, population, GDP, key industries, major cities, area, economic activities breakdown, and key facts
- FR9: Users can view zone content in Vietnamese or English based on language preference
- FR10: Users can collapse and expand the sidebar navigation

### Authentication & User Management

- FR11: Users can sign up with email, password, and optional username
- FR12: Users can sign in with email and password
- FR13: Users can sign out
- FR14: The system detects admin role from user metadata (`user_metadata.role` or `app_metadata.role`)
- FR15: Admin-only routes are protected and redirect unauthenticated/non-admin users

### Admin Panel

- FR16: Admin users can access a tabbed admin dashboard with Analytics, Files, Quizzes, and Settings tabs
- FR17: Admin users can view analytics: total visits, unique visitors, hourly visits (24h), most visited pages, device breakdown, browser statistics
- FR18: Admin users can view visit trend data over configurable date ranges

### Document Management

- FR19: Authenticated users can browse documents in a file manager with folder navigation
- FR20: Authenticated users can upload files (up to 50MB) with drag-and-drop support
- FR21: Authenticated users can create folders in the document storage
- FR22: Authenticated users can download files
- FR23: Admin users can delete files and folders
- FR24: The system validates file size and type before upload

### Quiz System

- FR25: Admin users can create quizzes with title, description, difficulty level (easy/medium/hard), and optional time limit
- FR26: Admin users can add questions with multiple-choice options and mark correct answers
- FR27: Admin users can save quiz drafts before publishing
- FR28: Admin users can publish quizzes (changing status from draft to published)
- FR29: Admin users can edit and delete quizzes
- FR30: Admin users can support questions with multiple correct answers
- FR31: Users can browse published quizzes listed by title and difficulty
- FR32: Users can take a timed quiz with one question at a time and submit answers
- FR33: Users can see their score immediately upon quiz completion
- FR34: The system auto-saves quiz progress as a draft in localStorage during quiz-taking
- FR35: Users can resume an interrupted quiz from the auto-saved draft
- FR36: The system deletes quiz drafts upon quiz submission

### Analytics & Tracking

- FR37: The system tracks page visits with session management, device type, browser, and OS
- FR38: The system records session duration when users leave a page
- FR39: The system aggregates analytics via Supabase RPC functions
- FR40: Admin users can view auto-refreshing analytics data on the dashboard

### Settings & Configuration

- FR41: Admin users can view and update general settings (map drawing video URL, feedback form URL)
- FR42: Admin users can see a preview of configured URLs before saving

### Internationalization

- FR43: Users can switch between Vietnamese (default) and English
- FR44: The system persists language preference across sessions
- FR45: The system detects language from localStorage, navigator, or HTML tag on first visit

### Onboarding & Guidance

- FR46: First-time users see a 13-step interactive tutorial highlighting key features
- FR47: The system tracks tutorial completion and does not re-show it on subsequent visits

### External Content Integration

- FR48: Users can view an embedded YouTube video for map drawing tutorial
- FR49: Users can access an embedded Google Form for feedback submission

### Notifications

- FR50: Users see toast notifications for actions (file upload success, quiz saved, errors) that auto-dismiss after 4 seconds

## Non-Functional Requirements

### Performance

- NFR1: LCP under 2.5 seconds on simulated 3G
- NFR2: Map tile rendering completes within 1 second of zone data load
- NFR3: Zone selection and sidebar card rendering within 200ms (FID < 100ms)
- NFR4: Quiz auto-save to localStorage within 100ms
- NFR5: Production build initial bundle under 500KB gzipped
- NFR6: GADM GeoJSON served from `/public/` static assets with browser cache headers

### Security

- NFR7: All Supabase tables have Row Level Security (RLS) policies
- NFR8: Admin operations enforced via RLS checking `user_metadata.role = 'admin'`
- NFR9: File uploads validated client-side for size (max 50MB) and type (whitelist)
- NFR10: Supabase Storage bucket is private — authenticated users only
- NFR11: console.log/info/debug stripped from production via Terser
- NFR12: console.error/warn preserved for production diagnostics
- NFR13: No service role key in client bundle — anon key only
- NFR14: Missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` throws at startup

### Accessibility

- NFR15: WCAG 2.1 Level AA for all public-facing pages
- NFR16: Minimum 44px touch targets for all interactive elements
- NFR17: Zone information conveyed through text and data, not color alone
- NFR18: High contrast mode with `filter: contrast(1.2)`
- NFR19: `prefers-reduced-motion` disables animations
- NFR20: ARIA labels in Vietnamese and English on all interactive elements
- NFR21: Keyboard navigation for map controls, quiz flow, and sidebar

### Reliability

- NFR22: Client-side routing handles all routes — no 404s on refresh (Netlify SPA fallback)
- NFR23: Auth state persists in localStorage via Zustand across page refreshes
- NFR24: Quiz draft recovery handles browser crash, tab close, and battery death
- NFR25: Core map functionality works without external API dependencies (static GeoJSON)

### Scalability

- NFR26: Supabase free tier supports target user base
- NFR27: Analytics table indexed on visit_timestamp, session_id, visitor_id, page_path
- NFR28: Quiz service caching (5-min TTL) prevents redundant queries
- NFR29: Document listing uses request deduplication and 5-min TTL cache

### Compatibility

- NFR30: Renders correctly on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- NFR31: Mobile-responsive on iOS Safari 14+ and Chrome Mobile 90+
- NFR32: OpenStreetMap tiles render correctly on all supported browsers
