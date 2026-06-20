/**
 * family.spec.ts
 *
 * Tests: authenticated navigation and nav bar presence.
 * (Family group features were removed in the app refactor.)
 */

import { test, expect } from '@playwright/test'
import { ensureTestUser, loginAs } from './helpers/auth'

test.beforeAll(async () => {
  await ensureTestUser()
})

test.beforeEach(async ({ page }) => {
  await loginAs(page)
})

// ── Nav ──────────────────────────────────────────────────────────────

test('nav bar is visible on all authenticated pages', async ({ page }) => {
  for (const path of ['/', '/plan']) {
    await page.goto(path)
    // Nav component renders the Wander logo/name
    await expect(page.getByRole('link', { name: 'Wander' })).toBeVisible()
  }
})

test('dashboard loads without crashing', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'My Trips' })).toBeVisible()
  await expect(page.getByText('Something went wrong')).not.toBeVisible()
  await expect(page.getByText('Application error')).not.toBeVisible()
})

test('plan page loads without crashing', async ({ page }) => {
  await page.goto('/plan')
  await expect(page.getByText('Something went wrong')).not.toBeVisible()
  await expect(page.getByText('Application error')).not.toBeVisible()
})
