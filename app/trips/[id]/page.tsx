import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import sql from '@/lib/db'
import TripDetail from '@/components/trip/TripDetail'
import { Trip } from '@/lib/schema'

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id

  // Fetch the trip
  const rows = await sql`SELECT * FROM trips WHERE id = ${id}`
  const trip = rows[0] as unknown as Trip | undefined
  if (!trip) notFound()

  const isOwner = userId === trip.user_id
  const isPublic = trip.is_public

  // Access control: public trips are visible to anyone; private trips require ownership or group membership
  if (!isPublic && !isOwner) {
    if (!userId) redirect(`/login?callbackUrl=/trips/${id}`)

    const sharedRows = await sql`
      SELECT t.id FROM trips t
      JOIN trip_shares ts ON ts.trip_id = t.id
      JOIN family_members fm ON fm.group_id = ts.group_id
      WHERE t.id = ${id} AND fm.user_id = ${userId}
      LIMIT 1
    `
    if (!sharedRows[0]) notFound()
  }

  return <TripDetail trip={trip} isOwner={isOwner} isShared={isPublic} isLoggedIn={!!userId} />
}
