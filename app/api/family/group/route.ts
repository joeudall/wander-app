import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const group = await sql`
    SELECT fg.*, fm.role FROM family_groups fg
    JOIN family_members fm ON fm.group_id = fg.id
    WHERE fm.user_id = ${session.user.id}
    LIMIT 1
  `
  if (group.length === 0) return NextResponse.json({ group: null })

  const members = await sql`
    SELECT fm.user_id, fm.role, fm.joined_at, u.email
    FROM family_members fm
    JOIN users u ON u.id = fm.user_id
    WHERE fm.group_id = ${group[0].id}
    ORDER BY fm.joined_at ASC
  `
  return NextResponse.json({ group: group[0], members })
}
