'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 11 L12 4 L21 11" stroke={active ? '#2F6E73' : '#A8A091'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 10 V20 H19 V10" stroke={active ? '#2F6E73' : '#A8A091'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const PlanIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={active ? '#2F6E73' : '#A8A091'} strokeWidth="2" />
    <path d="M12 8 V16 M8 12 H16" stroke={active ? '#2F6E73' : '#A8A091'} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const YouIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={active ? '#2F6E73' : '#A8A091'} strokeWidth="2" />
    <path d="M5 20 C5 16 8 14 12 14 C16 14 19 16 19 20" stroke={active ? '#2F6E73' : '#A8A091'} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export default function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showMenu, setShowMenu] = useState(false)

  if (!session?.user) return null

  const isHome = pathname === '/' || pathname.startsWith('/trips')
  const isPlan = pathname === '/plan'

  return (
    <nav className="mobile-nav">
      <Link href="/" className={`mobile-tab${isHome ? ' active' : ''}`}>
        <HomeIcon active={isHome} />
        <span>Trips</span>
      </Link>
      <Link href="/plan" className={`mobile-tab${isPlan ? ' active' : ''}`}>
        <PlanIcon active={isPlan} />
        <span>Plan</span>
      </Link>
      <button
        type="button"
        className={`mobile-tab${showMenu ? ' active' : ''}`}
        onClick={() => setShowMenu((v) => !v)}
      >
        <YouIcon active={showMenu} />
        <span>You</span>
      </button>

      {showMenu && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 148 }} onClick={() => setShowMenu(false)} />
          <div style={{ position: 'fixed', bottom: '80px', right: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow)', zIndex: 149, minWidth: '200px', padding: '6px' }}>
            <div style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text3)', borderBottom: '1px solid var(--border)', marginBottom: '6px' }}>
              {session.user.email}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{ width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: '14px', fontWeight: 500, color: 'var(--text)', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </nav>
  )
}
