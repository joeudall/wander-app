import { createHash } from 'crypto'
import sql from '@/lib/db'

/** Cookie that identifies a guest planner before they create an account. */
export const ANON_COOKIE = 'wander_anon'

/** Max trips a guest can generate per rolling 24h (per anon cookie). */
export const ANON_DAILY_LIMIT = 3

/** Max guest generations per rolling 24h per IP (cookie deletion doesn't reset this). */
export const IP_DAILY_LIMIT = 10

/** Salted hash of the caller's IP — never store raw IPs. */
export function hashIp(ip: string): string {
  return createHash('sha256')
    .update(`${process.env.AUTH_SECRET ?? 'wander'}:${ip}`)
    .digest('hex')
    .slice(0, 32)
}

/**
 * Attach any trips created anonymously on this device to the signed-in user.
 * Called lazily from server components when both a session and the anon
 * cookie are present. Idempotent; no-op once trips are claimed.
 */
export async function claimAnonTrips(userId: string, anonId: string) {
  try {
    await sql`
      UPDATE trips SET user_id = ${userId}, anon_id = NULL
      WHERE anon_id = ${anonId} AND user_id IS NULL
    `
  } catch (err) {
    // Column may not exist yet (migration not run) — never break page render.
    console.warn('claimAnonTrips skipped:', err instanceof Error ? err.message : err)
  }
}
