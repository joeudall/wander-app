'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TripGuidelines, BudgetStyle } from '@/lib/schema'
import { calcBudgetRanges } from '@/lib/budget'
import { TagPicker, KidsPillInput } from '@/components/wizard/WizardShell'

const INTERESTS = [
  '🥾 Hiking', '🦁 Wildlife', '📸 Photography', '🏖️ Beach',
  '🏛️ Museums & Culture', '🍽️ Food & Drinks', '🚗 Scenic Drives',
  '⭐ Stargazing', '⛵ Water / Boating', '🌃 Nightlife', '🎡 Kid Activities', '⛳ Golf / Sports',
]

const GEN_STEPS = [
  'Reading your preferences',
  'Researching travel options',
  'Finding lodging options',
  'Discovering activities',
  'Checking weather & seasonality',
  'Building your trip plan',
  'Finalizing packing list & budget',
]

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: '#998f7c',
  marginBottom: '8px',
  display: 'block',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  padding: '14px 16px',
  fontSize: '15px',
  color: 'var(--text)',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

export default function PlanPage() {
  const router = useRouter()

  const [destination, setDestination] = useState('')
  const [targetMonthYear, setTargetMonthYear] = useState('')
  const [nights, setNights] = useState(7)
  const [travelersMin, setTravelersMin] = useState(2)
  const [travelersMax, setTravelersMax] = useState(4)
  const [tripType, setTripType] = useState<'family' | 'adults' | 'undecided'>('adults')
  const [kidsAges, setKidsAges] = useState<number[]>([])
  const [travelMode, setTravelMode] = useState<'fly' | 'drive'>('fly')
  const [departureAirport, setDepartureAirport] = useState('')
  const [drivingFrom, setDrivingFrom] = useState('')
  const [domesticOrInternational, setDomesticOrInternational] = useState<'domestic' | 'international'>('domestic')
  const [budgetStyle, setBudgetStyle] = useState<BudgetStyle>('mid')
  const [interests, setInterests] = useState<string[]>([])
  const [dietaryNeeds] = useState<string[]>([])
  const [lodgingPrefs] = useState<string[]>([])
  const [freeTextNotes, setFreeTextNotes] = useState('')

  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState(0)
  const [genError, setGenError] = useState('')

  const budgetRanges = calcBudgetRanges(nights, travelersMin, travelersMax, domesticOrInternational)

  async function generate() {
    if (!destination.trim()) return
    setGenerating(true)
    setGenStep(0)
    setGenError('')

    const guidelines: TripGuidelines = {
      tripType,
      travelersMin,
      travelersMax,
      kidsAges,
      planningStage: 'destination_selected',
      destination,
      timeframeMode: 'flexible',
      targetMonthYear,
      nights,
      travelMode,
      departureAirport,
      drivingFrom,
      domesticOrInternational,
      interests,
      budgetStyle,
      dietaryNeeds,
      lodgingPrefs,
      freeTextNotes,
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guidelines),
      })
      if (!res.body) throw new Error('No response body')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const parsed = JSON.parse(line.slice(6))
          if (parsed.event === 'progress') setGenStep(parsed.data.step)
          else if (parsed.event === 'complete') {
            if (parsed.data.tripId) router.push(`/trips/${parsed.data.tripId}`)
            else router.push('/')
          } else if (parsed.event === 'error') {
            setGenError(parsed.data.message)
            setGenerating(false)
          }
        }
      }
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Generation failed')
      setGenerating(false)
    }
  }

  if (generating) {
    return (
      <div style={{ maxWidth: '560px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        {genError ? (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Something went wrong</h2>
            <p style={{ color: 'var(--text2)', marginBottom: '24px' }}>{genError}</p>
            <button
              onClick={() => { setGenerating(false); setGenError('') }}
              style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '11px 24px', borderRadius: '10px', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              ← Try Again
            </button>
          </>
        ) : (
          <>
            <div style={{ width: '52px', height: '52px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 28px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '8px' }}>Building your trip plan…</h2>
            <p style={{ color: 'var(--text2)', fontSize: '15px' }}>Researching, planning, and putting it all together</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '32px', textAlign: 'left', maxWidth: '300px', margin: '32px auto 0' }}>
              {GEN_STEPS.map((label, i) => {
                const n = i + 1
                const done = genStep > n
                const active = genStep === n
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--text3)', fontWeight: active ? 600 : 400 }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', background: done ? 'var(--green)' : 'transparent', color: done ? 'white' : 'currentColor', animation: active ? 'pulse 1s infinite' : 'none' }}>
                      {done ? '✓' : ''}
                    </div>
                    {label}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '52px 24px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '34px' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: '14px' }}>New trip</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '40px', lineHeight: 1.05, letterSpacing: '-0.025em', margin: 0 }}>Where to next?</h1>
        <p style={{ fontSize: '15.5px', color: 'var(--text2)', margin: '14px auto 0', maxWidth: '420px', lineHeight: 1.55 }}>
          Tell us the shape of it. We&apos;ll draft an itinerary you can shape together.
        </p>
      </div>

      {/* Composer card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: '22px' }}>

        <Field label="Destination">
          <input
            type="text"
            placeholder="Grand Teton National Park, Spain, Tokyo…"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={{ ...inputStyle, fontSize: '16px' }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(47,110,115,.12)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="When">
            <input
              type="text"
              placeholder="📅  August 2026"
              value={targetMonthYear}
              onChange={(e) => setTargetMonthYear(e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(47,110,115,.12)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </Field>
          <Field label="Nights">
            <input
              type="number"
              min={1}
              value={nights}
              onChange={(e) => setNights(Number(e.target.value))}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(47,110,115,.12)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Travelers">
            <div style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px', alignItems: 'center', gap: '10px', fontSize: '15px' }}>
              <input type="number" min={1} value={travelersMin} onChange={(e) => setTravelersMin(Number(e.target.value))} style={{ width: '36px', border: 'none', background: 'transparent', fontSize: '15px', outline: 'none', textAlign: 'center', fontFamily: 'inherit' }} />
              <span style={{ color: 'var(--text3)' }}>–</span>
              <input type="number" min={1} value={travelersMax} onChange={(e) => setTravelersMax(Number(e.target.value))} style={{ width: '36px', border: 'none', background: 'transparent', fontSize: '15px', outline: 'none', textAlign: 'center', fontFamily: 'inherit' }} />
              <span style={{ color: 'var(--text3)', marginLeft: '2px' }}>people</span>
            </div>
          </Field>
          <Field label="Trip type">
            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value as 'family' | 'adults' | 'undecided')}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="adults">Adults</option>
              <option value="family">Family</option>
              <option value="undecided">Not sure yet</option>
            </select>
          </Field>
        </div>

        {tripType === 'family' && (
          <Field label="Kids' ages">
            <KidsPillInput value={kidsAges} onChange={setKidsAges} />
          </Field>
        )}

        <Field label="Flying from">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
            {(['fly', 'drive'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTravelMode(mode)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '100px',
                  border: `1.5px solid ${travelMode === mode ? 'var(--accent)' : 'var(--border)'}`,
                  background: travelMode === mode ? 'var(--accent-light)' : 'var(--surface2)',
                  color: travelMode === mode ? 'var(--accent)' : 'var(--text2)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {mode === 'fly' ? '✈️ Flying' : '🚗 Driving'}
              </button>
            ))}
          </div>
          {travelMode === 'fly' ? (
            <input
              type="text"
              placeholder="Departure airport or city (e.g. Phoenix, AZ)"
              value={departureAirport}
              onChange={(e) => setDepartureAirport(e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(47,110,115,.12)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          ) : (
            <input
              type="text"
              placeholder="Driving from (e.g. Scottsdale, AZ)"
              value={drivingFrom}
              onChange={(e) => setDrivingFrom(e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(47,110,115,.12)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          )}
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Domestic or International">
            <select
              value={domesticOrInternational}
              onChange={(e) => setDomesticOrInternational(e.target.value as 'domestic' | 'international')}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="domestic">Domestic</option>
              <option value="international">International</option>
            </select>
          </Field>
          <Field label="Budget">
            <select
              value={budgetStyle}
              onChange={(e) => setBudgetStyle(e.target.value as BudgetStyle)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {(['budget', 'mid', 'splurge'] as BudgetStyle[]).map((tier) => {
                const labels = { budget: 'Budget-friendly', mid: 'Mid-range', splurge: 'Splurge' }
                const range = budgetRanges?.[tier]
                return (
                  <option key={tier} value={tier}>
                    {labels[tier]}{range ? ` · ${range.label}` : ''}
                  </option>
                )
              })}
            </select>
          </Field>
        </div>

        <Field label="What are you into?">
          <TagPicker
            options={INTERESTS.map((i) => ({ label: i }))}
            selected={interests}
            onChange={setInterests}
          />
        </Field>

        <Field label="Anything specific?">
          <textarea
            placeholder="Two families, a mix of ages. Want one big hike and an easy lake day…"
            value={freeTextNotes}
            onChange={(e) => setFreeTextNotes(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(47,110,115,.12)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
          />
        </Field>

        <button
          onClick={generate}
          disabled={!destination.trim()}
          style={{
            width: '100%',
            marginTop: '4px',
            background: 'var(--accent)',
            color: '#FBF7F0',
            border: 'none',
            padding: '15px',
            borderRadius: '10px',
            fontFamily: 'var(--font-body)',
            fontSize: '15.5px',
            fontWeight: 600,
            cursor: destination.trim() ? 'pointer' : 'not-allowed',
            opacity: destination.trim() ? 1 : 0.6,
            boxShadow: '0 6px 16px rgba(47,110,115,.22)',
            letterSpacing: '0.01em',
          }}
        >
          ✦  Generate trip plan
        </button>
      </div>
    </div>
  )
}
