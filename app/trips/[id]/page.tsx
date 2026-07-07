import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { auth } from '@/auth'
import sql from '@/lib/db'
import { ANON_COOKIE, claimAnonTrips } from '@/lib/anon'
import TripDetail from '@/components/trip/TripDetail'
import { Trip } from '@/lib/schema'

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const anonId = (await cookies()).get(ANON_COOKIE)?.value

  // If they just signed in with unclaimed guest trips, claim them first
  // (e.g. arriving back here via the claim banner's login redirect).
  if (session?.user?.id && anonId) {
    await claimAnonTrips(session.user.id, anonId)
  }

  const rows = await sql`SELECT * FROM trips WHERE id = ${id}`
  const trip = rows[0] as unknown as Trip | undefined

  if (!trip) notFound()

  const isOwner = !!session?.user?.id && session.user.id === trip.user_id
  const isGuestCreator = !trip.user_id && !!anonId && trip.anon_id === anonId

  // Viewable: public trips, the owner, or the guest who created it on this device
  if (trip.is_public || isOwner || isGuestCreator) {
    return (
      <TripDetail
        trip={trip}
        isOwner={isOwner}
        claimable={isGuestCreator && !session?.user?.id}
      />
    )
  }

  // Private trip, no access: friendly explainer instead of a login bounce
  // (previously recipients of an unshared link were sent to signup, then 404'd).
  return <PrivateTripScreen tripId={id} signedIn={!!session?.user?.id} />
}

function PrivateTripScreen({ tripId, signedIn }: { tripId: string; signedIn: boolean }) {
  return (
    <div style={{ maxWidth: '440px', margin: '96px auto', padding: '0 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '44px', marginBottom: '16px' }}>🔒</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
        This trip is private
      </h1>
      <p style={{ color: 'var(--text2)', fontSize: '15px', lineHeight: 1.55, margin: '0 0 28px' }}>
        {signedIn
          ? 'The person who planned it hasn’t shared it yet. Ask them to hit “Share link” on the trip.'
          : 'If this is your trip, sign in to view it. Otherwise, ask the person who planned it to hit “Share link” and send you a fresh link.'}
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {!signedIn && (
          <Link
            href={`/login?callbackUrl=/trips/${tripId}`}
            style={{ background: 'var(--accent)', color: '#FBF7F0', padding: '12px 22px', borderRadius: '10px', fontSize: '14.5px', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        )}
        <Link
          href="/"
          style={{ background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)', padding: '12px 22px', borderRadius: '10px', fontSize: '14.5px', fontWeight: 600, textDecoration: 'none' }}
        >
          {signedIn ? 'Back to my trips' : 'Plan your own trip'}
        </Link>
      </div>
    </div>
  )
}
