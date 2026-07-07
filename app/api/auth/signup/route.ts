import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }
  if (password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: 'Password must be 8–128 characters' }, { status: 400 })
  }

  const existing = await sql`SELECT id FROM users WHERE LOWER(email) = ${email}`
  if (existing.length > 0) {
    return NextResponse.json({ error: 'An account with that email already exists' }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 10)
  await sql`INSERT INTO users (email, password_hash) VALUES (${email}, ${hash})`

  return NextResponse.json({ success: true })
}
