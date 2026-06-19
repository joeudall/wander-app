'use client'

import { useState } from 'react'
import { Trip } from '@/lib/schema'
import Link from 'next/link'
import Tag, { activityTagVariant } from '@/components/ui/Tag'

const HEADER_COLORS: Record<string, string> = {
  gold: 'linear-gradient(135deg, #c7a96b 0%, #8b6914 60%, #5c4410 100%)',
  blue: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #3b82f6 100%)',
  green: 'linear-gradient(135deg, #14532d 0%, #22c55e 100%)',
  purple: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)',
  orange: 'linear-gradient(135deg, #7c2d12 0%, #f97316 100%)',
}

type TabName = 'overview' | 'itinerary' | 'bookings' | 'food' | 'tips'

export default function TripDetail({ trip }: { trip: Trip }) {
  const [activeTab, setActiveTab] = useState<TabName>('overview')
  const { plan, guidelines } = trip

  const headerBg = HEADER_COLORS[trip.cardColor] ?? HEADER_COLORS.blue

  const travelerText = guidelines.travelersMax > guidelines.travelersMin
    ? `${guidelines.travelersMin}–${guidelines.travelersMax} people`
    : `${guidelines.travelersMin} ${guidelines.travelersMin === 1 ? 'person' : 'people'}`

  return (
    <>
      {/* Header */}
      <div style={{ background: headerBg, color: 'white', padding: '48px 24px 40px', position: 'relative' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <Link
            href="/"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
            }}
          >
            ← Back to My Trips
          </Link>
          <h1 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>
            {trip.emoji} {plan.destination}
          </h1>
          <div style={{ fontSize: '16px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span>📅 {guidelines.targetMonthYear} · {guidelines.nights} nights</span>
            <span>👥 {travelerText}</span>
            <span>✈️ {guidelines.departureAirport}</span>
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
        {activeTab === 'overview' && <OverviewTab trip={trip} />}
        {activeTab === 'itinerary' && <ItineraryTab trip={trip} />}
        {activeTab === 'bookings' && <BookingsTab trip={trip} />}
        {activeTab === 'food' && <FoodTab trip={trip} />}
        {activeTab === 'tips' && <TipsTab trip={trip} />}
      </div>
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

function OverviewTab({ trip }: { trip: Trip }) {
  const { plan } = trip
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <InfoCard title="🌟 Highlights">
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none' }}>
            {plan.highlights.map((h, i) => (
              <li key={i} style={{ fontSize: '14px', paddingLeft: '16px', borderLeft: '3px solid var(--accent)', lineHeight: 1.45 }}>{h}</li>
            ))}
          </ul>
        </InfoCard>
        <InfoCard title="☁️ Weather">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div><strong>Avg Temp:</strong> {plan.weather.avgTemp}</div>
            <div><strong>Rainfall:</strong> {plan.weather.rainfall}</div>
            <div><strong>Crowds:</strong> {plan.weather.crowdLevel}</div>
            <div style={{ color: 'var(--text2)', fontSize: '13px', marginTop: '4px' }}>{plan.weather.seasonalNotes}</div>
          </div>
        </InfoCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <InfoCard title="✈️ Flights">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {plan.flights.map((f, i) => (
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
            {plan.lodging.map((l, i) => (
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
    </>
  )
}

function ItineraryTab({ trip }: { trip: Trip }) {
  return (
    <div>
      {trip.plan.itinerary.map((day) => (
        <div key={day.dayNumber} style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                background: 'var(--accent)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {day.dayNumber}
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.2px' }}>{day.title}</h3>
              {day.date && <p style={{ fontSize: '13px', color: 'var(--text2)' }}>{day.date}</p>}
            </div>
          </div>

          <div style={{ marginLeft: '60px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-38px', top: 0, bottom: 0, width: '2px', background: 'var(--border)' }} />
            {day.activities.map((activity, ai) => (
              <div
                key={ai}
                style={{
                  display: 'flex',
                  gap: '14px',
                  padding: '14px 0',
                  borderBottom: ai < day.activities.length - 1 ? '1px solid var(--border)' : 'none',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '-42px',
                    top: '20px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    border: '2px solid var(--surface)',
                    boxShadow: '0 0 0 2px var(--accent)',
                  }}
                />
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', minWidth: '80px', paddingTop: '2px' }}>
                  {activity.timeOfDay || ''}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>{activity.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.45 }}>{activity.description}</div>
                  {activity.cost && <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>💰 {activity.cost}</div>}
                  {activity.tags && activity.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {activity.tags.map((tag) => (
                        <Tag key={tag} variant={activityTagVariant(tag)}>{tag}</Tag>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function BookingsTab({ trip }: { trip: Trip }) {
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
          {trip.plan.bookings.map((b, i) => (
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
    </div>
  )
}

function FoodTab({ trip }: { trip: Trip }) {
  const { foodGuide } = trip.plan
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
      <InfoCard title="🍽️ Must-Try Dishes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {foodGuide.mustTry.map((item, i) => (
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
    </div>
  )
}

function TipsTab({ trip }: { trip: Trip }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
      {trip.plan.tips.map((category, i) => (
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
    </div>
  )
}
