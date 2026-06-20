'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

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
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
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
      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    await signIn('google', { callbackUrl })
  }

  function switchMode(next: 'login' | 'signup') {
    setMode(next)
    setError('')
    setEmail('')
    setPassword('')
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

  const isSignup = mode === 'signup'

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
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '340px' }}>

          {/* Tab toggle */}
          <div style={{
            display: 'flex',
            background: '#EBE4D8',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '28px',
          }}>
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#2E2A24' : '#998f7c',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
                }}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--text2)', margin: '0 0 24px' }}>
            {isSignup ? 'Start planning your next adventure.' : 'Sign in to pick up where you left off.'}
          </p>

          {/* Google SSO */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: '#fff',
              border: '1.5px solid #E6DBC9',
              borderRadius: '10px',
              padding: '13px',
              fontSize: '15px',
              fontWeight: 600,
              color: '#2E2A24',
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: '20px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            {isSignup ? 'Sign up with Google' : 'Continue with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#E6DBC9' }} />
            <span style={{ fontSize: '12px', color: '#998f7c', fontWeight: 600, letterSpacing: '0.05em' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#E6DBC9' }} />
          </div>

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
                {!isSignup && (
                  <span style={{ fontSize: '12.5px', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Forgot?</span>
                )}
              </div>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? 'At least 8 characters' : '••••••••'}
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
                background: isSignup ? '#3a7a6e' : 'var(--accent)',
                color: '#FBF7F0',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: isSignup
                  ? '0 6px 16px rgba(58,122,110,.28)'
                  : '0 6px 16px rgba(47,110,115,.22)',
              }}
            >
              {loading
                ? (isSignup ? 'Creating account…' : 'Signing in…')
                : (isSignup ? 'Create account' : 'Sign in')}
            </button>

            {loading && isSignup && (
              <div style={{
                marginTop: '14px',
                textAlign: 'center',
                fontSize: '13.5px',
                color: '#998f7c',
                lineHeight: 1.5,
              }}>
                Please be patient — this can take a few seconds.
              </div>
            )}
          </form>

        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .login-brand-panel { display: block !important; }
        }
      `}</style>
    </div>
  )
}
