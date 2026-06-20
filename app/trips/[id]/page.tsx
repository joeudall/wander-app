import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import sql from '@/lib/db'
import TripDetail from '@/components/trip/TripDetail'
import { Trip } from '@/lib/schema'

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  const rows = await sql`SELECT * FROM trips WHERE id = ${id}`
  const trip = rows[0] as unknown as Trip | undefined

  if (!trip) notFound()

  const isOwner = session?.user?.id === trip.user_id

  // Public trips: anyone can view
  if (trip.is_public) {
    return <TripDetail trip={trip} isOwner={isOwner} />
  }

  // Private trip: must be logged in and be the owner
  if (!session?.user?.id) redirect(`/login?callbackUrl=/trips/${id}`)
  if (!isOwner) notFound()

  return <TripDetail trip={trip} isOwner={true} />
}
