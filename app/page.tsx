import Link from 'next/link'
import { SAMPLE_TRIPS } from '@/data/trips'
import TripCard from '@/components/trip/TripCard'

export default function Dashboard() {
  const upcoming = SAMPLE_TRIPS.filter((t) => t.status === 'upcoming')
  const past = SAMPLE_TRIPS.filter((t) => t.status === 'past')

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

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '48px' }}>
          {[
            { num: SAMPLE_TRIPS.length, label: 'Trips saved' },
            { num: 2, label: 'Countries visited' },
            { num: 16, label: 'Travelers' },
            { num: upcoming.length, label: 'Upcoming' },
          ].map(({ num, label }) => (
            <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--accent)' }}>{num}</div>
              <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <>
            <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.2px', marginBottom: '20px' }}>Upcoming</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '48px' }}>
              {upcoming.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </div>
          </>
        )}

        {/* Past */}
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
