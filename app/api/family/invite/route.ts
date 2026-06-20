import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await req.json()
  if (!email?.trim()) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const groupRows = await sql`
    SELECT fg.id FROM family_groups fg
    JOIN family_members fm ON fm.group_id = fg.id
    WHERE fm.user_id = ${session.user.id} AND fm.role = 'owner'
    LIMIT 1
  `
  if (groupRows.length === 0) return NextResponse.json({ error: 'You must create a family group first' }, { status: 403 })
  const groupId = groupRows[0].id

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  await sql`
    INSERT INTO family_invites (group_id, email, invited_by, token, expires_at)
    VALUES (${groupId}, ${email.toLowerCase().trim()}, ${session.user.id}, ${token}, ${expiresAt})
    ON CONFLICT DO NOTHING
  `

  const inviteUrl = `${process.env.NEXTAUTH_URL ?? ''}/invite/${token}`
  return NextResponse.json({ inviteUrl, token })
}
