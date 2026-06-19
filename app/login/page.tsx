'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setError('Check your email to confirm your account, then log in.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/')
    router.refresh()
  }

  async function handleMagicLink() {
    if (!email) { setError('Enter your email first'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setMagicSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>✈️</div>
          <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.3px' }}>
            <span style={{ color: 'var(--accent)' }}>Trip</span>Planner
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text2)', marginTop: '6px' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow)' }}>
          {magicSent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📬</div>
              <h2 style={{ fontWeight: 700, marginBottom: '8px' }}>Check your email</h2>
              <p style={{ color: 'var(--text2)', fontSize: '14px' }}>We sent a magic link to <strong>{email}</strong></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '15px', outline: 'none', fontFamily: 'inherit' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '15px', outline: 'none', fontFamily: 'inherit' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
                />
              </div>

              {error && (
                <div style={{ fontSize: '13px', color: error.includes('Check your email') ? 'var(--green)' : 'var(--red)', padding: '10px 12px', background: error.includes('Check your email') ? 'var(--green-light)' : 'var(--red-light)', borderRadius: 'var(--radius-sm)' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Loading…' : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text3)', fontSize: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                or
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>

              <button
                type="button"
                onClick={handleMagicLink}
                disabled={loading}
                style={{ background: 'none', border: '1.5px solid var(--border)', padding: '11px', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: 'var(--text2)' }}
              >
                ✉️ Send magic link
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text2)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
