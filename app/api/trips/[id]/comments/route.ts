import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

async function canAccessTrip(tripId: string, userId: string): Promise<boolean> {
  const rows = await sql`
    SELECT t.id FROM trips t
    LEFT JOIN trip_shares ts ON ts.trip_id = t.id
    LEFT JOIN family_members fm ON fm.group_id = ts.group_id AND fm.user_id = ${userId}
    WHERE t.id = ${tripId} AND (t.user_id = ${userId} OR fm.user_id IS NOT NULL)
    LIMIT 1
  `
  return rows.length > 0
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await canAccessTrip(id, session.user.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const rows = await sql`
    SELECT c.*, u.email as author_email,
      EXISTS(SELECT 1 FROM comment_reads cr WHERE cr.comment_id = c.id AND cr.user_id = ${session.user.id}) as is_read
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.trip_id = ${id}
    ORDER BY c.created_at ASC
  `
  return NextResponse.json({ comments: rows })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await canAccessTrip(id, session.user.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { body, referenceType = 'trip', referenceId } = await req.json()
  if (!body?.trim()) return NextResponse.json({ error: 'Comment body required' }, { status: 400 })

  const rows = await sql`
    INSERT INTO comments (trip_id, user_id, body, reference_type, reference_id)
    VALUES (${id}, ${session.user.id}, ${body.trim()}, ${referenceType}, ${referenceId ?? null})
    RETURNING *
  `
  return NextResponse.json({ comment: rows[0] })
}
