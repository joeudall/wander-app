'use client'

const STEPS = ['Who', 'When & Where', 'Style', 'Details', 'Generate']

export default function WizardProgress({ currentStep }: { currentStep: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
      {STEPS.map((label, i) => {
        const stepNum = i + 1
        const isDone = stepNum < currentStep
        const isActive = stepNum === currentStep
        return (
          <div
            key={label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              flex: 1,
              position: 'relative',
            }}
          >
            {i < STEPS.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '50%',
                  right: '-50%',
                  height: '2px',
                  background: isDone ? 'var(--accent)' : 'var(--border)',
                  zIndex: 0,
                }}
              />
            )}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                zIndex: 1,
                border: `2px solid ${isDone ? 'var(--accent)' : isActive ? 'var(--accent)' : 'var(--border)'}`,
                background: isDone ? 'var(--accent)' : isActive ? 'var(--accent-light)' : 'var(--surface)',
                color: isDone ? 'white' : isActive ? 'var(--accent)' : 'var(--text3)',
                transition: 'all 0.2s',
              }}
            >
              {isDone ? '✓' : stepNum}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: isDone ? 'var(--text2)' : isActive ? 'var(--accent)' : 'var(--text3)',
                fontWeight: isActive ? 600 : 500,
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
