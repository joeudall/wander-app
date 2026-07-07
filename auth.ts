import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const rows = await sql`
          SELECT id, email, password_hash FROM users
          WHERE LOWER(email) = LOWER(${credentials.email as string})
        `
        const user = rows[0]
        if (!user) return null

        // Google-only accounts have no password_hash
        if (!user.password_hash) return null

        const valid = await bcrypt.compare(credentials.password as string, user.password_hash)
        if (!valid) return null

        return { id: user.id, email: user.email }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        const existing = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${user.email})`
        if (existing.length === 0) {
          const rows = await sql`
            INSERT INTO users (email, password_hash) VALUES (${user.email.toLowerCase()}, NULL)
            RETURNING id
          `
          user.id = rows[0].id
        } else {
          user.id = existing[0].id
        }
      }
      return true
    },
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
})
