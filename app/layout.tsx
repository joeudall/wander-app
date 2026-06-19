import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/ui/Nav'

export const metadata: Metadata = {
  title: 'TripPlanner — AI-Powered Travel Plans',
  description: 'Dream it and point you in the right direction. AI-powered trip planning for friends and family.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}
