import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import DashboardPage from '@/components/trip/DashboardPage'

export default async function TripsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/trips')

  return <DashboardPage userId={session.user.id} />
}
