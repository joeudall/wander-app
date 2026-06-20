'use client'

import { useState } from 'react'
import { Trip, DestinationPlan } from '@/lib/schema'
import Link from 'next/link'
import Tag, { activityTagVariant } from '@/components/ui/Tag'
import RefinementPanel from '@/components/trip/RefinementPanel'

const MountainBanner = () => (
  <svg viewBox="0 0 1040 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
    <rect width="1040" height="200" fill="#EFE6D6" />
    <circle cx="150" cy="62" r="40" fill="#E7C6AC" />
    <path d="M0 200 L210 56 L380 200 Z" fill="#A7AB92" />
    <path d="M250 200 L520 18 L800 200 Z" fill="#838872" />
    <path d="M488 78 L520 18 L554 78 L530 64 L520 78 L506 64 Z" fill="#F4EEE4" />
    <path d="M620 200 L860 70 L1040 200 Z" fill="#BFC1AC" />
    <rect y="182" width="1040" height="18" fill="#6E7460" />
  </svg>
)

type TabName = 'overview' | 'itinerary' | 'bookings' | 'food' | 'tips'

export default function TripDetail({ trip }: { trip: Trip }) {
  const [activeTab, setActiveTab] = useState<TabName>('overview')
  const [plan, setPlan] = useState<DestinationPlan>(trip.plan)
  const [copied, setCopied] = useState(false)
  const { guidelines } = trip

  const handleRefined = (section: Partial<DestinationPlan>) => {
    setPlan((prev) => ({ ...prev, ...section }))
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusColors: Record<string, { bg: string; color: string }> = {
    upcoming: { bg: '#E3EDEC', color: '#265B5F' },
    past: { bg: 'var(--surface3)', color: 'var(--text2)' },
    planning: { bg: '#F0DFCC', color: '#9E5A37' },
  }
  const statusStyle = statusColors[trip.status] ?? statusColors.planning

  const nights = guidelines.nights ?? ''
  const travelers = guidelines.travelersMax > guidelines.travelersMin
    ? `${guidelines.travelersMin}–${guidelines.travelersMax}`
    : `${guidelines.travelersMin}`

  return (
    <>
      {/* Hero banner with back button overlay */}
      <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
        <MountainBanner />
        <Link
          href="/"
          style={{ position: 'absolute', top: '48px', left: '18px', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(251,247,240,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
          className="detail-back-btn"
          aria-label="Back to trips"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 5 L8 12 L15 19" stroke="#2E2A24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {/* Trip header */}
      <div style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)', padding: '22px 40px 28px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ background: statusStyle.bg, color: statusStyle.color, borderRadius: '999px', padding: '5px 13px', fontSize: '12px', fontWeight: 600 }}>
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </span>
            </Link>
            <span style={{ fontSize: '13px', color: 'var(--text3)' }}>{guidelines.destination}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '34px', lineHeight: 1.05, letterSpacing: '-0.025em', margin: 0 }}>
              {plan.destination}
            </h1>
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
              <button
                onClick={copyLink}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: '1.5px solid var(--border)',
                  background: copied ? 'var(--accent-light)' : 'var(--surface)',
                  color: copied ? 'var(--accent)' : 'var(--text2)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? '✓ Copied!' : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    Share
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info tiles — mobile shows these, desktop hides them */}
          <div className="detail-info-tiles">
            <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '10.5px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text3)' }}>Dates</div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, marginTop: '3px' }}>{guidelines.targetMonthYear || guidelines.startDate || '—'}</div>
            </div>
            {nights && (
              <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '10.5px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text3)' }}>Nights</div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, marginTop: '3px' }}>{nights}</div>
              </div>
            )}
            <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '10.5px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text3)' }}>Party</div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, marginTop: '3px' }}>{travelers}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '0 24px',
          display: 'flex',
          overflowX: 'auto',
          position: 'sticky',
          top: '60px',
          zIndex: 99,
        }}
        className="detail-tab-nav"
      >
        {(['overview', 'itinerary', 'bookings', 'food', 'tips'] as TabName[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '16px 20px',
              fontSize: '14px',
              fontWeight: 500,
              color: activeTab === tab ? 'var(--accent)' : 'var(--text2)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            {tab === 'food' ? 'Food Guide' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'overview' && <OverviewTab plan={plan} tripId={trip.id} onRefined={handleRefined} />}
        {activeTab === 'itinerary' && <ItineraryTab plan={plan} tripId={trip.id} onRefined={handleRefined} />}
        {activeTab === 'bookings' && <BookingsTab plan={plan} tripId={trip.id} onRefined={handleRefined} />}
        {activeTab === 'food' && <FoodTab plan={plan} tripId={trip.id} onRefined={handleRefined} />}
        {activeTab === 'tips' && <TipsTab plan={plan} tripId={trip.id} onRefined={handleRefined} />}
      </div>

      <style>{`
        .detail-back-btn { display: none; }
        .detail-info-tiles { display: none; gap: 10px; margin-top: 18px; }
        .detail-tab-nav { top: 60px; }

        @media (max-width: 768px) {
          .detail-back-btn { display: flex !important; }
          .detail-info-tiles { display: flex !important; }
          .detail-tab-nav { top: 0; }
        }
      `}</style>
    </>
  )
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text3)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

function OverviewTab({ plan, tripId, onRefined }: { plan: DestinationPlan; tripId: string; onRefined: (s: Partial<DestinationPlan>) => void }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <InfoCard title="🌟 Highlights">
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none' }}>
            {(plan.highlights ?? []).map((h, i) => (
              <li key={i} style={{ fontSize: '14px', paddingLeft: '16px', borderLeft: '3px solid var(--accent)', lineHeight: 1.45 }}>{h}</li>
            ))}
          </ul>
        </InfoCard>
        {plan.weather && (
          <InfoCard title="☁️ Weather">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div><strong>Avg Temp:</strong> {plan.weather.avgTemp}</div>
              <div><strong>Rainfall:</strong> {plan.weather.rainfall}</div>
              <div><strong>Crowds:</strong> {plan.weather.crowdLevel}</div>
              <div style={{ color: 'var(--text2)', fontSize: '13px', marginTop: '4px' }}>{plan.weather.seasonalNotes}</div>
            </div>
          </InfoCard>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <InfoCard title="✈️ Flights">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(plan.flights ?? []).map((f, i) => (
              <div key={i} style={{ padding: '12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{f.airline}</div>
                <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{f.priceRange} · {f.flightTime}</div>
                {f.notes && <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>{f.notes}</div>}
              </div>
            ))}
          </div>
        </InfoCard>
        <InfoCard title="🏠 Lodging Options">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(plan.lodging ?? []).map((l, i) => (
              <div key={i} style={{ padding: '12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{l.type}</div>
                <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{l.neighborhood} · {l.pricePerNight}</div>
                {l.notes && <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>{l.notes}</div>}
              </div>
            ))}
          </div>
        </InfoCard>
      </div>

      <InfoCard title="💰 Budget Overview">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Flights', value: plan.budget.flights },
            { label: 'Lodging', value: plan.budget.lodging },
            { label: 'Food', value: plan.budget.food },
            { label: 'Activities', value: plan.budget.activities },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '12px', padding: '12px', background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Total Estimate</span>
          <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--accent)' }}>{plan.budget.total}</span>
        </div>
      </InfoCard>

      <RefinementPanel tripId={tripId} tab="overview" onRefined={onRefined} />
    </>
  )
}

function ItineraryTab({ plan, tripId, onRefined }: { plan: DestinationPlan; tripId: string; onRefined: (s: Partial<DestinationPlan>) => void }) {
  return (
    <div>
      {(plan.itinerary ?? []).map((day) => (
        <div key={day.dayNumber} style={{ marginBottom: '32px' }}>
          {/* Day header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--accent)', color: '#F4EEE4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
              {day.dayNumber}
            </div>
            <div style={{ fontWeight: 600, fontSize: '15px' }}>{day.title}</div>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            {day.date && <div style={{ fontSize: '13px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{day.date}</div>}
          </div>

          {/* Activities */}
          <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '20px', marginLeft: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {day.activities.map((activity, ai) => (
              <div key={ai} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{activity.name}</div>
                  {activity.timeOfDay && <div style={{ fontSize: '13px', color: 'var(--text3)', whiteSpace: 'nowrap', flexShrink: 0 }}>{activity.timeOfDay}</div>}
                </div>
                <div style={{ fontSize: '13.5px', color: 'var(--text2)', marginTop: '5px', lineHeight: 1.5 }}>{activity.description}</div>
                {(activity.cost || (activity.tags && activity.tags.length > 0)) && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {activity.cost && <span style={{ fontSize: '12px', color: 'var(--text3)' }}>💰 {activity.cost}</span>}
                    {activity.tags?.map((tag) => (
                      <Tag key={tag} variant={activityTagVariant(tag)}>{tag}</Tag>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <RefinementPanel tripId={tripId} tab="itinerary" onRefined={onRefined} />
    </div>
  )
}

function BookingsTab({ plan, tripId, onRefined }: { plan: DestinationPlan; tripId: string; onRefined: (s: Partial<DestinationPlan>) => void }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
          fontSize: '14px',
        }}
      >
        <thead>
          <tr>
            {['Date', 'Activity', 'Time', 'Platform / Ref', 'Notes'].map((h) => (
              <th
                key={h}
                style={{
                  background: 'var(--surface2)',
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(plan.bookings ?? []).map((b, i) => (
            <tr key={i}>
              <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>{b.date}</td>
              <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}><strong>{b.activity}</strong></td>
              <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{b.time}</td>
              <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>
                {b.platform}
                {b.reference && (
                  <><br /><code style={{ fontFamily: 'monospace', fontSize: '12px', background: 'var(--surface2)', padding: '2px 7px', borderRadius: '4px', color: 'var(--text2)' }}>{b.reference}</code></>
                )}
              </td>
              <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', verticalAlign: 'top', color: 'var(--text2)' }}>{b.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <RefinementPanel tripId={tripId} tab="bookings" onRefined={onRefined} />
    </div>
  )
}

function FoodTab({ plan, tripId, onRefined }: { plan: DestinationPlan; tripId: string; onRefined: (s: Partial<DestinationPlan>) => void }) {
  const foodGuide = plan.foodGuide ?? { mustTry: [] }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
      <InfoCard title="🍽️ Must-Try Dishes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(foodGuide.mustTry ?? []).map((item, i) => (
            <div key={i} style={{ padding: '12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{item.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '2px' }}>{item.description}</div>
              {item.dietaryNotes && <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>{item.dietaryNotes}</div>}
            </div>
          ))}
        </div>
      </InfoCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {foodGuide.mealTimes && (
          <InfoCard title="⏰ Meal Times">
            <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.6 }}>{foodGuide.mealTimes}</p>
          </InfoCard>
        )}
        {foodGuide.kidFriendlyPicks && foodGuide.kidFriendlyPicks.length > 0 && (
          <InfoCard title="🧒 Kid-Friendly Picks">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {foodGuide.kidFriendlyPicks.map((item, i) => (
                <span key={i} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '100px', background: 'var(--surface2)', color: 'var(--text2)', fontWeight: 500 }}>{item}</span>
              ))}
            </div>
          </InfoCard>
        )}
        {foodGuide.dietaryNotes && (
          <div style={{ padding: '14px', background: 'var(--amber-light)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--amber)' }}>
            ⚠️ <strong>Dietary notes:</strong> {foodGuide.dietaryNotes}
          </div>
        )}
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <RefinementPanel tripId={tripId} tab="food" onRefined={onRefined} />
      </div>
    </div>
  )
}

function TipsTab({ plan, tripId, onRefined }: { plan: DestinationPlan; tripId: string; onRefined: (s: Partial<DestinationPlan>) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
      {(plan.tips ?? []).map((category, i) => (
        <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {category.icon} {category.category}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {category.tips.map((tip, j) => (
              <div
                key={j}
                style={{ fontSize: '14px', color: 'var(--text2)', paddingLeft: '16px', borderLeft: '3px solid var(--border)', lineHeight: 1.45 }}
                dangerouslySetInnerHTML={{ __html: tip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
              />
            ))}
          </div>
        </div>
      ))}
      <div style={{ gridColumn: '1 / -1' }}>
        <RefinementPanel tripId={tripId} tab="tips" onRefined={onRefined} />
      </div>
    </div>
  )
}
