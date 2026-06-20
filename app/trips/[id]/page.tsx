import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import sql from '@/lib/db'
import TripDetail from '@/components/trip/TripDetail'
import { Trip } from '@/lib/schema'

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect(`/login?callbackUrl=/trips/${id}`)

  const rows = await sql`SELECT * FROM trips WHERE id = ${id} AND user_id = ${session.user.id}`
  const trip = rows[0] as unknown as Trip | undefined

  if (!trip) notFound()

  return <TripDetail trip={trip} />
}
