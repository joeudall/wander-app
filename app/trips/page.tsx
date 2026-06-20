import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import sql from '@/lib/db'
import TripsDashboard from '@/components/trip/TripsDashboard'
import { Trip } from '@/lib/schema'

export default async function TripsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const tripRows = await sql`SELECT * FROM trips WHERE user_id = ${session.user.id} ORDER BY created_at DESC`
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
