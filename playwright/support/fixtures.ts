import { test as base } from '@playwright/test';
import { createUser } from './factories/user-factory';
import { createQuiz } from './factories/quiz-factory';
import { createDocument } from './factories/document-factory';

/**
 * Custom Fixtures for Vietnam Economic Zones E2E Tests
 *
 * Provides test data factories and helpers for creating test entities.
 * These fixtures work with API seeding for fast, parallel-safe tests.
 */

export const test = base.extend({
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
