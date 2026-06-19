'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Trip } from '@/lib/schema'
import TripDetail from '@/components/trip/TripDetail'
import Link from 'next/link'

function GeneratedTripContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    try {
      const raw = sessionStorage.getItem(`trip-${id}`)
      if (raw) setTrip(JSON.parse(raw))
    } catch {
      // sessionStorage unavailable or invalid
    }
    setLoading(false)
  }, [id])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text2)' }}>Loading your trip…</div>
  }

  if (!trip) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ color: 'var(--text2)', marginBottom: '16px' }}>Trip not found — it may have expired.</p>
        <Link href="/plan" style={{ color: 'var(--accent)' }}>Plan a new trip →</Link>
      </div>
    )
  }

  return <TripDetail trip={trip} />
}

export default function GeneratedTripPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text2)' }}>Loading…</div>}>
      <GeneratedTripContent />
    </Suspense>
  )
}
