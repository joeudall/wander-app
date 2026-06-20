/**
 * share.spec.ts
 *
 * Tests: trip sharing toggle, public URL accessible without login,
 * unshared trip blocked for logged-out user.
 *
 * Uses a seeded trip (inserted directly into DB) to avoid running the AI wizard.
 */

import { test, expect, request } from '@playwright/test'
import { ensureTestUser, loginAs, EMAIL, BASE_URL } from './helpers/auth'
import { seedTrip, deleteSeedTrip, getTestUserId, unshareTrip } from './helpers/seed'

let tripId: string

test.beforeAll(async () => {
  await ensureTestUser()
  const userId = await getTestUserId(EMAIL)
  if (!userId) throw new Error('Test user not found in DB')
  tripId = await seedTrip(userId)
})

test.afterAll(async () => {
  if (tripId) await deleteSeedTrip(tripId)
})

// ── API-level share tests (fast, no browser needed) ──────────────────

test('unauthenticated POST to share endpoint returns 401', async () => {
  const ctx = await request.newContext({ baseURL: BASE_URL })
  const res = await ctx.post(`/api/trips/${tripId}/share`)
  expect(res.status()).toBe(401)
  await ctx.dispose()
})

test('unauthenticated DELETE to share endpoint returns 401', async () => {
  const ctx = await request.newContext({ baseURL: BASE_URL })
  const res = await ctx.delete(`/api/trips/${tripId}/share`)
  expect(res.status()).toBe(401)
  await ctx.dispose()
})

// ── UI-level share tests ─────────────────────────────────────────────

test('trip detail page loads when logged in', async ({ page }) => {
  await loginAs(page)
  await page.goto(`/trips/${tripId}`)
  await expect(page.getByRole('heading', { name: 'Maui, Hawaii' })).toBeVisible()
})

test('owner can share a trip via the share button', async ({ page }) => {
  await loginAs(page)
  await page.goto(`/trips/${tripId}`)

  // Button text when unshared is "Share link"
  const shareBtn = page.getByRole('button', { name: /Share link/i })
  await expect(shareBtn).toBeVisible()
  await shareBtn.click()

  // After sharing, button becomes "Shared — copy link"
  await expect(page.getByRole('button', { name: /Shared — copy link/i })).toBeVisible({ timeout: 5_000 })
})

test('shared trip is accessible without login', async ({ page, context }) => {
  // First, share the trip as the owner
  await loginAs(page)
  await page.goto(`/trips/${tripId}`)
  const shareBtn = page.getByRole('button', { name: /Share link/i })
  if (await shareBtn.isVisible()) {
    await shareBtn.click()
    await page.waitForTimeout(500)
  }

  // Now open the trip URL in a fresh browser context (no session)
  const guestContext = await context.browser()!.newContext()
  const guestPage = await guestContext.newPage()
  await guestPage.goto(`/trips/${tripId}`)

  // Public trip should show the destination, not redirect to login
  await expect(guestPage.getByRole('heading', { name: 'Maui, Hawaii' })).toBeVisible({ timeout: 8_000 })
  await guestContext.close()
})

test('unshared trip redirects logged-out user to login', async ({ context }) => {
  // Reset trip to unshared state directly via DB
  await unshareTrip(tripId)

  // Try to access as a guest
  const guestContext = await context.browser()!.newContext()
  const guestPage = await guestContext.newPage()
  await guestPage.goto(`/trips/${tripId}`)

  // Should redirect to login (not show the trip)
  await expect(guestPage).toHaveURL(/\/login/, { timeout: 8_000 })
  await guestContext.close()
})

// ── Trip page tabs ───────────────────────────────────────────────────

test('trip detail tabs render without error', async ({ page }) => {
  await loginAs(page)
  await page.goto(`/trips/${tripId}`)

  const tabs = ['Itinerary', 'Bookings', 'Food Guide', 'Tips']
  for (const tab of tabs) {
    await page.getByRole('button', { name: tab }).click()
    await expect(page.getByText('Something went wrong')).not.toBeVisible()
  }
})
