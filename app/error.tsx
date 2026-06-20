'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>😕</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
        Something went wrong
      </h2>
      <p style={{ color: 'var(--text2)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={reset}
        style={{
          background: 'var(--accent)',
          color: '#FBF7F0',
          border: 'none',
          padding: '11px 24px',
          borderRadius: '10px',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  )
}
