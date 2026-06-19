'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
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
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '-0.3px',
          color: 'var(--text)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
        }}
      >
        ✈️ <span style={{ color: 'var(--accent)' }}>Trip</span>Planner
      </Link>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
        <NavBtn href="/" active={pathname === '/'}>My Trips</NavBtn>
        <NavBtn href="/plan" active={pathname === '/plan'}>Plan a Trip</NavBtn>
        <Link
          href="/plan"
          style={{
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: '8px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          + New Trip
        </Link>
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
