import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/ui/Nav'
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
          <Nav />
          <main>{children}</main>
          <footer style={{ padding: '24px 40px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text3)', textAlign: 'center' }}>
            This site contains affiliate links. We may earn a small commission if you book through them — at no extra cost to you. It helps keep Wander free.
          </footer>
        </Providers>
      </body>
    </html>
  )
}
