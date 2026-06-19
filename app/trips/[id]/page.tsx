import { notFound } from 'next/navigation'
import { SAMPLE_TRIPS } from '@/data/trips'
import TripDetail from '@/components/trip/TripDetail'

export function generateStaticParams() {
  return SAMPLE_TRIPS.map((trip) => ({ id: trip.id }))
}

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trip = SAMPLE_TRIPS.find((t) => t.id === id)
  if (!trip) notFound()
  return <TripDetail trip={trip} />
}
