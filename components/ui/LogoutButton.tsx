'use client'

import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      style={{ background: 'none', border: '1.5px solid var(--border)', padding: '7px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, color: 'var(--text2)', cursor: 'pointer' }}
    >
      Sign out
    </button>
  )
}
