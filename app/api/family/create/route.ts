import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Group name required' }, { status: 400 })

  const existing = await sql`
    SELECT fg.id FROM family_groups fg
    JOIN family_members fm ON fm.group_id = fg.id
    WHERE fm.user_id = ${session.user.id} AND fm.role = 'owner'
    LIMIT 1
  `
  if (existing.length > 0) return NextResponse.json({ error: 'You already have a family group' }, { status: 409 })

  const rows = await sql`
    INSERT INTO family_groups (name, created_by) VALUES (${name.trim()}, ${session.user.id}) RETURNING id
  `
  const groupId = rows[0].id
  await sql`
    INSERT INTO family_members (group_id, user_id, role) VALUES (${groupId}, ${session.user.id}, 'owner')
  `
  return NextResponse.json({ groupId })
}
