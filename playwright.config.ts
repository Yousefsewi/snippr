import { defineConfig, devices } from '@playwright/test'

// Automatic checks of the most important pages, in a real browser (the Edge already on this PC).
// Run: npm run test:e2e            (against the live site)
//      E2E_BASE_URL=http://localhost:3000 npm run test:e2e   (against a local `npm run dev` / `npm start`)
export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://www.snipprcalendar.com',
    channel: 'msedge',
    locale: 'en-GB',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
    { name: 'phone', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium', channel: 'msedge' } },
  ],
})
