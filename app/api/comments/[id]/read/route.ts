import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await sql`
    INSERT INTO comment_reads (user_id, comment_id) VALUES (${session.user.id}, ${id})
    ON CONFLICT DO NOTHING
  `
  return NextResponse.json({ ok: true })
}
