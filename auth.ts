import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const rows = await sql`
          SELECT id, email, password_hash FROM users WHERE email = ${credentials.email as string}
        `
        const user = rows[0]
        if (!user) return null

        const valid = await bcrypt.compare(credentials.password as string, user.password_hash)
        if (!valid) return null

        return { id: user.id, email: user.email }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // On Google sign-in, upsert the user into our users table
      if (account?.provider === 'google' && profile?.email) {
        await sql`
          INSERT INTO users (email, password_hash)
          VALUES (${profile.email}, NULL)
          ON CONFLICT (email) DO NOTHING
        `
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) token.id = user.id
      // For Google sign-ins, look up the real DB user id by email
      if (account?.provider === 'google' && token.email) {
        const rows = await sql`SELECT id FROM users WHERE email = ${token.email}`
        if (rows[0]) token.id = rows[0].id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
})
