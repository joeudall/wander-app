import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/ui/Nav'
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
