import { test as base } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createUser } from './factories/user-factory';
import { createQuiz } from './factories/quiz-factory';
import { createDocument } from './factories/document-factory';

/**
 * Custom Fixtures for Vietnam Economic Zones E2E Tests
 *
 * Provides test data factories and helpers for creating test entities.
 * These fixtures work with API seeding for fast, parallel-safe tests.
 */

// =============================================================================
// CRUD write-path gating + service-role teardown wiring (CRUD_TEST_SPEC §6)
// =============================================================================
// Read once from process.env. Values come from the shell/CI, or from
// playwright/.env (loaded by playwright.config.ts via dotenv). When
// TEST_RUN_CRUD_WRITE is unset/0, every CRUD spec should skip cleanly via
// `test.skip(!crudWriteEnabled, ...)` or isCrudWriteEnabled().
const CRUD_WRITE_ENABLED = process.env.TEST_RUN_CRUD_WRITE === '1';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Whether CRUD write tests are enabled.
 *
 * CRUD specs opt in with `TEST_RUN_CRUD_WRITE=1` (plus a service-role key +
 * the app pointed at LOCAL Supabase). Use this in beforeAll/beforeEach to skip
 * cleanly:
 *
 *   test.beforeEach(async ({ crudWriteEnabled }) => {
 *     test.skip(!crudWriteEnabled, 'CRUD write tests disabled');
 *   });
 */
export function isCrudWriteEnabled(): boolean {
  return CRUD_WRITE_ENABLED;
}

/**
 * Build a service-role Supabase client (RLS-bypassing) from env, for teardown.
 *
 * Returns null when SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing so
 * callers can skip cleanly instead of crashing. Pass the result to
 * `cleanupE2EEntities(client)` in afterAll.
 */
export function createServiceRoleClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Resolve the shared client once per worker (cheap; safe to reuse).
const SHARED_SERVICE_ROLE_CLIENT = createServiceRoleClient();

/**
 * Shape of the `seedData` fixture's helper bundle (API-side seeding).
 */
interface SeedData {
  user(overrides?: Parameters<typeof createUser>[0]): Promise<ReturnType<typeof createUser>>;
  quiz(overrides?: Parameters<typeof createQuiz>[0]): Promise<ReturnType<typeof createQuiz>>;
  document(overrides?: Parameters<typeof createDocument>[0]): Promise<ReturnType<typeof createDocument>>;
}

/**
 * Value types for the custom fixtures exposed by `test` below. Declared
 * explicitly so consumers get full typing (and so the file typechecks under
 * `tsc` — Playwright's runtime transform otherwise skips type checking).
 */
type E2EFixtures = {
  crudWriteEnabled: boolean;
  serviceRole: SupabaseClient | null;
  testUser: ReturnType<typeof createUser>;
  testAdmin: ReturnType<typeof createUser>;
  testQuiz: ReturnType<typeof createQuiz>;
  testDocument: ReturnType<typeof createDocument>;
  seedData: SeedData;
};

export const test = base.extend<E2EFixtures>({
  /**
   * Fixture: page (overridden)
   * Suppress the homepage first-time guide overlay (FirstTimeGuide) so it does
   * not intercept clicks during tests. The guide auto-shows ~1s after a fresh
   * visit and blocks interaction with the sidebar until dismissed; each test
   * runs in a fresh context so it would otherwise appear every run.
   */
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.setItem('vn-economic-zones-guide-completed', 'true');
    });
    await use(page);
  },

  /**
   * Fixture: crudWriteEnabled
   * Resolves to isCrudWriteEnabled(). CRUD specs consume it and call
   * `test.skip(!crudWriteEnabled, ...)` to stay green when writes are off.
   */
  crudWriteEnabled: async ({}, use) => {
    await use(isCrudWriteEnabled());
  },

  /**
   * Fixture: serviceRole
   * A Supabase service-role client (RLS-bypassing) for afterAll teardown via
   * cleanupE2EEntities(). Null when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
   * are not configured — callers should treat null as "skip teardown".
   */
  serviceRole: async ({}, use) => {
    await use(SHARED_SERVICE_ROLE_CLIENT);
  },

  /**
   * Fixture: testUser
   * Creates a test user with optional overrides.
   * Automatically cleaned up after each test.
   */
  testUser: async ({}, use) => {
    const user = createUser();
    await use(user);
    // Cleanup happens automatically
  },

  /**
   * Fixture: testAdmin
   * Creates an admin user with optional overrides.
   */
  testAdmin: async ({}, use) => {
    const admin = createUser({ role: 'admin' });
    await use(admin);
  },

  /**
   * Fixture: testQuiz
   * Creates a published quiz with optional overrides.
   */
  testQuiz: async ({}, use) => {
    const quiz = createQuiz({ status: 'published' });
    await use(quiz);
  },

  /**
   * Fixture: testDocument
   * Creates a test document with optional overrides.
   */
  testDocument: async ({}, use) => {
    const document = createDocument();
    await use(document);
  },

  /**
   * Fixture: seedData
   * Helper for seeding test data through API.
   */
  seedData: async ({ request }, use) => {
    const helpers = {
      /**
       * Seed a user via API
       */
      async user(overrides?: Parameters<typeof createUser>[0]) {
        const user = createUser(overrides);
        const response = await request.post('/api/users', {
          data: user,
        });
        if (!response.ok()) {
          throw new Error(`Failed to seed user: ${response.status()}`);
        }
        return user;
      },

      /**
       * Seed a quiz via API
       */
      async quiz(overrides?: Parameters<typeof createQuiz>[0]) {
        const quiz = createQuiz(overrides);
        const response = await request.post('/api/quizzes', {
          data: quiz,
        });
        if (!response.ok()) {
          throw new Error(`Failed to seed quiz: ${response.status()}`);
        }
        return quiz;
      },

      /**
       * Seed a document via Supabase storage
       */
      async document(overrides?: Parameters<typeof createDocument>[0]) {
        const document = createDocument(overrides);
        // Implementation depends on Supabase storage API
        return document;
      },
    };

    await use(helpers);
  },
});

export { expect } from '@playwright/test';
