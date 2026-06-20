import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL(`/login?invite=${token}`, req.nextUrl))
  }

  const rows = await sql`
    SELECT * FROM family_invites
    WHERE token = ${token}
      AND accepted_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
  `
  if (rows.length === 0) return NextResponse.json({ error: 'Invite not found or expired' }, { status: 404 })

  const invite = rows[0]
  await sql`INSERT INTO family_members (group_id, user_id, role) VALUES (${invite.group_id}, ${session.user.id}, 'member') ON CONFLICT DO NOTHING`
  await sql`UPDATE family_invites SET accepted_at = NOW() WHERE token = ${token}`

  return NextResponse.redirect(new URL('/', req.nextUrl))
}
