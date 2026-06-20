'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Trip } from '@/lib/schema'
import TripCard from './TripCard'

type Filter = 'all' | 'upcoming' | 'past' | 'planning' | 'taken'

function getInitials(email: string | null | undefined): string {
  if (!email) return '?'
  const parts = email.split('@')[0].split(/[._-]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

const StarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
    <path d="M16 1 L19.2 12.8 L31 16 L19.2 19.2 L16 31 L12.8 19.2 L1 16 L12.8 12.8 Z" fill="#2F6E73" />
  </svg>
)

export default function TripsDashboard({ trips: initialTrips }: { trips: Trip[] }) {
  const { data: session } = useSession()
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [filter, setFilter] = useState<Filter>('all')

  const upcoming = trips.filter((t) => t.status === 'upcoming')
  const planning = trips.filter((t) => t.status === 'planning')
  const past = trips.filter((t) => t.status === 'past')
  const taken = trips.filter((t) => t.status === 'taken')

  const filtered = filter === 'all' ? trips
    : filter === 'upcoming' ? upcoming
    : filter === 'past' ? past
    : filter === 'taken' ? taken
    : planning

  function handleDelete(id: string) {
    setTrips((prev) => prev.filter((t) => t.id !== id))
  }

  function handleMarkTaken(id: string) {
    setTrips((prev) => prev.map((t) => t.id === id ? { ...t, status: 'taken' as const } : t))
  }

  return (
    <>
      {/* Mobile header */}
      <div className="mobile-dash-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <StarIcon />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: 700, letterSpacing: '-0.02em' }}>Wander</span>
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#3A322A', color: '#F4EEE4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
            {getInitials(session?.user?.email)}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '13px', padding: '14px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600 }}>{trips.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>Trips</div>
          </div>
          <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '13px', padding: '14px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600 }}>{planning.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>Planning</div>
          </div>
          <div style={{ flex: 1, background: 'var(--accent)', borderRadius: '13px', padding: '14px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: '#F4EEE4' }}>{upcoming.length}</div>
            <div style={{ fontSize: '11px', color: 'rgba(235,250,248,0.75)', marginTop: '2px' }}>Upcoming</div>
          </div>
        </div>
      </div>

      {/* Desktop header */}
      <div className="desktop-dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, letterSpacing: '-0.025em', margin: 0 }}>
            My Trips
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text2)', marginTop: '6px' }}>{session?.user?.email}</p>
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

      {trips.length === 0 ? (
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
          {/* Filter pills */}
          <div className="filter-pills">
            {(['all', 'upcoming', 'planning', 'taken', 'past'] as Filter[]).map((f) => {
              const labels: Record<Filter, string> = { all: 'All', upcoming: 'Upcoming', planning: 'Planning', past: 'Past', taken: 'Taken' }
              const counts: Record<Filter, number> = { all: trips.length, upcoming: upcoming.length, planning: planning.length, past: past.length, taken: taken.length }
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? 'var(--accent)' : 'var(--surface)',
                    color: filter === f ? '#F4EEE4' : 'var(--text2)',
                    border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '999px',
                    padding: '7px 15px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {labels[f]}{counts[f] > 0 && filter !== f ? ` · ${counts[f]}` : ''}
                </button>
              )
            })}
          </div>

          {/* Desktop sectioned view */}
          <div className="desktop-sections">
            {upcoming.length > 0 && <TripSection title="Upcoming" trips={upcoming} onDelete={handleDelete} onMarkTaken={handleMarkTaken} />}
            {planning.length > 0 && <TripSection title="In Planning" trips={planning} onDelete={handleDelete} onMarkTaken={handleMarkTaken} />}
            {taken.length > 0 && <TripSection title="Taken" trips={taken} onDelete={handleDelete} onMarkTaken={handleMarkTaken} />}
            {past.length > 0 && <TripSection title="Past Trips" trips={past} onDelete={handleDelete} onMarkTaken={handleMarkTaken} />}
          </div>

          {/* Mobile filtered list */}
          <div className="mobile-list">
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text3)', fontSize: '14px' }}>
                No {filter === 'all' ? '' : filter} trips yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filtered.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onDelete={handleDelete} onMarkTaken={handleMarkTaken} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* FAB — mobile only */}
      <Link
        href="/plan"
        className="mobile-fab"
        aria-label="Plan a new trip"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5 V19 M5 12 H19" stroke="#F4EEE4" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </Link>

      <style>{`
        .mobile-dash-header { display: none; }
        .desktop-dash-header { display: flex; }
        .filter-pills { display: none; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .mobile-list { display: none; }
        .desktop-sections { display: block; }
        .mobile-fab { display: none; }

        @media (max-width: 768px) {
          .mobile-dash-header { display: block; }
          .desktop-dash-header { display: none !important; }
          .filter-pills { display: flex; }
          .mobile-list { display: block; }
          .desktop-sections { display: none; }
          .mobile-fab {
            display: flex;
            position: fixed;
            right: 20px;
            bottom: 86px;
            width: 54px;
            height: 54px;
            border-radius: 50%;
            background: var(--accent);
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 20px rgba(47,110,115,.34);
            z-index: 140;
          }
        }
      `}</style>
    </>
  )
}

function TripSection({
  title,
  trips,
  onDelete,
  onMarkTaken,
}: {
  title: string
  trips: Trip[]
  onDelete: (id: string) => void
  onMarkTaken: (id: string) => void
}) {
  return (
    <div style={{ marginBottom: '44px' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '16px' }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} onDelete={onDelete} onMarkTaken={onMarkTaken} />
        ))}
      </div>
    </div>
  )
}
