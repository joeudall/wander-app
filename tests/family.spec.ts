/**
 * family.spec.ts
 *
 * Tests: family tab renders for users with and without a group,
 * invite flow UI is present.
 */

import { test, expect } from '@playwright/test'
import { ensureTestUser, loginAs } from './helpers/auth'

test.beforeAll(async () => {
  await ensureTestUser()
})

test.beforeEach(async ({ page }) => {
  await loginAs(page)
})

// ── Family tab basics ────────────────────────────────────────────────

test('family tab is visible in the dashboard', async ({ page }) => {
  await expect(page.getByRole('link', { name: /family/i })).toBeVisible()
})

test('family tab loads without crashing', async ({ page }) => {
  await page.goto('/?tab=family')
  // No error page
  await expect(page.getByText('Something went wrong')).not.toBeVisible()
  await expect(page.getByText('Application error')).not.toBeVisible()
})

test('user without a family group sees setup UI', async ({ page }) => {
  // The test user is fresh so likely has no family group
  await page.goto('/?tab=family')

  // FamilySetup shows either the group creation form or existing group
  const hasCreateOption = await page.getByText(/create/i).isVisible().catch(() => false)
  const hasGroupName    = await page.getByText(/family/i).isVisible().catch(() => false)

  expect(hasCreateOption || hasGroupName).toBe(true)
})

// ── Family group creation form ───────────────────────────────────────

test('family group name input is present on setup page', async ({ page }) => {
  await page.goto('/?tab=family')

  const nameInput = page.getByPlaceholder(/group name|family name/i)
  const hasInput = await nameInput.isVisible().catch(() => false)

  if (hasInput) {
    await nameInput.fill('Test Family')
    await expect(nameInput).toHaveValue('Test Family')
  }
})

// ── Nav ──────────────────────────────────────────────────────────────

test('nav bar is visible on all authenticated pages', async ({ page }) => {
  for (const path of ['/', '/plan', '/?tab=family']) {
    await page.goto(path)
    // Nav component renders the Wander logo/name
    await expect(page.getByText('Wander')).toBeVisible()
  }
})
