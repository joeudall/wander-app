'use client'

import { useState } from 'react'
import { DestinationPlan } from '@/lib/schema'

type RefinementTab = 'overview' | 'itinerary' | 'bookings' | 'food' | 'tips'

const TAB_SUGGESTIONS: Record<RefinementTab, string[]> = {
  overview: [
    'Try cheaper lodging options',
    'Upgrade to luxury stays',
    'Refresh flight options',
    'Update budget estimates',
  ],
  itinerary: [
    'Add a relaxed rest day',
    'More adventure activities',
    'Make it more family-friendly',
    'Add an off-the-beaten-path day',
  ],
  bookings: [
    'Suggest alternatives for each booking',
    'Add restaurant reservations',
    'Include activity bookings',
    'Simplify to must-do bookings',
  ],
  food: [
    'Add vegetarian-friendly picks',
    'Find local hidden gems',
    'Budget-friendly dining spots',
    'Upscale dining options',
  ],
  tips: [
    'Add packing list tips',
    'Add safety & health tips',
    'Add money-saving tips',
    'Add transport & getting around tips',
  ],
}

interface RefinementPanelProps {
  tripId: string
  tab: RefinementTab
  onRefined: (section: Partial<DestinationPlan>) => void
}

export default function RefinementPanel({ tripId, tab, onRefined }: RefinementPanelProps) {
  const [loading, setLoading] = useState(false)
  const canRefine = !!tripId // owner-only: parent passes '' for viewers
  const [customText, setCustomText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [lastRefined, setLastRefined] = useState<string | null>(null)

  if (!canRefine) return null

  const handleRefine = async (suggestion: string) => {
    if (!suggestion.trim() || loading) return
    setLoading(true)
    setError(null)
    setLastRefined(null)
    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, tab, suggestion }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Refinement failed')
      onRefined(data.section)
      setLastRefined(suggestion)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const suggestions = TAB_SUGGESTIONS[tab]

  return (
    <div
      style={{
        marginTop: '36px',
        borderTop: '1px solid var(--border)',
        paddingTop: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
        }}
      >
        <span style={{ fontSize: '16px' }}>✨</span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text3)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Refine this section
        </span>
        {loading && (
          <span
            style={{
              fontSize: '12px',
              color: 'var(--accent)',
              fontStyle: 'italic',
            }}
          >
            Updating…
          </span>
        )}
        {lastRefined && !loading && (
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text3)',
              fontStyle: 'italic',
            }}
          >
            Updated ✓
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => handleRefine(s)}
            disabled={loading}
            style={{
              fontSize: '13px',
              padding: '7px 14px',
              borderRadius: '999px',
              border: '1px solid var(--border)',
              background: loading ? 'var(--surface2)' : 'var(--surface)',
              color: loading ? 'var(--text3)' : 'var(--text2)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s, color 0.15s, border-color 0.15s',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                const el = e.currentTarget
                el.style.background = 'var(--accent-light)'
                el.style.color = 'var(--accent)'
                el.style.borderColor = 'var(--accent)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                const el = e.currentTarget
                el.style.background = 'var(--surface)'
                el.style.color = 'var(--text2)'
                el.style.borderColor = 'var(--border)'
              }
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customText.trim()) {
              handleRefine(customText)
              setCustomText('')
            }
          }}
          placeholder="Or describe your own change…"
          disabled={loading}
          style={{
            flex: 1,
            fontSize: '13.5px',
            padding: '9px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            outline: 'none',
            opacity: loading ? 0.6 : 1,
          }}
        />
        <button
          onClick={() => {
            handleRefine(customText)
            setCustomText('')
          }}
          disabled={loading || !customText.trim()}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            padding: '9px 18px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: loading || !customText.trim() ? 'var(--surface2)' : 'var(--accent)',
            color: loading || !customText.trim() ? 'var(--text3)' : '#fff',
            cursor: loading || !customText.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? '…' : 'Refine'}
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: '10px',
            fontSize: '13px',
            color: 'var(--red, #c0392b)',
            padding: '8px 12px',
            background: 'var(--red-light, #fdf2f2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--red-border, #f5c6c6)',
          }}
        >
          {error}
        </div>
      )}
    </div>
  )
}
