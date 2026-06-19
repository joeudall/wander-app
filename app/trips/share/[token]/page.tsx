import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TripDetail from '@/components/trip/TripDetail'

export default async function SharedTripPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('share_token', token)
    .single()

  if (!trip) notFound()

  return <TripDetail trip={trip} isShared />
}
