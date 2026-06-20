import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Email and password (8+ chars) required' }, { status: 400 })
  }

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`
  if (existing.length > 0) {
    return NextResponse.json({ error: 'An account with that email already exists' }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 10)
  await sql`INSERT INTO users (email, password_hash) VALUES (${email}, ${hash})`

  return NextResponse.json({ success: true })
}
