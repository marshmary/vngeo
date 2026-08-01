import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load E2E test env (TEST_ENV, TEST_USER_EMAIL, TEST_ADMIN_EMAIL, ...) from
// playwright/.env into process.env. Kept separate from the app's Vite .env.local.
// Test workers are forked after the config loads, so they inherit these values.
dotenv.config({ path: path.resolve(__dirname, './playwright/.env') });

/**
 * Playwright Configuration for Vietnam Economic Zones E2E Tests
 *
 * Environment-based configuration with fail-fast validation.
 * Supports local, staging, and production environments.
 */

// Central environment config map
const envConfigMap = {
  local: {
    baseURL: 'http://localhost:5173',
    ignoreHTTPSErrors: false,
  },
  staging: {
    baseURL: process.env.STAGING_URL || 'https://staging.vngeo.example.com',
    ignoreHTTPSErrors: true, // Allow self-signed certs in staging
  },
  production: {
    baseURL: process.env.PRODUCTION_URL || 'https://vngeo.example.com',
    ignoreHTTPSErrors: false,
  },
};

const environment = (process.env.TEST_ENV || 'local') as keyof typeof envConfigMap;

// Fail fast if environment not supported
if (!Object.keys(envConfigMap).includes(environment)) {
  console.error(`❌ No configuration found for environment: ${environment}`);
  console.error(`   Available environments: ${Object.keys(envConfigMap).join(', ')}`);
  process.exit(1);
}

console.log(`✅ Running E2E tests against: ${environment.toUpperCase()}`);

const envConfig = envConfigMap[environment];

export default defineConfig({
  // Test directory
  testDir: path.resolve(__dirname, './playwright/e2e'),

  // Artifact output directories
  outputDir: path.resolve(__dirname, './test-results'),
  snapshotDir: path.resolve(__dirname, './playwright/snapshots'),

  // Fully parallel execution
  fullyParallel: true,

  // Prevent accidentally committed .only() from blocking CI
  forbidOnly: !!process.env.CI,

  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,

  // Worker configuration
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'],
  ],

  // Global timeout: 60 seconds
  timeout: 60000,

  // Expect timeout: 10 seconds
  expect: {
    timeout: 10000,
  },

  // Projects for different browsers and configurations
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], ...envConfig },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], ...envConfig },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], ...envConfig },
    },

    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'], ...envConfig },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'], ...envConfig },
    },
  ],

  // Default settings for all projects
  use: {
    // Base URL from environment config
    baseURL: envConfig.baseURL,

    // Action timeout: 15 seconds
    actionTimeout: 15000,

    // Navigation timeout: 30 seconds
    navigationTimeout: 30000,

    // Screenshot on failure only (saves space)
    screenshot: 'only-on-failure',

    // Video recording on failure + retry
    video: 'retain-on-failure',

    // Keep failed attempts and retries for flake analysis
    trace: 'retain-on-failure-and-retries',

    // Ignore HTTPS errors for staging
    ignoreHTTPSErrors: envConfig.ignoreHTTPSErrors,

    // Viewport size
    viewport: { width: 1280, height: 720 },
  },

  // Local development server (only for local environment)
  ...(environment === 'local'
    ? {
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:5173',
          wait: {
            stdout: /ready|listening|localhost:/i,
          },
          reuseExistingServer: !process.env.CI,
          timeout: 120000,
        },
      }
    : {}),
});
