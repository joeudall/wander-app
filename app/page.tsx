import { auth } from '@/auth'
import DashboardPage from '@/components/trip/DashboardPage'
import LandingPage from '@/components/landing/LandingPage'

export default async function Home() {
  const session = await auth()

  // Public landing for visitors; dashboard for signed-in users.
  if (!session?.user?.id) return <LandingPage />
  return <DashboardPage userId={session.user.id} />
}
