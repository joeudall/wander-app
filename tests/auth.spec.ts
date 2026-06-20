/**
 * auth.spec.ts
 *
 * Tests: signup, login (success + failure), redirect behavior.
 * These are the flows most likely to break when auth config changes.
 */

import { test, expect } from '@playwright/test'
import { ensureTestUser, loginAs, EMAIL, PASSWORD } from './helpers/auth'

test.beforeAll(async () => {
  await ensureTestUser()
})

// ── Login ────────────────────────────────────────────────────────────

test('login page loads', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByText('Welcome back')).toBeVisible()
  await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
})

test('login with correct credentials redirects to dashboard', async ({ page }) => {
  await loginAs(page)
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'My Trips' })).toBeVisible()
})

test('login with wrong password shows error message', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Sign in' }).first().click()
  await page.getByPlaceholder('you@example.com').fill(EMAIL)
  await page.getByPlaceholder('••••••••').fill('wrongpassword')
  await page.getByRole('button', { name: 'Sign in' }).last().click()

  await expect(page.getByText('Invalid email or password')).toBeVisible()
  await expect(page).toHaveURL('/login') // should not have redirected
})

test('login with empty password is blocked by form validation', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('you@example.com').fill(EMAIL)
  // Don't fill password
  await page.getByRole('button', { name: 'Sign in' }).last().click()

  // HTML5 validation prevents submit — still on login page
  await expect(page).toHaveURL('/login')
})

// ── Signup ───────────────────────────────────────────────────────────

test('signup tab is visible and toggles the form', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByText('Create your account')).toBeVisible()
  await expect(page.getByPlaceholder('At least 8 characters')).toBeVisible()
})

test('signup with already-taken email shows error', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.getByPlaceholder('you@example.com').fill(EMAIL) // already exists
  await page.getByPlaceholder('At least 8 characters').fill(PASSWORD)
  await page.getByRole('button', { name: 'Create account' }).last().click()

  await expect(page.getByText('already exists')).toBeVisible()
})

test('signup with short password shows error', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.getByPlaceholder('you@example.com').fill('newuser@example.com')
  await page.getByPlaceholder('At least 8 characters').fill('short') // < 8 chars

  // HTML5 minLength validation kicks in before the API call
  await page.getByRole('button', { name: 'Create account' }).last().click()
  await expect(page).toHaveURL('/login')
})

// ── Auth guard ───────────────────────────────────────────────────────

test('unauthenticated user is redirected to login from dashboard', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login/)
})

test('unauthenticated user is redirected to login from plan page', async ({ page }) => {
  await page.goto('/plan')
  await expect(page).toHaveURL(/\/login/)
})
