'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const StarIcon = () => (
  <svg width="26" height="26" viewBox="0 0 32 32">
    <path d="M16 1 L19.2 12.8 L31 16 L19.2 19.2 L16 31 L12.8 19.2 L1 16 L12.8 12.8 Z" fill="#5FA39A" />
  </svg>
)

const MountainBg = () => (
  <svg viewBox="0 0 440 620" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: 'block', position: 'absolute', inset: 0 }}>
    <rect width="440" height="620" fill="#2E2A24" />
    <circle cx="330" cy="150" r="58" fill="#3a463f" />
    <path d="M0 620 L150 330 L280 620 Z" fill="#37423b" />
    <path d="M120 620 L300 250 L460 620 Z" fill="#2f6e73" opacity="0.85" />
    <path d="M268 322 L300 250 L334 322 L312 308 L300 322 L286 308 Z" fill="#cfeae3" opacity="0.6" />
    <path d="M300 620 L420 360 L520 620 Z" fill="#41504a" />
  </svg>
)

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
    }

    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#998f7c',
    marginBottom: '8px',
    display: 'block',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#FBF7F0',
    border: '1px solid #E6DBC9',
    borderRadius: '10px',
    padding: '13px 15px',
    fontSize: '15px',
    color: '#2E2A24',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch', background: '#F4EEE4' }}>
      {/* Brand panel */}
      <div style={{ width: '440px', flexShrink: 0, position: 'relative', overflow: 'hidden', display: 'none' }} className="login-brand-panel">
        <MountainBg />
        <div style={{ position: 'relative', padding: '44px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <StarIcon />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '21px', fontWeight: 700, letterSpacing: '-0.02em', color: '#F4EEE4' }}>Wander</span>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', color: '#F4EEE4', lineHeight: 1.15 }}>
              Dream it, and we&apos;ll point you in the right direction.
            </div>
            <div style={{ fontSize: '14px', color: '#b8b1a3', marginTop: '14px', lineHeight: 1.55 }}>
              Trip planning for friends and family — calm, shared, all in one place.
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }} className="login-form-panel">
        {/* Mobile mountain background — hidden on desktop */}
        <div className="login-mobile-bg" style={{ display: 'none', position: 'absolute', inset: 0, zIndex: 0 }}>
          <MountainBg />
        </div>
        <div style={{ width: '100%', maxWidth: '340px', position: 'relative', zIndex: 1 }} className="login-form-inner">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', margin: '0' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--text2)', margin: '8px 0 28px' }}>
            {mode === 'login' ? 'Sign in to pick up where you left off.' : 'Start planning your next trip.'}
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(47,110,115,.12)' }}
                onBlur={(e) => { e.target.style.borderColor = '#E6DBC9'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                {mode === 'login' && (
                  <span style={{ fontSize: '12.5px', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Forgot?</span>
                )}
              </div>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(47,110,115,.12)' }}
                onBlur={(e) => { e.target.style.borderColor = '#E6DBC9'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {error && (
              <div style={{ fontSize: '13px', color: 'var(--red)', padding: '10px 12px', background: 'var(--red-light)', borderRadius: '8px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--accent)',
                color: '#FBF7F0',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 6px 16px rgba(47,110,115,.22)',
              }}
            >
              {loading ? 'Loading…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="switch-mode" style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text2)', marginTop: '22px' }}>
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

      <style>{`
        @media (min-width: 768px) {
          .login-brand-panel { display: block !important; }
        }
        @media (max-width: 767px) {
          .login-form-panel {
            background: #2E2A24 !important;
            position: relative;
            overflow: hidden;
          }
          .login-form-panel::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(46,42,36,0) 40%, rgba(46,42,36,.9) 65%, #2E2A24 82%);
            pointer-events: none;
            z-index: 0;
          }
          .login-form-inner {
            position: relative;
            z-index: 1;
          }
          .login-form-inner h2 { color: #F4EEE4 !important; }
          .login-form-inner p { color: #b8b1a3 !important; }
          .login-form-inner label { color: #8e887c !important; }
          .login-form-inner input {
            background: #3a352d !important;
            border-color: #4a443b !important;
            color: #F4EEE4 !important;
          }
          .login-form-inner .switch-mode { color: #b8b1a3 !important; }
          .login-mobile-bg {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}
