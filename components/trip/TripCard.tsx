'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Trip } from '@/lib/schema'

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  upcoming: { label: '● Upcoming', bg: '#E3EDEC', color: '#265B5F' },
  past: { label: 'Completed', bg: 'rgba(234,223,205,0.9)', color: '#7A7163' },
  planning: { label: '✦ Planning', bg: 'rgba(240,223,204,0.9)', color: '#9E5A37' },
  taken: { label: '✓ Taken', bg: 'rgba(218,234,220,0.95)', color: '#2E6B3E' },
}

const MountainBanner = () => (
  <svg viewBox="0 0 340 128" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
    <rect width="340" height="128" fill="#EFE6D6" />
    <circle cx="60" cy="36" r="24" fill="#E7C6AC" />
    <path d="M0 128 L78 44 L150 128 Z" fill="#A7AB92" />
    <path d="M90 128 L190 24 L300 128 Z" fill="#838872" />
    <path d="M172 52 L190 24 L210 52 L196 44 L190 52 L182 44 Z" fill="#F4EEE4" />
    <path d="M220 128 L300 48 L340 128 Z" fill="#BFC1AC" />
    <rect y="118" width="340" height="10" fill="#6E7460" />
  </svg>
)

export default function TripCard({
  trip,
  onDelete,
  onMarkTaken,
}: {
  trip: Trip
  onDelete?: (id: string) => void
  onMarkTaken?: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await fetch(`/api/trips/${trip.id}`, { method: 'DELETE' })
      onDelete?.(trip.id)
    } finally {
      setLoading(false)
      setMenuOpen(false)
    }
  }

  async function handleMarkTaken() {
    setLoading(true)
    try {
      await fetch(`/api/trips/${trip.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'taken' }),
      })
      onMarkTaken?.(trip.id)
    } finally {
      setLoading(false)
      setMenuOpen(false)
    }
  }

  if (!trip.plan?.destination) {
    return (
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px 20px', textAlign: 'center', color: 'var(--text3)' }}>
        <div style={{ fontSize: '22px', marginBottom: '10px' }}>✦</div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text2)', marginBottom: '4px' }}>Generating trip plan…</div>
        <div style={{ fontSize: '13px' }}>Refresh to check status</div>
      </div>
    )
  }

  const badge = STATUS_BADGE[trip.status] ?? STATUS_BADGE.planning
  const travelerText =
    trip.guidelines.travelersMax > trip.guidelines.travelersMin
      ? `${trip.guidelines.travelersMin}–${trip.guidelines.travelersMax} travelers`
      : `${trip.guidelines.travelersMin} ${trip.guidelines.travelersMin === 1 ? 'traveler' : 'travelers'}`

  return (
    <div style={{ position: 'relative' }}>
      {/* Main card — fully clickable link */}
      <Link href={`/trips/${trip.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div className="trip-card-hover" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}>
          <div style={{ height: '128px', position: 'relative' }}>
            <MountainBanner />
            <span style={{ position: 'absolute', top: '12px', left: '12px', background: badge.bg, color: badge.color, borderRadius: '999px', padding: '5px 12px', fontSize: '11.5px', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
              {badge.label}
            </span>
            <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '28px', lineHeight: 1 }}>
              {trip.emoji}
            </span>
          </div>

          <div style={{ padding: '16px 18px 44px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '18px', letterSpacing: '-0.02em', margin: '0 0 5px' }}>
              {trip.plan.destination}
            </h3>
            <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
              {trip.guidelines.targetMonthYear || trip.guidelines.startDate
                ? `${trip.guidelines.targetMonthYear || trip.guidelines.startDate} · `
                : ''}
              {travelerText}
            </div>

            {(trip.plan.highlights ?? []).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                {(trip.plan.highlights ?? []).slice(0, 2).map((h, i) => (
                  <span key={i} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '100px', fontWeight: 500, background: i === 0 ? 'var(--accent-light)' : 'var(--surface2)', color: i === 0 ? 'var(--accent)' : 'var(--text2)' }}>
                    {h.length > 30 ? h.slice(0, 28) + '…' : h}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Actions — sibling of Link so clicks don't navigate */}
      <div style={{ position: 'absolute', bottom: '14px', right: '14px', zIndex: 2 }}>
        <button
          onClick={() => setMenuOpen((p) => !p)}
          disabled={loading}
          aria-label="Trip actions"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            width: '30px',
            height: '28px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text3)',
            fontSize: '15px',
            padding: 0,
            fontFamily: 'inherit',
            opacity: loading ? 0.5 : 1,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            letterSpacing: '0.04em',
          }}
        >
          ···
        </button>

        {menuOpen && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 5 }}
              onClick={() => setMenuOpen(false)}
            />
            <div style={{
              position: 'absolute',
              bottom: 'calc(100% + 6px)',
              right: 0,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              padding: '6px',
              minWidth: '164px',
              zIndex: 10,
            }}>
              {trip.status !== 'taken' && (
                <button
                  onClick={handleMarkTaken}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 12px', borderRadius: '7px', cursor: 'pointer', fontSize: '13.5px', fontFamily: 'inherit', color: 'var(--text)', fontWeight: 500 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  ✓ Mark as taken
                </button>
              )}
              <button
                onClick={handleDelete}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 12px', borderRadius: '7px', cursor: 'pointer', fontSize: '13.5px', fontFamily: 'inherit', color: 'var(--red)', fontWeight: 500 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--red-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                Delete trip
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
