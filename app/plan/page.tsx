'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import WizardProgress from '@/components/wizard/WizardProgress'
import {
  WizardCard,
  WizardButton,
  FormGroup,
  FormInput,
  FormTextarea,
  ChoiceCard,
  RadioOption,
  TagPicker,
  ToggleGroup,
  KidsPillInput,
} from '@/components/wizard/WizardShell'
import { TripGuidelines, TripType, BudgetStyle } from '@/lib/schema'
import { calcBudgetRanges } from '@/lib/budget'

const INTERESTS = [
  '🥾 Hiking', '🦁 Wildlife', '📸 Photography', '🏖️ Beach',
  '🏛️ Museums & Culture', '🍽️ Food & Drinks', '🚗 Scenic Drives',
  '⛵ Water / Boating', '🌃 Nightlife', '🎡 Kid Activities',
  '⭐ Stargazing', '⛳ Golf / Sports',
]

const DIETARY = ['🌱 Vegetarian', '🥦 Vegan', '🐟 Pescatarian', '🌾 Gluten-free', '🥜 Nut allergy', '👶 Picky kids']

const LODGING = [
  '🏡 Single property (Airbnb/VRBO)', '🏨 Hotel', '♨️ Hot tub',
  '🔥 Firepit', '🍳 Full kitchen', '🏔️ Mountain views',
]

const GEN_STEPS = [
  'Reading your preferences',
  'Researching flights',
  'Finding lodging options',
  'Discovering activities',
  'Checking weather & seasonality',
  'Building your trip plan',
  'Finalizing packing list & budget',
]

interface WizardState extends TripGuidelines {
  // extra UI state
  step: number
  genStep: number
  genError?: string
}

const DEFAULT: WizardState = {
  step: 1,
  genStep: 0,
  tripType: 'family',
  travelersMin: 2,
  travelersMax: 4,
  kidsAges: [],
  planningStage: 'destination_selected',
  destination: '',
  timeframeMode: 'flexible',
  targetMonthYear: '',
  nights: 7,
  startDate: '',
  endDate: '',
  travelMode: 'fly',
  departureAirport: '',
  drivingFrom: '',
  domesticOrInternational: 'domestic',
  interests: [],
  budgetStyle: 'mid',
  dietaryNeeds: [],
  lodgingPrefs: [],
  freeTextNotes: '',
}

export default function PlanPage() {
  const router = useRouter()
  const [state, setState] = useState<WizardState>(DEFAULT)
  const [generatedPlan, setGeneratedPlan] = useState<object | null>(null)

  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((s) => ({ ...s, [key]: value }))

  const nextStep = () => setState((s) => ({ ...s, step: s.step + 1 }))
  const prevStep = () => setState((s) => ({ ...s, step: s.step - 1 }))

  const budgetRanges = calcBudgetRanges(
    state.nights,
    state.travelersMin,
    state.travelersMax,
    state.domesticOrInternational
  )

  async function generate() {
    setState((s) => ({ ...s, step: 5, genStep: 0, genError: undefined }))

    const guidelines: TripGuidelines = {
      tripType: state.tripType,
      travelersMin: state.travelersMin,
      travelersMax: state.travelersMax,
      kidsAges: state.kidsAges,
      planningStage: state.planningStage,
      destination: state.destination,
      timeframeMode: state.timeframeMode,
      targetMonthYear: state.targetMonthYear,
      nights: state.nights,
      startDate: state.startDate,
      endDate: state.endDate,
      travelMode: state.travelMode,
      departureAirport: state.departureAirport,
      drivingFrom: state.drivingFrom,
      domesticOrInternational: state.domesticOrInternational,
      interests: state.interests,
      budgetStyle: state.budgetStyle,
      dietaryNeeds: state.dietaryNeeds,
      lodgingPrefs: state.lodgingPrefs,
      freeTextNotes: state.freeTextNotes,
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
          if (parsed.event === 'progress') {
            setState((s) => ({ ...s, genStep: parsed.data.step }))
          } else if (parsed.event === 'complete') {
            setGeneratedPlan(parsed.data.plan)
            if (parsed.data.tripId) {
              router.push(`/trips/${parsed.data.tripId}`)
            } else {
              router.push('/')
            }
          } else if (parsed.event === 'error') {
            setState((s) => ({ ...s, genError: parsed.data.message }))
          }
        }
      }
    } catch (err) {
      setState((s) => ({ ...s, genError: err instanceof Error ? err.message : 'Generation failed' }))
    }
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px' }}>

      {state.step === 1 && (
        <>
          <WizardProgress currentStep={1} />
          <WizardCard
            title="Who's this trip for?"
            subtitle="This shapes everything — activities, pacing, lodging, and how detailed the plan gets."
            footer={
              <>
                <WizardButton variant="ghost" onClick={() => router.push('/')}>Cancel</WizardButton>
                <WizardButton onClick={nextStep}>Next: When & Where →</WizardButton>
              </>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '32px' }}>
              <ChoiceCard
                icon="👨‍👩‍👧‍👦"
                label="Family"
                desc="Kids, parents, maybe grandparents — kid-inclusive activities & pacing"
                selected={state.tripType === 'family'}
                onClick={() => set('tripType', 'family')}
              />
              <ChoiceCard
                icon="🍻"
                label="Adults Only"
                desc="Friends or couples — activity-driven, more flexibility, nightlife options"
                selected={state.tripType === 'adults'}
                onClick={() => set('tripType', 'adults')}
              />
              <ChoiceCard
                icon="🗺️"
                label="Help Me Decide"
                desc="Not sure on destination — get curated suggestions first"
                selected={state.tripType === 'undecided'}
                onClick={() => set('tripType', 'undecided')}
              />
            </div>

            <FormGroup label="How many travelers?" optional>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <FormInput
                  id="travelers-min"
                  type="number"
                  placeholder="Min (e.g. 4)"
                  value={state.travelersMin || ''}
                  onChange={(e) => set('travelersMin', Number(e.target.value))}
                  min={1}
                />
                <FormInput
                  id="travelers-max"
                  type="number"
                  placeholder="Max (e.g. 6)"
                  value={state.travelersMax || ''}
                  onChange={(e) => set('travelersMax', Number(e.target.value))}
                  min={1}
                />
              </div>
            </FormGroup>

            {state.tripType === 'family' && (
              <FormGroup label="Kids' ages" optional>
                <KidsPillInput value={state.kidsAges} onChange={(ages) => set('kidsAges', ages)} />
              </FormGroup>
            )}
          </WizardCard>
        </>
      )}

      {state.step === 2 && (
        <>
          <WizardProgress currentStep={2} />
          <WizardCard
            title="When & where?"
            subtitle="Rough answers are totally fine — we work with what you have."
            footer={
              <>
                <WizardButton variant="ghost" onClick={prevStep}>← Back</WizardButton>
                <WizardButton onClick={nextStep}>Next: Travel Style →</WizardButton>
              </>
            }
          >
            <FormGroup label="Destination">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '8px' }}>
                <RadioOption
                  label="I have a destination in mind"
                  sublabel="Go deep on one place"
                  selected={state.planningStage === 'destination_selected'}
                  onClick={() => set('planningStage', 'destination_selected')}
                />
                <RadioOption
                  label="Show me options"
                  sublabel="Compare a few destinations against my preferences"
                  selected={state.planningStage === 'ideation'}
                  onClick={() => set('planningStage', 'ideation')}
                />
              </div>
              <FormInput
                type="text"
                placeholder={state.planningStage === 'destination_selected' ? 'e.g. Spain, National Parks, Japan…' : 'e.g. beach, warm, 4hrs from Phoenix…'}
                value={state.destination}
                onChange={(e) => set('destination', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Timeframe">
              <div style={{ marginBottom: '12px' }}>
                <ToggleGroup
                  value={state.timeframeMode}
                  onChange={(v) => set('timeframeMode', v as 'flexible' | 'exact')}
                  options={[{ value: 'flexible', label: 'Flexible' }, { value: 'exact', label: 'Exact dates' }]}
                />
              </div>
              {state.timeframeMode === 'flexible' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <FormInput
                    type="text"
                    placeholder="Month & year (e.g. July 2026)"
                    value={state.targetMonthYear}
                    onChange={(e) => set('targetMonthYear', e.target.value)}
                  />
                  <FormInput
                    id="trip-nights"
                    type="number"
                    placeholder="# of nights (e.g. 7)"
                    value={state.nights || ''}
                    onChange={(e) => set('nights', Number(e.target.value))}
                    min={1}
                  />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <FormInput
                    type="date"
                    placeholder="Start date"
                    value={state.startDate}
                    onChange={(e) => set('startDate', e.target.value)}
                  />
                  <FormInput
                    type="date"
                    placeholder="End date"
                    value={state.endDate}
                    onChange={(e) => set('endDate', e.target.value)}
                  />
                </div>
              )}
            </FormGroup>

            <FormGroup label="Getting there">
              <div style={{ marginBottom: '12px' }}>
                <ToggleGroup
                  value={state.travelMode}
                  onChange={(v) => set('travelMode', v as 'fly' | 'drive')}
                  options={[{ value: 'fly', label: '✈️ Flying' }, { value: 'drive', label: '🚗 Driving' }]}
                />
              </div>
              {state.travelMode === 'fly' ? (
                <FormInput
                  type="text"
                  placeholder="Departure airport or city (e.g. Phoenix, AZ (PHX/AZA))"
                  value={state.departureAirport}
                  onChange={(e) => set('departureAirport', e.target.value)}
                />
              ) : (
                <>
                  <FormInput
                    type="text"
                    placeholder="Driving from (e.g. Scottsdale, AZ)"
                    value={state.drivingFrom}
                    onChange={(e) => set('drivingFrom', e.target.value)}
                  />
                  <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '6px' }}>
                    We&apos;ll factor in drive time and suggest routes.
                  </p>
                </>
              )}
            </FormGroup>

            <FormGroup label="Trip type">
              <div style={{ display: 'flex', gap: '10px' }}>
                <RadioOption
                  label="Domestic"
                  selected={state.domesticOrInternational === 'domestic'}
                  onClick={() => set('domesticOrInternational', 'domestic')}
                />
                <RadioOption
                  label="International"
                  selected={state.domesticOrInternational === 'international'}
                  onClick={() => set('domesticOrInternational', 'international')}
                />
              </div>
            </FormGroup>
          </WizardCard>
        </>
      )}

      {state.step === 3 && (
        <>
          <WizardProgress currentStep={3} />
          <WizardCard
            title="What's your vibe?"
            subtitle="Pick all that apply."
            footer={
              <>
                <WizardButton variant="ghost" onClick={prevStep}>← Back</WizardButton>
                <WizardButton onClick={nextStep}>Next: Details →</WizardButton>
              </>
            }
          >
            <FormGroup label="Interests & must-haves">
              <TagPicker
                options={INTERESTS.map((i) => ({ label: i }))}
                selected={state.interests}
                onChange={(v) => set('interests', v)}
              />
            </FormGroup>

            <FormGroup label="Budget style">
              {budgetRanges && (
                <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '10px' }}>
                  Estimates for {budgetRanges.nights}-night trip · {budgetRanges.pax} traveler{budgetRanges.pax !== 1 ? 's' : ''}
                  <span style={{ fontSize: '11px', marginLeft: '6px' }}>· Includes flights, lodging, food &amp; activities</span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(['budget', 'mid', 'splurge'] as BudgetStyle[]).map((tier) => {
                  const labels: Record<BudgetStyle, { label: string; sublabel: string; color: string }> = {
                    budget: { label: 'Budget-friendly', sublabel: 'Value matters most', color: 'var(--green)' },
                    mid: { label: 'Mid-range', sublabel: 'Good value, some splurges OK', color: 'var(--accent)' },
                    splurge: { label: 'Splurge', sublabel: 'Quality and comfort first', color: 'var(--amber)' },
                  }
                  const meta = labels[tier]
                  const range = budgetRanges?.[tier]
                  return (
                    <RadioOption
                      key={tier}
                      label={meta.label}
                      sublabel={range ? `${range.rate} · ${meta.sublabel}` : meta.sublabel}
                      selected={state.budgetStyle === tier}
                      onClick={() => set('budgetStyle', tier)}
                      right={
                        range ? (
                          <span style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: 700, color: meta.color, whiteSpace: 'nowrap' }}>
                            {range.label}
                          </span>
                        ) : undefined
                      }
                    />
                  )
                })}
              </div>
            </FormGroup>
          </WizardCard>
        </>
      )}

      {state.step === 4 && (
        <>
          <WizardProgress currentStep={4} />
          <WizardCard
            title="A few more details"
            subtitle="Optional, but helps make the plan more useful."
            footer={
              <>
                <WizardButton variant="ghost" onClick={prevStep}>← Back</WizardButton>
                <WizardButton onClick={generate}>Generate My Trip Plan ✨</WizardButton>
              </>
            }
          >
            <FormGroup label="Dietary needs" optional>
              <TagPicker
                options={DIETARY.map((d) => ({ label: d }))}
                selected={state.dietaryNeeds}
                onChange={(v) => set('dietaryNeeds', v)}
              />
            </FormGroup>

            <FormGroup label="Lodging preferences" optional>
              <TagPicker
                options={LODGING.map((l) => ({ label: l }))}
                selected={state.lodgingPrefs}
                onChange={(v) => set('lodgingPrefs', v)}
              />
            </FormGroup>

            <FormGroup label="Anything else?" optional>
              <FormTextarea
                placeholder="e.g. 'avoid big crowds', 'want a sunrise hike', 'birthday celebration', 'no red-eye flights'…"
                value={state.freeTextNotes}
                onChange={(e) => set('freeTextNotes', e.target.value)}
                rows={3}
              />
            </FormGroup>
          </WizardCard>
        </>
      )}

      {state.step === 5 && (
        <>
          <WizardProgress currentStep={5} />
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              {state.genError ? (
                <>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Something went wrong</h2>
                  <p style={{ color: 'var(--text2)', marginBottom: '24px' }}>{state.genError}</p>
                  <WizardButton onClick={() => setState((s) => ({ ...s, step: 4 }))}>← Try Again</WizardButton>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      border: '4px solid var(--border)',
                      borderTopColor: 'var(--accent)',
                      borderRadius: '50%',
                      animation: 'spin 0.9s linear infinite',
                      margin: '0 auto 24px',
                    }}
                  />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Building your trip plan…</h2>
                  <p style={{ color: 'var(--text2)', fontSize: '15px' }}>Researching flights, lodging, activities, and local tips</p>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      marginTop: '28px',
                      textAlign: 'left',
                      maxWidth: '320px',
                      margin: '28px auto 0',
                    }}
                  >
                    {GEN_STEPS.map((label, i) => {
                      const stepNum = i + 1
                      const isDone = state.genStep > stepNum
                      const isActive = state.genStep === stepNum
                      return (
                        <div
                          key={label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '14px',
                            color: isDone ? 'var(--green)' : isActive ? 'var(--accent)' : 'var(--text2)',
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: '2px solid currentColor',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              fontSize: '11px',
                              background: isDone ? 'var(--green)' : 'transparent',
                              borderColor: isDone ? 'var(--green)' : undefined,
                              color: isDone ? 'white' : 'currentColor',
                              animation: isActive ? 'pulse 1s infinite' : 'none',
                            }}
                          >
                            {isDone ? '✓' : ''}
                          </div>
                          {label}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
