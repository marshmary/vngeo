import { faker } from '@faker-js/faker';

/**
 * User Factory for E2E Tests
 *
 * Generates test user data with sensible defaults and faker-based uniqueness.
 * Use overrides to specify what matters for each test.
 */

type UserRole = 'user' | 'admin' | 'moderator';

export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  isActive: boolean;
  // Additional Supabase user metadata
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

/**
 * Create a test user with optional overrides.
 *
 * @example
 * const user = createUser() // Default user
 * const admin = createUser({ role: 'admin' }) // Admin user
 * const custom = createUser({ email: 'test@example.com', isActive: false })
 */
export const createUser = (overrides: Partial<User> = {}): User => {
  const password = overrides.password || faker.internet.password({ length: 12, memorable: true });

  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    password,
    name: faker.person.fullName(),
    role: 'user',
    createdAt: new Date(),
    isActive: true,
    user_metadata: {
      full_name: faker.person.fullName(),
      avatar_url: faker.image.avatar(),
    },
    ...overrides,
  };
};

/**
 * Create an admin user (convenience factory)
 */
export const createAdminUser = (overrides: Partial<User> = {}): User =>
  createUser({ role: 'admin', ...overrides });

/**
 * Create an inactive user
 */
export const createInactiveUser = (overrides: Partial<User> = {}): User =>
  createUser({ isActive: false, ...overrides });
