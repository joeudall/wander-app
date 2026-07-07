import Link from 'next/link'

const MountainHero = () => (
  <svg viewBox="0 0 1200 420" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: 'block', position: 'absolute', inset: 0 }}>
    <rect width="1200" height="420" fill="#2E2A24" />
    <circle cx="920" cy="110" r="70" fill="#3a463f" />
    <path d="M0 420 L280 180 L520 420 Z" fill="#37423b" />
    <path d="M340 420 L640 120 L960 420 Z" fill="#2f6e73" opacity="0.85" />
    <path d="M596 212 L640 120 L688 212 L660 192 L640 212 L620 192 Z" fill="#cfeae3" opacity="0.6" />
    <path d="M780 420 L1040 210 L1240 420 Z" fill="#41504a" />
  </svg>
)

const steps = [
  {
    icon: '🗺️',
    title: 'Tell us the shape of it',
    body: 'Destination, dates, who’s coming, budget, what you’re into. Takes about a minute.',
  },
  {
    icon: '✦',
    title: 'We research and draft',
    body: 'AI researches flights, lodging, and activities, then builds a day-by-day itinerary with real cost estimates.',
  },
  {
    icon: '🤝',
    title: 'Refine and share',
    body: 'Tweak any section with a note, then share a link with the friends and family coming along.',
  },
]

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: '420px', display: 'flex', alignItems: 'center' }}>
        <MountainHero />
        <div style={{ position: 'relative', maxWidth: '960px', margin: '0 auto', padding: '72px 24px', width: '100%' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(34px, 5vw, 52px)', lineHeight: 1.05, letterSpacing: '-0.025em', color: '#F4EEE4', margin: 0, maxWidth: '560px' }}>
            Dream it, and we&apos;ll point you in the right direction.
          </h1>
          <p style={{ fontSize: '17px', color: '#cfc8ba', margin: '18px 0 30px', lineHeight: 1.55, maxWidth: '480px' }}>
            A complete trip plan — itinerary, lodging, budget, and packing list — generated in about a minute. Built for planning with friends and family.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/plan"
              style={{ background: 'var(--accent)', color: '#FBF7F0', padding: '14px 26px', borderRadius: '10px', fontSize: '15.5px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 6px 16px rgba(47,110,115,.35)' }}
            >
              ✦&ensp;Plan a trip — no account needed
            </Link>
            <Link
              href="/login"
              style={{ background: 'rgba(251,247,240,0.1)', color: '#F4EEE4', border: '1px solid rgba(251,247,240,0.25)', padding: '14px 26px', borderRadius: '10px', fontSize: '15.5px', fontWeight: 600, textDecoration: 'none' }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '56px 24px 72px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {steps.map((s) => (
            <div key={s.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '26px', marginBottom: '12px' }}>{s.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, margin: '0 0 8px' }}>{s.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.55, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: '13.5px', color: 'var(--text3)', marginTop: '36px' }}>
          Your first plans are saved on this device — create a free account whenever you want to keep and share them.
        </p>
      </div>
    </div>
  )
}
