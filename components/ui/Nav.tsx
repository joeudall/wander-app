'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/ui/LogoutButton'

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        height: '60px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
        }}
      >
        Wander
      </Link>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <NavBtn href="/" active={pathname === '/'}>My Trips</NavBtn>
        <NavBtn href="/plan" active={pathname === '/plan'}>Plan a Trip</NavBtn>
        <Link
          href="/plan"
          style={{
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            padding: '8px 18px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: '8px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            letterSpacing: '0.01em',
          }}
        >
          + New Trip
        </Link>
        <div style={{ marginLeft: '12px', paddingLeft: '12px', borderLeft: '1px solid var(--border)' }}>
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}

function NavBtn({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        background: active ? 'var(--accent-light)' : 'none',
        color: active ? 'var(--accent)' : 'var(--text2)',
        border: 'none',
        padding: '8px 14px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {children}
    </Link>
  )
}
