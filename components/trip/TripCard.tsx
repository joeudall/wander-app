'use client'

import Link from 'next/link'
import { Trip } from '@/lib/schema'

const CARD_GRADIENTS: Record<string, string> = {
  blue: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
  green: 'linear-gradient(135deg, #14532d, #22c55e)',
  purple: 'linear-gradient(135deg, #4c1d95, #8b5cf6)',
  orange: 'linear-gradient(135deg, #7c2d12, #f97316)',
  gold: 'linear-gradient(135deg, #c7a96b, #e8c97a)',
}

const STATUS_BADGE: Record<string, { label: string; bg: string }> = {
  upcoming: { label: '● Upcoming', bg: 'rgba(34,197,94,0.3)' },
  past: { label: 'Completed', bg: 'rgba(255,255,255,0.15)' },
  planning: { label: '✦ Planning', bg: 'rgba(251,191,36,0.3)' },
}

export default function TripCard({ trip }: { trip: Trip }) {
  if (!trip.plan?.destination) {
    return (
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px 20px', textAlign: 'center', color: 'var(--text3)' }}>
        <div style={{ fontSize: '22px', marginBottom: '10px' }}>✦</div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text2)', marginBottom: '4px' }}>Generating trip plan…</div>
        <div style={{ fontSize: '13px' }}>Refresh to check status</div>
      </div>
    )
  }

  const badge = STATUS_BADGE[trip.status]
  const gradient = CARD_GRADIENTS[trip.cardColor] ?? CARD_GRADIENTS.blue
  const travelerText =
    trip.guidelines.travelersMax > trip.guidelines.travelersMin
      ? `${trip.guidelines.travelersMin}–${trip.guidelines.travelersMax} people`
      : `${trip.guidelines.travelersMin} ${trip.guidelines.travelersMin === 1 ? 'person' : 'people'}`

  return (
    <Link href={`/trips/${trip.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div className="trip-card-hover" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}>
        <div style={{ height: '160px', background: gradient, display: 'flex', alignItems: 'flex-end', padding: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: '48px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', opacity: 0.6 }}>
            {trip.emoji}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: badge.bg, backdropFilter: 'blur(4px)', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.3)', zIndex: 1 }}>
            {badge.label}
          </div>
        </div>
        <div style={{ padding: '18px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.2px', marginBottom: '4px' }}>
            {trip.plan.destination}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <span>📅 {trip.guidelines.targetMonthYear}</span>
            <span>👥 {travelerText}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(trip.plan.highlights ?? []).slice(0, 2).map((h, i) => (
              <span key={i} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '100px', fontWeight: 500, background: i === 0 ? 'var(--accent-light)' : 'var(--surface2)', color: i === 0 ? 'var(--accent)' : 'var(--text2)' }}>
                {h.length > 30 ? h.slice(0, 28) + '…' : h}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
