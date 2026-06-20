import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trip = await sql`SELECT id FROM trips WHERE id = ${id} AND user_id = ${session.user.id}`
  if (trip.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await sql`UPDATE trips SET is_public = TRUE WHERE id = ${id}`
  return NextResponse.json({ shared: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trip = await sql`SELECT id FROM trips WHERE id = ${id} AND user_id = ${session.user.id}`
  if (trip.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await sql`UPDATE trips SET is_public = FALSE WHERE id = ${id}`
  return NextResponse.json({ shared: false })
}
