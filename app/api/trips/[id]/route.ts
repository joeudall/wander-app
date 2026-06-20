import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await sql`DELETE FROM trips WHERE id = ${id} AND user_id = ${session.user.id}`
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { status } = await req.json()
  const allowed = ['planning', 'upcoming', 'past', 'taken']
  if (!allowed.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  await sql`UPDATE trips SET status = ${status} WHERE id = ${id} AND user_id = ${session.user.id}`
  return NextResponse.json({ success: true })
}
