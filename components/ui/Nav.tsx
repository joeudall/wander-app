'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { StarIcon, getInitials } from '@/components/ui/Brand'

export default function Nav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showMenu, setShowMenu] = useState(false)

  // The login page has its own full-screen brand panel — no double logo.
  if (pathname === '/login') return null

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
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
        }}
      >
        <StarIcon />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '21px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
          Wander
        </span>
      </Link>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '28px' }}>
        <NavLink href="/" active={pathname === '/'}>Trips</NavLink>
        <NavLink href="/plan" active={pathname === '/plan'}>Plan a trip</NavLink>

        {!session?.user && (
          <Link
            href="/login"
            style={{ background: 'var(--accent)', color: '#FBF7F0', padding: '8px 18px', borderRadius: '999px', fontSize: '13.5px', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        )}

        {session?.user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              aria-label="Account menu"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#3A322A',
                color: '#F4EEE4',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {getInitials(session.user.email)}
            </button>
            {showMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setShowMenu(false)} />
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '44px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow)',
                  zIndex: 99,
                  minWidth: '180px',
                  padding: '6px',
                }}>
                  <div style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text3)', borderBottom: '1px solid var(--border)', marginBottom: '6px' }}>
                    {session.user.email}
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    style={{ width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: '14px', fontWeight: 500, color: 'var(--text)', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'var(--surface2)' }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'none' }}
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        fontSize: '14px',
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--text)' : '#8a8170',
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  )
}
