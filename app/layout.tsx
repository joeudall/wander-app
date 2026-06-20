import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/ui/Nav'
import { Analytics } from '@vercel/analytics/next'
import MobileNav from '@/components/ui/MobileNav'
import Providers from '@/components/ui/Providers'

export const metadata: Metadata = {
  title: 'Wander — AI-Powered Trip Planning',
  description: 'Dream it and point you in the right direction. AI-powered trip planning for friends and family.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <Analytics />
        <Providers>
          <div className="top-nav">
            <Nav />
          </div>
          <main>{children}</main>
          <MobileNav />
        </Providers>
      </body>
    </html>
  )
}
