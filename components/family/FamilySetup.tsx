'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trip } from '@/lib/schema'

interface Props {
  group: { id: string; name: string; role: string } | null
  trips: (Trip & { ownerEmail: string })[]
  userId: string
}

export default function FamilySetup({ group, trips }: Props) {
  const router = useRouter()
  const [groupName, setGroupName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function createGroup() {
    if (!groupName.trim()) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/family/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: groupName }),
    })
    if (!res.ok) { setError((await res.json()).error); setLoading(false); return }
    router.refresh()
  }

  async function invite() {
    if (!inviteEmail.trim()) return
    setLoading(true)
    const res = await fetch('/api/family/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setInviteUrl(data.inviteUrl)
    setInviteEmail('')
  }

  if (!group) {
    return (
      <div style={{ maxWidth: '480px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Create a family group
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--text2)', marginBottom: '24px', lineHeight: 1.55 }}>
            Planning a trip together? Create a group to share trips and leave comments.
          </p>
          <label style={labelStyle}>Group name</label>
          <input
            type="text"
            placeholder="The Udall Family"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(47,110,115,.12)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
          />
          {error && <p style={{ color: 'var(--red)', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
          <button
            onClick={createGroup}
            disabled={loading || !groupName.trim()}
            style={{ ...btnStyle, marginTop: '16px', width: '100%', opacity: loading || !groupName.trim() ? 0.6 : 1 }}
          >
            {loading ? 'Creating…' : 'Create group'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Group header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>{group.name}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '4px' }}>Trips shared with your group</p>
        </div>

        {/* Invite form */}
        {group.role === 'owner' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="email"
              placeholder="Invite by email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={{ ...inputStyle, width: '220px', margin: 0 }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(47,110,115,.12)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
              onKeyDown={(e) => e.key === 'Enter' && invite()}
            />
            <button onClick={invite} disabled={loading || !inviteEmail.trim()} style={{ ...btnStyle, opacity: loading || !inviteEmail.trim() ? 0.6 : 1 }}>
              Invite
            </button>
          </div>
        )}
      </div>

      {/* Invite link result */}
      {inviteUrl && (
        <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--accent-dark)', flex: 1, wordBreak: 'break-all' }}>{inviteUrl}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(inviteUrl); }}
            style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
          >
            Copy
          </button>
        </div>
      )}

      {/* Shared trips */}
      {trips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text2)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🤝</div>
          <p style={{ fontSize: '15px' }}>No shared trips yet. Open a trip and click <strong>Share with family</strong> to share it here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              style={{ textDecoration: 'none', display: 'block', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}
            >
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>{trip.emoji}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: '4px' }}>
                {(trip.plan as { destination?: string }).destination ?? trip.guidelines?.destination}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text3)' }}>Shared by {trip.ownerEmail}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em',
  textTransform: 'uppercase', color: '#998f7c', marginBottom: '8px', display: 'block',
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: 'var(--text)',
  outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s',
}

const btnStyle: React.CSSProperties = {
  background: 'var(--accent)', color: '#FBF7F0', border: 'none',
  padding: '11px 18px', borderRadius: '10px', fontFamily: 'inherit',
  fontSize: '14px', fontWeight: 600, cursor: 'pointer',
}
