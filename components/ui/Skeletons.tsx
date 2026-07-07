/** Loading skeletons shown instantly during server render + DB fetch. */

export function DashboardSkeleton() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Heading */}
      <div className="skeleton" style={{ width: '180px', height: '34px', marginBottom: '10px' }} />
      <div className="skeleton" style={{ width: '260px', height: '16px', marginBottom: '28px' }} />

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[64, 88, 76, 60].map((w, i) => (
          <div key={i} className="skeleton" style={{ width: `${w}px`, height: '30px', borderRadius: '999px' }} />
        ))}
      </div>

      {/* Trip cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div className="skeleton" style={{ height: '128px', borderRadius: 0 }} />
            <div style={{ padding: '16px 18px 20px' }}>
              <div className="skeleton" style={{ width: '70%', height: '18px', marginBottom: '10px' }} />
              <div className="skeleton" style={{ width: '50%', height: '13px', marginBottom: '14px' }} />
              <div style={{ display: 'flex', gap: '6px' }}>
                <div className="skeleton" style={{ width: '90px', height: '22px', borderRadius: '999px' }} />
                <div className="skeleton" style={{ width: '110px', height: '22px', borderRadius: '999px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TripDetailSkeleton() {
  return (
    <>
      {/* Hero banner */}
      <div className="skeleton" style={{ height: '200px', borderRadius: 0 }} />

      {/* Header */}
      <div style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)', padding: '22px 40px 28px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div className="skeleton" style={{ width: '110px', height: '24px', borderRadius: '999px', marginBottom: '14px' }} />
          <div className="skeleton" style={{ width: '320px', maxWidth: '70%', height: '34px' }} />
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', gap: '24px' }}>
        {[72, 68, 74, 46, 40].map((w, i) => (
          <div key={i} className="skeleton" style={{ width: `${w}px`, height: '16px' }} />
        ))}
      </div>

      {/* Content blocks */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 24px' }}>
        <div className="skeleton" style={{ height: '120px', marginBottom: '20px', borderRadius: 'var(--radius)' }} />
        <div className="skeleton" style={{ height: '180px', marginBottom: '20px', borderRadius: 'var(--radius)' }} />
        <div className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius)' }} />
      </div>
    </>
  )
}
