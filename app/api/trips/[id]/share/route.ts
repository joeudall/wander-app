import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trip = await sql`SELECT id FROM trips WHERE id = ${id} AND user_id = ${session.user.id}`
  if (trip.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const group = await sql`
    SELECT fg.id FROM family_groups fg
    JOIN family_members fm ON fm.group_id = fg.id
    WHERE fm.user_id = ${session.user.id}
    LIMIT 1
  `
  if (group.length === 0) return NextResponse.json({ error: 'No family group found' }, { status: 400 })

  const groupId = group[0].id
  await sql`
    INSERT INTO trip_shares (trip_id, group_id, shared_by) VALUES (${id}, ${groupId}, ${session.user.id})
    ON CONFLICT DO NOTHING
  `
  await sql`UPDATE trips SET group_id = ${groupId} WHERE id = ${id}`
  return NextResponse.json({ shared: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trip = await sql`SELECT id FROM trips WHERE id = ${id} AND user_id = ${session.user.id}`
  if (trip.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await sql`DELETE FROM trip_shares WHERE trip_id = ${id}`
  await sql`UPDATE trips SET group_id = NULL WHERE id = ${id}`
  return NextResponse.json({ shared: false })
}
