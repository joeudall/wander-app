import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await sql`
    SELECT t.*, u.email as owner_email
    FROM trips t
    JOIN trip_shares ts ON ts.trip_id = t.id
    JOIN family_members fm ON fm.group_id = ts.group_id
    JOIN users u ON u.id = t.user_id
    WHERE fm.user_id = ${session.user.id}
    ORDER BY t.created_at DESC
  `
  return NextResponse.json({ trips: rows })
}
