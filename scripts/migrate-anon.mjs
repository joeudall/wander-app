/**
 * migrate-anon.mjs — adds anonymous-trip support to the trips table.
 *
 * Run once from the trip-planner folder:
 *   node scripts/migrate-anon.mjs
 *
 * Safe + idempotent: additive column, drops NOT NULL on user_id.
 */
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

let url = process.env.DATABASE_URL
if (!url) {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  url = env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '')
}
if (!url) {
  console.error('DATABASE_URL not found in env or .env.local')
  process.exit(1)
}

const sql = neon(url)

console.log('Running migration…')
await sql`ALTER TABLE trips ADD COLUMN IF NOT EXISTS anon_id TEXT`
await sql`ALTER TABLE trips ADD COLUMN IF NOT EXISTS ip_hash TEXT`
await sql`ALTER TABLE trips ALTER COLUMN user_id DROP NOT NULL`
await sql`CREATE INDEX IF NOT EXISTS trips_anon_id_idx ON trips (anon_id) WHERE anon_id IS NOT NULL`
await sql`CREATE INDEX IF NOT EXISTS trips_ip_hash_idx ON trips (ip_hash) WHERE ip_hash IS NOT NULL`
const cols = await sql`SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'trips' AND column_name IN ('user_id', 'anon_id')`
console.log('Done:', JSON.stringify(cols))
