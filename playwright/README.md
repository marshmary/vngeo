# Vietnam Economic Zones - E2E Tests

End-to-end tests for the Vietnam Economic Zones application using Playwright.

## Setup

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `TEST_ENV` - Environment to test against (local, staging, production)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `TEST_USER_EMAIL` - Test user email
- `TEST_USER_PASSWORD` - Test user password
- `TEST_ADMIN_EMAIL` - Admin user email
- `TEST_ADMIN_PASSWORD` - Admin user password

## Running Tests

### Local Development

```bash
# Run all tests
npm run test:e2e

# Run with Playwright UI (recommended for development)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run in headed mode (see browser)
npm run test:e2e:headed
```

### Specific Tests

```bash
# Run specific test file
npx playwright test homepage.spec.ts

# Run tests matching a pattern
npx playwright test --grep "authentication"

# Run specific project (browser)
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Environment-Specific

```bash
# Run against staging
TEST_ENV=staging npm run test:e2e

# Run against production
TEST_ENV=production npm run test:e2e
```

## Architecture

### Directory Structure

```
playwright/
├── e2e/                      # Test files
│   ├── homepage.spec.ts
│   ├── authentication.spec.ts
│   └── quiz.spec.ts
├── support/
│   ├── fixtures.ts           # Custom Playwright fixtures
│   ├── helpers/
│   │   └── auth-helpers.ts  # Authentication helpers
│   └── factories/
│       ├── user-factory.ts   # User data factory
│       ├── quiz-factory.ts   # Quiz data factory
│       └── document-factory.ts # Document data factory
├── auth-sessions/            # Auth state storage
├── snapshots/                # Visual snapshots
└── config/                   # Environment configs (future)
```

### Fixtures

Custom fixtures provide test data and helpers:

- `testUser` - Creates a test user with defaults
- `testAdmin` - Creates an admin user
- `testQuiz` - Creates a published quiz
- `testDocument` - Creates a test document
- `seedData` - API seeding helpers

### Data Factories

Factory functions use `@faker-js/faker` for unique, parallel-safe test data:

- `createUser(overrides?)` - Generate test users
- `createQuiz(overrides?)` - Generate quizzes with questions
- `createDocument(overrides?)` - Generate document metadata

### Helpers

- `loginUser(page, user)` - Log in via UI
- `loginAdmin(page, admin)` - Log in as admin
- `logoutUser(page)` - Log out current user
- `setLanguage(page, language)` - Set Vietnamese/English

## Best Practices

### Selectors

Use `data-testid` attributes for stable selectors:

```typescript
// ✅ Good - stable
await page.click('[data-testid="login-button"]');

// ❌ Bad - fragile
await page.click('.btn-primary');
```

### Test Isolation

Each test should be independent:

- Use factories for unique data (faker prevents collisions)
- Don't depend on other tests' state
- Clean up after tests (automatic via fixtures)

### Given-When-Then Pattern

Structure tests clearly:

```typescript
test('user can log in', async ({ page }) => {
  // Given
  await page.goto('/login');

  // When
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.click('[data-testid="login-button"]');

  // Then
  await expect(page).toHaveURL('/');
});
```

### API-First Setup

Prefer API seeding over UI setup for test data:

```typescript
// ✅ Fast (10-50x)
await testUser.seedViaAPI({ role: 'admin' });

// ❌ Slow
await page.goto('/admin/users');
await page.click('[data-testid="add-user"]');
// ... many UI steps
```

### Network Interception

Set up intercepts before navigation:

```typescript
// ✅ Correct
const apiCall = interceptNetworkCall({ url: '**/api/users' });
await page.goto('/dashboard');
const { responseJson } = await apiCall;

// ❌ Wrong - too late
await page.goto('/dashboard');
const apiCall = interceptNetworkCall({ url: '**/api/users' });
```

## CI Integration

### GitHub Actions (Future)

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
  env:
    TEST_ENV: staging

- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Tests Time Out

- Increase timeout in `playwright.config.ts`
- Check if dev server is running (for local tests)
- Verify `BASE_URL` is correct

### Auth Tests Fail

- Check Supabase credentials in `.env`
- Verify test users exist in database
- Check network requests in trace viewer

### Browser Not Found

```bash
npx playwright install
npx playwright install --with-deps  # For system dependencies
```

### View Traces

```bash
npx playwright show-trace test-results/xyz-trace.zip
```

## Knowledge Base

This framework follows TEA (Test Architecture Enterprise) patterns:

- [Playwright Utils Overview](../.claude/skills/bmad-testarch-framework/resources/knowledge/overview.md)
- [Fixtures Composition](../.claude/skills/bmad-testarch-framework/resources/knowledge/fixtures-composition.md)
- [Data Factories](../.claude/skills/bmad-testarch-framework/resources/knowledge/data-factories.md)
- [Auth Session](../.claude/skills/bmad-testarch-framework/resources/knowledge/auth-session.md)
- [Network Interception](../.claude/skills/bmad-testarch-framework/resources/knowledge/intercept-network-call.md)

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [TEA Module](../.claude/skills/bmad-testarch-framework/)
- [Project Architecture](../../docs/architecture.md)
- [Project Context](../../_bmad-output/project-context.md)
