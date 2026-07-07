import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isPublicRoute =
    pathname === '/' ||               // landing page (signed-in users see dashboard)
    pathname.startsWith('/login') ||
    pathname.startsWith('/plan') ||   // guests can plan; trips saved via anon cookie
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/generate') ||
    // Trip pages may be public — let the page component decide
    /^\/trips\/[^/]+/.test(pathname)

  if (!isLoggedIn && !isPublicRoute) {
    // API routes get 401 JSON; page routes get redirected to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
