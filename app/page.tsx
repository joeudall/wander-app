import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import sql from '@/lib/db'
import TripCard from '@/components/trip/TripCard'
import { Trip } from '@/lib/schema'

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const tripRows = await sql`SELECT * FROM trips WHERE user_id = ${session.user.id} ORDER BY created_at DESC`
  const myTrips = tripRows as unknown as Trip[]

  const upcoming = myTrips.filter((t) => t.status === 'upcoming')
  const planning = myTrips.filter((t) => t.status === 'planning')
  const past = myTrips.filter((t) => t.status === 'past')

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, letterSpacing: '-0.025em', margin: 0 }}>
            My Trips
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text2)', marginTop: '6px' }}>{session.user.email}</p>
        </div>
        <Link
          href="/plan"
          style={{
            background: 'var(--accent)',
            color: '#FBF7F0',
            padding: '11px 22px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(47,110,115,.2)',
          }}
        >
          + Plan a trip
        </Link>
      </div>

      {myTrips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text2)' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🗺️</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>No trips yet</h2>
          <p style={{ marginBottom: '24px', fontSize: '15px' }}>Generate your first AI-powered trip plan to get started.</p>
          <Link href="/plan" style={{ background: 'var(--accent)', color: '#FBF7F0', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            Plan a Trip →
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && <TripSection title="Upcoming" trips={upcoming} />}
          {planning.length > 0 && <TripSection title="In Planning" trips={planning} />}
          {past.length > 0 && <TripSection title="Past Trips" trips={past} />}
        </>
      )}
    </div>
  )
}

function TripSection({ title, trips }: { title: string; trips: Trip[] }) {
  return (
    <div style={{ marginBottom: '44px' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '16px' }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
      </div>
    </div>
  )
}
