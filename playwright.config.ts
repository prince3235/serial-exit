import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for Serial Exit e2e tests.
 * Runs against a local server on port 3000. Set E2E_PROD=1 to test the production
 * build (run `npm run build` first); otherwise the dev server is used.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
      testMatch: /mobile\.spec\.ts/,
    },
  ],
  webServer: {
    command: process.env.E2E_PROD ? "npm start" : "npm run dev",
    env: { PORT: "3000", HOSTNAME: "127.0.0.1", PORTAL_ACCESS_KEY: process.env.PORTAL_ACCESS_KEY ?? "e2e-key" },
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
