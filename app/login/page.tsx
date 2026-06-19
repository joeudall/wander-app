'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signup') {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      // Auto sign in after signup
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>✈️</div>
          <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.3px' }}>
            <span style={{ color: 'var(--accent)' }}>Wander</span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text2)', marginTop: '6px' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow)' }}>
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '15px', outline: 'none', fontFamily: 'inherit' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
              />
            </div>

            {error && (
              <div style={{ fontSize: '13px', color: 'var(--red)', padding: '10px 12px', background: 'var(--red-light)', borderRadius: 'var(--radius-sm)' }}>
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
          </form>
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
