import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TripDetail from '@/components/trip/TripDetail'

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single()

  if (!trip) notFound()

  return <TripDetail trip={trip} />
}
