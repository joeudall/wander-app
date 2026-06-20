import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const trip = await sql`SELECT id FROM trips WHERE id = ${id} AND user_id = ${userId}`
  if (trip.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await sql`UPDATE trips SET is_public = TRUE WHERE id = ${id}`
  return NextResponse.json({ shared: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const trip = await sql`SELECT id FROM trips WHERE id = ${id} AND user_id = ${userId}`
  if (trip.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await sql`UPDATE trips SET is_public = FALSE WHERE id = ${id}`
  return NextResponse.json({ shared: false })
}
