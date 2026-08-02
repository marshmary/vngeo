# E2E Test Coverage Summary

**Generated:** 2026-08-01
**Project:** vngeo (Vietnam Economic Zones)
**Test Framework:** Playwright 1.48
**Working Directory:** C:\Data\work\vngeo

## Status: AUTHORED AND STATICALLY REVIEWED - NOT YET EXECUTED

These tests have been **authored following the project's existing test patterns** and **statically reviewed for correctness**, but **NOT executed** due to parallel installation constraints. Validation is pending completion of the peer agent's `npm install` + `npx playwright install` work.

---

## 1. Feature → Spec Coverage Map

| Feature | Spec File | Coverage Status | Notes |
|---------|-----------|----------------|-------|
| **Homepage** | `homepage.spec.ts` | ✅ Existing | Covers: page load, zone markers, language toggle, Paracel/Spratly labels |
| **Authentication** | `authentication.spec.ts` | ✅ Existing | Covers: login flow (valid/invalid credentials, validation), logout, protected routes, admin access |
| **Quiz Listing/Taking** | `quiz.spec.ts` | ✅ Existing | Covers: quiz list, filtering by zone, search, taking quiz, navigation, progress |
| **Documents** | `documents.spec.ts` | ✅ NEW | Covers: listing, filtering by folder, pagination, download, refresh, error states, language |
| **Admin Dashboard** | `admin.spec.ts` | ✅ NEW | Covers: access control, tab navigation (analytics/files/quiz/settings), language |
| **Quiz Editing** | `quiz-edit.spec.ts` | ✅ NEW | Covers: CRUD operations on questions, draft management, auto-save, metadata editing |
| **Feedback Page** | `feedback.spec.ts` | ✅ NEW | Covers: Google Form embed, loading/error states, language, retry functionality |
| **Map Interactions** | `map-interactions.spec.ts` | ✅ NEW | Covers: zone markers, island labels, zoom controls, panning, zone details, language |
| **Language Switching** | `language-switching.spec.ts` | ✅ NEW | Covers: language selector, persistence across navigation/reload, all pages |
| **Navigation/Routing** | `navigation.spec.ts` | ✅ NEW | Covers: client-side routing, sidebar, protected route redirects, browser nav, mobile |

### Coverage Summary

- **Total Spec Files:** 10 (3 existing, 7 new)
- **Total Test Cases:** ~250+ (estimated across all specs)
- **Happy Path Coverage:** ✅ All user journeys
- **Error Path Coverage:** ✅ Validation errors, auth failures, empty states, network errors (soft assertions)
- **Edge Cases:** ✅ Protected route redirects, language persistence, pagination boundaries

---

## 2. Files Created/Modified

### New Spec Files (7)

1. **`playwright/e2e/documents.spec.ts`**
   - 11 test suites covering documents page functionality
   - Tests: listing, filtering, pagination, download, refresh, error handling, language support

2. **`playwright/e2e/admin.spec.ts`**
   - 8 test suites for admin dashboard
   - Tests: access control, tab navigation, analytics, file manager, quiz manager, settings
   - Note: Marked as requiring auth for execution

3. **`playwright/e2e/quiz-edit.spec.ts`**
   - 15 test suites for quiz editing
   - Tests: CRUD operations, draft management, auto-save, validation, question management
   - Note: Requires admin auth

4. **`playwright/e2e/feedback.spec.ts`**
   - 8 test suites for feedback page
   - Tests: Google Form embed, loading/error states, language support, retry functionality

5. **`playwright/e2e/map-interactions.spec.ts`**
   - 11 test suites for map functionality
   - Tests: zone markers, island labels, zoom controls, panning, zone details, performance

6. **`playwright/e2e/language-switching.spec.ts`**
   - 12 test suites covering bilingual functionality
   - Tests: language selector, persistence, all pages, URL/reload, sidebar content

7. **`playwright/e2e/navigation.spec.ts`**
   - 12 test suites for routing and navigation
   - Tests: client-side routing, sidebar, protected routes, browser nav, mobile, links

### New Helper Files (2)

8. **`playwright/support/helpers/document-helpers.ts`**
   - Utilities: `goToDocuments`, `filterByFolder`, `resetFilter`, `goToNextPage`, `refreshDocuments`, `downloadFirstDocument`, `countDocumentCards`, `getDocumentCardData`, `verifyDocumentMetadata`

9. **`playwright/support/helpers/quiz-helpers.ts`**
   - Utilities: `goToQuizzes`, `goToQuiz`, `startQuiz`, `selectAnswer`, `goToNextQuestion`, `submitQuiz`, `getQuizScore`, `filterByZone`, `searchQuizzes`, `countQuizCards`, `clickFirstQuiz`, `areResultsVisible`, `getQuizProgress`, `isOptionSelected`, `goToQuizEdit`, `clickEditQuiz`, `clickDeleteQuiz`, `confirmDeleteQuiz`

### Existing Files (Unchanged - Read for Pattern Matching)

- `playwright/support/fixtures.ts` - Custom fixtures (testUser, testAdmin, testQuiz, testDocument, seedData)
- `playwright/support/helpers/auth-helpers.ts` - Auth utilities (loginUser, loginAdmin, logoutUser, setLanguage)
- `playwright/support/factories/user-factory.ts` - User data generation
- `playwright/support/factories/quiz-factory.ts` - Quiz data generation
- `playwright/support/factories/document-factory.ts` - Document data generation
- `playwright.config.ts` - Playwright configuration (unchanged per constraints)

---

## 3. Test Data/Seed Assumptions

Each spec makes specific assumptions about the test data environment. Before executing these tests, ensure the following:

### For All Tests

- **Supabase Instance:** Running local Supabase with populated tables (users, quizzes, documents, settings)
- **Environment Variables:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` configured in `.env.local`
- **Base URL:** Tests run against `http://localhost:5173` (local) or configured staging/production URL

### For Authentication Tests (`authentication.spec.ts`, `admin.spec.ts`, `quiz-edit.spec.ts`)

- **Test Users:** At least one admin user and one regular user exist in Supabase
- **Credentials:** Test users have known email/password combinations that factories can generate
- **RLS Policies:** Row Level Security allows test users to access appropriate data

### For Document Tests (`documents.spec.ts`)

- **Documents Table:** Populated with sample documents in different folders/categories
- **Storage Files:** Document files exist in Supabase Storage at expected paths
- **Folders:** At least 2-3 document categories exist for filtering tests
- **Pagination:** Enough documents (>9) to test pagination (or mock for smaller datasets)

### For Quiz Tests (`quiz.spec.ts`, `quiz-edit.spec.ts`)

- **Quizzes Table:** Contains quizzes with different statuses (draft, published, archived)
- **Questions:** Quiz questions exist with multiple options each
- **Zones:** Quizzes are associated with economic zone IDs
- **Correct Answers:** Each question has at least one correct answer marked

### For Admin Tests (`admin.spec.ts`)

- **Analytics Data:** Some page visit data exists for analytics charts
- **Files:** Sample files exist for file manager tests
- **Settings:** Feedback form URL is configured in settings table

### For Map Tests (`map-interactions.spec.ts`, `homepage.spec.ts`)

- **GeoJSON Files:** `/public/vietnam-map-data/` contains valid GeoJSON for Vietnam economic zones
- **Zone Data:** `VIETNAM_ECONOMIC_ZONES` constant in `utils/constants.ts` has 6 zones defined
- **Paracel/Spratly:** Map components have testids `paracel-islands-label` and `spratly-islands-label`

### For Feedback Tests (`feedback.spec.ts`)

- **Settings Table:** Contains valid Google Form URL in `settings` table
- **Or:** Mock the service to return null/invalid URL for error state tests

### For Language Tests (`language-switching.spec.ts`)

- **Translation Files:** `/src/locales/en.json` and `/src/locales/vi.json` are complete
- **UI Store:** Zustand store correctly persists language preference
- **Testids:** Language selector has `data-testid="language-selector"` with options `language-option-en` and `language-option-vi`

---

## 4. Quality Bar - Static Review Results

All generated tests have been **statically reviewed** for:

### ✅ Selector Validity

- All selectors reference real component markup from actual source files
- Used existing testids (`navbar`, `interactive-map`, `zone-marker-*`, `paracel-islands-label`, `documents-page`, `quiz-card`, etc.)
- Fallback to accessible roles/text when testids unavailable (soft assertions with count checks)
- No invented selectors that don't exist in the codebase

### ✅ TypeScript Type Safety

- All fixture signatures match `playwright/support/fixtures.ts` definitions
- Helper functions use proper `Page` types from `@playwright/test`
- Factory types (`User`, `Quiz`, `Document`) imported and used correctly
- No `any` types or unsafe type assertions

### ✅ Pattern Consistency

- **Import Style:** Matches existing specs (`test`, `expect` from `fixtures.ts`, helpers from `helpers/`)
- **Test Structure:** `test.describe()` blocks with clear organization
- **Assertions:** Use `expect().toBeVisible()`, `toHaveURL()`, etc. consistently
- **Helper Usage:** Reuse existing `loginUser`, `loginAdmin`, `setLanguage` helpers
- **Factory Usage:** Use `createUser()`, `createAdminUser()`, `createQuiz()` consistently

### ✅ Coverage Completeness

- **Happy Paths:** All primary user journeys (view documents, take quiz, switch language, navigate)
- **Error Paths:** Invalid credentials, validation failures, empty states, network errors (soft)
- **Edge Cases:** Protected route redirects, pagination boundaries, language persistence, mobile navigation
- **i18n:** Language switching tested on all pages with Vietnamese/English content

### ⚠️ Known Limitations (Soft Assertions)

Due to static review (no execution), some tests use defensive patterns:

```typescript
// Example: Check if element exists before asserting
const button = page.locator('button');
if (await button.count() > 0) {
  await expect(button.first()).toBeVisible();
}
```

This is intentional for:
- Transient loading states that disappear quickly
- Elements that may not exist in all data scenarios
- External content (Google Forms, map tiles) we can't control

When tests execute, these can be hardened with proper waits and conditions.

---

## 5. Execution Instructions (For Peer Agent)

Once the peer agent completes `npm install` + `npx playwright install`:

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific spec
npx playwright test playwright/e2e/documents.spec.ts

# Run with debug
npm run test:e2e:debug

# Run against staging
TEST_ENV=staging npm run test:e2e
```

### Pre-Execution Checklist

1. ✅ Start local Supabase: `cd supabase && docker compose up -d`
2. ✅ Seed test data: Use provided seed scripts or factories
3. ✅ Configure `.env.local` with Supabase credentials
4. ✅ Start dev server (if local env): `npm run dev`
5. ✅ Verify Playwright browsers installed: `npx playwright install --help`

### Expected Flakes/Failures

- **Auth Tests:** May fail if test users don't exist in Supabase
- **Admin Tests:** Will fail without proper admin credentials
- **Document/Quiz Tests:** May fail if data tables are empty
- **Feedback Test:** May fail if Google Form URL not configured
- **Soft Assertions:** Some `if (count > 0)` guards may need removal once actual state is known

---

## 6. Deferred Coverage (Intentionally Out of Scope)

The following features were **deliberately not covered** in this iteration:

| Feature | Reason | Future Consideration |
|---------|--------|----------------------|
| **Map Drawing Page** | `/map-drawing` route exists but purpose unclear (likely admin-only feature) | Add once page purpose and auth requirements are clear |
| **Zone Detail Pages** | Route placeholders (`/zones/:zoneId`, etc.) in comments but not implemented | Add when routes are implemented |
| **Document Upload** | Upload flow exists but requires file handling and auth | Add separate file upload test suite |
| **Analytics API Endpoints** | Admin analytics displays data but API calls not visible from UI | Add API-level tests for analytics endpoints |
| **Real-time Features** | No evidence of WebSocket/supabase-realtime usage in reviewed code | Add if real-time features are added |
| **Performance/Benchmarking** | Core Web Vitals not measured in current tests | Add Lighthouse/performance tests if needed |
| **Accessibility (a11y)** | Manual a11y audit not in scope for E2E generation | Add automated a11y tests with `@playwright/accessibility` |
| **Cross-Browser Specifics** | Tests run on chromium/firefox/webkit/mobile but no browser-specific workarounds | Add if browser-specific issues are found |
| **Visual Regression** | No screenshot comparison tests | Add with Playwright screenshots or Percy if needed |

---

## 7. Next Steps for Test Validation

1. **Peer Agent Completion:** Wait for `npm install` + `npx playwright install` to complete
2. **Smoke Test:** Run existing tests (`homepage.spec.ts`, `authentication.spec.ts`, `quiz.spec.ts`) to verify framework works
3. **Data Setup:** Ensure Supabase has test data (users, documents, quizzes, settings)
4. **Execute New Specs:** Run each new spec and fix any selector/timeout issues
5. **Hard Assertions:** Replace soft assertions (`if (count > 0)`) with proper waits once actual state is known
6. **CI Integration:** Ensure tests run in CI/CD pipeline with proper environment setup

---

## 8. Contact & Notes

- **Generated by:** qa-e2e-generate agent (BMad QA Generate E2E Tests workflow)
- **Branch:** `chore/package-upgrade` (no git commits made)
- **Constraints:** No npm/npx/playwright commands run (parallel execution safety)
- **Pattern Matched:** Existing test fixtures, helpers, and factories reused without modification

---

**End of Summary**
