'use client'

import { useState, useEffect, Suspense } from 'react'
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

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
)

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [signupMessage, setSignupMessage] = useState('')

  // Reset state when switching modes
  useEffect(() => {
    setError('')
    setSignupMessage('')
  }, [mode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSignupMessage('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        setSignupMessage('Creating your account…')
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error)
          setLoading(false)
          setSignupMessage('')
          return
        }
        setSignupMessage('Account created — signing you in…')
      }

      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
        setSignupMessage('')
        return
      }
      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      setSignupMessage('')
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl })
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
      {/* Brand panel — desktop only */}
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
        <div className="login-mobile-bg" style={{ display: 'none', position: 'absolute', inset: 0, zIndex: 0 }}>
          <MountainBg />
        </div>
        <div style={{ width: '100%', maxWidth: '340px', position: 'relative', zIndex: 1 }} className="login-form-inner">

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.06)', borderRadius: '12px', padding: '4px', marginBottom: '28px' }}>
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '9px',
                  border: 'none',
                  background: mode === m ? '#FBF7F0' : 'transparent',
                  color: mode === m ? '#2E2A24' : '#998f7c',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: '#FBF7F0',
              color: '#2E2A24',
              border: '1px solid #E6DBC9',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '14.5px',
              fontWeight: 600,
              cursor: googleLoading || loading ? 'not-allowed' : 'pointer',
              opacity: googleLoading || loading ? 0.7 : 1,
              fontFamily: 'inherit',
              marginBottom: '20px',
              transition: 'background 0.15s',
            }}
          >
            <GoogleIcon />
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#E6DBC9' }} />
            <span style={{ fontSize: '12px', color: '#998f7c', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#E6DBC9' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
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

            <div style={{ marginBottom: '22px' }}>
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

            {signupMessage && !error && (
              <div style={{ fontSize: '13px', color: 'var(--accent)', padding: '10px 12px', background: 'var(--accent-light)', borderRadius: '8px', marginBottom: '16px' }}>
                {signupMessage}
              </div>
            )}

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
              {loading
                ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
                : (mode === 'login' ? 'Sign in' : 'Create account')}
            </button>
          </form>
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
          .login-mobile-bg {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
