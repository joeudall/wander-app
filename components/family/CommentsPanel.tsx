'use client'

import { useState, useEffect, useRef } from 'react'
import { Comment } from '@/lib/schema'

interface Props {
  tripId: string
  isOwner: boolean
  isShared: boolean
  onShare: () => void
  onUnshare: () => void
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function CommentsPanel({ tripId, isOwner, isShared, onShare, onUnshare }: Props) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sharing, setSharing] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function load() {
    const res = await fetch(`/api/trips/${tripId}/comments`)
    if (res.ok) {
      const data = await res.json()
      setComments(data.comments.map((c: Record<string, unknown>) => ({
        id: c.id, tripId: c.trip_id, userId: c.user_id, authorEmail: c.author_email,
        body: c.body, referenceType: c.reference_type, referenceId: c.reference_id,
        createdAt: c.created_at, updatedAt: c.updated_at,
        isRead: c.is_read,
      })))
    }
  }

  useEffect(() => { if (open) load() }, [open])

  async function send() {
    if (!body.trim()) return
    setSending(true)
    await fetch(`/api/trips/${tripId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    setBody('')
    await load()
    setSending(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function markRead(commentId: string) {
    await fetch(`/api/comments/${commentId}/read`, { method: 'POST' })
    setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, isRead: true } : c))
  }

  const unread = comments.filter((c) => !c.isRead).length

  async function toggleShare() {
    setSharing(true)
    if (isShared) {
      await fetch(`/api/trips/${tripId}/share`, { method: 'DELETE' })
      onUnshare()
    } else {
      const res = await fetch(`/api/trips/${tripId}/share`, { method: 'POST' })
      if (res.ok) onShare()
    }
    setSharing(false)
  }

  return (
    <>
      {/* Floating action bar */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', zIndex: 50 }}>
        {isOwner && (
          <button
            onClick={toggleShare}
            disabled={sharing}
            style={{
              background: isShared ? 'var(--accent-light)' : 'var(--surface)',
              color: isShared ? 'var(--accent)' : 'var(--text2)',
              border: `1px solid ${isShared ? 'var(--accent)' : 'var(--border)'}`,
              padding: '9px 16px',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: sharing ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow)',
            }}
          >
            {isShared ? '✓ Shared with family' : '+ Share with family'}
          </button>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            background: open ? 'var(--accent)' : 'var(--surface)',
            color: open ? 'white' : 'var(--text)',
            border: '1px solid var(--border)',
            padding: '11px 18px',
            borderRadius: '100px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          💬 Comments
          {!open && unread > 0 && (
            <span style={{ background: 'var(--accent)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '1px 6px', borderRadius: '100px', marginLeft: '2px' }}>
              {unread}
            </span>
          )}
        </button>
      </div>

      {/* Comments drawer */}
      {open && (
        <div style={{
          position: 'fixed',
          right: 0,
          top: '60px',
          bottom: 0,
          width: '360px',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          boxShadow: 'var(--shadow-lg)',
        }}>
          {/* Header */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600 }}>Comments</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text3)', padding: '4px' }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text3)', fontSize: '14px' }}>
                No comments yet. Be the first to leave one.
              </div>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    marginBottom: '12px',
                    padding: '12px 14px',
                    background: c.isRead ? 'var(--surface2)' : 'var(--accent-light)',
                    border: `1px solid ${c.isRead ? 'var(--border)' : 'var(--accent)'}`,
                    borderRadius: '10px',
                    cursor: !c.isRead ? 'pointer' : 'default',
                  }}
                  onClick={() => { if (!c.isRead) markRead(c.id) }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>{c.authorEmail.split('@')[0]}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text3)', flexShrink: 0 }}>{formatTime(c.createdAt)}</span>
                  </div>
                  {c.referenceType !== 'trip' && (
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {c.referenceType === 'day' ? `Day ${c.referenceId}` : c.referenceId}
                    </div>
                  )}
                  <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>{c.body}</p>
                  {!c.isRead && <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '6px', fontWeight: 600 }}>Tap to mark read</div>}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Compose */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
            <textarea
              placeholder="Leave a comment…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '11px 13px',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none',
                color: 'var(--text)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send() }}
            />
            <button
              onClick={send}
              disabled={sending || !body.trim()}
              style={{
                width: '100%',
                marginTop: '8px',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '10px',
                fontFamily: 'inherit',
                fontSize: '14px',
                fontWeight: 600,
                cursor: sending || !body.trim() ? 'not-allowed' : 'pointer',
                opacity: sending || !body.trim() ? 0.6 : 1,
              }}
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
