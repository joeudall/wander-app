import type { Metadata, Viewport } from 'next'
import { Hanken_Grotesk, Schibsted_Grotesk } from 'next/font/google'
import './globals.css'
import Nav from '@/components/ui/Nav'
import MobileNav from '@/components/ui/MobileNav'
import Providers from '@/components/ui/Providers'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const fontBody = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const fontDisplay = Schibsted_Grotesk({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Wander — AI-Powered Trip Planning',
  description: 'Dream it and point you in the right direction. AI-powered trip planning for friends and family.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontBody.variable} ${fontDisplay.variable}`}>
      <body>
        <Providers>
          <div className="top-nav">
            <Nav />
          </div>
          <main>{children}</main>
          <MobileNav />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
