import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import sql from '@/lib/db'
import TripCard from '@/components/trip/TripCard'
import FamilySetup from '@/components/family/FamilySetup'
import { Trip } from '@/lib/schema'

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function Dashboard({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { tab = 'my' } = await searchParams

  const tripRows = await sql`SELECT * FROM trips WHERE user_id = ${session.user.id} ORDER BY created_at DESC`
  const myTrips = tripRows as unknown as Trip[]

  const groupRows = await sql`
    SELECT fg.*, fm.role FROM family_groups fg
    JOIN family_members fm ON fm.group_id = fg.id
    WHERE fm.user_id = ${session.user.id}
    LIMIT 1
  `
  const familyGroup = groupRows[0] ? { id: String(groupRows[0].id), name: String(groupRows[0].name), role: String(groupRows[0].role) } : null

  let familyTrips: (Trip & { ownerEmail: string })[] = []
  if (familyGroup && tab === 'family') {
    const sharedRows = await sql`
      SELECT t.*, u.email as owner_email
      FROM trips t
      JOIN trip_shares ts ON ts.trip_id = t.id
      JOIN users u ON u.id = t.user_id
      WHERE ts.group_id = ${familyGroup.id}
      ORDER BY t.created_at DESC
    `
    familyTrips = sharedRows as unknown as (Trip & { ownerEmail: string })[]
  }

  const upcoming = myTrips.filter((t) => t.status === 'upcoming')
  const planning = myTrips.filter((t) => t.status === 'planning')
  const past = myTrips.filter((t) => t.status === 'past')

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px' }}>

      {/* Header row */}
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

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '36px' }}>
        <TabBtn href="/?tab=my" active={tab !== 'family'} label="My Trips" count={myTrips.length} />
        <TabBtn href="/?tab=family" active={tab === 'family'} label={familyGroup?.name ?? 'Family'} count={null} />
      </div>

      {/* My Trips tab */}
      {tab !== 'family' && (
        <>
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
        </>
      )}

      {/* Family tab */}
      {tab === 'family' && (
        <FamilySetup group={familyGroup} trips={familyTrips} userId={session.user.id!} />
      )}
    </div>
  )
}

function TabBtn({ href, active, label, count }: { href: string; active: boolean; label: string; count: number | null }) {
  return (
    <Link
      href={href}
      style={{
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--accent)' : 'var(--text2)',
        borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '-1px',
        transition: 'color 0.15s',
      }}
    >
      {label}
      {count !== null && (
        <span style={{ background: active ? 'var(--accent-light)' : 'var(--surface2)', color: active ? 'var(--accent)' : 'var(--text3)', fontSize: '12px', fontWeight: 600, padding: '1px 7px', borderRadius: '100px' }}>
          {count}
        </span>
      )}
    </Link>
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
