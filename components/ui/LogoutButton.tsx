'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={logout}
      style={{ background: 'none', border: '1.5px solid var(--border)', padding: '7px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, color: 'var(--text2)', cursor: 'pointer' }}
    >
      Sign out
    </button>
  )
}
