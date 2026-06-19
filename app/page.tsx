import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TripCard from '@/components/trip/TripCard'
import { Trip } from '@/lib/schema'
import LogoutButton from '@/components/ui/LogoutButton'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const allTrips: Trip[] = trips ?? []
  const upcoming = allTrips.filter((t) => t.status === 'upcoming')
  const past = allTrips.filter((t) => t.status === 'past')
  const planning = allTrips.filter((t) => t.status === 'planning')

  return (
    <>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #3b82f6 100%)', color: 'white', padding: '56px 24px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '10px' }}>
          Your Family&apos;s Adventures
        </h1>
        <p style={{ fontSize: '17px', opacity: 0.8, maxWidth: '480px', margin: '0 auto 28px' }}>
          Plan, organize, and relive every trip — from the first idea to the last memory.
        </p>
        <Link href="/plan" style={{ background: 'white', color: 'var(--accent)', border: 'none', padding: '13px 28px', borderRadius: '100px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', textDecoration: 'none', display: 'inline-block' }}>
          Plan a New Trip →
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>

        {/* User + logout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text2)' }}>Signed in as <strong>{user.email}</strong></div>
          <LogoutButton />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '48px' }}>
          {[
            { num: allTrips.length, label: 'Trips saved' },
            { num: allTrips.filter(t => t.guidelines?.domesticOrInternational === 'international').length, label: 'International' },
            { num: allTrips.reduce((sum, t) => sum + (t.guidelines?.travelersMin ?? 0), 0) || 0, label: 'Travelers planned' },
            { num: upcoming.length, label: 'Upcoming' },
          ].map(({ num, label }) => (
            <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--accent)' }}>{num}</div>
              <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        {allTrips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text2)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>No trips yet</h2>
            <p style={{ marginBottom: '24px' }}>Generate your first AI trip plan to get started.</p>
            <Link href="/plan" style={{ background: 'var(--accent)', color: 'white', padding: '12px 24px', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
              Plan a Trip →
            </Link>
          </div>
        )}

        {upcoming.length > 0 && (
          <>
            <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.2px', marginBottom: '20px' }}>Upcoming</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '48px' }}>
              {upcoming.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </div>
          </>
        )}

        {planning.length > 0 && (
          <>
            <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.2px', marginBottom: '20px' }}>In Planning</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '48px' }}>
              {planning.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </div>
          </>
        )}

        {past.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.2px' }}>Past Trips</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '48px' }}>
              {past.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </div>
          </>
        )}
      </div>
    </>
  )
}
