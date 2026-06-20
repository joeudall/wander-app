import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import sql from '@/lib/db'
import TripDetail from '@/components/trip/TripDetail'
import { Trip } from '@/lib/schema'

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) notFound()

  const userId = session.user.id

  // Check direct ownership
  const ownedRows = await sql`SELECT * FROM trips WHERE id = ${id} AND user_id = ${userId}`
  let trip = ownedRows[0] as unknown as Trip | undefined
  let isOwner = !!trip

  if (!trip) {
    // Check if trip is shared to user's group
    const sharedRows = await sql`
      SELECT t.* FROM trips t
      JOIN trip_shares ts ON ts.trip_id = t.id
      JOIN family_members fm ON fm.group_id = ts.group_id
      WHERE t.id = ${id} AND fm.user_id = ${userId}
      LIMIT 1
    `
    trip = sharedRows[0] as unknown as Trip | undefined
  }

  if (!trip) notFound()

  // Check if trip is already shared with user's group
  const shareRows = await sql`
    SELECT 1 FROM trip_shares ts
    JOIN family_members fm ON fm.group_id = ts.group_id
    WHERE ts.trip_id = ${id} AND fm.user_id = ${userId}
    LIMIT 1
  `
  const isShared = shareRows.length > 0

  return <TripDetail trip={trip} isOwner={isOwner} isShared={isShared} />
}
