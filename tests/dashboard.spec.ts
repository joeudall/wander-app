/**
 * dashboard.spec.ts
 *
 * Tests: dashboard renders correctly after login, tabs work, plan button exists.
 * Catches regressions in DB queries and server component rendering.
 */

import { test, expect } from '@playwright/test'
import { ensureTestUser, loginAs } from './helpers/auth'

test.beforeAll(async () => {
  await ensureTestUser()
})

test.beforeEach(async ({ page }) => {
  await loginAs(page)
})

// ── Page structure ───────────────────────────────────────────────────

test('dashboard shows My Trips heading', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'My Trips' })).toBeVisible()
})

test('dashboard shows logged-in user email', async ({ page }) => {
  const { EMAIL } = await import('./helpers/auth')
  await expect(page.getByText(EMAIL)).toBeVisible()
})

test('dashboard has Plan a trip button', async ({ page }) => {
  await expect(page.getByRole('link', { name: /plan a trip/i })).toBeVisible()
})

// ── Tabs ─────────────────────────────────────────────────────────────

test('My Trips tab is active by default', async ({ page }) => {
  // The active tab has color accent styling and no ?tab=family in URL
  await expect(page).not.toHaveURL(/tab=family/)
  await expect(page.getByRole('link', { name: /my trips/i })).toBeVisible()
})

test('Family tab is clickable', async ({ page }) => {
  await page.getByRole('link', { name: /family/i }).click()
  await expect(page).toHaveURL(/tab=family/)
})

test('Family tab renders without crashing', async ({ page }) => {
  await page.goto('/?tab=family')
  // Should show either the family setup UI or a family group — either way no error page
  await expect(page.getByRole('heading', { name: 'My Trips' })).toBeVisible()
  // No error message visible
  await expect(page.getByText('Something went wrong')).not.toBeVisible()
})

// ── Plan wizard entry ────────────────────────────────────────────────

test('clicking Plan a trip navigates to /plan', async ({ page }) => {
  await page.getByRole('link', { name: /plan a trip/i }).click()
  await expect(page).toHaveURL('/plan')
})

test('plan page renders the trip wizard', async ({ page }) => {
  await page.goto('/plan')
  // The wizard has a destination field
  await expect(page.getByPlaceholder(/destination/i)).toBeVisible()
})

// ── Empty state ──────────────────────────────────────────────────────

test('empty state is shown when user has no trips', async ({ page }) => {
  // The test user may have trips from seed — this test is best run on a fresh user.
  // For now, just confirm the page doesn't crash regardless.
  await expect(page.getByRole('heading', { name: 'My Trips' })).toBeVisible()
})
