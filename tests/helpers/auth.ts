import { Page, request } from '@playwright/test'

const EMAIL    = process.env.TEST_USER_EMAIL    ?? 'playwright-test@wander-test.dev'
const PASSWORD = process.env.TEST_USER_PASSWORD ?? 'TestPassword123!'
const BASE_URL = process.env.TEST_BASE_URL      ?? 'http://localhost:3000'

/**
 * Create the test user if they don't exist yet.
 * Safe to call multiple times — 409 (already exists) is treated as success.
 */
export async function ensureTestUser() {
  const ctx = await request.newContext({ baseURL: BASE_URL })
  const res = await ctx.post('/api/auth/signup', {
    data: { email: EMAIL, password: PASSWORD },
  })
  // 200 = created, 409 = already exists — both are fine
  if (res.status() !== 200 && res.status() !== 409) {
    throw new Error(`ensureTestUser failed: ${res.status()} ${await res.text()}`)
  }
  await ctx.dispose()
}

/**
 * Log in via the UI and return the page (now authenticated).
 * Call this at the start of any test that needs a session.
 */
export async function loginAs(page: Page, email = EMAIL, password = PASSWORD) {
  await page.goto('/login')

  // Make sure we're on the login tab (not signup)
  await page.getByRole('button', { name: 'Sign in' }).first().click()

  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('••••••••').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).last().click()

  // Wait for redirect to dashboard
  await page.waitForURL('/', { timeout: 10_000 })
}

export { EMAIL, PASSWORD, BASE_URL }
