import { cookies } from 'next/headers'
import sql from '@/lib/db'
import { ANON_COOKIE, claimAnonTrips } from '@/lib/anon'
import TripsDashboard from '@/components/trip/TripsDashboard'
import { Trip } from '@/lib/schema'

/**
 * Shared server component behind both `/` (signed in) and `/trips`.
 *
 * Selects only the columns the trip cards actually render — NOT the full
 * plan JSON (which can be tens of KB per trip and was previously shipped
 * to the client in its entirety on every dashboard load).
 */
export default async function DashboardPage({ userId }: { userId: string }) {
  // Claim any trips generated anonymously on this device before listing.
  const anonId = (await cookies()).get(ANON_COOKIE)?.value
  if (anonId) await claimAnonTrips(userId, anonId)

  const tripRows = await sql`
    SELECT
      id, status, emoji, card_color, created_at, is_public, user_id, guidelines,
      jsonb_build_object(
        'destination', plan->'destination',
        'highlights', COALESCE(plan->'highlights', '[]'::jsonb)
      ) AS plan
    FROM trips
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
  const myTrips = tripRows as unknown as Trip[]

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px' }} className="dashboard-page">
      <TripsDashboard trips={myTrips} />
      <style>{`
        @media (max-width: 768px) {
          .dashboard-page { padding: 20px 18px 24px; }
        }
      `}</style>
    </div>
  )
}
